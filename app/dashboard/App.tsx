'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserMenu from './components/UserMenu';
import FileUpload from './components/FileUpload';
import Summary from './components/Summary';
import Chat from './components/Chat';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileData } from '@/types';
import { BrainIcon, TrendingUpIcon } from 'lucide-react';

function App() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [dueFlashcardsCount, setDueFlashcardsCount] = useState(0);

  useEffect(() => {
    const fetchDueFlashcards = async () => {
      try {
        const response = await fetch('/api/flashcards?dueOnly=true&limit=1');
        if (response.ok) {
          const data = await response.json();
          setDueFlashcardsCount(data.dueCount || 0);
        }
      } catch (error) {
        console.error('Error fetching due flashcards:', error);
      }
    };

    fetchDueFlashcards();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-gray-800 bg-gray-900">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            <UserMenu />
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            <Header />

            {/* Flashcards Due Notification */}
            {dueFlashcardsCount > 0 && !uploadedFile && (
              <div className="mb-6 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-500 p-3 rounded-full">
                      <BrainIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Flashcards Due for Review
                      </h3>
                      <p className="text-gray-300">
                        You have {dueFlashcardsCount} flashcard{dueFlashcardsCount !== 1 ? 's' : ''} waiting for review. Keep your knowledge fresh!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/flashcards/review?dueOnly=true')}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    <TrendingUpIcon className="w-5 h-5" />
                    Review Now
                  </button>
                </div>
              </div>
            )}

            {uploadedFile ? (
              <>
                <Summary file={uploadedFile} />
                <Chat file={uploadedFile} />
              </>
            ) : (
              <FileUpload onFileUpload={setUploadedFile} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
