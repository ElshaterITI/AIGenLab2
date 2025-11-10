import React from 'react';
import { ChatMode } from '../types';

interface HeaderProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
}

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6-10.375A1 1 0 0 1 3.437 2.5l10.375 6a2 2 0 0 0 1.437 1.437l6 10.375a1 1 0 0 1-1.125 1.563l-10.375-6Z"/><path d="M20 5.5 18.5 4"/><path d="m14 8.5-1.5-1.5"/><path d="M12.5 2 12 3.5"/><path d="M3 11.5 4 11"/>
  </svg>
);


const Header: React.FC<HeaderProps> = ({ mode, setMode }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 shadow-md">
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-purple-400"/>
        <h1 className="text-xl font-bold text-white">Gemini AI Studio</h1>
      </div>
      <div className="flex items-center space-x-2 rounded-full bg-gray-700 p-1">
        <button
          onClick={() => setMode(ChatMode.TEXT)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
            mode === ChatMode.TEXT ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMode(ChatMode.IMAGE)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
            mode === ChatMode.IMAGE ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          Generate Image
        </button>
        <button
          onClick={() => setMode(ChatMode.TOOLS)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
            mode === ChatMode.TOOLS ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          AI Tools
        </button>
        <button
          onClick={() => setMode(ChatMode.RAG)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
            mode === ChatMode.RAG ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          Chat with Files
        </button>
      </div>
    </header>
  );
};

export default Header;