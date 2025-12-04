import { AppMode, ChatMessage, Language } from "../types";

// Note: On n'importe plus le SDK Google ici pour éviter l'erreur "API Key must be set in browser"
// Tout passe par notre endpoint sécurisé /api/generate

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

// Helper pour appeler l'API Vercel
const callApi = async (payload: any) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Throw specific error messages
      if (response.status === 413) throw new Error("File too large (Max 4.5MB)");
      if (response.status === 504) throw new Error("Timeout: The AI took too long to respond.");
      if (response.status === 500) throw new Error(errorData.error || "Server Error (Check API Key)");
      
      throw new Error(errorData.error || `Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur d'appel API:", error);
    throw error;
  }
};

export const generateStudyMaterial = async (params: GenerateParams): Promise<any> => {
  const data = await callApi(params);
  
  if (params.mode === AppMode.FLASHCARDS || params.mode === AppMode.QUIZ) {
    try {
      // L'API renvoie déjà un objet JSON parsé ou une string JSON
      return typeof data.text === 'string' ? JSON.parse(data.text) : data.text;
    } catch (e) {
      console.error("Failed to parse JSON response", e);
      throw new Error("Invalid JSON response from AI");
    }
  }

  return data.text;
};

// Initialisation purement locale (stateless)
export const initializeChatSession = (params: ChatInitParams): { initialMessages: ChatMessage[] } => {
  const initialMessages: ChatMessage[] = [];

  // Message de bienvenue du système
  initialMessages.push({ role: 'model', text: params.customWelcomeMessage || "Hello!" });

  return { initialMessages };
};

export const sendChatMessage = async (
  history: ChatMessage[], 
  newMessage: string,
  context: {
    fileData?: { mimeType: string, data: string } | null,
    textInput: string,
    additionalContext: string,
    language: Language
  }
): Promise<string> => {
  
  // On envoie tout le contexte à chaque fois car l'API est stateless
  const payload = {
    mode: AppMode.CHAT,
    message: newMessage,
    history: history, // L'historique précédent
    fileData: context.fileData,
    textInput: context.textInput,
    additionalContext: context.additionalContext,
    language: context.language
  };

  const data = await callApi(payload);
  return data.text;
};