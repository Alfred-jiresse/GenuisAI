import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AppMode, Flashcard, QuizQuestion, ChatMessage, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

interface GenerateParams {
  mode: AppMode;
  textInput: string;
  fileData?: {
    mimeType: string;
    data: string;
  };
  additionalContext?: string;
  language: Language;
}

interface ChatInitParams extends GenerateParams {
  customWelcomeMessage?: string;
}

export const generateStudyMaterial = async (params: GenerateParams): Promise<any> => {
  const parts: any[] = [];

  if (params.fileData) {
    parts.push({
      inlineData: {
        mimeType: params.fileData.mimeType,
        data: params.fileData.data,
      },
    });
  }

  if (params.textInput) {
    parts.push({ text: params.textInput });
  }

  let prompt = "";
  let responseSchema: any = undefined;
  let responseMimeType: string | undefined = undefined;

  const languageInstruction = params.language === 'fr' 
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

  switch (params.mode) {
    case AppMode.SUMMARY:
      prompt = `${basePersona}
      Analyze the provided content and generate a clear, structured summary. 
      Focus on key concepts, main arguments, and crucial details. 
      Use bullet points and bold text for readability.`;
      break;

    case AppMode.EXPLANATION:
      prompt = `${basePersona}
      Provide a deep-dive, step-by-step explanation of the core topics found in this content. 
      Use analogies where helpful. Break down complex ideas into simple terms.
      If there is code, explain it line-by-line.
      ${params.additionalContext ? `Focus specifically on: ${params.additionalContext}` : ''}`;
      break;

    case AppMode.STUDY_PLAN:
      prompt = `${basePersona}
      Create a structured study plan based on this content.
      ${params.additionalContext ? `Duration/Goal: ${params.additionalContext}` : 'Create a 1-week plan.'}
      Break it down by days or sessions with precise topics to cover and suggested review methods.`;
      break;

    case AppMode.FLASHCARDS:
      prompt = `${basePersona}
      Create 10 high-quality flashcards based on the most important concepts. 
      Return strictly JSON. 
      The JSON keys (question, answer) must remain in English, but the VALUES must be in ${params.language === 'fr' ? 'French' : 'English'}.`;
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

    case AppMode.QUIZ:
      prompt = `${basePersona}
      Generate a multiple-choice quiz with 5 questions.
      Difficulty: ${params.additionalContext || 'Medium'}.
      Include a clear explanation for the correct answer.
      Return strictly JSON.
      The JSON keys (id, question, options, correctAnswerIndex, explanation) must remain in English, but the VALUES must be in ${params.language === 'fr' ? 'French' : 'English'}.`;
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
    
    case AppMode.CHAT:
      return;
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: responseMimeType,
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    if (params.mode === AppMode.FLASHCARDS || params.mode === AppMode.QUIZ) {
      return JSON.parse(response.text);
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const initializeChatSession = (params: ChatInitParams): { chat: Chat, initialMessages: ChatMessage[] } => {
  const parts: any[] = [];

  if (params.fileData) {
    parts.push({
      inlineData: {
        mimeType: params.fileData.mimeType,
        data: params.fileData.data,
      },
    });
  }

  if (params.textInput) {
    parts.push({ text: params.textInput });
  }
  
  const languageInstruction = params.language === 'fr' 
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

    ${params.additionalContext ? `Additional context: ${params.additionalContext}` : ''}
  `;

  parts.push({ text: systemInstruction });

  // Use provided custom welcome message or default based on language
  let welcomeMessage = params.customWelcomeMessage;
  
  if (!welcomeMessage) {
    welcomeMessage = params.language === 'fr' 
      ? "👋 Re-bonjour ! Ton espace d’étude est prêt. Téléverse ton document ou écris un sujet pour commencer." 
      : "👋 Welcome back! Your study space is ready. Upload your document or type a topic to start.";
  }

  const initialHistory = [
    {
      role: 'user',
      parts: parts
    },
    {
      role: 'model',
      parts: [{ text: welcomeMessage }]
    }
  ];

  const chat = ai.chats.create({
    model: MODEL_NAME,
    history: initialHistory,
  });

  return {
    chat,
    initialMessages: [{ role: 'model', text: welcomeMessage }]
  };
};