import React, { useState } from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { AdminProductManagement } from './AdminProductManagement';
import { AdminOrderManagement } from './AdminOrderManagement';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Quản Trị Viên (Admin)</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'products' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Quản lý Sản Phẩm</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'orders' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Quản lý Đơn Hàng</span>
          </button>
        </div>
      </div>

      {activeTab === 'products' ? <AdminProductManagement /> : <AdminOrderManagement />}
    </div>
  );
};
