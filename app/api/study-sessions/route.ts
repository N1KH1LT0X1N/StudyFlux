import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List user's study sessions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const documentId = searchParams.get("documentId");

    const where: any = {
      userId: session.user.id,
    };

    if (documentId) {
      where.documentId = documentId;
    }

    const studySessions = await prisma.studySession.findMany({
      where,
      orderBy: {
        startedAt: "desc",
      },
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

    const total = await prisma.studySession.count({ where });

    return NextResponse.json({
      sessions: studySessions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch study sessions" },
      { status: 500 }
    );
  }
}

// POST - Start a new study session
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentId } = body;

    // Check if document exists and user owns it (if documentId provided)
    if (documentId) {
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
    }

    // Create new study session
    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        documentId: documentId || null,
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

    // Update user's last active time
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ session: studySession });
  } catch (error) {
    console.error("Error creating study session:", error);
    return NextResponse.json(
      { error: "Failed to create study session" },
      { status: 500 }
    );
  }
}
