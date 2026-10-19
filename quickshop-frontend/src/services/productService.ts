import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { Category, Product } from '../types/product';

export const productService = {
  getCategories: (): Promise<ApiResponse<Category[]>> =>
    axiosClient.get('/categories'),

  getProducts: (params?: any): Promise<ApiResponse<PageResponse<Product>>> =>
    axiosClient.get('/products', { params }),

  getProductById: (id: number): Promise<ApiResponse<Product>> =>
    axiosClient.get(`/products/${id}`),

  createProduct: (data: any): Promise<ApiResponse<Product>> =>
    axiosClient.post('/admin/products', data),

  updateProduct: (id: number, data: any): Promise<ApiResponse<Product>> =>
    axiosClient.put(`/admin/products/${id}`, data),

  deleteProduct: (id: number): Promise<ApiResponse<void>> =>
    axiosClient.delete(`/admin/products/${id}`),
};
