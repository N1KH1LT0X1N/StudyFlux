import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";
import { updateStreak } from "@/lib/streak";

// GET - List user notes
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {
      userId: session.user.id,
    };

    if (documentId) {
      where.documentId = documentId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
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

    const total = await prisma.note.count({ where });

    return NextResponse.json({
      notes,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Create note
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, documentId } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

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

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content,
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

    // Award points and update streak
    await awardPoints(
      session.user.id,
      "create_note",
      5,
      {
        noteId: note.id,
      }
    );

    await updateStreak(session.user.id);

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
