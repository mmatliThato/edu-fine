
import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    totalScore: number;
  };
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/register',
      data,
    );
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/login',
      data,
    );
    return response.data;
  },
};
