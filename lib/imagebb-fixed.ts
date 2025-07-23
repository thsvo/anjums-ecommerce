export interface ImageBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export interface ProcessedImageBBImage {
  id: string;
  url: string;
  deleteUrl: string;
  originalName?: string;
  size: number;
  width: number;
  height: number;
  viewerUrl: string;
  thumbUrl: string;
  mediumUrl: string;
}

// Convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const uploadToImageBB = async (
  file: File,
  name?: string
): Promise<ProcessedImageBBImage> => {
  const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY;
  
  if (!apiKey) {
    throw new Error('ImageBB API key not found. Please set NEXT_PUBLIC_IMAGEBB_API_KEY in your environment variables.');
  }

  try {
    // Convert file to base64
    const base64Image = await fileToBase64(file);
    
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('key', apiKey);
    
    if (name) {
      formData.append('name', name);
    }

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ImageBBResponse = await response.json();

    if (!result.success) {
      throw new Error('Upload failed');
    }

    return {
      id: result.data.id,
      url: result.data.url,
      deleteUrl: result.data.delete_url,
      originalName: file.name,
      size: result.data.size,
      width: result.data.width,
      height: result.data.height,
      viewerUrl: result.data.url_viewer,
      thumbUrl: result.data.thumb.url,
      mediumUrl: result.data.medium.url,
    };
  } catch (error) {
    console.error('ImageBB upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const uploadMultipleToImageBB = async (
  files: File[],
  namePrefix?: string
): Promise<ProcessedImageBBImage[]> => {
  const uploadPromises = files.map((file, index) => {
    const name = namePrefix ? `${namePrefix}_${index + 1}` : undefined;
    return uploadToImageBB(file, name);
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};
