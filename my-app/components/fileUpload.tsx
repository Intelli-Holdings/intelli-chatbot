import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadPopupProps {
  onClose: () => void;
  onFilesUploaded: (files: File[]) => void;
}

const FileUploadPopup: React.FC<FileUploadPopupProps> = ({ onClose, onFilesUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });

  const handleUpload = () => {
    if (files.length > 0) {
      onFilesUploaded(files);
      onClose();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag and drop files here, or click to select files</p>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFilesSelected}
          />
        </div>
        <div>
          {files.map((file) => (
            <div key={file.name}>{file.name}</div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpload}>
            Upload
          </button>
          <button className="ml-2 bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;