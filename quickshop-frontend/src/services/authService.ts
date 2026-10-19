import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { AuthResponse, User } from '../types/auth';

export const authService = {
  login: (data: any): Promise<ApiResponse<AuthResponse>> =>
    axiosClient.post('/auth/login', data),

  register: (data: any): Promise<ApiResponse<AuthResponse>> =>
    axiosClient.post('/auth/register', data),

  getMe: (): Promise<ApiResponse<User>> =>
    axiosClient.get('/users/me'),

  updateProfile: (data: any): Promise<ApiResponse<User>> =>
    axiosClient.put('/users/me', data),
};
