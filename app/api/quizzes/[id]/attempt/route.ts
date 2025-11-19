import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const { answers } = await req.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    const results: Array<{
      questionId: string;
      question: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }> = [];

    quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index]?.toUpperCase();
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer || "Not answered",
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || "",
      });
    });

    const totalQuestions = quiz.questions.length;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Create quiz attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score,
        totalQuestions,
        answers,
      },
    });

    // Award points: +10 base + 1 per correct answer
    const pointsEarned = 10 + correctCount;
    await awardPoints(user.id, "complete_quiz", pointsEarned, {
      quizId: quiz.id,
      attemptId: attempt.id,
      score,
      totalQuestions,
      percentage,
    });

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        score,
        totalQuestions,
        percentage,
        correctCount,
      },
      results,
      pointsEarned,
      message: `Quiz completed! You scored ${percentage}% (+${pointsEarned} points)`,
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz attempt" },
      { status: 500 }
    );
  }
}
