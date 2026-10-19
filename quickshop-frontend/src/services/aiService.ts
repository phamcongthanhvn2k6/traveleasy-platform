import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';

export const aiService = {
  generateDescription: (productName: string): Promise<ApiResponse<{ description: string }>> =>
    axiosClient.post('/ai/generate-description', { productName }),

  chat: (message: string): Promise<ApiResponse<{ reply: string }>> =>
    axiosClient.post('/ai/chat', { message }),
};
