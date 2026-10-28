import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../../../services/api';
import { AuthUser } from '../../../types';
import { toast } from '../../../context/ToastContext';

export const CompanyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdminAttempt, setIsAdminAttempt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsAdminAttempt(false);

    if (!identifier.trim()) {
      const msg = 'Vui lòng nhập Email hoặc SĐT đối tác nhà xe.';
      toast.warning(msg, 'Thiếu Thông Tin');
      setErrorMsg(msg);
      return;
    }
    if (!password) {
      const msg = 'Vui lòng nhập mật khẩu tài khoản.';
      toast.warning(msg, 'Thiếu Mật Khẩu');
      setErrorMsg(msg);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password: password,
      });

      const data: AuthUser = response.data?.data;

      // PHÂN QUYỀN NGHIÊM NGẶT: CỔNG NÀY CHỈ DÀNH RIÊNG CHO ĐỐI TÁC NHÀ XE (OPERATOR)
      if (!data || data.role !== 'OPERATOR') {
        localStorage.removeItem('traveleasy_token');
        localStorage.removeItem('traveleasy_user');

        if (data?.role === 'ADMIN') {
          setIsAdminAttempt(true);
          const errText = `Từ chối truy cập! Tài khoản "${identifier.trim()}" là Quản trị viên hệ thống (ADMIN). Cổng này chỉ dành riêng cho Đối tác điều hành nhà xe (OPERATOR). Quản trị viên sàn vui lòng đăng nhập tại Cổng Quản Trị Hệ Thống.`;
          toast.error('Tài khoản Quản trị viên (ADMIN) không được phép truy cập cổng Nhà xe!', 'Sai Cổng Đăng Nhập');
          setErrorMsg(errText);
        } else {
          setIsAdminAttempt(false);
          const errText = `Từ chối truy cập! Tài khoản "${identifier.trim()}" mang vai trò ${data?.role || 'CUSTOMER'}. Cổng này chỉ dành riêng cho Đối tác điều hành nhà xe (OPERATOR).`;
          toast.error(errText, 'Truy Cập Bị Từ Chối');
          setErrorMsg(errText);
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('traveleasy_token', data.token);
      localStorage.setItem('traveleasy_user', JSON.stringify(data));

      toast.success(`Đăng nhập thành công! Chào mừng ${data.fullName}.`, 'Đối Tác Nhà Xe');

      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/company/dashboard';
      setTimeout(() => {
        navigate(fromPath, { replace: true });
      }, 500);
    } catch (err: any) {
      console.error('Company Login failed:', err);
      const serverMsg = err.response?.data?.message || 'Tài khoản hoặc mật khẩu nhà xe không chính xác.';
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
        backgroundColor: '#042f2e',
        backgroundImage: 'radial-gradient(circle at 50% 25%, rgba(13, 148, 136, 0.25) 0%, #021a19 75%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(13, 148, 136, 0.4)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 35px rgba(13, 148, 136, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)',
            }}
          >
            <Building2 size={30} />
          </div>

          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(13, 148, 136, 0.2)',
              color: '#2dd4bf',
              border: '1px solid rgba(13, 148, 136, 0.4)',
              borderRadius: '9999px',
              padding: '3px 12px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              marginBottom: '8px',
            }}
          >
            TRAVELEASY BUS OPERATOR PORTAL
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            Đăng Nhập Đối Tác Nhà Xe
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Hệ thống điều hành đội xe, bán vé tại quầy và quản lý tuyến đường
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '14px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            <div>{errorMsg}</div>
            {isAdminAttempt && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(239, 68, 68, 0.35)' }}>
                <Link
                  to="/admin/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#38bdf8',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '12.5px',
                  }}
                >
                  🛡️ Đi đến Cổng Quản Trị Hệ Thống (Admin Portal) ngay →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Demo Accounts Selection */}
        <div style={{ marginBottom: '20px', padding: '12px 14px', backgroundColor: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.25)', borderRadius: '10px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2dd4bf', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <KeyRound size={13} /> Tài khoản đối tác nhà xe mẫu (Mật khẩu: Rikkei@123)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { label: 'Sao Việt Express', email: 'dieuhanh@xesaoviet.com.vn' },
              { label: 'TravelEasy Express', email: 'partner@traveleasy.vn' },
              { label: 'Thành Bưởi', email: 'dieuhanh@thanhbuoi.com.vn' },
              { label: 'Phương Trang FUTA', email: 'dieuhanh@futabus.vn' },
              { label: 'Hải Vân Express', email: 'dieuhanh@haivan.com' },
              { label: 'Hoa Mai Vũng Tàu', email: 'dieuhanh@hoamaivungtau.com.vn' },
              { label: 'Hà Lan Limousine', email: 'dieuhanh@halan.com.vn' },
              { label: 'Liên Hưng Nha Trang', email: 'dieuhanh@xekhachlienhung.com' },
            ].map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIdentifier(acc.email);
                  setPassword('Rikkei@123');
                }}
                style={{
                  background: identifier === acc.email ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: identifier === acc.email ? '#2dd4bf' : '#e2e8f0',
                  border: identifier === acc.email ? '1px solid #2dd4bf' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '4px 8px',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Email hoặc Số Điện Thoại Điều Hành *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại điều hành..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '12px 14px 12px 40px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Mật Khẩu *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu tài khoản..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '12px 42px 12px 40px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '13px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP VÀO CỔNG NHÀ XE →'}
          </button>
        </form>

        {/* Back Link & Switch Portal Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/"
            style={{
              color: '#94a3b8',
              fontSize: '12.5px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} /> Quay lại Trang Chủ Đặt Vé
          </Link>

          <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Bạn là Quản trị viên Sàn tổng? </span>
            <Link
              to="/admin/login"
              style={{
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Đăng nhập Quản Trị Hệ Thống (Admin) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLoginPage;
