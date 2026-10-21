import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, Search, ShieldCheck, PhoneCall, User, Info, Building2, LayoutDashboard, Globe, LogOut, Ticket, X, CheckCircle, Mail } from 'lucide-react';
import { AuthUser } from '../types';
import { toast } from '../context/ToastContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <header style={{ backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {/* Top Announcement & Quick Links Bar (Chuẩn Vexere Prototype Screenshot 1) */}
      <div style={{ backgroundColor: '#1d4ed8', color: '#ffffff', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: '#fbbf24', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>MỚI</span>
            <span style={{ fontSize: '12.5px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ vận chuyển (*)
              <Info size={14} style={{ opacity: 0.8, cursor: 'pointer' }} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
            <Link to="/my-tickets" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.9 }}>
              Vé của tôi
            </Link>
            <button
              type="button"
              onClick={() => {
                if (user?.role === 'OPERATOR') {
                  navigate('/company/dashboard');
                } else {
                  setShowPartnerModal(true);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                opacity: 0.9,
                cursor: 'pointer',
                fontSize: '13px',
                padding: 0
              }}
            >
              Mở bán vé trên TravelEasy
            </button>
            <button
              type="button"
              onClick={() => {
                if (user?.role === 'OPERATOR') {
                  navigate('/company/dashboard');
                } else {
                  setShowPartnerModal(true);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                opacity: 0.9,
                cursor: 'pointer',
                fontSize: '13px',
                padding: 0
              }}
            >
              Trở thành đối tác
            </button>
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
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px' }}>TravelEasy</span>
                <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>.vn</span>
              </div>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.2px' }}>
                NỀN TẢNG KẾT NỐI HÀNH KHÁCH VÀ NHÀ XE
              </span>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link 
              to="/search" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/search' || location.pathname === '/' ? '#2563eb' : '#334155', 
                fontWeight: location.pathname === '/search' || location.pathname === '/' ? 700 : 600, 
                fontSize: '14.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderBottom: location.pathname === '/search' || location.pathname === '/' ? '2px solid #2563eb' : '2px solid transparent',
                padding: '8px 0'
              }}
            >
              <Search size={16} /> Vé Xe Khách
            </Link>
            <Link 
              to="/my-tickets" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/my-tickets' ? '#2563eb' : '#334155', 
                fontWeight: location.pathname === '/my-tickets' ? 700 : 600, 
                fontSize: '14.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderBottom: location.pathname === '/my-tickets' ? '2px solid #2563eb' : '2px solid transparent',
                padding: '8px 0'
              }}
            >
              <Ticket size={16} /> Vé Của Tôi
            </Link>
            <Link 
              to="/lookup" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/lookup' ? '#2563eb' : '#334155', 
                fontWeight: location.pathname === '/lookup' ? 700 : 600, 
                fontSize: '14.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderBottom: location.pathname === '/lookup' ? '2px solid #2563eb' : '2px solid transparent',
                padding: '8px 0'
              }}
            >
              <ShieldCheck size={16} /> Tra Cứu Vé
            </Link>
          </nav>
        </div>

        {/* Right Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
