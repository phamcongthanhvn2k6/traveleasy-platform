import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Search, ShieldCheck, PhoneCall, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#2563eb', padding: '8px', borderRadius: '8px', color: '#fff', display: 'flex' }}>
            <Bus size={26} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.5px' }}>TravelEasy</span>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>NỀN TẢNG BÁN VÉ XE KHÁCH</span>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/' ? '#2563eb' : '#475569', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            <Search size={18} /> Tìm Chuyến
          </Link>
          <Link 
            to="/lookup" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/lookup' ? '#2563eb' : '#475569', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            <ShieldCheck size={18} /> Tra Cứu Vé
          </Link>
          <Link 
            to="/admin" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/admin' ? '#2563eb' : '#475569', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#eff6ff'
            }}
          >
            Quản Trị Nhà Xe
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 700, fontSize: '14px' }}>
            <PhoneCall size={18} /> Hotline: 1900 6868
          </div>
          <button style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}>
            <User size={16} /> Đăng Nhập
          </button>
        </div>
      </div>
    </header>
  );
};
