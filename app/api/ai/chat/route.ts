import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { file, message, chatHistory } = await request.json();

    if (!file || !message) {
      return NextResponse.json(
        { error: "File and message are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: file.file,
          mimeType: file.type,
        },
      },
      `
        Answer this question about the attached document: ${message}.
        Answer as a chatbot with short messages and text only (no markdowns, tags or symbols)
        #you are a teacher assistent whose job is to provide a summary to the user and always be engaging with him
        #you have the multiliguel ability to talk in all of the three language listed hindi english and marathi but your respone should match the format of user
        eg: if a user writes marathi in english reply in marathi but using english alphabets and if he uses marathi character to have a communication with you use marathi character only
        #when a user ask you questions explain then topics cleary with followup question and same and relevent topics(keep it string no markdown or json)(less than 200 words)
        #explain r reply what the user has asked for and then below list the questions in point rather than a conversation flow paragraph

        Chat history: ${JSON.stringify(chatHistory || [])}
      `,
    ]);

    const responseText = result.response.text();

    return NextResponse.json({ response: responseText }, { status: 200 });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Error generating response. Please try again later." },
      { status: 500 }
    );
  }
}
