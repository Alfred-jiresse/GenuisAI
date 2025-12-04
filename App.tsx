import React, { useState, useRef, useEffect } from 'react';
import { AppMode, LoadingState, Flashcard, QuizQuestion, ChatMessage, Language, ViewState, User } from './types';
import TabNavigation from './components/TabNavigation';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import MarkdownView from './components/MarkdownView';
import ChatView from './components/ChatView';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import { generateStudyMaterial, initializeChatSession, sendChatMessage } from './services/geminiService';
import { UploadCloud, X, Sparkles, GraduationCap, Sun, Moon, Languages, LogOut, FileText, Clock, User as UserIcon } from './components/Icons';
import { Chat } from '@google/genai';

const TRANSLATIONS = {
  en: {
    // Fallback English
    title: "StudyGeniusAI",
    subtitle: "Powered by Gemini 2.5",
    uploadTitle: "1. Upload Material",
    uploadPlaceholder: "Click to upload PDF or Image",
    uploadSub: "Supports PDF, PNG, JPG",
    orPaste: "Or paste text",
    pastePlaceholder: "Paste your notes, lecture transcript, or topic here...",
    contextTitle: "2. Additional Context (Optional)",
    contextTip: "💡 Tip: Ask for specific exam formats, difficulty levels, or focus areas.",
    contextPlaceholder: "E.g., 'Focus on chapter 3', 'Exam is in 2 days', 'Make it hard'...",
    generate: "Generate",
    startChat: "Start Chat Session",
    processing: "Processing...",
    generating: "Generating your study materials...",
    analyzing: "Analyzing content with Gemini AI",
    error: "Something went wrong. Please try again.",
    chatEmptyState: "Please upload content to start chatting with the AI Tutor.",
    tabs: {
      [AppMode.SUMMARY]: "Summary",
      [AppMode.FLASHCARDS]: "Flashcards",
      [AppMode.QUIZ]: "Quiz",
      [AppMode.EXPLANATION]: "Deep Dive",
      [AppMode.STUDY_PLAN]: "Study Plan",
      [AppMode.CHAT]: "AI Tutor"
    },
    titles: {
      summary: "Course Summary",
      explanation: "Deep Dive Explanation",
      studyPlan: "Personalized Study Plan"
    },
    flashcards: {
      card: "Card",
      flipInstruction: "Click card to flip",
      question: "Question",
      answer: "Answer",
      flipButton: "Flip Card",
      noCards: "No flashcards available."
    },
    quiz: {
      question: "Question",
      score: "Score",
      submit: "Submit Answer",
      next: "Next Question",
      viewResults: "View Results",
      tryAgain: "Try Again",
      complete: "Quiz Complete!",
      youGot: "You got",
      outOf: "out of",
      correct: "correct",
      explanation: "Explanation",
      noQuiz: "No quiz generated."
    },
    chat: {
      title: "StudyGeniusAI Tutor",
      subtitle: "Always here to help you learn",
      thinking: "StudyGenius is thinking...",
      placeholder: "Ask a question about your material..."
    },
    welcome: {
      title: "🎓 Welcome to StudyGeniusAI",
      subtitle: "Your intelligent assistant to learn faster.",
      buttonText: "Continue"
    },
    login: {
      title: "🔐 Login or Create Account",
      subtitle: "Access your documents, plan, and progress.",
      methods: {
        google: "Continue with Google",
        email: "Continue with Email",
        guest: "Continue without account"
      },
      emailView: {
        placeholder: "name@example.com",
        submit: "Send Magic Link",
        back: "Back",
        sentTitle: "Check your email",
        sentDesc: "We sent you a magic link to sign in."
      },
      guestWarning: "Note: In guest mode, documents are not saved and will be deleted when you leave."
    },
    banner: {
      guest: "Guest Mode: Nothing is saved. Upload a document to start.",
      user: "Logged In: Your documents are saved (3 days)."
    },
    welcomeMessages: {
      guest: "👋 Welcome! You are in guest mode. Nothing will be saved. Upload a document to start.",
      user: "👋 Welcome! Your documents and study space are ready. Upload your file or type a topic."
    }
  },
  fr: {
    title: "StudyGeniusAI",
    subtitle: "Propulsé par Gemini 2.5",
    uploadTitle: "1. Télécharger le support",
    uploadPlaceholder: "Cliquez pour ajouter PDF ou Image",
    uploadSub: "Supporte PDF, PNG, JPG",
    orPaste: "Ou collez du texte",
    pastePlaceholder: "Collez vos notes, transcription ou sujet ici...",
    contextTitle: "2. Contexte supplémentaire (Optionnel)",
    contextTip: "💡 Conseil : Demandez des formats d'examen, niveaux de difficulté ou sujets précis.",
    contextPlaceholder: "Ex: 'Focus sur le chap 3', 'Examen dans 2 jours', 'Niveau difficile'...",
    generate: "Générer",
    startChat: "Démarrer le Chat",
    processing: "Traitement...",
    generating: "Génération de vos supports d'étude...",
    analyzing: "Analyse du contenu avec Gemini AI",
    error: "Une erreur est survenue. Veuillez réessayer.",
    chatEmptyState: "Veuillez charger du contenu pour discuter avec le Tuteur IA.",
    tabs: {
      [AppMode.SUMMARY]: "Résumé",
      [AppMode.FLASHCARDS]: "Flashcards",
      [AppMode.QUIZ]: "Quiz",
      [AppMode.EXPLANATION]: "Approfondissement",
      [AppMode.STUDY_PLAN]: "Planning",
      [AppMode.CHAT]: "Tuteur IA"
    },
    titles: {
      summary: "Résumé du cours",
      explanation: "Explication approfondie",
      studyPlan: "Plan d'étude personnalisé"
    },
    flashcards: {
      card: "Carte",
      flipInstruction: "Cliquez pour retourner",
      question: "Question",
      answer: "Réponse",
      flipButton: "Retourner",
      noCards: "Aucune flashcard disponible."
    },
    quiz: {
      question: "Question",
      score: "Score",
      submit: "Valider",
      next: "Question suivante",
      viewResults: "Voir les résultats",
      tryAgain: "Réessayer",
      complete: "Quiz Terminé !",
      youGot: "Vous avez",
      outOf: "sur",
      correct: "correctes",
      explanation: "Explication",
      noQuiz: "Aucun quiz généré."
    },
    chat: {
      title: "Tuteur StudyGeniusAI",
      subtitle: "Toujours là pour vous aider à apprendre",
      thinking: "StudyGenius réfléchit...",
      placeholder: "Posez une question sur votre cours..."
    },
    welcome: {
      title: "🎓 Bienvenue sur StudyGeniusAI",
      subtitle: "Ton assistant intelligent pour apprendre plus vite.",
      buttonText: "Continuer"
    },
    login: {
      title: "🔐 Connexion ou Création de compte",
      subtitle: "Accède à tes documents, ton planning et ta progression.",
      methods: {
        google: "Continuer avec Google",
        email: "Continuer avec un email",
        guest: "Continuer sans compte"
      },
      emailView: {
        placeholder: "nom@exemple.com",
        submit: "Envoyer un lien magique",
        back: "Retour",
        sentTitle: "Vérifiez vos emails",
        sentDesc: "Nous vous avons envoyé un lien pour vous connecter."
      },
      guestWarning: "Si vous continuez sans compte, vos documents seront supprimés à la fin de la session."
    },
    banner: {
      guest: "Mode Invité : Les documents ne sont pas sauvegardés.",
      user: "Mode Connecté : Vos documents sont sauvegardés (3 jours)."
    },
    welcomeMessages: {
      guest: "👋 Bienvenue ! Tu es en mode invité. Rien ne sera sauvegardé. Téléverse un document pour commencer.",
      user: "👋 Bienvenue ! Tes documents et ton espace d’étude sont prêts. Téléverse ton fichier ou écris un sujet."
    }
  }
};

function App() {
  const [viewState, setViewState] = useState<ViewState>('WELCOME');
  const [user, setUser] = useState<User | null>(null);
  
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.SUMMARY);
  const [fileData, setFileData] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');

  // Cache generated content
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  const handleLogin = (isGuest: boolean, email?: string) => {
    if (isGuest) {
      setUser({ id: 'guest', name: 'Guest', isGuest: true });
    } else {
      setUser({ id: 'user_1', name: email ? email.split('@')[0] : 'Student', email, isGuest: false });
    }
    setViewState('APP');
  };

  const handleLogout = () => {
    setUser(null);
    setViewState('WELCOME');
    setFileData(null);
    setTextInput('');
    setGeneratedContent({});
    setChatHistory([]);
    chatSessionRef.current = null;
  };

  // Reset chat when content changes or language changes
  useEffect(() => {
    setChatHistory([]);
    chatSessionRef.current = null;
  }, [fileData, textInput, language]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setFileData({
          name: file.name,
          mimeType: file.type,
          data: base64String,
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const initChatIfNeeded = async () => {
    if (!chatSessionRef.current) {
      // Get the correct welcome message based on user status
      const welcomeMsg = user?.isGuest ? t.welcomeMessages.guest : t.welcomeMessages.user;

      if (!fileData && !textInput.trim()) return false;
      
      const { chat, initialMessages } = initializeChatSession({
        mode: AppMode.CHAT,
        textInput,
        fileData: fileData ? { mimeType: fileData.mimeType, data: fileData.data } : undefined,
        additionalContext,
        language,
        customWelcomeMessage: welcomeMsg
      });
      
      chatSessionRef.current = chat;
      setChatHistory(initialMessages);
    }
    return true;
  };

  const handleSendMessage = async (message: string) => {
    const initialized = await initChatIfNeeded();
    if (!initialized || !chatSessionRef.current) return;

    // Optimistically add user message
    const newHistory = [...chatHistory, { role: 'user' as const, text: message }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const responseText = await sendChatMessage(chatSessionRef.current, message);
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: t.error, isError: true }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!fileData && !textInput.trim()) return;

    if (activeMode === AppMode.CHAT) {
      await initChatIfNeeded();
      return;
    }

    setLoading('loading');
    try {
      const result = await generateStudyMaterial({
        mode: activeMode,
        textInput,
        fileData: fileData ? { mimeType: fileData.mimeType, data: fileData.data } : undefined,
        additionalContext,
        language
      });

      setGeneratedContent(prev => ({
        ...prev,
        [`${activeMode}_${language}`]: result
      }));
      setLoading('success');
    } catch (error) {
      console.error(error);
      setLoading('error');
    }
  };

  const handleTabChange = async (mode: AppMode) => {
    setActiveMode(mode);
    setLoading('idle');
    
    if (mode === AppMode.CHAT) {
      // Auto-initialize chat if content exists
      if (fileData || textInput.trim()) {
        await initChatIfNeeded();
      }
    }
  };

  const renderContent = () => {
    // Chat Mode
    if (activeMode === AppMode.CHAT) {
      if ((!fileData && !textInput.trim())) {
         return (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
             <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
             <p className="text-lg">{t.chatEmptyState}</p>
          </div>
        );
      }
      return (
        <ChatView 
          messages={chatHistory} 
          onSendMessage={handleSendMessage} 
          isLoading={isChatLoading}
          labels={t.chat}
        />
      );
    }

    // Other Modes
    const content = generatedContent[`${activeMode}_${language}`];

    if (loading === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-500 dark:text-indigo-400 animate-pulse">
          <Sparkles size={48} className="mb-4 animate-spin-slow" />
          <p className="text-xl font-medium text-gray-900 dark:text-gray-100">{t.generating}</p>
          <p className="text-sm text-indigo-400 dark:text-indigo-300 mt-2">{t.analyzing}</p>
        </div>
      );
    }

    if (loading === 'error') {
      return (
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30">
          <p className="text-red-600 dark:text-red-400 font-medium">{t.error}</p>
        </div>
      );
    }

    if (!content && loading === 'idle') {
      // Empty State with Welcome Message
      const welcomeMsg = user?.isGuest ? t.welcomeMessages.guest : t.welcomeMessages.user;
      return (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.05)] px-6">
           <GraduationCap size={48} className="mx-auto mb-6 opacity-50 text-indigo-500" />
           <p className="text-lg whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-300">
             {welcomeMsg}
           </p>
        </div>
      );
    }

    switch (activeMode) {
      case AppMode.SUMMARY:
        return <MarkdownView content={content as string} title={t.titles.summary} />;
      case AppMode.FLASHCARDS:
        return <FlashcardView flashcards={content as Flashcard[]} labels={t.flashcards} />;
      case AppMode.QUIZ:
        return <QuizView questions={content as QuizQuestion[]} labels={t.quiz} />;
      case AppMode.EXPLANATION:
        return <MarkdownView content={content as string} title={t.titles.explanation} />;
      case AppMode.STUDY_PLAN:
        return <MarkdownView content={content as string} title={t.titles.studyPlan} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: AppMode.SUMMARY, label: t.tabs[AppMode.SUMMARY] },
    { id: AppMode.FLASHCARDS, label: t.tabs[AppMode.FLASHCARDS] },
    { id: AppMode.QUIZ, label: t.tabs[AppMode.QUIZ] },
    { id: AppMode.EXPLANATION, label: t.tabs[AppMode.EXPLANATION] },
    { id: AppMode.STUDY_PLAN, label: t.tabs[AppMode.STUDY_PLAN] },
    { id: AppMode.CHAT, label: t.tabs[AppMode.CHAT] },
  ];

  // Logic to render different views
  if (viewState === 'WELCOME') {
    return <WelcomeScreen onStart={() => setViewState('LOGIN')} labels={t.welcome} />;
  }

  if (viewState === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} labels={t.login} />;
  }

  // APP View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2 mr-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">
                <UserIcon size={16} />
                <span>{user.isGuest ? 'Guest' : user.name}</span>
              </div>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold text-sm border border-gray-200 dark:border-gray-600"
              aria-label="Toggle Language"
            >
              <Languages size={18} />
              <span>{language === 'en' ? 'EN' : 'FR'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Document Storage Status Banner */}
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm border shadow-sm ${
          user?.isGuest 
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200' 
            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          {user?.isGuest ? (
            <>
              <Clock className="flex-shrink-0 mt-0.5" size={18} />
              <span>
                {t.banner.guest.includes(':') ? (
                   <><strong>{t.banner.guest.split(':')[0]}:</strong> {t.banner.guest.split(':')[1]}</>
                ) : (
                   t.banner.guest
                )}
                {' '}<span className="underline cursor-pointer hover:text-amber-600 dark:hover:text-amber-100" onClick={() => setViewState('LOGIN')}>Connectez-vous</span> pour sauvegarder.
              </span>
            </>
          ) : (
            <>
              <FileText className="flex-shrink-0 mt-0.5" size={18} />
              <span>
                 {t.banner.user.includes(':') ? (
                    <><strong>{t.banner.user.split(':')[0]}:</strong> {t.banner.user.split(':')[1]}</>
                 ) : (
                    t.banner.user
                 )}
              </span>
            </>
          )}
        </div>

        {/* Input Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.4)] p-8 mb-8 border border-gray-50 dark:border-gray-700 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* File Upload / Text Area */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t.uploadTitle}</label>
              
              {!fileData ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary dark:border-primary-dark bg-primary-dark/5 dark:bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center text-primary dark:text-primary-dark cursor-pointer hover:bg-primary-dark/10 dark:hover:bg-primary/10 transition-colors h-48 group"
                >
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-sm font-bold">{t.uploadPlaceholder}</p>
                  <p className="text-xs opacity-70 mt-1">{t.uploadSub}</p>
                </div>
              ) : (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-6 flex items-center justify-between h-48">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl text-indigo-500 dark:text-indigo-400 shadow-sm">
                      <UploadCloud size={28} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{fileData.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">{fileData.mimeType.split('/')[1]}</p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2 rounded-lg shadow-sm">
                    <X size={20} />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="application/pdf,image/png,image/jpeg,image/webp"
              />
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                  <span className="bg-white dark:bg-gray-800 px-4 text-gray-400 dark:text-gray-500">{t.orPaste}</span>
                </div>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t.pastePlaceholder}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 min-h-[120px] transition-all"
              />
            </div>

            {/* Context & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="flex-grow">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">{t.contextTitle}</label>
                <div className="bg-accent/10 dark:bg-accent/20 rounded-2xl p-4 mb-3 border border-accent/20 dark:border-accent/30">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">{t.contextTip}</p>
                </div>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 h-40 resize-none transition-all"
                  placeholder={t.contextPlaceholder}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={(!fileData && !textInput) || loading === 'loading'}
                className={`w-full py-4 rounded-xl font-bold text-white text-[16px] shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3
                  ${(!fileData && !textInput) || loading === 'loading' 
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-br from-primary to-primary-hover hover:from-primary-hover hover:to-blue-500 shadow-primary/30'
                  }`}
              >
                {loading === 'loading' ? (
                  <>{t.processing}</>
                ) : (
                  <>
                    <Sparkles size={22} />
                    {activeMode === AppMode.CHAT ? t.startChat : `${t.generate} ${t.tabs[activeMode]}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Output Section */}
        <TabNavigation 
          activeMode={activeMode} 
          onSelectMode={handleTabChange} 
          disabled={loading === 'loading'}
          tabs={tabs}
        />

        <div className="min-h-[400px]">
          {renderContent()}
        </div>

      </main>
    </div>
  );
}

export default App;