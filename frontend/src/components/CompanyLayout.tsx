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
  Search,
  Bell,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { AuthUser } from '../types';

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
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
    toast.info('Đã đăng xuất khỏi Cổng Đối Tác Nhà Xe.', 'Đăng Xuất');
    navigate('/company/login', { replace: true });
  };

  const operationItems = [
    { label: 'Doi xe', path: '/company/vehicles', icon: Bus },
    { label: 'Dia diem nha xe', path: '/company/locations', icon: MapPin },
    { label: 'Tuyen duong', path: '/company/routes', icon: Route },
    { label: 'Chinh sach huy', path: '/company/cancellation-policies', icon: Shield },
  ];

  const businessItems = [
    { label: 'Chuyen xe', path: '/company/trips', icon: Calendar },
    { label: 'Dat ve', path: '/company/bookings', icon: Ticket },
    { label: 'Danh gia', path: '/company/reviews', icon: Star },
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
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

          {/* Nav List */}
          <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
              <span>Tong quan</span>
            </Link>

            {/* VAN HANH Group */}
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
              VAN HANH
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

            {/* KINH DOANH Group */}
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
              KINH DOANH
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

          {/* Right Header: Company Selector, Notification & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Current Company Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0369a1',
                cursor: 'pointer'
              }}
            >
              <span>Nha xe hien tai: <strong style={{ color: '#0284c7' }}>TravelEasy Express</strong></span>
              <ChevronDown size={13} color="#0284c7" />
            </div>

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
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {currentUser?.fullName || 'Điều Hành Nhà Xe'}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#0d9488' }}>
                  {currentUser?.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'ĐỐI TÁC NHÀ XE'}
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
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
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
        <main style={{ flex: 1, padding: '24px 28px', backgroundColor: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;

