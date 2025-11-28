import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
  content: string;
  title?: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content, title }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      {title && (
        <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-2">
            {title}
          </h2>
        </div>
      )}
      <div className="p-8 prose prose-indigo dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-img:rounded-xl">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownView;