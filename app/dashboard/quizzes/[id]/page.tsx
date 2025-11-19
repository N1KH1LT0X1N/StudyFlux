"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import QuestionDisplay from "@/components/quiz/QuestionDisplay";
import { toast } from "sonner";

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();

      if (response.ok) {
        setQuiz(data.quiz);
      } else {
        toast.error(data.error || "Failed to load quiz");
        router.push("/dashboard/quizzes");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
      router.push("/dashboard/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const confirmed = confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Quiz submitted successfully!");
        // Store results in sessionStorage for results page
        sessionStorage.setItem(
          `quiz-results-${data.attempt.id}`,
          JSON.stringify(data)
        );
        // Navigate to results page with state
        router.push(
          `/dashboard/quizzes/${quizId}/results?attemptId=${data.attempt.id}`
        );
      } else {
        toast.error(data.error || "Failed to submit quiz");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {quiz.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {answeredCount} of {quiz.questions.length} questions answered
        </p>
      </div>

      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        selectedAnswer={answers[currentQuestionIndex]}
        onAnswerSelect={handleAnswerSelect}
      />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Question Navigator
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`p-2 rounded text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : answers[index]
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
