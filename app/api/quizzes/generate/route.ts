import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuiz } from "@/lib/quiz-generator";
import { awardPoints } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { documentId, questionCount = 10 } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Validate question count
    const validQuestionCount = Math.min(Math.max(questionCount, 5), 20);

    // Get document with its content
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId: user.id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.summary) {
      return NextResponse.json(
        { error: "Document must be processed first to generate a quiz" },
        { status: 400 }
      );
    }

    // Generate quiz questions using AI
    // Note: We need the document text. For now, we'll use the summary as the text
    // In a real implementation, you'd fetch the actual document content
    const questions = await generateQuiz(
      document.summary,
      document.summary,
      validQuestionCount
    );

    // Create quiz in database
    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        documentId: document.id,
        title: `Quiz: ${document.title}`,
        questions: {
          create: questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    // Award points for generating a quiz
    await awardPoints(user.id, "generate_quiz", 10, {
      quizId: quiz.id,
      documentId: document.id,
      questionCount: questions.length,
    });

    return NextResponse.json({
      success: true,
      quiz,
      message: "Quiz generated successfully! +10 points",
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
