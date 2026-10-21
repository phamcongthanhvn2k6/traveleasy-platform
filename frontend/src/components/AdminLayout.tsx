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
  Store,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Calendar,
  Ticket
} from 'lucide-react';
import { AuthUser } from '../types';
import { toast } from '../context/ToastContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    { label: 'Tong quan', path: '/admin/dashboard', icon: LayoutGrid },
    { label: 'Chuyen xe', path: '/admin/trips', icon: Calendar },
    { label: 'Don dat ve', path: '/admin/bookings', icon: Ticket },
    { label: 'Nguoi dung', path: '/admin/users', icon: Users },
    { label: 'Nha xe', path: '/admin/bus-companies', icon: Bus },
  ];

  const categoryItems = [
    { label: 'Loai ghe', path: '/admin/seat-catalog/types', icon: Armchair },
    { label: 'Mau so do ghe', path: '/admin/seat-catalog/templates', icon: Grid },
    { label: 'Dia diem', path: '/admin/locations', icon: MapPin },
  ];

  const systemItems = [
    { label: 'Banner', path: '/admin/banners', icon: Image },
    { label: 'Cong thanh toan', path: '/admin/gateways', icon: CreditCard },
    { label: 'Bao cao danh gia', path: '/admin/review-reports', icon: Star },
    { label: 'Chinh sach huy', path: '/admin/cancellation-policies', icon: Shield },
    { label: 'Nhat ky he thong', path: '/admin/audit-logs', icon: Clock },
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
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
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', overflowY: 'auto' }}>
          {/* Brand Header */}
          <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          {/* Nav List */}
          <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

            {/* DANH MUC Group */}
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
              DANH MUC
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

            {/* HE THONG Group */}
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
              HE THONG
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
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/company/dashboard"
            style={{
              width: '100%',
              backgroundColor: '#151e34',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '9px 12px',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.15s ease'
            }}
          >
            <Store size={15} color="#94a3b8" />
            <span>Sang TravelEasy Partner</span>
          </Link>

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
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 10px',
              width: '280px',
              gap: '8px'
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tim kiem..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: '#0f172a',
                flex: 1
              }}
            />
            <span
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '1px 5px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#64748b'
              }}
            >
              ⌘ K
            </span>
          </div>

          {/* Right Header: Notification & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Bell Icon */}
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
              <Bell size={18} color="#64748b" />
              <span
                style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444'
                }}
              />
            </div>

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
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {currentUser?.fullName || 'Admin TravelEasy'}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>
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
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '5px 9px',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                }}
              >
                <LogOut size={13} color="#dc2626" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px 28px', backgroundColor: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
