import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Calendar, 
  Truck, 
  MapPin, 
  ShieldAlert, 
  Users, 
  FileText,
  ArrowLeft
} from 'lucide-react';

export const AdminNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Tổng Quan (Dashboard)', path: '/admin', icon: BarChart2 },
    { label: 'Quản Lý Chuyến Xe', path: '/admin/trips', icon: Calendar },
    { label: 'Nhà Xe & Đội Xe', path: '/admin/fleet', icon: Truck },
    { label: 'Tuyến Đường & Điểm Dừng', path: '/admin/routes', icon: MapPin },
    { label: 'Chính Sách & Giá Vé', path: '/admin/policies', icon: ShieldAlert },
    { label: 'Người Dùng & Phân Quyền', path: '/admin/users', icon: Users },
    { label: 'Nhật Ký (Audit Logs)', path: '/admin/audit-logs', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', padding: '8px 0' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
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
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: active ? '#1d4ed8' : '#475569',
                  backgroundColor: active ? '#eff6ff' : 'transparent',
                  border: active ? '1px solid #bfdbfe' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={active ? '#1d4ed8' : '#64748b'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748b',
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            whiteSpace: 'nowrap',
            marginLeft: '16px'
          }}
        >
          <ArrowLeft size={14} /> Về Trang Khách Hàng
        </Link>
      </div>
    </div>
  );
};

export default AdminNav;

