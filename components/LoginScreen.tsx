import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldAlert, Chrome, ArrowLeft, CheckCircle } from './Icons';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: (isGuest: boolean, email?: string) => void;
  labels: {
    title: string;
    subtitle: string;
    methods: {
      google: string;
      email: string;
      guest: string;
    };
    emailView: {
      placeholder: string;
      submit: string;
      back: string;
      sentTitle: string;
      sentDesc: string;
    };
    guestWarning: string;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, labels }) => {
  const [view, setView] = useState<'main' | 'email' | 'magicLinkSent'>('main');
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().includes('@')) {
      // Simulate magic link sent
      setView('magicLinkSent');
      setTimeout(() => {
        onLogin(false, email);
      }, 2000); // Auto login after 2s for demo
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-[420px] w-full bg-white dark:bg-gray-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        {/* Header Content */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-5 text-indigo-600 dark:text-indigo-400">
             <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {labels.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-4">
            {labels.subtitle}
          </p>
        </div>

        {view === 'main' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 relative z-10"
          >
            {/* Google */}
            <button 
              onClick={() => onLogin(false, 'user@gmail.com')}
              className="w-full py-3.5 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-3 relative overflow-hidden"
            >
              <Chrome size={20} className="text-blue-500" />
              <span>{labels.methods.google}</span>
            </button>

            {/* Email */}
            <button 
              onClick={() => setView('email')}
              className="w-full py-3.5 px-4 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white dark:text-gray-100 border border-transparent dark:border-gray-600 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
            >
              <Mail size={20} />
              <span>{labels.methods.email}</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white dark:bg-gray-800 px-3 text-gray-400 dark:text-gray-500">Ou</span>
              </div>
            </div>

            {/* Guest */}
            <button 
              onClick={() => onLogin(true)}
              className="w-full py-3.5 px-4 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <User size={18} />
              {labels.methods.guest}
            </button>

             {/* Guest Warning */}
             <div className="mt-6 p-3.5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2.5">
                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                <p className="opacity-90 leading-relaxed">{labels.guestWarning}</p>
             </div>
          </motion.div>
        )}

        {view === 'email' && (
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleEmailSubmit}
            className="space-y-4 relative z-10"
          >
            <div className="space-y-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.emailView.placeholder}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {labels.emailView.submit}
              <ArrowRight size={18} />
            </button>

            <button 
              type="button"
              onClick={() => setView('main')}
              className="w-full py-3 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              {labels.emailView.back}
            </button>
          </motion.form>
        )}

        {view === 'magicLinkSent' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 text-green-600 dark:text-green-400">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{labels.emailView.sentTitle}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{labels.emailView.sentDesc}</p>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};

export default LoginScreen;