import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw } from './Icons';
import { motion } from 'framer-motion';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  labels: {
    card: string;
    flipInstruction: string;
    question: string;
    answer: string;
    flipButton: string;
    noCards: string;
  };
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards, labels }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400">{labels.noCards}</div>;
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
        <span className="bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
          {labels.card} {currentIndex + 1} / {flashcards.length}
        </span>
        <span className="flex items-center gap-2">
          {labels.flipInstruction} <RotateCcw size={14} />
        </span>
      </div>

      <div 
        className="relative w-full h-96 perspective-1000 cursor-pointer group"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full h-full text-center transition-all duration-500 transform-style-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col items-center justify-center p-10 hover:shadow-lg dark:hover:bg-gray-750 transition-all"
               style={{ backfaceVisibility: 'hidden' }}>
            <h3 className="text-indigo-500 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-6 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">{labels.question}</h3>
            <p className="text-2xl text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
              {currentCard.question}
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-10"
               style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <h3 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-6 bg-white/20 px-3 py-1 rounded-lg">{labels.answer}</h3>
            <p className="text-xl font-medium leading-relaxed">
              {currentCard.answer}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-6 mt-10">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
          className="px-8 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} />
          {labels.flipButton}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardView;