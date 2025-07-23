import { useState, useCallback } from 'react';
import { uploadMultipleToImageBB, ProcessedImageBBImage } from '../lib/imagebb-fixed';

interface UseImageBBUploadReturn {
  uploadImages: (files: File[], namePrefix?: string) => Promise<ProcessedImageBBImage[]>;
  uploading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useImageBBUpload = (): UseImageBBUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = useCallback(async (files: File[], namePrefix?: string): Promise<ProcessedImageBBImage[]> => {
    setUploading(true);
    setError(null);

    try {
      const result = await uploadMultipleToImageBB(files, namePrefix);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImages,
    uploading,
    error,
    clearError,
  };
};

// Specialized hook for product image uploads
export const useProductImageUpload = () => {
  const { uploadImages, uploading, error, clearError } = useImageBBUpload();

  const uploadProductImages = useCallback(async (files: File[], productName?: string) => {
    const namePrefix = productName 
      ? `product_${productName.toLowerCase().replace(/\s+/g, '_')}` 
      : 'product';
    
    return uploadImages(files, namePrefix);
  }, [uploadImages]);

  return {
    uploadImages: uploadProductImages,
    uploading,
    error,
    clearError,
  };
};

// Specialized hook for category image uploads
export const useCategoryImageUpload = () => {
  const { uploadImages, uploading, error, clearError } = useImageBBUpload();

  const uploadCategoryImages = useCallback(async (files: File[], categoryName?: string) => {
    const namePrefix = categoryName 
      ? `category_${categoryName.toLowerCase().replace(/\s+/g, '_')}` 
      : 'category';
    
    return uploadImages(files, namePrefix);
  }, [uploadImages]);

  return {
    uploadImages: uploadCategoryImages,
    uploading,
    error,
    clearError,
  };
};

// Specialized hook for user avatar uploads
export const useAvatarUpload = () => {
  const { uploadImages, uploading, error, clearError } = useImageBBUpload();

  const uploadAvatar = useCallback(async (file: File, username?: string) => {
    const namePrefix = username 
      ? `avatar_${username.toLowerCase().replace(/\s+/g, '_')}` 
      : 'avatar';
    
    const result = await uploadImages([file], namePrefix);
    return result[0]; // Return single image for avatar
  }, [uploadImages]);

  return {
    uploadImage: uploadAvatar,
    uploading,
    error,
    clearError,
  };
};
