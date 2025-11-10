import React, { useState } from "react";
import {
    uploadFileForFineTuning,
    createFineTuningJob,
} from "../services/openAIService";

const ToolSection: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ title, description, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2 text-purple-400">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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

const OpenAITools: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadResult, setUploadResult] = useState<string | null>(null);
    const [jobResult, setJobResult] = useState<string | null>(null);
    const [isFineTuningLoading, setIsFineTuningLoading] = useState(false);
    const [fineTuningError, setFineTuningError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleStartFineTuning = async () => {
        if (!selectedFile) return;
        setIsFineTuningLoading(true);
        setFineTuningError(null);
        setUploadResult(null);
        setJobResult(null);

        try {
            // Step 1: Upload file
            const uploadResponse = await uploadFileForFineTuning(selectedFile);
            setUploadResult(
                `✅ File uploaded successfully. File ID: ${uploadResponse.id}`
            );

            // Step 2: Create fine-tuning job
            const jobResponse = await createFineTuningJob(uploadResponse.id);
            setJobResult(
                `🚀 Fine-tuning job created. Job ID: ${jobResponse.id}. Status: ${jobResponse.status}`
            );
        } catch (e) {
            setFineTuningError(
                e instanceof Error ? e.message : "An unknown error occurred."
            );
        } finally {
            setIsFineTuningLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">
                    OpenAI Fine-Tuning Tools
                </h2>
                <p className="text-gray-400 mt-2">
                    Upload a dataset and start a fine-tuning job using OpenAI’s
                    API.
                    <br />
                    Requires a valid <code>OPENAI_API_KEY</code>.
                </p>
            </div>

            {/* Fine-tuning Section */}
            <ToolSection
                title="Fine-tuning Job Creator"
                description="Upload a training file (in JSONL format) and start a fine-tuning job for the 'gpt-3.5-turbo' model."
            >
                <div className="flex items-center space-x-4">
                    <label
                        htmlFor="file-upload"
                        className="flex-1 cursor-pointer px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-center border-2 border-dashed border-gray-600 hover:border-purple-500 hover:text-white transition-colors"
                    >
                        {selectedFile
                            ? selectedFile.name
                            : "Choose a JSONL file..."}
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jsonl"
                        disabled={isFineTuningLoading}
                    />
                    <button
                        onClick={handleStartFineTuning}
                        disabled={isFineTuningLoading || !selectedFile}
                        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-all duration-200 flex items-center justify-center"
                    >
                        {isFineTuningLoading && <LoadingSpinner />}
                        {isFineTuningLoading ? "Processing..." : "Start Job"}
                    </button>
                </div>

                {fineTuningError && (
                    <div className="text-red-400 bg-red-900/20 p-3 rounded-lg">
                        {fineTuningError}
                    </div>
                )}
                {uploadResult && (
                    <div className="text-green-400 bg-green-900/20 p-3 rounded-lg">
                        {uploadResult}
                    </div>
                )}
                {jobResult && (
                    <div className="text-blue-400 bg-blue-900/20 p-3 rounded-lg">
                        {jobResult}
                    </div>
                )}
            </ToolSection>
        </div>
    );
};

export default OpenAITools;
