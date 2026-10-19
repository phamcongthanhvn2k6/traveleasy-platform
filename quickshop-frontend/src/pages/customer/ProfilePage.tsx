import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';

export const ProfilePage: React.FC = () => {
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile(form);
      if (token) setAuth(token, res.data);
      setMessage('Cập nhật thông tin thành công!');
    } catch {
      setMessage('Cập nhật thất bại, vui lòng thử lại');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>
      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input type="text" disabled value={user?.email || ''} className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
          <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-primary-500" />
        </div>
        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg transition-colors">
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};
