import React from 'react';
import { AppMode } from '../types';
import { BookOpen, Layers, FileQuestion, BrainCircuit, CalendarClock, MessageSquare } from './Icons';

interface TabNavigationProps {
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  disabled?: boolean;
  tabs: { id: AppMode; label: string }[];
}

const iconMap = {
  [AppMode.SUMMARY]: BookOpen,
  [AppMode.FLASHCARDS]: Layers,
  [AppMode.QUIZ]: FileQuestion,
  [AppMode.EXPLANATION]: BrainCircuit,
  [AppMode.STUDY_PLAN]: CalendarClock,
  [AppMode.CHAT]: MessageSquare,
};

const TabNavigation: React.FC<TabNavigationProps> = ({ activeMode, onSelectMode, disabled, tabs }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {tabs.map((tab) => {
        const Icon = iconMap[tab.id];
        const isActive = activeMode === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectMode(tab.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300
              ${isActive 
                ? 'bg-white dark:bg-gray-800 text-indigo-500 dark:text-indigo-400 shadow-md ring-2 ring-indigo-500 dark:ring-indigo-400 transform -translate-y-1' 
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 border border-gray-200 dark:border-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Icon size={18} className={isActive ? 'text-indigo-500 dark:text-indigo-400' : ''} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;