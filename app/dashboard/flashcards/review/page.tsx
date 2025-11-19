"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlashcardReview } from "@/components/flashcards/FlashcardReview";
import { ReviewControls } from "@/components/flashcards/ReviewControls";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  Trophy,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { FLASHCARD_QUALITY } from "@/lib/constants";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
  documentId: string;
  document?: {
    title: string;
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const dueOnly = searchParams.get("dueOnly") === "true";

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    loadFlashcards();
    setSessionStartTime(new Date());
  }, [documentId, dueOnly]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isSubmitting || isComplete) return;

      // Space to flip
      if (e.code === "Space") {
        e.preventDefault();
        if (!isFlipped) {
          setIsFlipped(true);
        }
        return;
      }

      // Number keys for rating (only when flipped)
      if (isFlipped) {
        const key = e.key;
        if (key === "1") {
          handleRate(FLASHCARD_QUALITY.AGAIN);
        } else if (key === "2") {
          handleRate(FLASHCARD_QUALITY.HARD);
        } else if (key === "3") {
          handleRate(FLASHCARD_QUALITY.GOOD);
        } else if (key === "4") {
          handleRate(FLASHCARD_QUALITY.EASY);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, isSubmitting, currentIndex, flashcards, isComplete]);

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      let url = "/api/flashcards?limit=1000";

      if (documentId) {
        url += `&documentId=${documentId}`;
      }

      if (dueOnly) {
        url += "&dueOnly=true";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data = await response.json();
      const cards = data.flashcards;

      if (cards.length === 0) {
        toast.info("No flashcards to review");
        router.push("/dashboard/flashcards");
        return;
      }

      // Shuffle flashcards for better learning
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled);
    } catch (error) {
      console.error("Error loading flashcards:", error);
      toast.error("Failed to load flashcards");
      router.push("/dashboard/flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (quality: number) => {
    if (isSubmitting || !isFlipped) return;

    const currentCard = flashcards[currentIndex];
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quality }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const data = await response.json();
      const pointsEarned = data.pointsEarned || 0;

      setCardsReviewed((prev) => prev + 1);
      setTotalPoints((prev) => prev + pointsEarned);

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        // Review complete!
        setIsComplete(true);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlip = useCallback(() => {
    if (!isFlipped && !isSubmitting) {
      setIsFlipped(true);
    }
  }, [isFlipped, isSubmitting]);

  const getElapsedTime = () => {
    const now = new Date();
    const diffMs = now.getTime() - sessionStartTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-950 p-6 rounded-full">
                <PartyPopper className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Review Complete!</h1>
            <p className="text-muted-foreground mb-8">
              Great job! You've completed all the flashcards in this session.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{cardsReviewed}</p>
                <p className="text-sm text-muted-foreground">Cards Reviewed</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">+{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Points Earned</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{getElapsedTime()}</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/dashboard/flashcards")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/flashcards")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Review
          </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{getElapsedTime()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>+{totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Document Title */}
        {currentCard.document && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {currentCard.document.title}
            </p>
          </div>
        )}

        {/* Flashcard */}
        <FlashcardReview
          flashcard={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        {/* Review Controls - Only show when flipped */}
        {isFlipped && (
          <ReviewControls onRate={handleRate} disabled={isSubmitting} />
        )}
      </div>
    </div>
  );
}
