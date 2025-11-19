"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FlashcardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  flashcard?: {
    id: string;
    front: string;
    back: string;
    hint?: string | null;
    documentId: string;
  };
  documents: Array<{
    id: string;
    title: string;
  }>;
  mode?: "create" | "edit";
}

export function FlashcardEditor({
  isOpen,
  onClose,
  onSave,
  flashcard,
  documents,
  mode = "create",
}: FlashcardEditorProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
      setHint(flashcard.hint || "");
      setDocumentId(flashcard.documentId);
    } else {
      setFront("");
      setBack("");
      setHint("");
      setDocumentId(documents[0]?.id || "");
    }
  }, [flashcard, documents]);

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) {
      toast.error("Front and back are required");
      return;
    }

    if (!documentId && mode === "create") {
      toast.error("Please select a document");
      return;
    }

    setIsLoading(true);

    try {
      const url =
        mode === "edit" && flashcard
          ? `/api/flashcards/${flashcard.id}`
          : "/api/flashcards";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: front.trim(),
          back: back.trim(),
          hint: hint.trim() || null,
          documentId: mode === "create" ? documentId : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save flashcard");
      }

      toast.success(
        mode === "edit"
          ? "Flashcard updated successfully"
          : "Flashcard created successfully"
      );
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving flashcard:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save flashcard"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Flashcard" : "Create New Flashcard"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the flashcard content below."
              : "Create a new flashcard for your document."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="document">Document</Label>
              <Select value={documentId} onValueChange={setDocumentId}>
                <SelectTrigger id="document">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="front">Front (Question) *</Label>
            <Textarea
              id="front"
              placeholder="What question do you want to ask?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">Back (Answer) *</Label>
            <Textarea
              id="back"
              placeholder="What is the answer to this question?"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hint">Hint (Optional)</Label>
            <Textarea
              id="hint"
              placeholder="Add a helpful hint or memory aid"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {showPreview && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  FRONT:
                </p>
                <p className="text-base">{front || "..."}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  BACK:
                </p>
                <p className="text-base">{back || "..."}</p>
              </div>
              {hint && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    HINT:
                  </p>
                  <p className="text-base text-muted-foreground">{hint}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
