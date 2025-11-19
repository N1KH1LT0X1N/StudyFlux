"use client";

import { useState, useEffect } from "react";
import { Plus, Brain, Loader2 } from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";
import { toast } from "sonner";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    fetchQuizzes();
    fetchDocuments();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes");
      const data = await response.json();
      if (response.ok) {
        setQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocumentId) {
      toast.error("Please select a document");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          questionCount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Quiz generated successfully!");
        setShowGenerateModal(false);
        setSelectedDocumentId("");
        setQuestionCount(10);
        fetchQuizzes();
      } else {
        toast.error(data.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Quiz deleted successfully");
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
      } else {
        toast.error(data.error || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quizzes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate your first quiz from a document to test your knowledge
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Generate Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
            />
          ))}
        </div>
      )}

      {/* Generate Quiz Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Generate Quiz
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Document
                </label>
                <select
                  value={selectedDocumentId}
                  onChange={(e) => setSelectedDocumentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a document...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(Math.min(20, Math.max(5, parseInt(e.target.value) || 10)))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Choose between 5 and 20 questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleGenerateQuiz}
                disabled={generating || !selectedDocumentId}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedDocumentId("");
                  setQuestionCount(10);
                }}
                disabled={generating}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
