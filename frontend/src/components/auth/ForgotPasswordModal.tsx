import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { toast } from '../../context/ToastContext';
import { loginWithGoogle } from '../../services/firebaseAuthService';
import { isFirebaseConfigured } from '../../services/firebase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  initialIdentifier?: string;
  onClose: () => void;
  onResetSuccess: (email: string) => void;
}

type RecoveryStep = 'email' | 'otp' | 'reset';

interface ConfirmedAccountInfo {
  maskedEmail: string;
  maskedFullName: string;
  roleLabel: string;
}

const OTP_LENGTH = 6;

const formatCountdown = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const normalizePhoneDigits = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }
  return digits;
};

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  initialIdentifier = '',
  onClose,
  onResetSuccess,
}) => {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmedAccount, setConfirmedAccount] = useState<ConfirmedAccountInfo | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleGoogleLoginFromModal = async () => {
    if (!isFirebaseConfigured) {
      toast.warning('Chức năng đăng nhập Google chưa được cấu hình.', 'Firebase');
      return;
    }
    setGoogleLoading(true);
    try {
      const authData = await loginWithGoogle();
      localStorage.setItem('traveleasy_token', authData.token);
      localStorage.setItem('traveleasy_user', JSON.stringify(authData));
      toast.success(`Đăng nhập Google thành công! Chào mừng ${authData.fullName || authData.email}.`, 'Thành Công');
      onClose();
      const redirectUrl = authData.role === 'ADMIN' ? '/admin/dashboard' : authData.role === 'OPERATOR' ? '/company/dashboard' : '/';
      window.location.href = redirectUrl;
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        const msg = err?.message || 'Đăng nhập Google không thành công';
        toast.error(msg, 'Lỗi Google');
        setErrorMsg(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Khởi tạo lại trạng thái sạch mỗi khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    const raw = initialIdentifier.trim();
    const isEmail = raw.includes('@');
    const isPhone = !isEmail && /^\+?\d[\d\s.-]{7,16}$/.test(raw);

    setStep('email');
    setEmail(isEmail ? raw : '');
    setPhone(isPhone ? raw : '');
    setConfirmedAccount(null);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setOtpExpiresIn(0);
    setResendCooldown(0);
    setSubmitting(false);
    setResending(false);
    setErrorMsg(null);
  }, [isOpen, initialIdentifier]);

  // Đếm ngược hiệu lực OTP và cooldown gửi lại
  useEffect(() => {
    if (!isOpen || step !== 'otp') return;
    if (otpExpiresIn <= 0 && resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOpen, step, otpExpiresIn, resendCooldown]);

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

  const passwordChecks = useMemo(() => {
    const pwd = newPassword || '';
    return [
      { id: 'min', label: 'Tối thiểu 6 ký tự (bắt buộc)', met: pwd.length >= 6 },
      { id: 'case', label: 'Nên gồm chữ hoa & chữ thường', met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) },
      { id: 'num', label: 'Nên gồm ít nhất 1 chữ số (0-9)', met: /\d/.test(pwd) },
    ];
  }, [newPassword]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e?: React.FormEvent, isResendRequest = false) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const phoneDigits = normalizePhoneDigits(cleanPhone);

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = 'Vui lòng nhập đúng định dạng địa chỉ email đã đăng ký.';
      setErrorMsg(msg);
      toast.warning(msg, 'Email Không Hợp Lệ');
      return;
    }

    if (!cleanPhone || phoneDigits.length < 9 || phoneDigits.length > 15) {
      const msg = 'Vui lòng nhập đúng số điện thoại đã đăng ký để đối chiếu chính xác tài khoản.';
      setErrorMsg(msg);
      toast.warning(msg, 'Số Điện Thoại Không Hợp Lệ');
      return;
    }

    setErrorMsg(null);
    if (isResendRequest) {
      setResending(true);
    } else {
      setSubmitting(true);
    }

    try {
      const res = await api.post('/auth/forgot-password', {
        email: cleanEmail,
        phone: cleanPhone,
      });
      const data = res.data?.data;
      setConfirmedAccount({
        maskedEmail: data?.maskedEmail || cleanEmail,
        maskedFullName: data?.maskedFullName || 'Thành viên TravelEasy',
        roleLabel: data?.roleLabel || 'Thành viên',
      });
      setOtpExpiresIn(data?.expiresInSeconds ?? 300);
      setResendCooldown(data?.resendCooldownSeconds ?? 60);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');

      toast.success(
        res.data?.message || `Đã gửi mã OTP tới ${data?.maskedEmail || cleanEmail}.`,
        'Đã Gửi Mã OTP'
      );

      window.setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 60);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Không thể gửi mã OTP. Vui lòng kiểm tra lại đúng cặp Email và Số điện thoại đã đăng ký.';
      setErrorMsg(msg);
      toast.error(msg, 'Xác Minh Tài Khoản Thất Bại');
    } finally {
      setSubmitting(false);
      setResending(false);
    }
  };

  const handleOtpDigitChange = (index: number, rawValue: string) => {
    const cleaned = rawValue.replace(/\D/g, '');
    setErrorMsg(null);

    if (!cleaned) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, OTP_LENGTH).split('');
      setOtpDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < OTP_LENGTH; i++) {
          if (index + i < OTP_LENGTH && chars[i] !== undefined) {
            next[index + i] = chars[i];
          }
        }
        return next;
      });
      const focusIdx = Math.min(index + chars.length, OTP_LENGTH - 1);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    setErrorMsg(null);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== OTP_LENGTH) {
      const msg = 'Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.';
      setErrorMsg(msg);
      toast.warning(msg, 'Thiếu Mã OTP');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: otpValue,
      });
      const token = res.data?.data?.resetToken;
      if (!token) {
        throw new Error('Không nhận được phiên xác thực đặt lại mật khẩu.');
      }
      setResetToken(token);
      setStep('reset');
      toast.success('Xác minh mã OTP thành công. Hãy thiết lập mật khẩu mới.', 'Xác Minh Thành Công');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.';
      setErrorMsg(msg);
      toast.error(msg, 'Xác Minh Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      const msg = 'Mật khẩu mới phải có tối thiểu 6 ký tự.';
      setErrorMsg(msg);
      toast.warning(msg, 'Mật Khẩu Quá Ngắn');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp với mật khẩu mới.';
      setErrorMsg(msg);
      toast.warning(msg, 'Mật Khẩu Không Khớp');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        resetToken,
        newPassword,
      });
      toast.success(
        res.data?.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
        'Khôi Phục Thành Công'
      );
      onResetSuccess(email.trim());
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Không thể đặt lại mật khẩu. Phiên xác thực có thể đã hết hạn.';
      setErrorMsg(msg);
      toast.error(msg, 'Đặt Lại Mật Khẩu Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = step === 'email' ? 1 : step === 'otp' ? 2 : 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '470px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3
                id="forgot-password-modal-title"
                style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}
              >
                Khôi phục mật khẩu
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Đối chiếu chính chủ & xác minh mã OTP Email
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Đóng cửa sổ"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {[
            { num: 1, label: 'Đối chiếu tài khoản' },
            { num: 2, label: 'Xác minh OTP' },
            { num: 3, label: 'Mật khẩu mới' },
          ].map((item) => {
            const active = stepIndex === item.num;
            const done = stepIndex > item.num;
            return (
              <div
                key={item.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  fontWeight: active || done ? 700 : 500,
                  color: done ? '#059669' : active ? '#0f172a' : '#94a3b8',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: done ? '#059669' : active ? '#0f172a' : '#e2e8f0',
                    color: done || active ? '#ffffff' : '#64748b',
                    flexShrink: 0,
                  }}
                >
                  {done ? '✓' : item.num}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                color: '#dc2626',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                lineHeight: 1.45,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.toLowerCase().includes('google') && (
                <button
                  type="button"
                  onClick={handleGoogleLoginFromModal}
                  disabled={googleLoading}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#ea4335',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: googleLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(234,67,53,0.3)',
                  }}
                >
                  {googleLoading ? 'Đang mở Google...' : '⚡ Đăng nhập ngay bằng Google ID'}
                </button>
              )}
            </div>
          )}

          {/* STEP 1: ĐỐI CHIẾU EMAIL + SĐT ĐĂNG KÝ */}
          {step === 'email' && (
            <form onSubmit={(e) => handleRequestOtp(e, false)}>
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '11px 13px',
                  marginBottom: '18px',
                  fontSize: '12.5px',
                  color: '#1e40af',
                  lineHeight: 1.5,
                }}
              >
                Hệ thống sẽ đối chiếu đúng cặp <strong>Email</strong> và <strong>Số điện thoại</strong> đã
                đăng ký trong tài khoản TravelEasy trước khi gửi OTP, tránh gửi nhầm sang tài khoản khác.
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  ĐỊA CHỈ EMAIL ĐÃ ĐĂNG KÝ *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    required
                    autoFocus={!email}
                    placeholder="vd: customer@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  SỐ ĐIỆN THOẠI ĐÃ ĐĂNG KÝ *
                </label>
                <div style={{ position: 'relative' }}>
                  <PhoneCall
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="tel"
                    required
                    autoFocus={Boolean(email)}
                    placeholder="vd: 0912345678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: submitting ? 0.75 : 1,
                }}
              >
                {submitting ? 'Đang đối chiếu & gửi OTP...' : 'ĐỐI CHIẾU & GỬI MÃ OTP'}
                {!submitting && <ArrowRight size={16} />}
              </button>

              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Bạn đã đăng ký hoặc liên kết bằng tài khoản Google?
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLoginFromModal}
                  disabled={googleLoading}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: googleLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {googleLoading ? 'Đang mở Google...' : 'Đăng nhập nhanh bằng Google ID'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: XÁC MINH MÃ OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  fontSize: '13px',
                  color: '#065f46',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                  <UserCheck size={15} />
                  <span>
                    Tài khoản: {confirmedAccount?.maskedFullName} ({confirmedAccount?.roleLabel})
                  </span>
                </div>
                Mã xác nhận 6 chữ số đã được gửi tới email đăng ký{' '}
                <strong>{confirmedAccount?.maskedEmail || email}</strong>. Vui lòng kiểm tra cả hộp thư đến và
                thư mục Spam/Quảng cáo.
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '12.5px',
                }}
              >
                <span style={{ fontWeight: 700, color: '#334155' }}>NHẬP MÃ OTP (6 SỐ)</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700,
                    color: otpExpiresIn > 0 ? '#059669' : '#dc2626',
                  }}
                >
                  <Clock size={14} />
                  {otpExpiresIn > 0 ? `Hết hạn sau ${formatCountdown(otpExpiresIn)}` : 'Mã OTP đã hết hạn'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    aria-label={`Chữ số OTP thứ ${idx + 1}`}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    style={{
                      height: '50px',
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      borderRadius: '10px',
                      border: digit ? '2px solid #059669' : '1.5px solid #cbd5e1',
                      backgroundColor: digit ? '#f0fdf4' : '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || otpValue.length < OTP_LENGTH}
                style={{
                  width: '100%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: submitting || otpValue.length < OTP_LENGTH ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: submitting || otpValue.length < OTP_LENGTH ? 0.65 : 1,
                }}
              >
                <ShieldCheck size={17} />
                {submitting ? 'Đang xác minh mã OTP...' : 'XÁC MINH MÃ OTP'}
              </button>

              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  fontSize: '12.5px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowLeft size={14} /> Đổi thông tin tài khoản
                </button>

                <button
                  type="button"
                  disabled={resending || resendCooldown > 0}
                  onClick={() => handleRequestOtp(undefined, true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: resendCooldown > 0 ? '#94a3b8' : '#059669',
                    fontWeight: 700,
                    cursor: resending || resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <RefreshCw size={13} />
                  {resending
                    ? 'Đang gửi lại...'
                    : resendCooldown > 0
                    ? `Gửi lại mã sau ${resendCooldown}s`
                    : 'Gửi lại mã OTP'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: TẠO MẬT KHẨU MỚI */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                Đang đặt lại mật khẩu cho tài khoản:{' '}
                <strong>{confirmedAccount?.maskedFullName}</strong> ({confirmedAccount?.roleLabel}) —{' '}
                <strong>{email.trim()}</strong>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  MẬT KHẨU MỚI *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 42px 11px 40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                {passwordChecks.map((chk) => (
                  <div
                    key={chk.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      fontSize: '12px',
                      color: chk.met ? '#059669' : '#64748b',
                      fontWeight: chk.met ? 700 : 500,
                    }}
                  >
                    {chk.met ? (
                      <CheckCircle size={13} color="#059669" />
                    ) : (
                      <AlertCircle size={13} color="#94a3b8" />
                    )}
                    <span>{chk.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  XÁC NHẬN MẬT KHẨU MỚI *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 42px 11px 40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: submitting ? 0.75 : 1,
                }}
              >
                <ShieldCheck size={17} />
                {submitting ? 'Đang cập nhật mật khẩu...' : 'CẬP NHẬT MẬT KHẨU MỚI'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
