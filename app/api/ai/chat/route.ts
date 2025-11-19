import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDocument } from "@/lib/document-processor";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, message, chatHistory } = await request.json();

    if (!documentId || !message) {
      return NextResponse.json(
        { error: "Document ID and message are required" },
        { status: 400 }
      );
    }

    // Fetch document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
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

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    // Get or create chat history for this document
    let chatHistoryRecord = await prisma.chatHistory.findFirst({
      where: {
        userId: session.user.id,
        documentId: documentId,
      },
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

    // Build context from document summary and key points
    let documentContext = "";
    if (document.summary) {
      documentContext += `Document Summary: ${document.summary}\n\n`;
    }
    if (document.keyPoints) {
      const keyPoints = Array.isArray(document.keyPoints)
        ? document.keyPoints
        : [];
      if (keyPoints.length > 0) {
        documentContext += `Key Points:\n${keyPoints.map((p: any) => `- ${p}`).join("\n")}\n\n`;
      }
    }

    // Format chat history
    const formattedHistory = chatHistory
      ? chatHistory
          .map((msg: any) => `${msg.role}: ${msg.content}`)
          .join("\n")
      : "";

    const prompt = `You are a helpful teacher assistant helping students understand their study materials.

${documentContext ? `Document Context:\n${documentContext}` : ""}

Answer this question: ${message}

Guidelines:
- Provide clear, concise explanations (less than 200 words)
- Use simple language appropriate for students
- Include relevant examples if helpful
- Suggest follow-up topics or questions at the end
- Be engaging and encouraging
- Support multiple languages (Hindi, English, Marathi) - match the user's language style

${formattedHistory ? `Previous conversation:\n${formattedHistory}\n` : ""}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Update chat history in database
    const newMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    const newResponse = {
      role: "assistant",
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [
      ...(chatHistoryRecord?.messages as any[] || []),
      newMessage,
      newResponse,
    ];

    if (chatHistoryRecord) {
      await prisma.chatHistory.update({
        where: { id: chatHistoryRecord.id },
        data: { messages: updatedMessages },
      });
    } else {
      await prisma.chatHistory.create({
        data: {
          userId: session.user.id,
          documentId: documentId,
          messages: updatedMessages,
        },
      });
    }

    // Update user's last active time
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
      response: responseText,
      chatHistory: updatedMessages,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Error generating response. Please try again later." },
      { status: 500 }
    );
  }
}
