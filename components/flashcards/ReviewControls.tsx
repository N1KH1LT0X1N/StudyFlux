"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Zap, ThumbsUp, Sparkles } from "lucide-react";
import { FLASHCARD_QUALITY, POINTS } from "@/lib/constants";

interface ReviewControlsProps {
  onRate: (quality: number) => void;
  disabled?: boolean;
}

export function ReviewControls({ onRate, disabled = false }: ReviewControlsProps) {
  const options = [
    {
      label: "Again",
      sublabel: "Completely forgot",
      quality: FLASHCARD_QUALITY.AGAIN,
      points: POINTS.REVIEW_FLASHCARD_AGAIN,
      color: "bg-red-500 hover:bg-red-600 text-white",
      icon: RotateCcw,
      shortcut: "1",
    },
    {
      label: "Hard",
      sublabel: "Struggled to recall",
      quality: FLASHCARD_QUALITY.HARD,
      points: POINTS.REVIEW_FLASHCARD_HARD,
      color: "bg-orange-500 hover:bg-orange-600 text-white",
      icon: Zap,
      shortcut: "2",
    },
    {
      label: "Good",
      sublabel: "Recalled correctly",
      quality: FLASHCARD_QUALITY.GOOD,
      points: POINTS.REVIEW_FLASHCARD_GOOD,
      color: "bg-green-500 hover:bg-green-600 text-white",
      icon: ThumbsUp,
      shortcut: "3",
    },
    {
      label: "Easy",
      sublabel: "Knew it instantly",
      quality: FLASHCARD_QUALITY.EASY,
      points: POINTS.REVIEW_FLASHCARD_EASY,
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      icon: Sparkles,
      shortcut: "4",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.quality}
                  onClick={() => onRate(option.quality)}
                  disabled={disabled}
                  className={`${option.color} flex flex-col h-auto py-4 px-4 relative group`}
                  variant="default"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Icon className="h-5 w-5" />
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-0 text-xs"
                    >
                      +{option.points} pts
                    </Badge>
                  </div>
                  <div className="text-left w-full">
                    <div className="font-semibold text-base mb-1">
                      {option.label}
                    </div>
                    <div className="text-xs opacity-90 font-normal">
                      {option.sublabel}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <kbd className="px-2 py-1 text-xs font-semibold bg-white/20 rounded">
                      {option.shortcut}
                    </kbd>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Use keyboard shortcuts: <kbd className="px-2 py-1 bg-muted rounded mx-1">1</kbd> Again,{" "}
            <kbd className="px-2 py-1 bg-muted rounded mx-1">2</kbd> Hard,{" "}
            <kbd className="px-2 py-1 bg-muted rounded mx-1">3</kbd> Good,{" "}
            <kbd className="px-2 py-1 bg-muted rounded mx-1">4</kbd> Easy, or{" "}
            <kbd className="px-2 py-1 bg-muted rounded mx-1">Space</kbd> to flip
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
