import axiosClient from '@/lib/axios';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post('/auth/login', data);
    return response.data;
  },
  
  // Sau này thêm register ở đây
  register: async (data: any) => {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  }
};