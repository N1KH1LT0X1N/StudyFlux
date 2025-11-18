'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserMenu from './components/UserMenu';
import FileUpload from './components/FileUpload';
import Summary from './components/Summary';
import Chat from './components/Chat';
import { useState } from 'react';
import { FileData } from '@/types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);

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
