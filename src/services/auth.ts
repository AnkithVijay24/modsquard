const API_URL = 'http://localhost:5001/api';

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    profile?: {
      id: string;
      bio?: string;
      avatarUrl?: string;
      location?: string;
      website?: string;
      instagramUrl?: string;
      facebookUrl?: string;
      youtubeUrl?: string;
    };
  };
  token: string;
}

export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    console.log('Attempting to sign up with:', { ...data, password: '[REDACTED]' });
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(data),
    });

    console.log('Sign up response status:', response.status);
    console.log('Sign up response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = 'Failed to sign up';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Sign up successful');
    return responseData;
  } catch (error) {
    console.error('Sign up error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please make sure the server is running and try again.');
    }
    throw error;
  }
};

export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }

    return response.json();
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign out');
    }

    localStorage.removeItem('token');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user data');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
}; 