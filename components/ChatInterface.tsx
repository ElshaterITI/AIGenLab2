
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AttachedImage } from '../types';
import Message from './Message';
import PaperclipIcon from './icons/PaperclipIcon';
import SendIcon from './icons/SendIcon';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: AttachedImage) => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!inputText.trim() && !attachedImage)) return;
    onSendMessage(inputText, attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("File is too large. Please select a file smaller than 4MB.");
        return;
      }
      const base64 = await fileToBase64(file);
      setAttachedImage({ base64, mimeType: file.type, name: file.name });
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        {isLoading && messages[messages.length-1].role === 'user' && (
             <div className="flex justify-start">
                 <div className="bg-gray-700 rounded-lg p-3 max-w-lg animate-pulse">
                     <div className="h-4 bg-gray-600 rounded w-24"></div>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        {attachedImage && (
            <div className="mb-2 flex items-center bg-gray-700 p-2 rounded-lg">
                <img src={attachedImage.base64} alt="preview" className="w-12 h-12 object-cover rounded mr-2" />
                <span className="text-sm text-gray-300 truncate flex-1">{attachedImage.name}</span>
                <button onClick={() => setAttachedImage(null)} className="ml-2 text-red-400 hover:text-red-300">&times;</button>
            </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp, image/gif"
          />
          <button type="button" onClick={handleAttachClick} className="p-2 text-gray-400 hover:text-purple-400 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage(e);
                }
            }}
            placeholder="Type a message or attach an image..."
            className="flex-1 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || (!inputText.trim() && !attachedImage)} className="p-3 bg-purple-600 text-white rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors">
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
