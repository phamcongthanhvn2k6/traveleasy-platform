import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { orderService } from '../../services/orderService';

export const CheckoutPage: React.FC = () => {
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipientName: user?.fullName || '',
    recipientPhone: user?.phone || '',
    shippingAddress: user?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await orderService.checkout({
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      clearCart();
      alert('Đặt hàng thành công với phương thức COD!');
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán nhận hàng (COD)</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên người nhận *</label>
          <input
            type="text"
            required
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
          <input
            type="tel"
            required
            value={form.recipientPhone}
            onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ nhận hàng chi tiết *</label>
          <textarea
            required
            rows={3}
            value={form.shippingAddress}
            onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-primary-500"
          ></textarea>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <p className="font-semibold text-gray-800">Phương thức thanh toán:</p>
          <p className="text-gray-600 mt-1">Thanh toán tiền mặt khi nhận hàng (Cash On Delivery - COD)</p>
          <p className="font-bold text-primary-700 text-base mt-2">
            Tổng thanh toán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotalAmount())}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Đang xử lý đặt hàng...' : 'Xác nhận đặt hàng'}
        </button>
      </form>
    </div>
  );
};
