"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Grid, List, Plus } from "lucide-react";
import DocumentCard from "@/components/documents/DocumentCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  topics?: string[];
  uploadedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      toast.success("Document deleted successfully");
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      // Search filter
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.topics &&
          Array.isArray(doc.topics) &&
          doc.topics.some((topic) =>
            topic.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      // Type filter
      const matchesType =
        filterType === "all" || doc.fileType.includes(filterType);

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

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
              <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
              <p className="text-gray-600 mt-1">
                {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Upload Document
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* File Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="image">Images</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterType !== "all"
                ? "No documents match your filters"
                : "No documents uploaded yet"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
