import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  // Ensure we only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mode, textInput, fileData, additionalContext, language, chatHistory } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY missing in environment variables.");
    return res.status(500).json({ error: 'Server configuration error: API_KEY missing.' });
  }

  const ai = new GoogleGenAI({ apiKey });
  const MODEL_NAME = "gemini-2.5-flash";

  try {
    // --- CHAT MODE ---
    if (mode === 'CHAT') {
      const history = chatHistory || [];
      const userMessage = history.pop(); // The last message is the user's new input
      
      // If history is empty, initialize it with system instructions via context or logic
      // Ideally, the client sends the full conversation.
      
      const languageInstruction = language === 'fr' 
      ? "IMPORTANT: You MUST reply in FRENCH." 
      : "IMPORTANT: You MUST reply in ENGLISH.";

      const systemInstruction = `
        You are StudyGeniusAI, an intelligent study assistant.
        Mission:
        - Summarize PDFs, images, and texts
        - Generate quizzes, flashcards, and explanations
        - Create study plans (1 to 30 days)
        - Tutor the user in any subject with step-by-step clarity
        Behavior Rules:
        - Always use a friendly, motivating tone.
        - Adapt your explanations to the user’s level.
        - Always answer step by step if the user asks for explanations.
        - Never invent fake data; ask for more details if needed.
        - Use tables, bullet points, and clean structure.
        - ${languageInstruction}
        ${additionalContext ? `Additional context: ${additionalContext}` : ''}
      `;
      
      // Create chat with history (excluding the new message which we send via sendMessage)
      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: { systemInstruction },
        history: history
      });

      const result = await chat.sendMessage({ message: userMessage.parts[0].text });
      return res.status(200).json({ text: result.text });
    }

    // --- STANDARD GENERATION MODES ---
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

    const languageInstruction = language === 'fr' 
      ? "IMPORTANT: You MUST generate ALL content in FRENCH." 
      : "IMPORTANT: You MUST generate ALL content in ENGLISH.";

    const basePersona = `
      You are StudyGeniusAI, an intelligent study assistant.
      Tone: Friendly, motivating, and adapted to the student's level.
      Rules:
      - Explain step-by-step.
      - Use clear structures (bullet points, tables).
      - No fake data.
      - ${languageInstruction}
    `;

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