import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from './Icons';

interface QuizViewProps {
  questions: QuizQuestion[];
  labels: {
    question: string;
    score: string;
    submit: string;
    next: string;
    viewResults: string;
    tryAgain: string;
    complete: string;
    youGot: string;
    outOf: string;
    correct: string;
    explanation: string;
    noQuiz: string;
  };
}

const QuizView: React.FC<QuizViewProps> = ({ questions, labels }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQIndex];

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  if (!questions || questions.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400">{labels.noQuiz}</div>;
  }

  if (showResults) {
    return (
      <div className="max-w-xl mx-auto text-center bg-white dark:bg-gray-800 p-10 rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{labels.complete}</h2>
        <div className="inline-block p-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-6">
          <div className="text-5xl font-black text-indigo-500 dark:text-indigo-400">
            {Math.round((score / questions.length) * 100)}%
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
          {labels.youGot} <span className="font-bold text-gray-900 dark:text-gray-100">{score}</span> {labels.outOf} <span className="font-bold text-gray-900 dark:text-gray-100">{questions.length}</span> {labels.correct}.
        </p>
        
        <button 
          onClick={handleRestart}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center gap-2 mx-auto"
        >
          <RotateCcw size={20} />
          {labels.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-2">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">{labels.question} {currentQIndex + 1} / {questions.length}</span>
        <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400">{labels.score}: {score}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => {
            let itemClass = "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center ";
            
            if (isSubmitted) {
              if (idx === currentQuestion.correctAnswerIndex) {
                itemClass += "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300";
              } else if (idx === selectedOption) {
                itemClass += "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300";
              } else {
                itemClass += "border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-60";
              }
            } else {
              if (idx === selectedOption) {
                itemClass += "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 shadow-sm";
              } else {
                itemClass += "border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={itemClass}
                disabled={isSubmitted}
              >
                <span className="font-medium text-base">{option}</span>
                {isSubmitted && idx === currentQuestion.correctAnswerIndex && <CheckCircle className="text-green-500 dark:text-green-400" size={24} />}
                {isSubmitted && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && <XCircle className="text-red-500 dark:text-red-400" size={24} />}
              </button>
            );
          })}
        </div>

        {isSubmitted && (
          <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30 animate-fadeIn">
            <span className="font-bold flex items-center gap-2 mb-2 text-indigo-500 dark:text-indigo-400">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></div> {labels.explanation}:
            </span>
            <p className="leading-relaxed opacity-90">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className={`px-10 py-4 rounded-xl font-bold text-white transition-all shadow-md ${
              selectedOption === null ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 hover:shadow-lg hover:scale-105'
            }`}
          >
            {labels.submit}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            {currentQIndex < questions.length - 1 ? labels.next : labels.viewResults}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;