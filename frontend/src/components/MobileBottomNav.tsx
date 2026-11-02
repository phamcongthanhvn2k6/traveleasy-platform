import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Ticket, QrCode, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  // Hide on partner and admin portals to avoid cluttering operational screens
  if (location.pathname.startsWith('/company') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const user = (() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const navItems = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Đặt vé', path: '/search', icon: Search },
    { label: 'Vé của tôi', path: '/my-tickets', icon: Ticket },
    { label: 'Quét QR', path: '/scanner', icon: QrCode },
    { label: user ? 'Tài khoản' : 'Đăng nhập', path: user ? '/profile' : '/auth', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="show-mobile-only"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        boxShadow: isDark
          ? '0 -4px 20px rgba(0, 0, 0, 0.5)'
          : '0 -4px 20px rgba(15, 23, 42, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              color: active
                ? isDark
                  ? '#38bdf8'
                  : '#2563eb'
                : isDark
                ? '#94a3b8'
                : '#64748b',
              transition: 'all 0.15s ease',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: active
                  ? isDark
                    ? 'rgba(56, 189, 248, 0.15)'
                    : '#eff6ff'
                  : 'transparent',
              }}
            >
              <Icon
                size={18}
                color={active ? (isDark ? '#38bdf8' : '#2563eb') : isDark ? '#94a3b8' : '#64748b'}
                strokeWidth={active ? 2.5 : 2}
              />
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: active ? 700 : 500,
                letterSpacing: '-0.1px',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;

