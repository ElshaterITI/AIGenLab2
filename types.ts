export enum ChatMode {
  TEXT = 'text',
  IMAGE = 'image',
  TOOLS = 'tools',
  RAG = 'rag',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 data URL
}

export interface AttachedImage {
  base64: string;
  mimeType: string;
  name: string;
}