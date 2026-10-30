import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  KeyRound,
  Server
} from 'lucide-react';
import api from '../../../services/api';
import { AuthUser } from '../../../types';
import { toast } from '../../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isOperatorAttempt, setIsOperatorAttempt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsOperatorAttempt(false);

    if (!identifier.trim()) {
      const msg = 'Vui lòng nhập Email hoặc Tài khoản quản trị.';
      toast.warning(msg, 'Thiếu Thông Tin');
      setErrorMsg(msg);
      return;
    }
    if (!password) {
      const msg = 'Vui lòng nhập mật khẩu quản trị.';
      toast.warning(msg, 'Thiếu Mật Khẩu');
      setErrorMsg(msg);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password: password
      });

      const data: AuthUser = response.data?.data;

      // KIỂM TRA QUYỀN QUẢN TRỊ VIÊN (ADMIN) NGHIÊM NGẶT
      if (!data || data.role !== 'ADMIN') {
        // Hủy lưu thông tin và thông báo vi phạm phân quyền
        localStorage.removeItem('traveleasy_token');
        localStorage.removeItem('traveleasy_user');

        if (data?.role === 'OPERATOR') {
          setIsOperatorAttempt(true);
          const errText = `Từ chối quyền truy cập! Tài khoản "${identifier.trim()}" là Đối tác điều hành nhà xe (OPERATOR). Cổng này chỉ dành riêng cho Quản trị viên sàn (ADMIN). Vui lòng đăng nhập tại Cổng Đối Tác Nhà Xe.`;
          toast.error('Tài khoản Nhà xe (OPERATOR) không được phép truy cập cổng Quản trị sàn!', 'Sai Cổng Đăng Nhập');
          setErrorMsg(errText);
        } else {
          setIsOperatorAttempt(false);
          const errText = `Từ chối quyền truy cập! Tài khoản "${identifier.trim()}" mang vai trò ${data?.role || 'CUSTOMER'}. Cổng Quản trị viên chỉ cho phép tài khoản có vai trò ADMIN.`;
          toast.error(errText, 'Truy Cập Bị Từ Chối');
          setErrorMsg(errText);
        }
        setLoading(false);
        return;
      }

      // Lưu trữ phiên đăng nhập Admin
      localStorage.setItem('traveleasy_token', data.token);
      localStorage.setItem('traveleasy_user', JSON.stringify(data));

      toast.success(`Xác thực thành công! Xin chào Quản trị viên ${data.fullName}.`, 'Đăng Nhập Thành Công');
      setSuccessMsg(`Xác thực thành công! Xin chào Quản trị viên ${data.fullName}. Đang chuyển hướng...`);

      // Chuyển hướng tới trang Admin Dashboard hoặc trang trước đó
      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';
      setTimeout(() => {
        navigate(fromPath, { replace: true });
      }, 700);

    } catch (err: any) {
      console.error('Admin Login failed:', err);
      const serverMsg = err.response?.data?.message || 'Tài khoản hoặc mật khẩu quản trị không chính xác.';
      toast.error(serverMsg, 'Xác Thực Thất Bại');
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070d1e',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.12) 0px, transparent 50%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        color: '#f8fafc'
      }}
    >
      {/* Top Breadcrumb / Return Home */}
      <div style={{ width: '100%', maxWidth: '460px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '13px',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <ArrowLeft size={16} /> Quay lại trang chủ TravelEasy
        </Link>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            letterSpacing: '0.5px'
          }}
        >
          INTERNAL PORTAL
        </span>
      </div>

      {/* Main Admin Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header with Glowing Gradient & Security Shield */}
        <div
          style={{
            padding: '32px 32px 24px',
            borderBottom: '1px solid #1e293b',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0) 100%)',
            textAlign: 'center'
          }}
        >
          {/* Brand & Security Icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
              marginBottom: '16px',
              position: 'relative'
            }}
          >
            <ShieldCheck size={32} />
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <KeyRound size={10} color="#ffffff" />
            </div>
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 6px',
              letterSpacing: '-0.3px'
            }}
          >
            Cổng Quản Trị Hệ Thống
          </h1>
          <div
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: 1.5,
              maxWidth: '360px',
              margin: '0 auto'
            }}
          >
            Khu vực giới hạn dành riêng cho Ban Điều Hành và Quản trị viên <strong style={{ color: '#e2e8f0' }}>TravelEasy</strong>.
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          {/* Error Message Alert */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                color: '#fca5a5',
                fontSize: '13px',
                lineHeight: 1.45
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#6ee7b7',
                fontSize: '13px'
              }}
            >
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Quick Demo Admin Accounts */}
          <div style={{ marginBottom: '20px', padding: '12px 14px', backgroundColor: 'rgba(79, 70, 229, 0.12)', border: '1px solid rgba(79, 70, 229, 0.3)', borderRadius: '10px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <KeyRound size={13} /> Tài khoản Quản trị viên mẫu (Mật khẩu demo: 123456789@)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { label: 'Admin Hệ Thống', email: 'admin@traveleasy.vn' },
                { label: 'Admin Đại Phát', email: 'daiphat.admin@traveleasy.vn' },
                { label: 'Admin Thanh Phong', email: 'phanthanhphong.admin@traveleasy.vn' },
              ].map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIdentifier(acc.email);
                    setPassword('123456789@');
                  }}
                  style={{
                    background: identifier === acc.email ? 'rgba(79, 70, 229, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                    color: identifier === acc.email ? '#a5b4fc' : '#e2e8f0',
                    border: identifier === acc.email ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Input Email / Identifier */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '8px'
                }}
              >
                Email Quản Trị Viên <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex'
                  }}
                >
                  <Mail size={17} />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập email quản trị viên..."
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '11px 14px 11px 42px',
                    fontSize: '14px',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                />
              </div>
            </div>

            {/* Input Password */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '8px'
                }}
              >
                Mật Khẩu Xác Thực <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex'
                  }}
                >
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '11px 42px 11px 42px',
                    fontSize: '14px',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security Policy */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                fontSize: '13px'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94a3b8' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
                />
                Duy trì phiên đăng nhập
              </label>

              <span style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Server size={13} /> SSL 256-Bit
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: loading
                  ? '#334155'
                  : 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? (
                <>Đang xác thực thông tin...</>
              ) : (
                <>
                  ĐĂNG NHẬP HỆ THỐNG <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Card Footer: Security Notice */}
        <div
          style={{
            backgroundColor: '#0a101f',
            padding: '14px 24px',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#64748b',
            textAlign: 'center'
          }}
        >
          <Lock size={13} color="#10b981" />
          <span>Hệ thống ghi nhận địa chỉ IP &amp; Nhật ký kiểm toán thời gian thực</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

