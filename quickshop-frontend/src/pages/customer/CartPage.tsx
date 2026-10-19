import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotalAmount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mt-2">Hãy khám phá thêm hàng trăm sản phẩm hấp dẫn trên QuickShop!</p>
        <Link to="/" className="inline-block mt-6 bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết giỏ hàng</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 shadow-sm">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <img src={i.imageUrl || 'https://via.placeholder.com/100'} alt={i.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{i.name}</h3>
                <p className="text-sm font-bold text-primary-600 mt-1">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(i.productId, i.quantity - 1)} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold px-2">{i.quantity}</span>
                <button onClick={() => updateQuantity(i.productId, i.quantity + 1)} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => removeItem(i.productId)} className="text-gray-400 hover:text-red-500 p-2 ml-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
          <div className="text-lg font-bold">
            Tổng cộng: <span className="text-primary-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotalAmount())}</span>
          </div>
          <Link to="/checkout" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
            <span>Tiến hành đặt hàng COD</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
