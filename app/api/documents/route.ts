import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all user documents
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        summary: true,
        keyPoints: true,
        topics: true,
        difficulty: true,
        pageCount: true,
        uploadedAt: true,
        lastAccessedAt: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST - Create a new document (alternative to /api/upload)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, fileName, fileUrl, fileType, fileSize } = body;

    if (!title || !fileName || !fileUrl || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        title,
        fileName,
        fileUrl,
        fileType,
        fileSize,
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
