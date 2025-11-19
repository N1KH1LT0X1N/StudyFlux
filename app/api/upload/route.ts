import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";
import { updateStreak } from "@/lib/streak";
import { POINTS } from "@/lib/constants";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and images (JPG, PNG) are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Upload file to Supabase
    const { path, url } = await uploadFile(file, session.user.id);

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        title: file.name,
        fileName: file.name,
        fileUrl: url,
        fileType: file.type,
        fileSize: file.size,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        uploadedAt: true,
      },
    });

    // Award points and update streak
    await awardPoints(
      session.user.id,
      "upload_document",
      POINTS.UPLOAD_DOCUMENT,
      {
        documentId: document.id,
        fileName: file.name,
      }
    );

    await updateStreak(session.user.id);

    return NextResponse.json({
      message: "File uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
