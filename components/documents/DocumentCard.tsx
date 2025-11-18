"use client";

import Link from "next/link";
import { FileText, Download, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    topics?: string[];
    uploadedAt: string;
  };
  onDelete?: (id: string) => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(document.fileUrl, "_blank");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this document?")) {
      onDelete?.(document.id);
    }
  };

  return (
    <Link
      href={`/dashboard/documents/${document.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {document.fileName}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {document.topics && Array.isArray(document.topics) && document.topics.length > 0 ? (
            document.topics.slice(0, 3).map((topic: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded"
              >
                {topic}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded">
              No topics
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>{formatDate(document.uploadedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
