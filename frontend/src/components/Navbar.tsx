import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Search, 
  ShieldCheck, 
  PhoneCall, 
  User, 
  Info, 
  Building2, 
  LayoutDashboard, 
  Globe, 
  LogOut, 
  Ticket, 
  X, 
  CheckCircle, 
  Mail, 
  Tag, 
  Sparkles,
  Handshake,
  Clock,
  Star,
  FileText,
  Sun,
  Moon,
  QrCode
} from 'lucide-react';
import { AuthUser } from '../types';
import { toast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showPartnerModal, setShowPartnerModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      setUser(saved ? JSON.parse(saved) : null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('traveleasy_token');
    localStorage.removeItem('traveleasy_user');
    setUser(null);
    toast.info('Bạn đã đăng xuất khỏi hệ thống thành công.', 'Đăng Xuất');
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: isDark ? '#111827' : '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.06)',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
      transition: 'all 0.25s ease'
    }}>
      {/* Top Announcement & Quick Links Bar (Chuẩn Vexere Prototype Screenshot 1) */}
      <div style={{
        backgroundColor: isDark ? '#0f172a' : '#1d4ed8',
        color: '#ffffff',
        fontSize: '13px',
        padding: '6px 0',
        borderBottom: isDark ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.25s ease'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: '#fbbf24', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>MỚI</span>
            <span style={{ fontSize: '12.5px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ vận chuyển (*)
              <Info size={14} style={{ opacity: 0.8, cursor: 'pointer' }} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
            <Link
              to="/company/login"
              style={{
                color: '#93c5fd',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                padding: '3px 10px',
                borderRadius: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Cổng điều hành và quản lý dành riêng cho các nhà xe đối tác"
            >
              <Building2 size={13} />
              <span>Cổng Đối Tác Nhà Xe</span>
            </Link>

            <Link
              to="/partner"
              style={{
                textDecoration: 'none',
                color: '#ffffff',
                opacity: 0.95,
                fontSize: '12.5px',
                padding: '2px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.95')}
            >
              <Handshake size={14} />
              <span>Hợp tác mở bán vé</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9, cursor: 'pointer' }}>
              <Globe size={14} /> 🇻🇳 VN
            </div>
            <a 
              href="tel:19006868" 
              style={{ 
                color: '#fef08a', 
                textDecoration: 'none', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                padding: '3px 10px',
                borderRadius: '6px'
              }}
            >
              <PhoneCall size={13} /> Hotline 24/7
            </a>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/profile"
                  title="Xem và chỉnh sửa hồ sơ cá nhân"
                  style={{
                    backgroundColor: location.pathname === '/profile' ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <User size={13} /> {user.fullName || user.email}
                  {user.role === 'ADMIN' && (
                    <span style={{ backgroundColor: '#fbbf24', color: '#1e3a8a', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                      ADMIN
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <LogOut size={12} /> Thoát
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1d4ed8',
                  border: 'none',
                  padding: '4px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'none'
                }}
              >
                <User size={13} /> Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '8px', borderRadius: '10px', color: '#fff', display: 'flex', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}>
              <Bus size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: isDark ? '#60a5fa' : '#1e3a8a', letterSpacing: '-0.5px' }}>TravelEasy</span>
                <span style={{ backgroundColor: isDark ? '#854d0e' : '#fef3c7', color: isDark ? '#fef08a' : '#b45309', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>.vn</span>
              </div>
              <span style={{ display: 'block', fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, letterSpacing: '0.2px' }}>
                NỀN TẢNG KẾT NỐI HÀNH KHÁCH VÀ NHÀ XE
              </span>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* 1. Chức năng Đặt Vé Xe */}
            <Link 
              to="/search" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/search' || location.pathname === '/' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#cbd5e1' : '#334155'), 
                fontWeight: location.pathname === '/search' || location.pathname === '/' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/search' || location.pathname === '/' ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <Bus size={15} /> <span>Đặt Vé Xe</span>
            </Link>

            {/* 2. Chức năng Tra Cứu Vé (Riêng biệt, Tra cứu nhanh bằng Mã / SĐT & In vé QR) */}
            <Link 
              to="/lookup" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/lookup' || location.pathname.startsWith('/tickets') ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#cbd5e1' : '#334155'), 
                fontWeight: location.pathname === '/lookup' || location.pathname.startsWith('/tickets') ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/lookup' || location.pathname.startsWith('/tickets') ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={15} /> <span>Tra Cứu Vé</span>
            </Link>

            {/* 3. Chức năng Vé Của Tôi (Lịch sử đặt vé & Quản lý vé cá nhân) */}
            <Link 
              to="/my-tickets" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/my-tickets' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#cbd5e1' : '#334155'), 
                fontWeight: location.pathname === '/my-tickets' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/my-tickets' ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <Ticket size={15} /> <span>Vé Của Tôi</span>
            </Link>

            {/* 4. Chức năng Lịch Trình (Bảng giờ xe & Tuyến đường liên tỉnh) */}
            <Link 
              to="/schedule" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/schedule' || location.pathname === '/routes' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#cbd5e1' : '#475569'), 
                fontWeight: location.pathname === '/schedule' || location.pathname === '/routes' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/schedule' || location.pathname === '/routes' ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={15} /> <span>Lịch Trình</span>
            </Link>

            {/* 5. Chức năng Khuyến Mãi (Mã giảm giá, Voucher hoàn tiền) */}
            <Link 
              to="/promotions" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/promotions' ? '#f87171' : (isDark ? '#cbd5e1' : '#475569'), 
                fontWeight: location.pathname === '/promotions' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/promotions' ? '2px solid #ef4444' : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <Tag size={15} color="#ef4444" /> <span style={{ color: '#ef4444', fontWeight: 700 }}>Khuyến Mãi</span>
              <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2', color: '#ef4444', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                HOT
              </span>
            </Link>

            {/* 6. Chức năng Đánh Giá (Nhận xét và xếp hạng chất lượng nhà xe) */}
            <Link 
              to="/reviews" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/reviews' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#cbd5e1' : '#475569'), 
                fontWeight: location.pathname === '/reviews' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/reviews' ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <Star size={15} color="#f59e0b" /> <span>Đánh Giá</span>
            </Link>

            {/* 7. Chức năng Chính Sách & FAQ (Quy chế hoạt động, hành lý, quyền lợi) */}
            <Link 
              to="/policy" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/policy' || location.pathname === '/guide' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#cbd5e1' : '#475569'), 
                fontWeight: location.pathname === '/policy' || location.pathname === '/guide' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/policy' || location.pathname === '/guide' ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={15} /> <span>Chính Sách & FAQ</span>
            </Link>

            {/* 8. Chức năng Quét Mã Soát Vé */}
            <Link 
              to="/scanner" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/scanner' ? '#34d399' : (isDark ? '#cbd5e1' : '#475569'), 
                fontWeight: location.pathname === '/scanner' ? 700 : 600, 
                fontSize: '13.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                borderBottom: location.pathname === '/scanner' ? '2px solid #10b981' : '2px solid transparent',
                padding: '8px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <QrCode size={15} color="#10b981" /> <span style={{ color: location.pathname === '/scanner' ? '#10b981' : 'inherit' }}>Quét Vé QR</span>
            </Link>
          </nav>
        </div>

        {/* Right Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Button (Chế độ Ban Đêm / Sáng) */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối (Ban đêm chống chói mắt)"}
            style={{
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#fbbf24' : '#475569',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: isDark ? '0 0 12px rgba(251, 191, 36, 0.2)' : 'none',
              transition: 'all 0.25s ease',
            }}
          >
            {isDark ? (
              <>
                <Sun size={15} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }} />
                <span style={{ fontSize: '12px', color: '#f8fafc' }}>Tối</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#475569" />
                <span style={{ fontSize: '12px', color: '#334155' }}>Sáng</span>
              </>
            )}
          </button>
          {/* Cổng Đối Tác Nhà Xe CHỈ hiển thị nếu tài khoản đang đăng nhập là OPERATOR */}
          {user?.role === 'OPERATOR' && (
            <Link 
              to="/company/dashboard" 
              title="Cổng đối tác điều hành nhà xe"
              style={{ 
                textDecoration: 'none', 
                color: '#0f766e', 
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              <Building2 size={16} color="#0d9488" /> 
              <span>Cổng Điều Hành Xe</span>
              <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '9.5px', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                OPERATOR
              </span>
            </Link>
          )}

          {/* CHỈ hiển thị Quản Trị Sàn khi tài khoản hiện tại ĐÃ ĐĂNG NHẬP và có vai trò ADMIN */}
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin/dashboard" 
              style={{ 
                textDecoration: 'none', 
                color: '#1e3a8a', 
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={16} color="#2563eb" /> Quản Trị Sàn (ADMIN)
            </Link>
          )}
        </div>
      </div>

      {/* Partner Registration & Info Modal */}
      {showPartnerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowPartnerModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPartnerModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#f0fdfa', padding: '8px', borderRadius: '10px', color: '#0d9488' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Hợp Tác Mở Bán Vé Cùng TravelEasy
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Dành cho các doanh nghiệp vận tải, nhà xe khách liên tỉnh
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              TravelEasy là nền tảng kết nối hành khách và hơn 50+ nhà xe uy tín trên toàn quốc. Đăng ký tham gia hệ thống để mở rộng thị trường và tối ưu hiệu suất lấp đầy ghế:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <CheckCircle size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tăng trưởng doanh thu 30 - 50%</strong>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Tiếp cận mạng lưới hơn 500.000 khách du lịch và hành khách đặt vé trực tuyến mỗi tháng.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <CheckCircle size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Phần mềm điều phối thông minh</strong>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Cung cấp phần mềm quản lý đội xe, chuyến xe, giá vé, bến đón trả và sơ đồ ghế thời gian thực.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <CheckCircle size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Đối soát tự động & Thanh toán tức thì</strong>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Tích hợp sẵn VNPAY, VietQR Napas 24/7, báo cáo doanh thu minh bạch và chu kỳ quyết toán nhanh.</div>
                </div>
              </div>
            </div>

            {/* Contact Box */}
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e', marginBottom: '6px' }}>LIÊN HỆ BỘ PHẬN PHÁT TRIỂN ĐỐI TÁC:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#134e4a', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PhoneCall size={14} color="#0d9488" /> <strong>Hotline:</strong> 1900 6868 (Nhánh 2)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#0d9488" /> <strong>Email:</strong> doitac@traveleasy.vn
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPartnerModal(false);
                  navigate('/company/login');
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f766e',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Đã là đối tác? Đăng nhập cổng nhà xe
              </button>

              <button
                type="button"
                onClick={() => setShowPartnerModal(false)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
