import type { LoginRequest, LoginResponse, User } from '../types';
import { api } from '@/lib/api';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/auth/login", data);
  },
  
  // Sau này thêm register ở đây
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response;
  }
};