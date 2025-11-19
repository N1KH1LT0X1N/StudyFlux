import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface GeneratedFlashcard {
  front: string;
  back: string;
  hint?: string;
}

/**
 * Generate flashcards from document text and summary using AI
 * @param documentText - Full text content of the document
 * @param documentSummary - AI-generated summary of the document
 * @returns Array of generated flashcards
 */
export async function generateFlashcards(
  documentText: string,
  documentSummary: string
): Promise<GeneratedFlashcard[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate document text if too long (keep first 8000 chars for context)
    const truncatedText =
      documentText.length > 8000
        ? documentText.substring(0, 8000) + "..."
        : documentText;

    const prompt = `You are an expert educational content creator. Generate 10-15 high-quality flashcards from the following document.

DOCUMENT SUMMARY:
${documentSummary}

DOCUMENT CONTENT:
${truncatedText}

INSTRUCTIONS:
1. Create 10-15 flashcards that cover the most important concepts, definitions, and facts
2. Each flashcard should have:
   - front: A clear, concise question (one sentence)
   - back: A complete, accurate answer (1-3 sentences)
   - hint: An optional helpful hint or memory aid (keep it brief)
3. Focus on key concepts, important definitions, critical facts, and fundamental principles
4. Make questions specific and unambiguous
5. Ensure answers are complete but concise
6. Use simple, clear language appropriate for studying
7. Vary the question types (what, why, how, when, define, explain, etc.)
8. Avoid yes/no questions
9. Don't include questions about page numbers or document structure

Return ONLY a valid JSON array with no additional text or markdown formatting:
[
  {
    "front": "Question here?",
    "back": "Answer here.",
    "hint": "Optional hint here"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse the JSON response
    const flashcards: GeneratedFlashcard[] = JSON.parse(text);

    // Validate flashcards
    if (!Array.isArray(flashcards)) {
      throw new Error("AI did not return an array of flashcards");
    }

    // Filter and validate each flashcard
    const validFlashcards = flashcards.filter((card) => {
      return (
        card &&
        typeof card === "object" &&
        typeof card.front === "string" &&
        typeof card.back === "string" &&
        card.front.trim().length > 0 &&
        card.back.trim().length > 0
      );
    });

    if (validFlashcards.length === 0) {
      throw new Error("No valid flashcards were generated");
    }

    // Ensure we have 10-15 flashcards (or at least some)
    if (validFlashcards.length < 5) {
      console.warn(
        `Only ${validFlashcards.length} flashcards generated, expected 10-15`
      );
    }

    return validFlashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse AI response. The AI did not return valid JSON."
      );
    }
    throw new Error("Failed to generate flashcards using AI");
  }
}

/**
 * Determine difficulty based on text complexity
 * @param text - Text to analyze
 * @returns Difficulty level: "easy", "medium", or "hard"
 */
export function determineDifficulty(text: string): "easy" | "medium" | "hard" {
  // Simple heuristic based on word count and complexity
  const wordCount = text.trim().split(/\s+/).length;
  const avgWordLength =
    text.replace(/\s+/g, "").length / Math.max(wordCount, 1);
  const hasTechnicalTerms = /\b(algorithm|theorem|hypothesis|protocol|methodology)\b/i.test(
    text
  );

  if (wordCount < 50 && avgWordLength < 6 && !hasTechnicalTerms) {
    return "easy";
  } else if (wordCount > 200 || avgWordLength > 7 || hasTechnicalTerms) {
    return "hard";
  } else {
    return "medium";
  }
}

/**
 * Generate a single flashcard from a concept
 * @param concept - The concept to create a flashcard for
 * @returns Generated flashcard
 */
export async function generateSingleFlashcard(
  concept: string
): Promise<GeneratedFlashcard> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a single flashcard for studying the following concept:

CONCEPT: ${concept}

Create a flashcard with:
- front: A clear question about this concept
- back: A complete, accurate answer
- hint: An optional helpful hint or memory aid

Return ONLY a valid JSON object with no additional text or markdown formatting:
{
  "front": "Question here?",
  "back": "Answer here.",
  "hint": "Optional hint here"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const flashcard: GeneratedFlashcard = JSON.parse(text);

    // Validate flashcard
    if (
      !flashcard ||
      typeof flashcard.front !== "string" ||
      typeof flashcard.back !== "string"
    ) {
      throw new Error("Invalid flashcard format");
    }

    return flashcard;
  } catch (error) {
    console.error("Error generating single flashcard:", error);
    throw new Error("Failed to generate flashcard");
  }
}
