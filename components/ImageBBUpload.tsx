import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageBBUpload } from '../hooks/useImageBBUpload';
import { ProcessedImageBBImage } from '../lib/imagebb-fixed';
import { Upload, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface ImageBBUploadProps {
  onImagesUploaded: (images: ProcessedImageBBImage[]) => void;
  maxFiles?: number;
  namePrefix?: string;
  showPreview?: boolean;
}

const ImageBBUpload: React.FC<ImageBBUploadProps> = ({
  onImagesUploaded,
  maxFiles = 5,
  namePrefix = 'image',
  showPreview = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { uploadImages, uploading, error, clearError } = useImageBBUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }, [files, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      const uploadedImages = await uploadImages(files, namePrefix);
      onImagesUploaded(uploadedImages);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-10 h-10 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here ...</p>
          ) : (
            <p className="text-gray-500">Drag & drop some files here, or click to select files</p>
          )}
          <p className="text-xs text-gray-400">Max {maxFiles} images</p>
        </div>
      </div>

      {showPreview && previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img src={preview} alt={`preview ${index}`} className="w-full h-auto object-cover rounded-lg aspect-square" />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-75 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length} Image{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageBBUpload;
