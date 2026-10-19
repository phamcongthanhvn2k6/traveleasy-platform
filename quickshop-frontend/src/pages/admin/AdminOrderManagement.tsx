import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types/order';

export const AdminOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

  const loadOrders = () => {
    orderService.getAllOrders().then((res) => setOrders(res.data.content));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders();
      alert('Đổi trạng thái đơn hàng thành công!');
    } catch {
      alert('Đổi trạng thái thất bại');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Quản lý và cập nhật đơn hàng</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Mã đơn</th>
              <th className="py-3 px-4">Người nhận</th>
              <th className="py-3 px-4">SĐT & Địa chỉ</th>
              <th className="py-3 px-4">Tổng tiền</th>
              <th className="py-3 px-4">Trạng thái hiện tại</th>
              <th className="py-3 px-4">Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-900">{o.orderCode}</td>
                <td className="py-3 px-4 font-semibold">{o.recipientName}</td>
                <td className="py-3 px-4 text-xs text-gray-500">
                  <p>{o.recipientPhone}</p>
                  <p className="line-clamp-1">{o.shippingAddress}</p>
                </td>
                <td className="py-3 px-4 font-bold text-primary-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white focus:outline-none"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
