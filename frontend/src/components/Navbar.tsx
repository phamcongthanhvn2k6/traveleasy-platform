import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Search, ShieldCheck, PhoneCall, User, Info, Building2, LayoutDashboard, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

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
            <Link to="/lookup" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.9 }}>
              Đơn hàng của tôi
            </Link>
            <Link to="/company" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>
              Mở bán vé trên TravelEasy
            </Link>
            <Link to="/company" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>
              Trở thành đối tác
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
            <button 
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
                gap: '5px'
              }}
            >
              <User size={13} /> Đăng nhập
            </button>
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
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/' ? '#2563eb' : '#334155', 
                fontWeight: location.pathname === '/' ? 700 : 600, 
                fontSize: '14.5px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderBottom: location.pathname === '/' ? '2px solid #2563eb' : '2px solid transparent',
                padding: '8px 0'
              }}
            >
              <Search size={16} /> Vé Xe Khách
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

        {/* Portal Switching Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link 
            to="/company/dashboard" 
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
            <Building2 size={16} color="#0d9488" /> Cổng Nhà Xe
          </Link>

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
            <LayoutDashboard size={16} color="#2563eb" /> Quản Trị Sàn
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
