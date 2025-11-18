// File types
export interface FileData {
  file: string; // base64 encoded file
  type: string; // MIME type
  imageUrl?: string;
  name?: string;
  size?: number;
}

// Chat message types
export interface ChatMessage {
  role: 'user' | 'model' | 'loader' | 'error';
  text: string;
}

// Component props
export interface ChatProps {
  file: FileData;
}

export interface SummaryProps {
  file: FileData;
}

export interface FileUploadProps {
  onFileUpload: (file: FileData) => void;
}

// API Response types
export interface ChatResponse {
  response: string;
  error?: string;
}

export interface SummaryResponse {
  summary: string;
  error?: string;
}

// Status types
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
