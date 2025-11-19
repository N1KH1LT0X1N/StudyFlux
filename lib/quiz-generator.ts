import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface QuizQuestion {
  question: string;
  options: string[]; // Array of 4 options
  correctAnswer: string; // Letter A, B, C, or D
  explanation: string;
}

/**
 * Generate quiz questions from document text and summary using AI
 * @param documentText - Full text content of the document
 * @param documentSummary - AI-generated summary of the document
 * @param questionCount - Number of questions to generate
 * @returns Array of generated quiz questions
 */
export async function generateQuiz(
  documentText: string,
  documentSummary: string,
  questionCount: number = 10
): Promise<QuizQuestion[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate document text if too long (keep first 8000 chars for context)
    const truncatedText =
      documentText.length > 8000
        ? documentText.substring(0, 8000) + "..."
        : documentText;

    const prompt = `You are an expert educational content creator. Generate ${questionCount} multiple choice questions from the following document.

DOCUMENT SUMMARY:
${documentSummary}

DOCUMENT CONTENT:
${truncatedText}

INSTRUCTIONS:
1. Create ${questionCount} multiple choice questions that test understanding of key concepts
2. Each question should have:
   - question: A clear, specific question that tests comprehension
   - options: Exactly 4 answer choices (labeled A, B, C, D)
   - correctAnswer: The letter of the correct answer (A, B, C, or D)
   - explanation: A brief explanation of why the answer is correct (1-2 sentences)
3. Focus on key concepts and understanding, not just recall
4. Make questions challenging but fair
5. Ensure incorrect options are plausible but clearly wrong
6. Vary question difficulty from easy to hard
7. Test different aspects: definitions, applications, comparisons, cause-effect
8. Avoid questions that are too obvious or trivial
9. Don't include questions about page numbers or document structure

Return ONLY a valid JSON array with no additional text or markdown formatting:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation of why A is correct."
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse the JSON response
    const questions: QuizQuestion[] = JSON.parse(text);

    // Validate questions
    if (!Array.isArray(questions)) {
      throw new Error("AI did not return an array of questions");
    }

    // Filter and validate each question
    const validQuestions = questions.filter((q) => {
      return (
        q &&
        typeof q === "object" &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === "string" &&
        ["A", "B", "C", "D"].includes(q.correctAnswer.toUpperCase()) &&
        typeof q.explanation === "string" &&
        q.question.trim().length > 0 &&
        q.explanation.trim().length > 0
      );
    });

    if (validQuestions.length === 0) {
      throw new Error("No valid questions were generated");
    }

    // Normalize correct answers to uppercase
    validQuestions.forEach((q) => {
      q.correctAnswer = q.correctAnswer.toUpperCase();
    });

    // Warn if we didn't get the expected number
    if (validQuestions.length < questionCount) {
      console.warn(
        `Only ${validQuestions.length} questions generated, expected ${questionCount}`
      );
    }

    return validQuestions.slice(0, questionCount);
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse AI response. The AI did not return valid JSON."
      );
    }
    throw new Error("Failed to generate quiz using AI");
  }
}

/**
 * Calculate quiz score
 * @param userAnswers - Object mapping question index to user's answer letter
 * @param questions - Array of quiz questions
 * @returns Score information
 */
export function calculateQuizScore(
  userAnswers: Record<number, string>,
  questions: QuizQuestion[]
): {
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
} {
  let correctCount = 0;

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index]?.toUpperCase();
    if (userAnswer === question.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return {
    score: correctCount,
    totalQuestions,
    correctCount,
    percentage,
  };
}
