"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  Download,
  MessageSquare,
  BookOpen,
  PlayCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  summary?: string;
  keyPoints?: string[];
  topics?: string[];
  difficulty?: string;
  pageCount?: number;
  uploadedAt: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error("Failed to fetch document");
      const data = await response.json();
      setDocument(data.document);
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to load document");
      router.push("/dashboard/documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatLoading) return;

    const userMessage = message;
    setMessage("");
    setChatLoading(true);

    // Add user message to chat history
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          message: userMessage,
          chatHistory,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Add assistant response to chat history
      const assistantMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setChatLoading(false);
    }
  };

  const handleStartStudySession = async () => {
    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) throw new Error("Failed to start study session");

      const data = await response.json();
      toast.success("Study session started!");
      router.push(`/dashboard/study?sessionId=${data.session.id}`);
    } catch (error) {
      console.error("Error starting study session:", error);
      toast.error("Failed to start study session");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <button
          onClick={() => router.push("/dashboard/documents")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Documents
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {document.title}
                  </h1>
                  <p className="text-gray-600">{document.fileName}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(document.uploadedAt)}
                </div>
                <div>{formatFileSize(document.fileSize)}</div>
                {document.pageCount && <div>{document.pageCount} pages</div>}
                {document.difficulty && (
                  <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-medium">
                    {document.difficulty}
                  </div>
                )}
              </div>

              {document.topics && document.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {document.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => window.open(document.fileUrl, "_blank")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Download className="w-4 h-4" />
                Download Document
              </button>
            </div>

            {/* Summary */}
            {document.summary && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {document.summary}
                </p>
              </div>
            )}

            {/* Key Points */}
            {document.keyPoints && document.keyPoints.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Key Points
                </h2>
                <ul className="space-y-2">
                  {document.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ask Questions
              </h2>

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Ask any question about this document
                  </p>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !message.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleStartStudySession}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Study Session
                </button>
                <button
                  onClick={() => toast.info("Flashcards feature coming soon!")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <BookOpen className="w-5 h-5" />
                  Generate Flashcards
                </button>
                <button
                  onClick={() => toast.info("Quiz feature coming soon!")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
