import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Sparkles, MessageSquare, ChevronRight } from './Icons';
import ReactMarkdown from 'react-markdown';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  labels: {
    title: string;
    subtitle: string;
    thinking: string;
    placeholder: string;
  };
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading, labels }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[650px] transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-500 dark:text-indigo-400">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{labels.title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{labels.subtitle}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB] dark:bg-gray-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
              }`}
            >
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-indigo dark:prose-invert'}`}>
                 <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2.5">
              <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400 animate-spin-slow" />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{labels.thinking}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="relative flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={labels.placeholder}
            disabled={isLoading}
            className="flex-1 pl-5 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`px-5 py-4 rounded-xl transition-all shadow-md flex items-center justify-center ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed shadow-none'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;