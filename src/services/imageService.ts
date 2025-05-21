import axios from 'axios';

interface UploadResponse {
  id: string;
  url: string;
  buildId?: string;
  createdAt?: string;
}

// Default values if env vars are not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Temporary function that returns a placeholder image
export const uploadImage = async (
  file: File,
  buildId?: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  // Simulate progress
  onProgress?.(50);
  await new Promise(resolve => setTimeout(resolve, 500));
  onProgress?.(100);

  // Return a placeholder image
  return {
    id: 'placeholder',
    url: 'https://placehold.co/600x400?text=Vehicle+Image',
    buildId: buildId,
    createdAt: new Date().toISOString()
  };
};

export const deleteImage = async (buildId: string, imageId: string): Promise<void> => {
  // No-op for now
  return;
};

export const getImageUrl = (url: string): string => {
  // If it's our placeholder, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // For any other URLs, maintain the previous logic
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  
  return `${API_URL}/uploads/${url}`;
}; 