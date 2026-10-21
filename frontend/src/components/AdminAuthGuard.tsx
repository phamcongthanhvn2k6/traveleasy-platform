import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { AuthUser } from '../types';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * =========================================================================
 * ROUTE GUARD BẢO VỆ PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN AUTH GUARD)
 * - Kiểm tra JWT Token & vai trò người dùng trong LocalStorage
 * - Nếu chưa đăng nhập: Chuyển hướng tới /admin/login
 * - Nếu đã đăng nhập nhưng vai trò KHÔNG PHẢI ADMIN (ví dụ: CUSTOMER, OPERATOR):
 *   Hiển thị màn hình 403 Forbidden - Nghiêm cấm truy cập trái phép
 * - Nếu là ADMIN: Cấp toàn quyền truy cập phân hệ /admin/*
 * =========================================================================
 */
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('traveleasy_token');
  const userJson = localStorage.getItem('traveleasy_user');

  // 1. Trường hợp chưa đăng nhập -> Chuyển về cổng đăng nhập Admin
  if (!token || !userJson) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  let user: AuthUser | null = null;
  try {
    user = JSON.parse(userJson);
  } catch (e) {
    // Dữ liệu rác hoặc giả mạo -> Xóa và yêu cầu đăng nhập lại
    localStorage.removeItem('traveleasy_token');
    localStorage.removeItem('traveleasy_user');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 2. Trường hợp đã đăng nhập nhưng role KHÔNG PHẢI ADMIN -> Chặn 403 Forbidden
  if (user.role !== 'ADMIN') {
    const handleSwitchToAdmin = () => {
      localStorage.removeItem('traveleasy_token');
      localStorage.removeItem('traveleasy_user');
      navigate('/admin/login', { replace: true });
    };

    const handleBackToClient = () => {
      navigate('/', { replace: true });
    };

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1d',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          color: '#ffffff'
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#111827',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.15)'
          }}
        >
          {/* 403 Warning Icon */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              marginBottom: '20px'
            }}
          >
            <ShieldAlert size={40} />
          </div>

          <div
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '3px 10px',
              borderRadius: '999px',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}
          >
            HTTP 403 • ACCESS FORBIDDEN
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 10px'
            }}
          >
            Từ Chối Quyền Truy Cập Quản Trị
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#9ca3af',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}
          >
            Tài khoản hiện tại của bạn là <strong style={{ color: '#f3f4f6' }}>{user.fullName || 'Người dùng'}</strong> ({user.email}) với vai trò <span style={{ color: '#f59e0b', fontWeight: 700 }}>[{user.role}]</span>. 
            Phân hệ Quản trị tối cao <code style={{ backgroundColor: '#1f2937', padding: '2px 6px', borderRadius: '4px', color: '#60a5fa' }}>/admin</code> chỉ dành riêng cho tài khoản có quyền <strong style={{ color: '#38bdf8' }}>ADMIN</strong>.
          </p>

          {/* Details Box */}
          <div
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '10px',
              padding: '14px 18px',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#d1d5db',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              border: '1px solid #374151'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Họ và tên:</span>
              <strong>{user.fullName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Vai trò hiện tại:</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{user.role} (Không đủ quyền)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Đường dẫn yêu cầu:</span>
              <span style={{ color: '#93c5fd' }}>{location.pathname}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleSwitchToAdmin}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
              }}
            >
              <LogOut size={16} /> Đăng nhập bằng tài khoản Quản trị viên khác
            </button>

            <button
              onClick={handleBackToClient}
              style={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                color: '#9ca3af',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.borderColor = '#374151';
              }}
            >
              <ArrowLeft size={16} /> Quay lại trang chủ TravelEasy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Đúng vai trò ADMIN -> Cho phép truy cập đầy đủ
  return <>{children}</>;
};

export default AdminAuthGuard;

