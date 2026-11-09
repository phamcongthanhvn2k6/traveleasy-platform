import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Bus,
  MapPin,
  Route,
  Shield,
  Calendar,
  Ticket,
  Star,
  DollarSign,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Store,
  Clock,
  Tag,
  BarChart3
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { AuthUser } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { getStoredCompany } from '../utils/companyHelper';

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
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

  const getCompanyDisplayName = () => {
    return getStoredCompany().shortName;
  };

  const handleLogout = () => {
    localStorage.removeItem('traveleasy_token');
    localStorage.removeItem('traveleasy_user');
    toast.info('Đã đăng xuất khỏi Cổng Đối Tác Nhà Xe.', 'Đăng Xuất');
    navigate('/company/login', { replace: true });
  };

  const operationItems = [
    { label: 'Đội xe của tôi', path: '/company/vehicles', icon: Bus },
    { label: 'Điểm đón/trả riêng', path: '/company/locations', icon: MapPin },
    { label: 'Tuyến đường đăng ký', path: '/company/routes', icon: Route },
    { label: 'Chính sách hủy vé riêng', path: '/company/cancellation-policies', icon: Shield },
  ];

  const businessItems = [
    { label: 'Lịch chuyến xe xuất bến', path: '/company/trips', icon: Calendar },
    { label: 'Hành khách & Vé đã đặt', path: '/company/bookings', icon: Ticket },
    { label: 'Doanh thu & Đối soát sàn', path: '/company/settlements', icon: DollarSign },
    { label: 'Đánh giá từ khách hàng', path: '/company/reviews', icon: Star },
  ];

  const sprint4Items = [
    { label: 'Quầy bán vé POS', path: '/company/pos', icon: Store, author: 'PTP' },
    { label: 'Quản lý ca trực', path: '/company/shifts', icon: Clock, author: 'JL' },
    { label: 'Quy tắc giá vé động', path: '/company/pricing-rules', icon: Tag, author: 'TMD' },
    { label: 'Báo cáo & Lấp đầy ghế', path: '/company/reports', icon: BarChart3, author: 'Phat' },
  ];

  const isActive = (path: string) => {
    if (path === '/company/dashboard' && (location.pathname === '/company' || location.pathname === '/company/dashboard')) {
      return true;
    }
    if (path === '/company/vehicles' && (location.pathname === '/company/vehicles' || location.pathname === '/company/fleet/vehicles')) {
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
      {/* 1. LEFT SIDEBAR (TRAVELEASY PARTNER THEME)             */}
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
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)',
                  flexShrink: 0
                }}
              >
                TE
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>TravelEasy Partner</div>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.6px', marginTop: '2px' }}>
                  BUS OPERATOR PORTAL
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
            {/* Tong quan */}
            <Link
              to="/company/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive('/company/dashboard') ? 600 : 500,
                color: isActive('/company/dashboard') ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive('/company/dashboard') ? '#1e293b' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutGrid size={17} color={isActive('/company/dashboard') ? '#ffffff' : '#94a3b8'} />
              <span>Tổng quan</span>
            </Link>

            {/* VẬN HÀNH ĐỘI XE Group */}
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
              VẬN HÀNH ĐỘI XE
            </div>
            {operationItems.map((item) => {
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

            {/* KINH DOANH & BÁN VÉ Group */}
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
              KINH DOANH & BÁN VÉ
            </div>
            {businessItems.map((item) => {
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

            {/* NHIỆM VỤ SPRINT 4 Group */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.8px',
                padding: '16px 12px 6px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>SPRINT 4 NHIỆM VỤ</span>
              <span style={{ fontSize: '9px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px' }}>
                OJT
              </span>
            </div>
            {sprint4Items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={17} color={active ? '#38bdf8' : '#94a3b8'} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: active ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#0f172a' : '#cbd5e1'
                    }}
                  >
                    {item.author}
                  </span>
                </Link>
              );
            })}
          </nav>
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
                aria-label="Mở Menu Điều Hành"
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

          {/* Right Header: Theme Toggle, Company Selector, Notification & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Theme Toggle Button */}
            <ThemeToggle showLabel={false} />

            {/* Current Company Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                backgroundColor: isDark ? '#082f49' : '#f0f9ff',
                border: `1px solid ${isDark ? '#0369a1' : '#bae6fd'}`,
                borderRadius: '6px',
                fontSize: '12px',
                color: isDark ? '#7dd3fc' : '#0369a1',
                cursor: 'pointer'
              }}
            >
              <span>Nhà xe: <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>{getCompanyDisplayName()}</strong></span>
              <ChevronDown size={13} color={isDark ? '#38bdf8' : '#0284c7'} />
            </div>

            {/* Notification Center Popover */}
            <NotificationDropdown />

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #0d9488)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                {currentUser?.fullName?.substring(0, 2)?.toUpperCase() || 'TE'}
              </div>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {currentUser?.fullName || 'Điều Hành Nhà Xe'}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#2dd4bf' : '#0d9488' }}>
                  ĐỐI TÁC NHÀ XE
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Đăng xuất Cổng Nhà Xe"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
                color: isDark ? '#fca5a5' : '#dc2626',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : '#fecaca'}`,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={13} /> Đăng Xuất
            </button>
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

export default CompanyLayout;

