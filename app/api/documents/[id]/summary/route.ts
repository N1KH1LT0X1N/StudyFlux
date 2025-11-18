import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// POST - Generate summary for a document
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
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

    // If summary already exists, return it
    if (document.summary) {
      return NextResponse.json({
        summary: document.summary,
        keyPoints: document.keyPoints,
        topics: document.topics,
        difficulty: document.difficulty,
      });
    }

    // Get the file content from request body
    const body = await req.json();
    const { fileContent } = body;

    if (!fileContent) {
      return NextResponse.json(
        { error: "File content is required" },
        { status: 400 }
      );
    }

    // Generate summary using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this document and provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key points (5-7 bullet points)
3. Main topics/tags (3-5 tags)
4. Difficulty level (easy, medium, or hard)

Document content:
${fileContent}

Please respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["point 1", "point 2", ...],
  "topics": ["topic1", "topic2", ...],
  "difficulty": "easy|medium|hard"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let analysisData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      analysisData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      // Fallback to basic summary
      analysisData = {
        summary: text,
        keyPoints: [],
        topics: [],
        difficulty: "medium",
      };
    }

    // Update document with generated summary
    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        summary: analysisData.summary,
        keyPoints: analysisData.keyPoints,
        topics: analysisData.topics,
        difficulty: analysisData.difficulty,
      },
    });

    // Award points for generating summary
    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: 5 } },
    });

    await prisma.pointsHistory.create({
      data: {
        userId: session.user.id,
        action: "generate_summary",
        points: 5,
        metadata: {
          documentId: document.id,
        },
      },
    });

    return NextResponse.json({
      summary: analysisData.summary,
      keyPoints: analysisData.keyPoints,
      topics: analysisData.topics,
      difficulty: analysisData.difficulty,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
