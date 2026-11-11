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
  BarChart3,
  ArrowLeftRight,
  Car,
  Users,
  Wallet,
  RotateCcw,
  ShieldAlert,
  UserCheck
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

export type StaffRole = 'OWNER' | 'CASHIER' | 'DISPATCHER';

export const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;
  });

  // Cơ chế Phân quyền nội bộ nhà xe (Sub-Account RBAC)
  const [staffRole, setStaffRole] = useState<StaffRole>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_staff_role');
      if (saved === 'CASHIER' || saved === 'DISPATCHER' || saved === 'OWNER') {
        return saved as StaffRole;
      }
    } catch {}
    return 'OWNER';
  });

  const handleRoleChange = (newRole: StaffRole) => {
    setStaffRole(newRole);
    localStorage.setItem('traveleasy_staff_role', newRole);
    const roleLabels: Record<StaffRole, string> = {
      OWNER: 'Chủ Nhà Xe / Giám Đốc (Toàn Quyền)',
      CASHIER: 'Nhân Viên Thu Ngân Quầy Bến Xe',
      DISPATCHER: 'Điều Hành Viên / Trực Ban Bến Xe'
    };
    toast.success(`Đã chuyển sang góc nhìn quyền hạn: ${roleLabels[newRole]}`, 'Phân Quyền RBAC');
  };

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
    localStorage.removeItem('traveleasy_staff_role');
    toast.info('Đã đăng xuất khỏi Cổng Đối Tác Nhà Xe.', 'Đăng Xuất');
    navigate('/company/login', { replace: true });
  };

  // Danh mục menu gốc
  const allOperationItems = [
    { label: 'Đội xe của tôi', path: '/company/vehicles', icon: Bus, roles: ['OWNER', 'DISPATCHER'] },
    { label: 'Điểm đón/trả riêng', path: '/company/locations', icon: MapPin, roles: ['OWNER', 'DISPATCHER'] },
    { label: 'Tuyến đường đăng ký', path: '/company/routes', icon: Route, roles: ['OWNER', 'DISPATCHER'] },
    { label: 'Chính sách hủy vé riêng', path: '/company/cancellation-policies', icon: Shield, roles: ['OWNER'] },
  ];

  const allBusinessItems = [
    { label: 'Lịch chuyến xe xuất bến', path: '/company/trips', icon: Calendar, roles: ['OWNER', 'DISPATCHER'] },
    { label: 'Hành khách & Vé đã đặt', path: '/company/bookings', icon: Ticket, roles: ['OWNER', 'CASHIER', 'DISPATCHER'] },
    { label: 'Doanh thu & Đối soát sàn', path: '/company/settlements', icon: DollarSign, roles: ['OWNER'] },
    { label: 'Đánh giá từ khách hàng', path: '/company/reviews', icon: Star, roles: ['OWNER'] },
  ];

  const allSprint4Items = [
    { label: 'Quầy bán vé POS', path: '/company/pos', icon: Store, author: 'PTP', roles: ['OWNER', 'CASHIER'] },
    { label: 'Quản lý ca trực', path: '/company/shifts', icon: Clock, author: 'JL', roles: ['OWNER', 'CASHIER'] },
    { label: 'Quy tắc giá vé động', path: '/company/pricing-rules', icon: Tag, author: 'TMD', roles: ['OWNER'] },
    { label: 'Báo cáo & Lấp đầy ghế', path: '/company/reports', icon: BarChart3, author: 'Phat', roles: ['OWNER'] },
  ];

  const allSprint3ExtendedItems = [
    { label: 'Đổi vé & chuyển chuyến', path: '/company/ticket-exchange', icon: ArrowLeftRight, author: 'TMD', roles: ['OWNER', 'CASHIER'] },
    { label: 'Xe trung chuyển tận nơi', path: '/company/shuttles', icon: Car, author: 'TMD', roles: ['OWNER', 'DISPATCHER'] },
    { label: 'Sổ chi phí & Lợi nhuận', path: '/company/expenses', icon: Wallet, author: 'TMD', roles: ['OWNER'] },
    { label: 'Phân công tổ lái xe', path: '/company/crew', icon: Users, author: 'JL', roles: ['OWNER', 'DISPATCHER'] },
    { label: 'Chính sách hoàn hủy vé', path: '/company/refunds', icon: RotateCcw, author: 'Phat', roles: ['OWNER'] },
  ];

  // Lọc Menu hiển thị theo StaffRole hiện tại
  const operationItems = allOperationItems.filter(item => item.roles.includes(staffRole));
  const businessItems = allBusinessItems.filter(item => item.roles.includes(staffRole));
  const sprint4Items = allSprint4Items.filter(item => item.roles.includes(staffRole));
  const sprint3ExtendedItems = allSprint3ExtendedItems.filter(item => item.roles.includes(staffRole));

  // Kiểm tra quyền truy cập đường dẫn hiện tại (Route Guard)
  const isCurrentPathRestricted = () => {
    if (staffRole === 'OWNER') return false;
    const currentPath = location.pathname;

    // Các đường dẫn tối mật về tài chính chỉ dành riêng cho OWNER
    const ownerOnlyPaths = ['/company/settlements', '/company/expenses', '/company/pricing-rules', '/company/reports', '/company/cancellation-policies'];
    if (ownerOnlyPaths.includes(currentPath)) {
      return true;
    }

    // CASHIER bị cấm vào phân công tổ lái & trung chuyển
    const dispatcherOnlyPaths = ['/company/crew', '/company/shuttles', '/company/vehicles', '/company/routes'];
    if (dispatcherOnlyPaths.includes(currentPath) && staffRole === 'CASHIER') {
      return true;
    }

    // DISPATCHER bị cấm vào quầy bán vé & ca trực
    const cashierOnlyPaths = ['/company/pos', '/company/shifts'];
    if (cashierOnlyPaths.includes(currentPath) && staffRole === 'DISPATCHER') {
      return true;
    }

    return false;
  };

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
          zIndex: 100,
          transform: isMobileOrTablet ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.25s ease',
          boxShadow: isMobileOrTablet && sidebarOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          {/* Logo & Close Button Header */}
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Link to="/company/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '16px'
                }}
              >
                T
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>
                  TravelEasy
                </span>
                <span style={{ color: '#38bdf8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
                  PARTNER PORTAL
                </span>
              </div>
            </Link>

            {isMobileOrTablet && (
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Đóng Menu Điều Hành"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Current Staff Role Badge in Sidebar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: staffRole === 'OWNER' ? 'rgba(245, 158, 11, 0.15)' : (staffRole === 'CASHIER' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)'),
              border: `1px solid ${staffRole === 'OWNER' ? 'rgba(245, 158, 11, 0.3)' : (staffRole === 'CASHIER' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)')}`,
              color: staffRole === 'OWNER' ? '#fbbf24' : (staffRole === 'CASHIER' ? '#60a5fa' : '#c084fc'),
              fontSize: '11px',
              fontWeight: 700
            }}>
              <UserCheck size={14} />
              <span>
                {staffRole === 'OWNER' && 'QUYỀN: CHỦ NHÀ XE'}
                {staffRole === 'CASHIER' && 'QUYỀN: THU NGÂN QUẦY'}
                {staffRole === 'DISPATCHER' && 'QUYỀN: ĐIỀU HÀNH BẾN'}
              </span>
            </div>
          </div>

          {/* Navigation Links (Được lọc tự động theo Staff Role) */}
          <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
              <LayoutGrid size={17} color={isActive('/company/dashboard') ? '#38bdf8' : '#94a3b8'} />
              <span>Bảng tổng quan</span>
            </Link>

            {/* VẬN HÀNH Group (nếu có item cho role này) */}
            {operationItems.length > 0 && (
              <>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.8px', padding: '16px 12px 6px', textTransform: 'uppercase' }}>
                  VẬN HÀNH XE
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
                      <Icon size={17} color={active ? '#38bdf8' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* KINH DOANH Group (nếu có item) */}
            {businessItems.length > 0 && (
              <>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.8px', padding: '16px 12px 6px', textTransform: 'uppercase' }}>
                  KINH DOANH & ĐỐI SOÁT
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
              </>
            )}

            {/* NHIỆM VỤ SPRINT 3 Group */}
            {sprint4Items.length > 0 && (
              <>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', padding: '16px 12px 6px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>NHIỆM VỤ SPRINT 3</span>
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
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: active ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)', color: active ? '#0f172a' : '#cbd5e1' }}>
                        {item.author}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* VẬN HÀNH NÂNG CAO Group */}
            {sprint3ExtendedItems.length > 0 && (
              <>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', letterSpacing: '0.8px', padding: '16px 12px 6px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>VẬN HÀNH NÂNG CAO</span>
                  <span style={{ fontSize: '9px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 5px', borderRadius: '4px' }}>
                    MỚI
                  </span>
                </div>
                {sprint3ExtendedItems.map((item) => {
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
                        <Icon size={17} color={active ? '#10b981' : '#94a3b8'} />
                        <span>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: active ? '#10b981' : 'rgba(255, 255, 255, 0.08)', color: active ? '#0f172a' : '#cbd5e1' }}>
                        {item.author}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#070d1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                {currentUser?.fullName?.charAt(0) || 'N'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.fullName || 'Nhà Xe Đối Tác'}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  {staffRole}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất khỏi Cổng Nhà Xe"
              style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
            >
              <LogOut size={15} />
            </button>
          </div>
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
          {/* Left Header: Hamburger button on Mobile/Tablet */}
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

            {/* DEMO SWITCHER: Chuyển đổi vai trò nhân viên tức thì cho Hội Đồng xem */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }} className="hide-on-mobile">
                Góc nhìn:
              </span>
              <select
                value={staffRole}
                onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: staffRole === 'OWNER' ? (isDark ? '#78350f' : '#fef3c7') : (staffRole === 'CASHIER' ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#581c87' : '#f3e8ff')),
                  color: staffRole === 'OWNER' ? '#d97706' : (staffRole === 'CASHIER' ? '#2563eb' : '#9333ea'),
                  border: `1px solid ${staffRole === 'OWNER' ? '#f59e0b' : (staffRole === 'CASHIER' ? '#3b82f6' : '#a855f7')}`,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="OWNER">👑 Chủ Nhà Xe / Giám Đốc (Full Access)</option>
                <option value="CASHIER">🎟️ Nhân Viên Thu Ngân Quầy Bến Xe</option>
                <option value="DISPATCHER">👨‍✈️ Điều Hành Viên / Trực Ban Bến</option>
              </select>
            </div>
          </div>

          {/* Right Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ThemeToggle showLabel={false} />
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
              }}
            >
              <span>Nhà xe: <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>{getCompanyDisplayName()}</strong></span>
            </div>
            <NotificationDropdown />
          </div>
        </header>

        {/* Content Body with Route Guard (Chặn 403 nếu cố tình gõ URL cấm) */}
        <main style={{ flex: 1, padding: isMobileOrTablet ? '16px' : '24px 28px', overflowY: 'auto' }}>
          {isCurrentPathRestricted() ? (
            <div style={{
              maxWidth: '640px',
              margin: '60px auto',
              padding: '36px',
              backgroundColor: isDark ? '#1e1b4b' : '#fef2f2',
              border: `1px solid ${isDark ? '#4338ca' : '#fecaca'}`,
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={32} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
                403 - TRUY CẬP BỊ TỪ CHỐI
              </h2>
              <p style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
                Bạn đang truy cập với vai trò <strong>{staffRole === 'CASHIER' ? 'Nhân viên thu ngân' : 'Điều hành viên'}</strong>.
                Thông tin này thuộc danh mục bảo mật tài chính / điều hành của Chủ Nhà Xe và bạn không có quyền xem!
              </p>
              <button
                onClick={() => navigate(staffRole === 'CASHIER' ? '/company/pos' : '/company/trips')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Quay về trang được phân quyền
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
export default CompanyLayout;
