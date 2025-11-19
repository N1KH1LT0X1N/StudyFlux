import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

// GET: Export all user data as JSON
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        documents: {
          include: {
            flashcards: true,
            notes: true,
            quizzes: {
              include: {
                questions: true,
                attempts: true,
              },
            },
          },
        },
        studySessions: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
        pointsHistory: true,
        quizAttempts: true,
        notes: true,
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...userData } = user;

    // Format data for export
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        points: userData.points,
        level: userData.level,
        streak: userData.streak,
        createdAt: userData.createdAt,
      },
      documents: userData.documents,
      studySessions: userData.studySessions,
      achievements: userData.achievements,
      pointsHistory: userData.pointsHistory,
      quizAttempts: userData.quizAttempts,
      notes: userData.notes,
      notifications: userData.notifications,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="studyflux-data-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
