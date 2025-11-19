"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FlashcardDeckCard } from "@/components/flashcards/FlashcardDeckCard";
import { FlashcardEditor } from "@/components/flashcards/FlashcardEditor";
import {
  BookOpen,
  Plus,
  Search,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
}

interface FlashcardDeck {
  documentId: string;
  documentTitle: string;
  totalCards: number;
  dueCards: number;
  lastReviewed?: Date;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDocument, setFilterDocument] = useState<string>("all");
  const [showEditor, setShowEditor] = useState(false);
  const [totalDueCards, setTotalDueCards] = useState(0);

  useEffect(() => {
    loadFlashcards();
    loadDocuments();
  }, []);

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/flashcards?limit=1000");

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data = await response.json();
      const flashcards = data.flashcards;
      setTotalDueCards(data.dueCount || 0);

      // Group flashcards by document
      const deckMap = new Map<string, FlashcardDeck>();

      flashcards.forEach((card: any) => {
        const docId = card.documentId;
        const docTitle = card.document?.title || "Unknown Document";

        if (!deckMap.has(docId)) {
          deckMap.set(docId, {
            documentId: docId,
            documentTitle: docTitle,
            totalCards: 0,
            dueCards: 0,
            lastReviewed: undefined,
          });
        }

        const deck = deckMap.get(docId)!;
        deck.totalCards++;

        // Check if card is due
        const isDue = new Date(card.nextReview) <= new Date();
        if (isDue) {
          deck.dueCards++;
        }

        // Update last reviewed date
        if (card.lastReviewed) {
          const reviewDate = new Date(card.lastReviewed);
          if (!deck.lastReviewed || reviewDate > deck.lastReviewed) {
            deck.lastReviewed = reviewDate;
          }
        }
      });

      const decksArray = Array.from(deckMap.values()).sort((a, b) => {
        // Sort by due cards (descending), then by total cards
        if (b.dueCards !== a.dueCards) {
          return b.dueCards - a.dueCards;
        }
        return b.totalCards - a.totalCards;
      });

      setDecks(decksArray);
    } catch (error) {
      console.error("Error loading flashcards:", error);
      toast.error("Failed to load flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleReviewDue = () => {
    router.push("/dashboard/flashcards/review?dueOnly=true");
  };

  const handleStudyAll = () => {
    router.push("/dashboard/flashcards/review");
  };

  const filteredDecks = decks.filter((deck) => {
    const matchesSearch = deck.documentTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterDocument === "all" || deck.documentId === filterDocument;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Flashcard Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage your flashcards
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEditor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Card
            </Button>
          </div>
        </div>

        {/* Stats & Quick Actions */}
        {!isLoading && decks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Cards Due Today
                    </p>
                    <p className="text-3xl font-bold mt-1">{totalDueCards}</p>
                  </div>
                  {totalDueCards > 0 && (
                    <Button onClick={handleReviewDue}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Review Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Decks
                    </p>
                    <p className="text-3xl font-bold mt-1">{decks.length}</p>
                  </div>
                  <Button variant="outline" onClick={handleStudyAll}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcard decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterDocument} onValueChange={setFilterDocument}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Decks Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => (
              <FlashcardDeckCard
                key={deck.documentId}
                documentId={deck.documentId}
                documentTitle={deck.documentTitle}
                totalCards={deck.totalCards}
                dueCards={deck.dueCards}
                lastReviewed={deck.lastReviewed}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterDocument !== "all"
                  ? "No flashcards found"
                  : "No flashcards yet"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {searchQuery || filterDocument !== "all"
                  ? "Try adjusting your filters"
                  : "Create flashcards manually or generate them from your documents"}
              </p>
              {!searchQuery && filterDocument === "all" && (
                <div className="flex gap-2">
                  <Button onClick={() => setShowEditor(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Card
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/documents")}
                  >
                    View Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Flashcard Editor */}
      <FlashcardEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={() => {
          loadFlashcards();
          setShowEditor(false);
        }}
        documents={documents}
        mode="create"
      />
    </div>
  );
}
