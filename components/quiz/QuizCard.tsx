"use client";

import Link from "next/link";
import { FileText, Trophy, Clock, Trash2 } from "lucide-react";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    createdAt: Date | string;
    questionCount: number;
    document: {
      id: string;
      title: string;
    };
    lastAttempt?: {
      score: number;
      totalQuestions: number;
      completedAt: Date | string;
    } | null;
    bestScore?: number | null;
  };
  onDelete?: (id: string) => void;
}

export default function QuizCard({ quiz, onDelete }: QuizCardProps) {
  const lastAttemptPercentage = quiz.lastAttempt
    ? Math.round((quiz.lastAttempt.score / quiz.lastAttempt.totalQuestions) * 100)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href={`/dashboard/quizzes/${quiz.id}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {quiz.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{quiz.document.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.questionCount} questions</span>
            </div>
          </div>

          {quiz.lastAttempt && (
            <div className="mt-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Last Score: {lastAttemptPercentage}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({quiz.lastAttempt.score}/{quiz.lastAttempt.totalQuestions})
              </span>
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(quiz.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete quiz"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Created {new Date(quiz.createdAt).toLocaleDateString()}
        </span>

        <Link
          href={`/dashboard/quizzes/${quiz.id}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {quiz.lastAttempt ? "Retake Quiz" : "Start Quiz"}
        </Link>
      </div>
    </div>
  );
}
