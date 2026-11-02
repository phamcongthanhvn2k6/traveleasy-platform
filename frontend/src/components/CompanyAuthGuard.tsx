import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Building2, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types';
import { isTokenExpired } from '../services/api';

interface CompanyAuthGuardProps {
  children: React.ReactNode;
}

/**
 * =========================================================================
 * ROUTE GUARD BẢO VỆ PHÂN HỆ ĐỐI TÁC NHÀ XE (COMPANY AUTH GUARD)
 * - Kiểm tra JWT Token & vai trò người dùng trong LocalStorage
 * - Nếu chưa đăng nhập: Chuyển hướng tới /company/login
 * - Nếu là ADMIN: Chặn 403 Forbidden, hướng dẫn chuyển sang Cổng Quản Trị Hệ Thống (/admin/dashboard)
 * - Nếu là CUSTOMER: Chặn 403 Forbidden
 * - CHỈ DUY NHẤT vai trò OPERATOR mới được truy cập phân hệ /company/*
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

  // 1. Chưa đăng nhập hoặc token đã hết hạn -> Chuyển về cổng đăng nhập đối tác
  if (!token || !userJson || isTokenExpired(token)) {
    if (token) {
      localStorage.removeItem('traveleasy_token');
      localStorage.removeItem('traveleasy_user');
    }
    return <Navigate to="/company/login" state={{ from: location, reason: token ? 'expired' : undefined }} replace />;
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

  // 2. PHÂN QUYỀN NGHIÊM NGẶT: Phân hệ /company/* CHỈ dành riêng cho vai trò OPERATOR
  if (user.role !== 'OPERATOR') {
    const handleSwitchAccount = () => {
      localStorage.removeItem('traveleasy_token');
      localStorage.removeItem('traveleasy_user');
      navigate('/company/login', { replace: true });
    };

    const handleBackHome = () => {
      navigate('/', { replace: true });
    };

    const handleGoAdminDashboard = () => {
      navigate('/admin/dashboard', { replace: true });
    };

    const isAdmin = user.role === 'ADMIN';

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
            border: isAdmin ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(13, 148, 136, 0.4)',
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
              backgroundColor: isAdmin ? 'rgba(59, 130, 246, 0.15)' : 'rgba(13, 148, 136, 0.15)',
              border: isAdmin ? '2px solid rgba(59, 130, 246, 0.4)' : '2px solid rgba(13, 148, 136, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isAdmin ? '#60a5fa' : '#14b8a6',
              marginBottom: '20px',
            }}
          >
            {isAdmin ? <ShieldAlert size={36} /> : <Building2 size={36} />}
          </div>

          <div
            style={{
              display: 'inline-block',
              backgroundColor: isAdmin ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isAdmin ? '#93c5fd' : '#f87171',
              border: isAdmin ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              marginBottom: '12px',
            }}
          >
            {isAdmin ? '403 FORBIDDEN — PHÂN BIỆT VAI TRÒ HỆ THỐNG' : '403 FORBIDDEN — YÊU CẦU QUYỀN ĐỐI TÁC NHÀ XE'}
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
            {isAdmin ? 'Tài Khoản Quản Trị Viên (ADMIN)' : 'Không Có Quyền Truy Cập'}
          </h2>

          <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            {isAdmin ? (
              <>
                Tài khoản <strong style={{ color: '#f8fafc' }}>{user.email}</strong> ({user.fullName || 'Quản trị viên'}) mang vai trò 
                <span style={{ color: '#38bdf8', fontWeight: 700 }}> [ADMIN]</span>. Phân hệ <code style={{ backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#2dd4bf' }}>/company/*</code> chỉ dành riêng cho Đối Tác Điều Hành Nhà Xe (<span style={{ color: '#2dd4bf', fontWeight: 700 }}>OPERATOR</span>). Hai vai trò này hoàn toàn độc lập và không dùng chung phân hệ.
              </>
            ) : (
              <>
                Bạn đang đăng nhập bằng tài khoản Khách Hàng (<strong>{user.email}</strong>). Cổng thông tin này dành riêng cho các nhà xe đối tác (<strong>OPERATOR</strong>).
              </>
            )}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isAdmin && (
              <button
                onClick={handleGoAdminDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                }}
              >
                <ShieldCheck size={16} /> Đến Cổng Quản Trị Hệ Thống (/admin/dashboard)
              </button>
            )}

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
              <LogOut size={16} /> Đăng Xuất Để Đăng Nhập Tài Khoản Nhà Xe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cấp quyền truy cập DUY NHẤT nếu là OPERATOR
  return <>{children}</>;
};

export default CompanyAuthGuard;
