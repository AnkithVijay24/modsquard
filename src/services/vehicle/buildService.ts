import axios from 'axios';

export interface Build {
  id: string;
  title: string;
  description: string;
  carMake: string;
  carModel: string;
  carYear: number;
  images?: {
    id: string;
    url: string;
    buildId?: string;
    createdAt?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  user?: {
    username: string;
    profile?: {
      avatarUrl: string | null;
    };
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create a minimal empty PNG file (1x1 transparent pixel)
const EMPTY_PNG = new Uint8Array([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A,
  0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
  0x82
]);

export const createBuild = async (buildData: Omit<Build, 'id' | 'createdAt' | 'updatedAt' | 'images'> & { images?: File[] }): Promise<Build> => {
  try {
    // Create FormData to handle both text data and image upload
    const formData = new FormData();
    
    // Add all build data fields
    Object.entries(buildData).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value.toString());
      }
    });

    // Add all images if provided
    if (buildData.images && buildData.images.length > 0) {
      buildData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await axios.post(`${API_URL}/api/builds`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating build:', error);
    throw new Error('Failed to create build');
  }
};

export const getBuilds = async (): Promise<Build[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/builds`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching builds:', error);
    throw new Error('Failed to fetch builds');
  }
};

export const updateBuild = async (buildId: string, buildData: Partial<Build> & { newImages?: File[] }): Promise<Build> => {
  try {
    const formData = new FormData();
    
    // Add all build data fields except images
    Object.entries(buildData).forEach(([key, value]) => {
      if (key !== 'newImages' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add new images if provided
    if (buildData.newImages && buildData.newImages.length > 0) {
      buildData.newImages.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await axios.put(`${API_URL}/api/builds/${buildId}`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating build:', error);
    throw new Error('Failed to update build');
  }
};

export const deleteBuild = async (buildId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/builds/${buildId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error('Error deleting build:', error);
    throw new Error('Failed to delete build');
  }
};

export const deleteImage = async (buildId: string, imageId: string): Promise<Build> => {
  try {
    const response = await axios.delete(`${API_URL}/api/builds/${buildId}/images/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

export const getPublicBuilds = async (): Promise<Build[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/builds/public`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching public builds:', error);
    throw new Error('Failed to fetch public builds');
  }
}; 