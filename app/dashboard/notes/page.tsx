"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  document?: {
    id: string;
    title: string;
  };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create note");

      const data = await response.json();
      setNotes([data.note, ...notes]);
      setShowCreateModal(false);
      setFormData({ title: "", content: "" });
      toast.success("Note created successfully! (+5 points)");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingNote || !formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update note");

      const data = await response.json();
      setNotes(notes.map((n) => (n.id === editingNote.id ? data.note : n)));
      setEditingNote(null);
      setFormData({ title: "", content: "" });
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      setNotes(notes.filter((n) => n.id !== id));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const openCreateModal = () => {
    setFormData({ title: "", content: "" });
    setEditingNote(null);
    setShowCreateModal(true);
  };

  const openEditModal = (note: Note) => {
    setFormData({ title: note.title, content: note.content });
    setEditingNote(note);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingNote(null);
    setFormData({ title: "", content: "" });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
              <p className="text-gray-600 mt-1">
                {notes.length} note{notes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              New Note
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "No notes match your search"
                : "No notes yet. Create your first note!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>

                {note.document && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600 mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{note.document.title}</span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Updated {formatDate(note.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingNote ? "Edit Note" : "Create New Note"}
                </h2>

                <form
                  onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter note title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Write your notes here..."
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {editingNote ? "Update Note" : "Create Note"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
