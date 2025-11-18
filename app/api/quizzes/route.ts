import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all quizzes for the current user
export async function GET(req: NextRequest) {
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

    const quizzes = await prisma.quiz.findMany({
      where: { userId: user.id },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          select: {
            id: true,
          },
        },
        attempts: {
          where: { userId: user.id },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response with question count and best score
    const formattedQuizzes = quizzes.map((quiz) => ({
      ...quiz,
      questionCount: quiz.questions.length,
      lastAttempt: quiz.attempts[0] || null,
      bestScore:
        quiz.attempts.length > 0
          ? Math.max(...quiz.attempts.map((a) => a.score))
          : null,
    }));

    return NextResponse.json({ quizzes: formattedQuizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST: Create a manual quiz (optional feature)
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

    const { documentId, title, questions } = await req.json();

    if (!documentId || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Validate document belongs to user
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId: user.id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        documentId: document.id,
        title,
        questions: {
          create: questions.map((q: any) => ({
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

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
