import React, { useState, useCallback } from 'react';
import { ChatMode, ChatMessage, AttachedImage } from './types';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import OpenAITools from './components/OpenAITools';
import RagChatInterface from './components/RagChatInterface';
import { generateText, generateTextWithImage, generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hello! I'm Gemini. You can chat with me or ask me to generate an image. Use the toggle above to switch modes.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (text: string, image?: AttachedImage) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', text, image: image?.base64 };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      let modelResponseText: string;
      if (image) {
        modelResponseText = await generateTextWithImage(text, image.base64, image.mimeType);
      } else {
        modelResponseText = await generateText(text);
      }
      
      const modelMessage: ChatMessage = { role: 'model', text: modelResponseText };
      setChatHistory((prev) => [...prev, modelMessage]);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      const errorResponseMessage: ChatMessage = { role: 'model', text: `Sorry, I encountered an error: ${errorMessage}` };
      setChatHistory((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateImage = useCallback(async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const imageUrl = await generateImage(prompt);
      const imageMessage: ChatMessage = {
          role: 'user',
          text: `Image prompt: "${prompt}"`,
      };
      const modelMessage: ChatMessage = {
          role: 'model',
          text: 'Here is the image you requested:',
          image: imageUrl
      };
      if (mode === ChatMode.TEXT) {
          setChatHistory(prev => [...prev, imageMessage, modelMessage]);
      }
      return imageUrl;
    // FIX: Corrected a typo in the catch block from `(e)_` to `(e)`.
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
      if (mode === ChatMode.TEXT) {
          const errorResponseMessage: ChatMessage = { role: 'model', text: `Sorry, I failed to generate the image: ${errorMessage}` };
          setChatHistory((prev) => [...prev, errorResponseMessage]);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-900 text-gray-100">
      <Header mode={mode} setMode={setMode} />
      <main className="flex-1 overflow-auto">
        {mode === ChatMode.TEXT && (
          <ChatInterface
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        )}
        {mode === ChatMode.IMAGE && (
          <ImageGenerator 
            onGenerateImage={handleGenerateImage}
            isLoading={isLoading}
            error={error}
          />
        )}
        {mode === ChatMode.TOOLS && (
          <OpenAITools />
        )}
        {mode === ChatMode.RAG && (
          <RagChatInterface />
        )}
      </main>
    </div>
  );
};

export default App;