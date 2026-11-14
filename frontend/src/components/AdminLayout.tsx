import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Bus,
  Armchair,
  Grid,
  MapPin,
  Image,
  CreditCard,
  Star,
  Shield,
  Clock,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Calendar,
  Ticket,
  DollarSign,
  Sun,
  Moon,
  Menu,
  X,
  Radio,
  Tag
} from 'lucide-react';
import { AuthUser } from '../types';
import { toast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth <= 1024;
      setIsMobileOrTablet(small);
      if (!small) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('traveleasy_token');
    localStorage.removeItem('traveleasy_user');
    toast.info('Bạn đã đăng xuất an toàn khỏi Cổng Quản trị.', 'Đăng Xuất Quản Trị');
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { label: 'Tổng quan', path: '/admin/dashboard', icon: LayoutGrid },
    { label: 'Chuyến xe toàn sàn', path: '/admin/trips', icon: Calendar },
    { label: 'Giám sát GPS đội xe (Live)', path: '/admin/gps-tracking', icon: Radio },
    { label: 'Tuyến đường toàn quốc', path: '/admin/routes', icon: MapPin },
    { label: 'Đơn đặt vé toàn sàn', path: '/admin/bookings', icon: Ticket },
    { label: 'Đối soát & Hoa hồng sàn', path: '/admin/settlements', icon: DollarSign },
    { label: 'Quản lý người dùng', path: '/admin/users', icon: Users },
    { label: 'Duyệt & Quản lý nhà xe', path: '/admin/bus-companies', icon: Bus },
  ];

  const categoryItems = [
    { label: 'Loại ghế chuẩn hóa', path: '/admin/seat-catalog/types', icon: Armchair },
    { label: 'Mẫu sơ đồ ghế master', path: '/admin/seat-catalog/templates', icon: Grid },
    { label: 'Địa điểm & Bến xe master', path: '/admin/locations', icon: MapPin },
  ];

  const systemItems = [
    { label: 'Khuyến mại & Voucher sàn', path: '/admin/promotions', icon: Tag },
    { label: 'Banner chiến dịch sàn', path: '/admin/banners', icon: Image },
    { label: 'Cổng thanh toán sàn', path: '/admin/gateways', icon: CreditCard },
    { label: 'Báo cáo đánh giá vi phạm', path: '/admin/review-reports', icon: Star },
    { label: 'Chính sách hoàn hủy sàn', path: '/admin/cancellation-policies', icon: Shield },
    { label: 'Nhật ký kiểm toán (Audit Logs)', path: '/admin/audit-logs', icon: Clock },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) {
      return true;
    }
    if (path === '/admin/seat-catalog/types' && (location.pathname === '/admin/seat-catalog/types' || location.pathname === '/admin/seat-types')) {
      return true;
    }
    if (path === '/admin/seat-catalog/templates' && (location.pathname === '/admin/seat-catalog/templates' || location.pathname === '/admin/seat-templates')) {
      return true;
    }
    if (path === '/admin/gateways' && (location.pathname === '/admin/gateways' || location.pathname === '/admin/payments')) {
      return true;
    }
    if (path === '/admin/review-reports' && (location.pathname === '/admin/review-reports' || location.pathname === '/admin/reviews')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: isDark ? '#0b0f19' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", transition: 'all 0.25s ease' }}>
      {/* Mobile/Tablet Backdrop Overlay */}
      {isMobileOrTablet && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (DARK NAVY THEME)                        */}
      {/* ======================================================== */}
      <aside
        style={{
          width: '240px',
          backgroundColor: '#0b132b',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: isMobileOrTablet ? 'fixed' : 'sticky',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: isMobileOrTablet ? 100 : 40,
          transform: isMobileOrTablet && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isMobileOrTablet && sidebarOpen ? '6px 0 24px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', overflowY: 'auto' }}>
          {/* Brand Header */}
          <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
                  flexShrink: 0
                }}
              >
                TE
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>TravelEasy Admin</div>
                <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 600, letterSpacing: '0.6px', marginTop: '2px' }}>
                  ENTERPRISE PORTAL
                </div>
              </div>
            </div>
            {isMobileOrTablet && (
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Đóng Menu"
                style={{
                  padding: '4px',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Nav List */}
          <nav 
            onClick={() => { if (isMobileOrTablet) setSidebarOpen(false); }}
            style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#ffffff' : '#94a3b8',
                    backgroundColor: active ? '#1e293b' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={17} color={active ? '#ffffff' : '#94a3b8'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* DANH MỤC HỆ THỐNG Group */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#475569',
                letterSpacing: '0.8px',
                padding: '16px 12px 6px',
                textTransform: 'uppercase'
              }}
            >
              DANH MỤC HỆ THỐNG
            </div>
            {categoryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#ffffff' : '#94a3b8',
                    backgroundColor: active ? '#1e293b' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={17} color={active ? '#ffffff' : '#94a3b8'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* HỆ THỐNG SÀN TỔNG Group */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#475569',
                letterSpacing: '0.8px',
                padding: '16px 12px 6px',
                textTransform: 'uppercase'
              }}
            >
              HỆ THỐNG SÀN TỔNG
            </div>
            {systemItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#ffffff' : '#94a3b8',
                    backgroundColor: active ? '#1e293b' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={17} color={active ? '#ffffff' : '#94a3b8'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Pinned Button */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={14} color="#f87171" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT WRAPPER                                   */}
      {/* ======================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '60px',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            padding: isMobileOrTablet ? '0 14px' : '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            transition: 'all 0.25s ease'
          }}
        >
          {/* Left Header: Hamburger button on Mobile/Tablet & Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isMobileOrTablet && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở Menu Quản Trị"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Menu size={18} />
              </button>
            )}

            {/* Search Box */}
            <div
              className="hide-on-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '6px 10px',
                width: isMobileOrTablet ? '180px' : '280px',
                gap: '8px'
              }}
            >
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  flex: 1
                }}
              />
              <span
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isDark ? '#94a3b8' : '#64748b'
                }}
              >
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right Header: Theme Toggle, Notification & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Theme Toggle Button */}
            <ThemeToggle showLabel={true} />

            {/* Notification Center Popover */}
            <NotificationDropdown />

            {/* Profile & Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  {currentUser?.fullName
                    ? currentUser.fullName.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
                    : 'AD'}
                </div>
                <div style={{ lineHeight: 1.15 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {currentUser?.fullName || 'Admin TravelEasy'}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                    {currentUser?.role ? `ROLE_${currentUser.role}` : 'SYSTEM_ADMIN'}
                  </div>
                </div>
              </div>

              {/* Direct Logout Button */}
              <button
                onClick={handleLogout}
                title="Đăng xuất khỏi Cổng Quản trị"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                  border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : '#fecaca'}`,
                  borderRadius: '6px',
                  padding: '5px 9px',
                  color: isDark ? '#fca5a5' : '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <LogOut size={13} color={isDark ? '#fca5a5' : '#dc2626'} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: isMobileOrTablet ? '16px 14px' : '24px 28px', backgroundColor: isDark ? '#0b0f19' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', transition: 'all 0.25s ease' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
