import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mode, textInput, fileData, additionalContext, language, history, message } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY missing in environment variables.");
    return res.status(500).json({ error: 'Configuration serveur : Clé API manquante.' });
  }

  const ai = new GoogleGenAI({ apiKey });
  const MODEL_NAME = "gemini-2.5-flash";

  try {
    const languageInstruction = language === 'fr' 
      ? "IMPORTANT: You MUST generate content/reply in FRENCH." 
      : "IMPORTANT: You MUST generate content/reply in ENGLISH.";

    const basePersona = `
      You are StudyGeniusAI, an intelligent study assistant.
      Tone: Friendly, motivating, and adapted to the student's level.
      Rules:
      - Explain step-by-step.
      - Use clear structures (bullet points, tables).
      - No fake data.
      - ${languageInstruction}
    `;

    // --- CHAT MODE ---
    if (mode === 'CHAT') {
      const systemInstruction = `
        ${basePersona}
        Mission:
        - Summarize PDFs, images, and texts
        - Generate quizzes, flashcards, and explanations
        - Create study plans (1 to 30 days)
        - Tutor the user in any subject with step-by-step clarity
        ${additionalContext ? `Additional context: ${additionalContext}` : ''}
        ${textInput ? `Context text: ${textInput}` : ''}
      `;

      // Conversion de l'historique client (ChatMessage[]) vers le format SDK
      // Client: { role: 'user'|'model', text: string }
      // SDK: { role: 'user'|'model', parts: [{ text: string }] }
      let sdkHistory = [];
      
      // Si un fichier est présent, on l'ajoute comme premier message 'user' dans l'historique simulé
      if (fileData) {
        sdkHistory.push({
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: fileData.mimeType,
                data: fileData.data
              }
            },
            { text: "Here is the document I want to study." }
          ]
        });
        sdkHistory.push({
          role: 'model',
          parts: [{ text: "I have received your document. What would you like to know?" }]
        });
      }

      // Ajout de l'historique de conversation existant
      if (history && Array.isArray(history)) {
        history.forEach(msg => {
            // On saute les messages d'erreur ou vides
            if(!msg.text || msg.isError) return;
            
            sdkHistory.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        });
      }

      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: { systemInstruction },
        history: sdkHistory
      });

      const result = await chat.sendMessage({ message: message });
      return res.status(200).json({ text: result.text });
    }

    // --- AUTRES MODES (Summary, Quiz, etc.) ---
    const parts = [];
    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data,
        },
      });
    }
    if (textInput) {
      parts.push({ text: textInput });
    }

    let prompt = "";
    let responseSchema = undefined;
    let responseMimeType = undefined;

    switch (mode) {
      case 'SUMMARY':
        prompt = `${basePersona}
        Analyze the provided content and generate a clear, structured summary. 
        Focus on key concepts, main arguments, and crucial details. 
        Use bullet points and bold text for readability.`;
        break;

      case 'EXPLANATION':
        prompt = `${basePersona}
        Provide a deep-dive, step-by-step explanation of the core topics found in this content. 
        Use analogies where helpful. Break down complex ideas into simple terms.
        If there is code, explain it line-by-line.
        ${additionalContext ? `Focus specifically on: ${additionalContext}` : ''}`;
        break;

      case 'STUDY_PLAN':
        prompt = `${basePersona}
        Create a structured study plan based on this content.
        ${additionalContext ? `Duration/Goal: ${additionalContext}` : 'Create a 1-week plan.'}
        Break it down by days or sessions with precise topics to cover and suggested review methods.`;
        break;

      case 'FLASHCARDS':
        prompt = `${basePersona}
        Create 10 high-quality flashcards based on the most important concepts. 
        Return strictly JSON. 
        The JSON keys (question, answer) must remain in English, but the VALUES must be in ${language === 'fr' ? 'French' : 'English'}.`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ["question", "answer"],
          },
        };
        break;

      case 'QUIZ':
        prompt = `${basePersona}
        Generate a multiple-choice quiz with 5 questions.
        Difficulty: ${additionalContext || 'Medium'}.
        Include a clear explanation for the correct answer.
        Return strictly JSON.
        The JSON keys (id, question, options, correctAnswerIndex, explanation) must remain in English, but the VALUES must be in ${language === 'fr' ? 'French' : 'English'}.`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
          },
        };
        break;
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: responseMimeType,
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}