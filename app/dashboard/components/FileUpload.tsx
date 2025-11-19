'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileUploadProps } from '@/types';

function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF and images (JPG, PNG) are allowed');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      // Call parent callback with uploaded file data
      const fileData = {
        file: '', // Not needed anymore since file is in Supabase
        type: file.type,
        imageUrl: data.document.fileUrl,
        name: data.document.fileName,
        size: data.document.fileSize,
        documentId: data.document.id,
      };

      onFileUpload(fileData);
      toast.success('File uploaded successfully! +10 points');

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <section className='mx-auto max-w-3xl pb-12 text-center md:pb-20 w-min'>
      <div className="relative">
        <input
          className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          type="file"
          accept=".pdf, .jpg, .jpeg, .png"
          onChange={handleFileUpload}
          disabled={isUploading}
        />

        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default FileUpload;
