import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { generateEmbedding, generateText } from "../services/geminiService";
import Message from "./Message";
import SendIcon from "./icons/SendIcon";
import FileUploadIcon from "./icons/FileUploadIcon";

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const LoadingSpinner: React.FC = () => (
    <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

const RagChatInterface: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState("Please upload a .txt file to begin.");
    const [chunks, setChunks] = useState<string[]>([]);
    const embeddingsRef = useRef<number[][]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "text/plain") {
            setStatus("Error: Please upload a .txt file.");
            return;
        }

        setFile(selectedFile);
        setIsLoading(true);
        setMessages([]);
        setChunks([]);
        embeddingsRef.current = [];
        setStatus(`Processing "${selectedFile.name}"...`);

        try {
            const text = await selectedFile.text();

            const fileChunks = text
                .split(/\n\s*\n/)
                .filter((chunk) => chunk.trim().length > 10);
            if (fileChunks.length === 0) {
                throw new Error(
                    "Could not find any paragraphs in the file. Please ensure it is a valid .txt file."
                );
            }
            setChunks(fileChunks);
            setStatus(
                `Chunked file into ${fileChunks.length} parts. Generating embeddings...`
            );

            const generatedEmbeddings: number[][] = [];
            for (let i = 0; i < fileChunks.length; i++) {
                const chunk = fileChunks[i];
                const embedding = await generateEmbedding(chunk);
                generatedEmbeddings.push(embedding);
                setStatus(
                    `Generated embedding for chunk ${i + 1}/${
                        fileChunks.length
                    }...`
                );
            }
            embeddingsRef.current = generatedEmbeddings;

            setStatus(`Ready to chat with "${selectedFile.name}".`);
            setMessages([
                {
                    role: "model",
                    text: `I've finished reading "${selectedFile.name}". What would you like to know?`,
                },
            ]);
        } catch (error) {
            console.error(error);
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            setStatus(`Error processing file: ${errorMessage}`);
            setFile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !inputText.trim() || !file) return;

        const userMessage: ChatMessage = { role: "user", text: inputText };
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            const queryEmbedding = await generateEmbedding(inputText);

            const similarities = embeddingsRef.current.map((emb) =>
                cosineSimilarity(queryEmbedding, emb)
            );

            const sortedIndices = similarities
                .map((val, index) => ({ val, index }))
                .sort((a, b) => b.val - a.val)
                .map((obj) => obj.index);

            const topK = 3;
            const contextChunks = sortedIndices
                .slice(0, topK)
                .map((index) => chunks[index]);
            const context = contextChunks.join("\n\n---\n\n");

            const prompt = `Based on the following context from a document, please answer the user's question. If the context doesn't contain the answer, say that you couldn't find the information in the document.\n\nContext:\n${context}\n\nQuestion:\n${inputText}\n\nAnswer:`;

            const modelResponseText = await generateText(prompt);

            const modelMessage: ChatMessage = {
                role: "model",
                text: modelResponseText,
            };
            setMessages((prev) => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? e.message
                    : "An unknown error occurred.";
            const errorResponseMessage: ChatMessage = {
                role: "model",
                text: `Sorry, I encountered an error: ${errorMessage}`,
            };
            setMessages((prev) => [...prev, errorResponseMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const isChatDisabled = !file || chunks.length === 0 || isLoading;

    return (
        <div className="flex flex-col h-full bg-gray-900">
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center gap-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt"
                    disabled={isLoading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                >
                    <FileUploadIcon className="w-5 h-5" />
                    {file ? "Change File" : "Upload .txt File"}
                </button>
                <div className="flex items-center gap-2 text-gray-300">
                    {isLoading && <LoadingSpinner />}
                    <span className="truncate">{status}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                {isLoading &&
                    messages.length > 0 &&
                    messages[messages.length - 1].role === "user" && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 rounded-lg p-3 max-w-lg animate-pulse">
                                <div className="h-4 bg-gray-600 rounded w-24"></div>
                            </div>
                        </div>
                    )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center space-x-3"
                >
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                handleSendMessage(e);
                            }
                        }}
                        placeholder={
                            isChatDisabled
                                ? "Please upload a file to start chatting"
                                : "Ask a question about the document..."
                        }
                        className="flex-1 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                        rows={1}
                        disabled={isChatDisabled}
                    />
                    <button
                        type="submit"
                        disabled={isChatDisabled || !inputText.trim()}
                        className="p-3 bg-purple-600 text-white rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RagChatInterface;
