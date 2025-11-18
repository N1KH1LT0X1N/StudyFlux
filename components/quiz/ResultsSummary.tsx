"use client";

import { Trophy, CheckCircle, XCircle, Award } from "lucide-react";
import Link from "next/link";

interface ResultsSummaryProps {
  score: number;
  totalQuestions: number;
  percentage: number;
  pointsEarned: number;
  results: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  quizId: string;
}

export default function ResultsSummary({
  score,
  totalQuestions,
  percentage,
  pointsEarned,
  results,
  quizId,
}: ResultsSummaryProps) {
  const getGrade = () => {
    if (percentage >= 90) return { label: "Excellent!", color: "text-green-600" };
    if (percentage >= 80) return { label: "Great Job!", color: "text-blue-600" };
    if (percentage >= 70) return { label: "Good Work!", color: "text-yellow-600" };
    if (percentage >= 60) return { label: "Keep Practicing!", color: "text-orange-600" };
    return { label: "Keep Trying!", color: "text-red-600" };
  };

  const grade = getGrade();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-xl p-8 text-white">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className={`text-2xl font-semibold mb-4 ${grade.color.replace('text-', 'text-white opacity-')}`}>
            {grade.label}
          </p>

          <div className="flex items-center justify-center gap-8 mt-6">
            <div>
              <div className="text-5xl font-bold">{percentage}%</div>
              <div className="text-sm opacity-90 mt-1">Score</div>
            </div>
            <div className="h-16 w-px bg-white/30" />
            <div>
              <div className="text-5xl font-bold">
                {score}/{totalQuestions}
              </div>
              <div className="text-sm opacity-90 mt-1">Correct</div>
            </div>
            <div className="h-16 w-px bg-white/30" />
            <div>
              <div className="text-5xl font-bold">+{pointsEarned}</div>
              <div className="text-sm opacity-90 mt-1">Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Correct Answers
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalQuestions - score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Incorrect Answers
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                +{pointsEarned}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Points Earned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Results
        </h2>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={result.questionId}
              className={`p-4 rounded-lg border-2 ${
                result.isCorrect
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Q{index + 1}: {result.question}
                  </h3>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Your answer:{" "}
                      </span>
                      <span
                        className={
                          result.isCorrect
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }
                      >
                        {result.userAnswer}
                      </span>
                    </div>
                    {!result.isCorrect && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Correct answer:{" "}
                        </span>
                        <span className="text-green-700 dark:text-green-300">
                          {result.correctAnswer}
                        </span>
                      </div>
                    )}
                    {result.explanation && (
                      <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Explanation:{" "}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {result.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Link
          href={`/dashboard/quizzes/${quizId}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Retake Quiz
        </Link>
        <Link
          href="/dashboard/quizzes"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          Back to Quizzes
        </Link>
      </div>
    </div>
  );
}
