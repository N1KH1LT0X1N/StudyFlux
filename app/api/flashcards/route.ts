import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/flashcards
 * List user's flashcards with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");
    const dueOnly = searchParams.get("dueOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {
      userId: session.user.id,
    };

    // Filter by document
    if (documentId) {
      where.documentId = documentId;
    }

    // Filter by due date
    if (dueOnly) {
      where.nextReview = {
        lte: new Date(),
      };
    }

    const flashcards = await prisma.flashcard.findMany({
      where,
      orderBy: [
        { nextReview: "asc" }, // Due cards first
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await prisma.flashcard.count({ where });

    // Count due flashcards
    const dueCount = await prisma.flashcard.count({
      where: {
        userId: session.user.id,
        nextReview: {
          lte: new Date(),
        },
      },
    });

    return NextResponse.json({
      flashcards,
      total,
      dueCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flashcards
 * Create a manual flashcard
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentId, front, back, hint } = body;

    // Validate required fields
    if (!front || !back) {
      return NextResponse.json(
        { error: "Front and back are required" },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Verify document exists and user owns it
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        userId: session.user.id,
        documentId,
        front: front.trim(),
        back: back.trim(),
        hint: hint ? hint.trim() : null,
        // Initial SM-2 values
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 1,
        nextReview: new Date(), // Due immediately
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ flashcard }, { status: 201 });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json(
      { error: "Failed to create flashcard" },
      { status: 500 }
    );
  }
}
