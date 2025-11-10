
import React, { useState } from 'react';

interface ImageGeneratorProps {
  onGenerateImage: (prompt: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onGenerateImage, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setGeneratedImage(null);
    const imageUrl = await onGenerateImage(prompt);
    if(imageUrl) {
        setGeneratedImage(imageUrl);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 md:p-8 bg-gray-900">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-2 text-purple-400">Image Generation Studio</h2>
        <p className="text-gray-400 mb-6">Describe the image you want to create. Be as specific as you can!</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style"
            className="flex-1 w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : 'Generate'}
          </button>
        </form>
        
        <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 overflow-hidden">
          {isLoading && !generatedImage && (
            <div className="text-center text-gray-400">
              <p>Generating your masterpiece...</p>
              <p className="text-sm mt-2">This can take a moment.</p>
            </div>
          )}
          {error && !isLoading && (
              <div className="text-center text-red-400 p-4">
                  <p className="font-bold">Generation Failed</p>
                  <p className="text-sm mt-1">{error}</p>
              </div>
          )}
          {!isLoading && generatedImage && (
            <img src={generatedImage} alt={prompt} className="w-full h-full object-contain" />
          )}
          {!isLoading && !generatedImage && !error && (
            <div className="text-center text-gray-500">
              <p>Your generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
