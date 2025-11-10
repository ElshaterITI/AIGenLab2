const OPENAI_API_URL = "https://api.openai.com/v1";

const getOpenAIApiKey = (): string => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "OPENAI_API_KEY environment variable is not set. Please set it to use OpenAI tools."
        );
    }
    return apiKey;
};

const openAIHeaders = () => ({
    Authorization: `Bearer ${getOpenAIApiKey()}`,
});

// ✅ Removed getEmbedding() completely

export const uploadFileForFineTuning = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("purpose", "fine-tune");
    formData.append("file", file);

    const response = await fetch(`${OPENAI_API_URL}/files`, {
        method: "POST",
        headers: openAIHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to upload file to OpenAI"
        );
    }
    return response.json();
};

export const createFineTuningJob = async (fileId: string): Promise<any> => {
    const response = await fetch(`${OPENAI_API_URL}/fine_tuning/jobs`, {
        method: "POST",
        headers: {
            ...openAIHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            training_file: fileId,
            model: "gpt-3.5-turbo",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message ||
                "Failed to create fine-tuning job with OpenAI"
        );
    }
    return response.json();
};
