"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lightbulb } from "lucide-react";

interface FlashcardReviewProps {
  flashcard: {
    id: string;
    front: string;
    back: string;
    hint?: string | null;
  };
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardReview({
  flashcard,
  isFlipped,
  onFlip,
}: FlashcardReviewProps) {
  const [showHint, setShowHint] = useState(false);

  const handleCardClick = () => {
    if (!isFlipped) {
      onFlip();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="relative perspective-1000 cursor-pointer"
        onClick={handleCardClick}
        style={{ minHeight: "400px" }}
      >
        <motion.div
          className="relative w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front of card */}
          <Card
            className={`absolute inset-0 backface-hidden ${
              isFlipped ? "invisible" : "visible"
            }`}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 min-h-[400px]">
              <div className="text-center space-y-6 w-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    Question
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-medium leading-relaxed">
                  {flashcard.front}
                </p>

                {flashcard.hint && !showHint && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(true);
                    }}
                    className="mt-6"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Show Hint
                  </Button>
                )}

                {flashcard.hint && showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                          Hint
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          {flashcard.hint}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-8">
                  <Eye className="h-4 w-4" />
                  <span>Click or press Space to reveal answer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back of card */}
          <Card
            className={`absolute inset-0 backface-hidden ${
              isFlipped ? "visible" : "invisible"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 min-h-[400px]">
              <div className="text-center space-y-6 w-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                    Answer
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    {flashcard.front}
                  </p>
                  <div className="border-t-2 border-dashed my-4" />
                  <p className="text-2xl md:text-3xl font-medium leading-relaxed">
                    {flashcard.back}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-8">
                  <EyeOff className="h-4 w-4" />
                  <span>Rate how well you knew this</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
