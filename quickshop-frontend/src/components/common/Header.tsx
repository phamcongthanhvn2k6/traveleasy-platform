import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

interface HeaderProps {
  onSearch?: (keyword: string) => void;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenCart }) => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.getTotalCount());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keyword);
    } else {
      navigate(`/?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <ShoppingBag className="w-6 h-6 text-primary-600" />
          <span>QuickShop</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden sm:flex items-center relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
        </form>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <button
            onClick={onOpenCart || (() => navigate('/cart'))}
            className="relative p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-full"
            title="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded-md hover:bg-amber-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{user.fullName}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 px-3 py-1.5 rounded-md"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
