'use client';

import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Summary from './components/Summary';
import Chat from './components/Chat';
import { useState } from 'react';
import { FileData } from '@/types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);

  return (
    <>
      <main className="container">
        <Header />
        {uploadedFile ? (
          <>
            <Summary file={uploadedFile} />
            <Chat file={uploadedFile} />
          </>
        ) : (
          <FileUpload onFileUpload={setUploadedFile} />
        )}
      </main>
    </>
  );
}

export default App;
