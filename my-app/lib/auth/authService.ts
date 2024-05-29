// authService.ts
import api from '@/lib/api';

interface RegisterPayload {
  email: string;
  role: string | null;
  password: string;
  is_email_verified: boolean;
}

const register = async (payload: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};


interface LoginPayload {
    email: string;
    role: string | null;
    password: string;
    is_email_verified: boolean;
  }
  
  const login = async (payload: LoginPayload) => {
    try {
      const response = await api.post('/auth/login/', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
  }
  
  const changePassword = async (payload: ChangePasswordPayload) => {
    try {
      const response = await api.post('/auth/change_password/', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  interface ForgotPasswordPayload {
    email: string;
  }
  
  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    try {
      const response = await api.post('/auth/forgot_password/', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      const response = await api.post('/auth/logout/');
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const getProfile = async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token/');
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  interface ResetPasswordPayload {
    token: string;
    newPassword: string;
  }
  
  const resetPassword = async (payload: ResetPasswordPayload) => {
    try {
      const response = await api.post('/auth/reset_password/', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const verifyEmail = async (token: string) => {
    try {
      const response = await api.post('/auth/verify_email/', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const auth = {
    register,
    login,
    changePassword,
    forgotPassword,
    logout,
    getProfile,
    refreshToken,
    resetPassword,
    verifyEmail,
  };
  
  export default auth;