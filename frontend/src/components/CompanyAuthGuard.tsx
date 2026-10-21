import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Building2, Zap } from 'lucide-react';
import { AuthUser } from '../types';
import api from '../services/api';
import { toast } from '../context/ToastContext';

interface CompanyAuthGuardProps {
  children: React.ReactNode;
}

/**
 * =========================================================================
 * ROUTE GUARD BẢO VỆ PHÂN HỆ ĐỐI TÁC NHÀ XE (COMPANY AUTH GUARD)
 * - Kiểm tra JWT Token & vai trò người dùng trong LocalStorage
 * - Nếu chưa đăng nhập: Chuyển hướng tới /company/login
 * - Nếu đã đăng nhập nhưng vai trò là CUSTOMER (không phải OPERATOR hoặc ADMIN):
 *   Hiển thị màn hình 403 Forbidden kèm nút chuyển tài khoản hoặc Đăng nhập Nhanh Demo
 * - Nếu là OPERATOR hoặc ADMIN: Cấp toàn quyền truy cập phân hệ /company/*
 * =========================================================================
 */
export const CompanyAuthGuard: React.FC<CompanyAuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Không redirect nếu đang ở trang login
  if (location.pathname.includes('/login')) {
    return <>{children}</>;
  }

  const token = localStorage.getItem('traveleasy_token');
  const userJson = localStorage.getItem('traveleasy_user');

  // 1. Chưa đăng nhập -> Chuyển về cổng đăng nhập đối tác
  if (!token || !userJson) {
    return <Navigate to="/company/login" state={{ from: location }} replace />;
  }

  let user: AuthUser | null = null;
  try {
    user = JSON.parse(userJson);
  } catch (e) {
    localStorage.removeItem('traveleasy_token');
    localStorage.removeItem('traveleasy_user');
    return <Navigate to="/company/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/company/login" state={{ from: location }} replace />;
  }

  // 2. Nếu vai trò không phải OPERATOR hoặc ADMIN -> Chặn 403 Forbidden
  if (user.role !== 'OPERATOR' && user.role !== 'ADMIN') {
    const handleSwitchAccount = () => {
      localStorage.removeItem('traveleasy_token');
      localStorage.removeItem('traveleasy_user');
      navigate('/company/login', { replace: true });
    };

    const handleQuickLoginPartner = async () => {
      try {
        const res = await api.post('/auth/login', {
          identifier: 'partner@traveleasy.vn',
          password: 'Rikkei@123',
        });
        const data = res.data?.data;
        if (data?.token) {
          localStorage.setItem('traveleasy_token', data.token);
          localStorage.setItem('traveleasy_user', JSON.stringify(data));
          toast.success(`Đăng nhập thành công với vai trò ${data.role} (${data.fullName})!`, 'Xác Thực Đối Tác');
          window.location.reload();
        }
      } catch (e) {
        toast.error('Lỗi khi đăng nhập tài khoản đối tác', 'Thất Bại');
      }
    };

    const handleBackHome = () => {
      navigate('/', { replace: true });
    };

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#042f2e',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(13, 148, 136, 0.15) 0%, transparent 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          color: '#ffffff',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(13, 148, 136, 0.4)',
            borderRadius: '16px',
            padding: '36px 30px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(13, 148, 136, 0.2)',
          }}
        >
          {/* Warning Icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(13, 148, 136, 0.15)',
              border: '2px solid rgba(13, 148, 136, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#14b8a6',
              marginBottom: '20px',
            }}
          >
            <Building2 size={36} />
          </div>

          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              marginBottom: '12px',
            }}
          >
            403 FORBIDDEN — YÊU CẦU QUYỀN ĐỐI TÁC NHÀ XE
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
            Không Có Quyền Truy Cập
          </h2>

          <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Bạn đang đăng nhập bằng tài khoản Khách Hàng (<strong>{user.email}</strong>). Cổng thông tin này dành riêng cho các nhà xe đối tác (<strong>OPERATOR</strong>) và Quản trị viên sàn.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleBackHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Quay Lại Trang Chủ Đặt Vé
            </button>

            <button
              onClick={handleSwitchAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '11px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Đăng Xuất Tài Khoản Khách Hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cấp quyền truy cập nếu là OPERATOR hoặc ADMIN
  return <>{children}</>;
};

export default CompanyAuthGuard;
