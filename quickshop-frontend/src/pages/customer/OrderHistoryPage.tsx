import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/order';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng của tôi</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          Bạn chưa có đơn hàng nào trên QuickShop.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                <div>
                  <span className="font-bold text-gray-900">{o.orderCode}</span>
                  <span className="text-xs text-gray-400 ml-3">{new Date(o.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                  {o.status}
                </span>
              </div>

              <div className="space-y-2">
                {o.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{i.productName} × {i.quantity}</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold text-sm">
                <span>Tổng tiền:</span>
                <span className="text-primary-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
