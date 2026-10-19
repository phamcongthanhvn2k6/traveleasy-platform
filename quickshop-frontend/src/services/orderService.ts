import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { Order, OrderStatus } from '../types/order';

export const orderService = {
  checkout: (data: any): Promise<ApiResponse<Order>> =>
    axiosClient.post('/orders/checkout', data),

  getMyOrders: (): Promise<ApiResponse<Order[]>> =>
    axiosClient.get('/orders/my-orders'),

  getOrderDetail: (id: number): Promise<ApiResponse<Order>> =>
    axiosClient.get(`/orders/${id}`),

  getAllOrders: (status?: OrderStatus, page = 0): Promise<ApiResponse<PageResponse<Order>>> =>
    axiosClient.get('/admin/orders', { params: { status, page } }),

  updateOrderStatus: (id: number, status: OrderStatus): Promise<ApiResponse<Order>> =>
    axiosClient.patch(`/admin/orders/${id}/status`, { status }),
};
