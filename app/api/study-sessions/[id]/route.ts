import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";
import { updateStreak } from "@/lib/streak";
import { POINTS } from "@/lib/constants";

// GET - Get session details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.id },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!studySession) {
      return NextResponse.json(
        { error: "Study session not found" },
        { status: 404 }
      );
    }

    // Check if user owns the session
    if (studySession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ session: studySession });
  } catch (error) {
    console.error("Error fetching study session:", error);
    return NextResponse.json(
      { error: "Failed to fetch study session" },
      { status: 500 }
    );
  }
}

// PATCH - Update session (end session, update metrics)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.id },
    });

    if (!studySession) {
      return NextResponse.json(
        { error: "Study session not found" },
        { status: 404 }
      );
    }

    // Check if user owns the session
    if (studySession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      duration,
      questionsAsked,
      flashcardsReviewed,
      endSession,
    } = body;

    const updateData: any = {};

    if (duration !== undefined) {
      updateData.duration = duration;
    }
    if (questionsAsked !== undefined) {
      updateData.questionsAsked = questionsAsked;
    }
    if (flashcardsReviewed !== undefined) {
      updateData.flashcardsReviewed = flashcardsReviewed;
    }

    // Calculate points if ending session
    let pointsEarned = 0;
    if (endSession && !studySession.endedAt) {
      updateData.endedAt = new Date();

      const finalDuration = duration || studySession.duration;
      const durationInHours = finalDuration / 3600;

      // Award points for completing 1 hour study session
      if (durationInHours >= 1) {
        pointsEarned = Math.floor(durationInHours) * POINTS.STUDY_SESSION_PER_HOUR;
        updateData.pointsEarned = pointsEarned;

        // Award points and update streak
        await awardPoints(
          session.user.id,
          "complete_study_session",
          pointsEarned,
          {
            sessionId: params.id,
            duration: finalDuration,
          }
        );

        await updateStreak(session.user.id);
      }
    }

    const updatedSession = await prisma.studySession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      session: updatedSession,
      pointsEarned,
    });
  } catch (error) {
    console.error("Error updating study session:", error);
    return NextResponse.json(
      { error: "Failed to update study session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete session
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.id },
    });

    if (!studySession) {
      return NextResponse.json(
        { error: "Study session not found" },
        { status: 404 }
      );
    }

    // Check if user owns the session
    if (studySession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.studySession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Study session deleted successfully" });
  } catch (error) {
    console.error("Error deleting study session:", error);
    return NextResponse.json(
      { error: "Failed to delete study session" },
      { status: 500 }
    );
  }
}
