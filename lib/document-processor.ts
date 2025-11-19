import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

/**
 * Extract text from PDF buffer
 * @param buffer - PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse to avoid ESM issues
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule.default || pdfParseModule) as any;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from image buffer using Gemini Vision
 * @param buffer - Image file buffer
 * @returns Extracted text content
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert buffer to base64
    const base64Image = buffer.toString("base64");

    // Detect image type
    const metadata = await sharp(buffer).metadata();
    const mimeType = `image/${metadata.format}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      "Extract all text content from this image. If it contains handwritten notes, diagrams, or any educational content, transcribe it accurately. Provide only the text content without any additional commentary.",
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text from image");
  }
}

/**
 * Chunk document text into smaller pieces for processing
 * @param text - Full document text
 * @param maxChunkSize - Maximum size of each chunk in characters
 * @returns Array of text chunks
 */
export function chunkDocument(text: string, maxChunkSize: number = 4000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split("\n\n");
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Extract metadata from document text
 * @param text - Document text content
 * @returns Metadata object with page count, word count, and estimated read time
 */
export function extractMetadata(text: string): {
  pageCount: number;
  wordCount: number;
  estimatedReadTime: number;
} {
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  // Estimate page count (assuming ~300 words per page)
  const pageCount = Math.max(1, Math.ceil(wordCount / 300));

  // Estimate read time in minutes (assuming ~200 words per minute)
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    pageCount,
    wordCount,
    estimatedReadTime,
  };
}

/**
 * Process document file and extract all information
 * @param buffer - File buffer
 * @param fileType - File type (pdf, jpg, png, etc.)
 * @returns Extracted text and metadata
 */
export async function processDocument(
  buffer: Buffer,
  fileType: string
): Promise<{ text: string; metadata: ReturnType<typeof extractMetadata> }> {
  let text: string;

  if (fileType === "pdf" || fileType === "application/pdf") {
    text = await extractTextFromPDF(buffer);
  } else if (
    fileType === "jpg" ||
    fileType === "jpeg" ||
    fileType === "png" ||
    fileType === "image/jpeg" ||
    fileType === "image/png"
  ) {
    text = await extractTextFromImage(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const metadata = extractMetadata(text);

  return {
    text,
    metadata,
  };
}
