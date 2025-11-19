"use client";

import { useState } from "react";

interface QuestionDisplayProps {
  question: {
    id: string;
    question: string;
    options: string[];
  };
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  showExplanation?: boolean;
  correctAnswer?: string;
  explanation?: string;
  isReview?: boolean;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showExplanation = false,
  correctAnswer,
  explanation,
  isReview = false,
}: QuestionDisplayProps) {
  const options = ["A", "B", "C", "D"];

  const getOptionClass = (optionLetter: string) => {
    const baseClass =
      "w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer";

    if (isReview && correctAnswer) {
      if (optionLetter === correctAnswer) {
        return `${baseClass} bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500`;
      }
      if (optionLetter === selectedAnswer && optionLetter !== correctAnswer) {
        return `${baseClass} bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500`;
      }
    }

    if (selectedAnswer === optionLetter) {
      return `${baseClass} bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500`;
    }

    return `${baseClass} border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-700/50`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="h-2 flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(questionNumber / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {options.map((letter, index) => (
          <button
            key={letter}
            onClick={() => !isReview && onAnswerSelect(letter)}
            className={getOptionClass(letter)}
            disabled={isReview}
          >
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[24px]">
                {letter}.
              </span>
              <span className="text-gray-900 dark:text-white">
                {question.options[index]}
              </span>
            </div>
          </button>
        ))}
      </div>

      {showExplanation && explanation && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Explanation
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
