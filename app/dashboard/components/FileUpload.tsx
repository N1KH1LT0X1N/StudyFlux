'use client';

import { Buffer } from 'buffer';
import { FileUploadProps, FileData } from '@/types';

function FileUpload({ onFileUpload }: FileUploadProps) {
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    const fileUpload = await uploadedFile.arrayBuffer();

    const file: FileData = {
      type: uploadedFile.type,
      file: Buffer.from(fileUpload).toString("base64"),
      imageUrl: uploadedFile.type.includes("pdf")
        ? "/document-icon.png"
        : URL.createObjectURL(uploadedFile),
      name: uploadedFile.name,
      size: uploadedFile.size,
    };

    console.log(file);
    onFileUpload(file);
  }

  return (
    <section className='mx-auto max-w-3xl pb-12 text-center md:pb-20 w-min'>
      <input
        className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%] cursor-pointer"
        type="file"
        accept=".pdf, .jpg, .jpeg, .png"
        onChange={handleFileUpload}
      />
    </section>
  );
}

export default FileUpload;
