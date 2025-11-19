"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface FlashcardDeckCardProps {
  documentId: string;
  documentTitle: string;
  totalCards: number;
  dueCards: number;
  lastReviewed?: Date;
}

export function FlashcardDeckCard({
  documentId,
  documentTitle,
  totalCards,
  dueCards,
  lastReviewed,
}: FlashcardDeckCardProps) {
  const router = useRouter();

  const handleReview = () => {
    router.push(`/dashboard/flashcards/review?documentId=${documentId}`);
  };

  const formatLastReviewed = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const reviewDate = new Date(date);
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {documentTitle}
            </CardTitle>
          </div>
          {dueCards > 0 && (
            <Badge variant="destructive" className="ml-2">
              {dueCards} due
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {totalCards} {totalCards === 1 ? "card" : "cards"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatLastReviewed(lastReviewed)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleReview}
              className="flex-1"
              variant={dueCards > 0 ? "default" : "outline"}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {dueCards > 0 ? `Review ${dueCards}` : "Study All"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
