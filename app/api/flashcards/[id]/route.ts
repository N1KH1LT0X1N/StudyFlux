import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/flashcards/[id]
 * Get a single flashcard
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: id },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
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

    return NextResponse.json({ flashcard });
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcard" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/flashcards/[id]
 * Update a flashcard's content
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: id },
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

    const body = await req.json();
    const { front, back, hint } = body;

    // Build update data
    const updateData: any = {};
    if (front !== undefined) updateData.front = front.trim();
    if (back !== undefined) updateData.back = back.trim();
    if (hint !== undefined) updateData.hint = hint ? hint.trim() : null;

    // Ensure at least front or back is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: id },
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

    return NextResponse.json({ flashcard: updatedFlashcard });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json(
      { error: "Failed to update flashcard" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/flashcards/[id]
 * Delete a flashcard
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: id },
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

    await prisma.flashcard.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Flashcard deleted successfully" });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return NextResponse.json(
      { error: "Failed to delete flashcard" },
      { status: 500 }
    );
  }
}
