import axios from 'axios';
import Cookies from 'js-cookie';

// Import the base URL from the environment variable
const baseUrl = process.env.NEXT_BASE_URL || 'https://intelli-python-backend.onrender.com';

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const response = await axios.post(`${baseUrl}/auth/login/`, { email, password });
    const { access_token, refresh_token } = response.data;

    // Store the access token and refresh token in cookies
    Cookies.set('accessToken', access_token);
    if (refresh_token) {
      Cookies.set('refreshToken', refresh_token);
    }

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

export function logout() {
  // Remove the access token and refresh token from cookies
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

export function checkAuthStatus(): boolean {
  const accessToken = Cookies.get('accessToken');
  return !!accessToken; // Return true if an access token exists, false otherwise
}