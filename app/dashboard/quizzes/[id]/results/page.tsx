"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ResultsSummary from "@/components/quiz/ResultsSummary";
import { toast } from "sonner";

export default function QuizResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const attemptId = searchParams.get("attemptId");

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, you'd fetch the attempt results from an API
    // For now, we'll use localStorage or session storage to pass results
    const storedResults = sessionStorage.getItem(`quiz-results-${attemptId}`);
    if (storedResults) {
      setResults(JSON.parse(storedResults));
      setLoading(false);
    } else {
      // If no stored results, redirect back to quiz list
      toast.error("Results not found");
      window.location.href = "/dashboard/quizzes";
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ResultsSummary
        score={results.attempt.score}
        totalQuestions={results.attempt.totalQuestions}
        percentage={results.attempt.percentage}
        pointsEarned={results.pointsEarned}
        results={results.results}
        quizId={quizId}
      />
    </div>
  );
}
