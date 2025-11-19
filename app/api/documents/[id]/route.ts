import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteFile } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

// GET - Get a single document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: {
        id,
      },
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

    // Update last accessed time
    await prisma.document.update({
      where: { id: id },
      data: { lastAccessedAt: new Date() },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PATCH - Update a document
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

    const document = await prisma.document.findUnique({
      where: { id },
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

    const body = await req.json();
    const allowedFields = [
      "title",
      "summary",
      "keyPoints",
      "topics",
      "difficulty",
      "pageCount",
    ];

    // Filter out non-allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedDocument = await prisma.document.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a document
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

    const document = await prisma.document.findUnique({
      where: { id: id },
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

    // Delete file from Supabase Storage
    try {
      // Extract path from URL
      const urlParts = document.fileUrl.split("/");
      const pathIndex = urlParts.indexOf("documents") + 1;
      if (pathIndex > 0) {
        const filePath = urlParts.slice(pathIndex).join("/");
        await deleteFile(filePath);
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete document from database
    await prisma.document.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
