import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getGeminiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }

    // Access via import.meta.env in Vite
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "VITE_GEMINI_API_KEY environment variable is not set. Please set it to use Gemini features."
        );
    }

    ai = new GoogleGenAI({ apiKey });
    console.log("Gemini key:", apiKey);
    console.log("Generic API key:", process.env.GEMINI_API_KEY);
    return ai;
};

const textModel = "gemini-2.5-flash";
const embeddingModel = "text-embedding-004";

// Function to convert base64 data URL to pure base64
const base64ToPure = (dataUrl: string): string => {
    return dataUrl.split(",")[1];
};

export const generateText = async (prompt: string): Promise<string> => {
    try {
        const client = getGeminiClient();
        const response = await client.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
};

export const generateTextWithImage = async (
    prompt: string,
    imageBase64: string,
    mimeType: string
): Promise<string> => {
    try {
        const client = getGeminiClient();
        const imagePart = {
            inlineData: {
                mimeType,
                data: base64ToPure(imageBase64),
            },
        };
        const textPart = { text: prompt };

        const response = await client.models.generateContent({
            model: textModel,
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text with image:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512`;
        return Promise.resolve(imageUrl);
    } catch (error) {
        console.error("Error creating image URL for Pollinations.ai:", error);
        throw error;
    }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const client = getGeminiClient();

        const result: any = await client.models.embedContent({
            model: embeddingModel,
            contents: [{ text }],
        } as any);

        if (Array.isArray(result?.embedding?.values)) {
            return result.embedding.values as number[];
        }

        console.error("Unexpected embedding response shape:", result);
        throw new Error("Could not extract embedding values from response.");
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};
