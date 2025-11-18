import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFlashcards } from "@/lib/flashcard-generator";
import { POINTS } from "@/lib/constants";

/**
 * POST /api/flashcards/generate
 * Generate flashcards from a document using AI
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Fetch the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user owns the document
    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if document has been processed
    if (!document.summary) {
      return NextResponse.json(
        {
          error:
            "Document must be summarized before generating flashcards. Please wait for the summary to be generated.",
        },
        { status: 400 }
      );
    }

    // Check if flashcards already exist for this document
    const existingFlashcardsCount = await prisma.flashcard.count({
      where: {
        documentId,
        userId: session.user.id,
      },
    });

    if (existingFlashcardsCount > 0) {
      return NextResponse.json(
        {
          error: `This document already has ${existingFlashcardsCount} flashcards. Delete existing flashcards first if you want to regenerate.`,
        },
        { status: 400 }
      );
    }

    // Fetch document content from storage (or use cached text if available)
    // For now, we'll use the summary and assume we have the text
    // In a real scenario, you'd fetch the file content from Supabase
    // For this implementation, we'll generate from summary alone
    const documentText = document.summary;

    // Generate flashcards using AI
    const generatedFlashcards = await generateFlashcards(
      documentText,
      document.summary
    );

    // Create flashcards in database
    const flashcards = await prisma.$transaction(
      generatedFlashcards.map((card) =>
        prisma.flashcard.create({
          data: {
            userId: session.user.id,
            documentId: documentId,
            front: card.front,
            back: card.back,
            hint: card.hint || null,
            // Initial SM-2 values
            repetitions: 0,
            easinessFactor: 2.5,
            interval: 1,
            nextReview: new Date(), // Due immediately
          },
        })
      )
    );

    // Award points for generating flashcards
    const pointsToAward = POINTS.UPLOAD_DOCUMENT; // 10 points

    await prisma.$transaction([
      // Update user points
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: pointsToAward,
          },
        },
      }),
      // Record points history
      prisma.pointsHistory.create({
        data: {
          userId: session.user.id,
          action: "generate_flashcards",
          points: pointsToAward,
          metadata: {
            documentId,
            flashcardsCount: flashcards.length,
          },
        },
      }),
    ]);

    return NextResponse.json({
      flashcards,
      count: flashcards.length,
      pointsEarned: pointsToAward,
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate flashcards",
      },
      { status: 500 }
    );
  }
}
