import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/spaced-repetition";
import { FLASHCARD_QUALITY, POINTS } from "@/lib/constants";
import { awardPoints } from "@/lib/gamification";
import { updateStreak } from "@/lib/streak";

/**
 * POST /api/flashcards/[id]/review
 * Submit a review for a flashcard and update using SM-2 algorithm
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quality, sessionId } = body;

    // Validate quality rating
    if (quality === undefined || quality === null) {
      return NextResponse.json(
        { error: "Quality rating is required" },
        { status: 400 }
      );
    }

    if (quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be between 0 and 5" },
        { status: 400 }
      );
    }

    // Fetch the flashcard
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: params.id },
    });

    if (!flashcard) {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 }
      );
    }

    // Check if user owns the flashcard
    if (flashcard.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate next review using SM-2 algorithm
    const sm2Result = calculateNextReview(
      quality,
      flashcard.repetitions,
      flashcard.easinessFactor,
      flashcard.interval
    );

    // Determine points based on quality
    let pointsEarned = 0;
    if (quality === FLASHCARD_QUALITY.AGAIN) {
      pointsEarned = POINTS.REVIEW_FLASHCARD_AGAIN; // 1 point
    } else if (quality === FLASHCARD_QUALITY.HARD) {
      pointsEarned = POINTS.REVIEW_FLASHCARD_HARD; // 2 points
    } else if (quality === FLASHCARD_QUALITY.GOOD) {
      pointsEarned = POINTS.REVIEW_FLASHCARD_GOOD; // 3 points
    } else if (quality === FLASHCARD_QUALITY.EASY) {
      pointsEarned = POINTS.REVIEW_FLASHCARD_EASY; // 5 points
    } else {
      // For quality 1 or 2 (partial credit)
      pointsEarned = POINTS.REVIEW_FLASHCARD_AGAIN; // 1 point
    }

    // Update flashcard with new SM-2 values
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: params.id },
      data: {
        repetitions: sm2Result.repetitions,
        easinessFactor: sm2Result.easinessFactor,
        interval: sm2Result.interval,
        nextReview: sm2Result.nextReview,
        lastReviewed: new Date(),
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

    // Award points and update streak
    await awardPoints(
      session.user.id,
      "review_flashcard",
      pointsEarned,
      {
        flashcardId: params.id,
        quality,
        documentId: flashcard.documentId,
      }
    );

    await updateStreak(session.user.id);

    // If sessionId provided, update the study session
    if (sessionId) {
      try {
        const studySession = await prisma.studySession.findUnique({
          where: { id: sessionId },
        });

        if (studySession && studySession.userId === session.user.id) {
          await prisma.studySession.update({
            where: { id: sessionId },
            data: {
              flashcardsReviewed: {
                increment: 1,
              },
              pointsEarned: {
                increment: pointsEarned,
              },
            },
          });
        }
      } catch (error) {
        console.error("Error updating study session:", error);
        // Don't fail the review if session update fails
      }
    }

    return NextResponse.json({
      flashcard: updatedFlashcard,
      pointsEarned,
      sm2: {
        repetitions: sm2Result.repetitions,
        easinessFactor: sm2Result.easinessFactor,
        interval: sm2Result.interval,
        nextReview: sm2Result.nextReview,
      },
    });
  } catch (error) {
    console.error("Error reviewing flashcard:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to review flashcard",
      },
      { status: 500 }
    );
  }
}
