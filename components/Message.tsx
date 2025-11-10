
import React from 'react';
import { ChatMessage } from '../types';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
          G
        </div>
      )}
      <div
        className={`rounded-lg p-3 max-w-lg lg:max-w-xl xl:max-w-2xl shadow-md ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-gray-700 text-gray-200'
        }`}
      >
        {message.image && (
          <img 
            src={message.image} 
            alt="user upload" 
            className="rounded-md mb-2 max-h-64 object-contain"
          />
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
};

export default Message;
