import axios from 'axios';

import { logger } from "@/lib/logger";
const BASE_URL = 'https://intelli-python-backend.onrender.com';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/login/`, {
      email,
      password,
    });

    if (response.status === 200) {
      const { access_token, refresh_token } = response.data;

      // Store the tokens in local storage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      return true;
    } else {
      logger.error('Login failed:', { data: response.data });
      return false;
    }
  } catch (error) {
    logger.error('Error during login:', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};


export function logout() {
  // Remove the access token and refresh token from storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function checkAuthStatus(): boolean {
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken; // Return true if an access token exists, false otherwise
}