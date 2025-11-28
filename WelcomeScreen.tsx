import React from 'react';
import { GraduationCap, Sparkles } from './Icons';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
  labels: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
  };
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, labels }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center p-6 md:p-12"
      >
        <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[20px] mb-10 shadow-lg shadow-indigo-500/30 text-white">
           <GraduationCap size={64} />
        </div>
        
        <h1 className="text-4xl md:text-[40px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
          {labels.title}
        </h1>
        
        <h2 className="text-xl md:text-[22px] font-medium text-indigo-500 dark:text-indigo-400 mb-8 leading-snug">
          {labels.subtitle}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-12 max-w-lg mx-auto">
          {labels.description}
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-[18px] font-bold rounded-xl shadow-lg transition-all flex items-center gap-3 mx-auto"
        >
          {labels.buttonText}
          <Sparkles size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;