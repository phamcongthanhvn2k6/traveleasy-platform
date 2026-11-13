import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bus, 
  ShieldCheck, 
  Lock, 
  Tag, 
  QrCode, 
  Star, 
  PhoneCall, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  Mail, 
  User as UserIcon, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import { isFirebaseConfigured } from '../../../services/firebase';
import {
  loginWithGoogle as firebaseLoginWithGoogle,
  sendPhoneOtp as firebaseSendPhoneOtp,
  verifyPhoneOtp as firebaseVerifyPhoneOtp,
  resetPhoneVerification,
  PHONE_OTP_RESEND_COOLDOWN_SECONDS,
  type AuthResponseData,
} from '../../../services/firebaseAuthService';
import { ForgotPasswordModal } from '../../../components/auth/ForgotPasswordModal';

export const CustomerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' or 'register'
  const isRegisterParam = location.pathname === '/register' || new URLSearchParams(location.search).get('tab') === 'register';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(isRegisterParam ? 'register' : 'login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [receiveNews, setReceiveNews] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Dynamic Password Strength & Criteria Checker
  const passwordCriteria = useMemo(() => {
    const pwd = regPassword || '';
    const hasMinLength = pwd.length >= 8;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasCase = hasLower && hasUpper;
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    const checks = [
      { id: 'length', label: 'Tối thiểu 8 ký tự', met: hasMinLength, detail: `${pwd.length}/8 ký tự` },
      { id: 'case', label: 'Chữ hoa (A-Z) & chữ thường (a-z)', met: hasCase, detail: !hasUpper ? 'thiếu chữ hoa' : !hasLower ? 'thiếu chữ thường' : 'đã đạt' },
      { id: 'number', label: 'Ít nhất 1 chữ số (0-9)', met: hasNumber, detail: !hasNumber ? 'thiếu số' : 'đã đạt' },
      { id: 'special', label: 'Ký tự đặc biệt (@, #, $, !...)', met: hasSpecial, detail: !hasSpecial ? 'thiếu ký tự đặc biệt' : 'đã đạt' },
    ];

    const score = checks.filter(c => c.met).length;

    let strengthLabel = 'Chưa nhập (0/4)';
    let strengthColor = '#94a3b8';
    let strengthBg = '#f1f5f9';

    if (pwd.length === 0) {
      strengthLabel = 'Chưa nhập (0/4)';
      strengthColor = '#94a3b8';
      strengthBg = '#f1f5f9';
    } else if (score <= 1) {
      strengthLabel = 'Rất yếu (1/4)';
      strengthColor = '#ef4444';
      strengthBg = '#fef2f2';
    } else if (score === 2) {
      strengthLabel = 'Trung bình (2/4)';
      strengthColor = '#f59e0b';
      strengthBg = '#fffbeb';
    } else if (score === 3) {
      strengthLabel = 'Khá mạnh (3/4)';
      strengthColor = '#3b82f6';
      strengthBg = '#eff6ff';
    } else {
      strengthLabel = 'Rất mạnh (4/4)';
      strengthColor = '#10b981';
      strengthBg = '#ecfdf5';
    }

    return {
      checks,
      score: pwd.length === 0 ? 0 : score,
      strengthLabel,
      strengthColor,
      strengthBg,
      isStrong: score >= 3
    };
  }, [regPassword]);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Modal bổ sung số điện thoại cho tài khoản Google chưa có SĐT
  const [googleUserMissingPhone, setGoogleUserMissingPhone] = useState<AuthResponseData | null>(null);
  const [promptPhoneInput, setPromptPhoneInput] = useState('');
  const [savingPromptPhone, setSavingPromptPhone] = useState(false);
  const [promptPhoneError, setPromptPhoneError] = useState<string | null>(null);

  // ==================== FIREBASE SOCIAL AUTH STATE ====================
  // Google: đang xử lý popup
  const [socialLoading, setSocialLoading] = useState<'google' | 'otp' | null>(null);
  // Phone OTP flow state
  const [otpStep, setOtpStep] = useState<'idle' | 'awaiting'>('idle'); // 'awaiting' = đã gửi SMS, chờ nhập OTP
  const [otpPhone, setOtpPhone] = useState('');      // input SĐT (E.164: +84xxxxxxxxx)
  const [otpCode, setOtpCode] = useState('');        // input mã OTP 6 số
  const [otpCooldown, setOtpCooldown] = useState(0);
  // Container id cho RecaptchaVerifier (invisible) của Firebase Phone Auth
  const RECAPTCHA_CONTAINER_ID = 'firebase-recaptcha-container';

  // Countdown dùng deadline tuyệt đối để không drift khi tab bị browser throttle.
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setInterval(() => setOtpCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldown > 0]);

  // Lưu JWT do backend cấp + điều hướng theo role - dùng chung cho mọi luồng đăng nhập
  const applyAuthSuccess = (authData: AuthResponseData, welcomeName: string) => {
    localStorage.setItem('traveleasy_token', authData.token);
    localStorage.setItem('traveleasy_user', JSON.stringify(authData));

    toast.success(`Đăng nhập thành công! Chào mừng ${welcomeName}.`, 'Xác Thực Thành Công');
    setSuccessMessage(`Đăng nhập thành công! Chào mừng ${welcomeName}.`);
    setTimeout(() => {
      const redirectParam = new URLSearchParams(location.search).get('redirect') || (location.state as any)?.from;
      if (redirectParam) {
        navigate(redirectParam);
        return;
      }
      if (authData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (authData.role === 'OPERATOR') {
        navigate('/company/dashboard');
      } else {
        navigate('/');
      }
    }, 600);
  };

  // Đăng nhập Google qua Firebase: popup → ID Token → backend verify → JWT
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      toast.warning('Chức năng đăng nhập Google chưa được cấu hình (thiếu biến VITE_FIREBASE_*).', 'Firebase');
      return;
    }
    setErrorMessage(null);
    setSocialLoading('google');
    try {
      const authData = await firebaseLoginWithGoogle();
      localStorage.setItem('traveleasy_token', authData.token);
      localStorage.setItem('traveleasy_user', JSON.stringify(authData));

      if (!authData.phone) {
        setGoogleUserMissingPhone(authData);
        setPromptPhoneInput('');
        setPromptPhoneError(null);
        toast.info('Vui lòng cập nhật số điện thoại để nhà xe liên hệ gửi vé.', 'Bổ Sung Thông Tin');
        return;
      }

      applyAuthSuccess(authData, authData.fullName || authData.email || 'bạn');
    } catch (err: any) {
      console.error('Google login error:', err);
      const msg = err?.code === 'auth/popup-closed-by-user'
        ? 'Bạn đã đóng cửa sổ đăng nhập Google'
        : err?.message || 'Đăng nhập Google không thành công';
      toast.error(msg, 'Đăng Nhập Thất Bại');
      setErrorMessage(msg);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSavePromptPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUserMissingPhone) return;

    const cleanPhone = promptPhoneInput.trim().replace(/\s+/g, '');
    if (!/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
      setPromptPhoneError('Số điện thoại không đúng định dạng (VD: 0988123456 hoặc +84988123456)');
      return;
    }

    setSavingPromptPhone(true);
    setPromptPhoneError(null);
    try {
      const res = await api.put('/auth/profile', {
        fullName: googleUserMissingPhone.fullName,
        phone: cleanPhone,
      });

      const updatedUser: AuthResponseData = {
        ...googleUserMissingPhone,
        phone: res.data?.data?.phone || cleanPhone,
      };
      setGoogleUserMissingPhone(null);
      applyAuthSuccess(updatedUser, updatedUser.fullName || 'bạn');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật số điện thoại. Vui lòng thử lại sau.';
      setPromptPhoneError(msg);
      toast.error(msg, 'Lỗi Cập Nhật');
    } finally {
      setSavingPromptPhone(false);
    }
  };

  const handleSkipPromptPhone = () => {
    if (!googleUserMissingPhone) return;
    const userToLogin = googleUserMissingPhone;
    setGoogleUserMissingPhone(null);
    applyAuthSuccess(userToLogin, userToLogin.fullName || 'bạn');
  };

  // BƯỚC 1 Phone OTP: gửi SMS (Firebase sẽ render reCAPTCHA invisible vào container)
  const handleSendPhoneOtp = async () => {
    if (!isFirebaseConfigured) {
      toast.warning('Chức năng đăng nhập OTP chưa được cấu hình (thiếu biến VITE_FIREBASE_*).', 'Firebase');
      return;
    }
    const phone = otpPhone.trim();
    if (otpCooldown > 0) {
      toast.warning(`Vui lòng chờ ${otpCooldown} giây trước khi gửi lại mã OTP.`, 'Giới hạn gửi OTP');
      return;
    }
    if (!/^\+?\d{9,15}$/.test(phone.replace(/[\s.-]/g, ''))) {
      const msg = 'Số điện thoại không hợp lệ. Dùng dạng quốc tế, vd: +84912345678';
      toast.warning(msg, 'Số Điện Thoại');
      setErrorMessage(msg);
      return;
    }
    const e164 = phone.startsWith('+') ? phone.replace(/[\s.-]/g, '') : `+84${phone.replace(/^0/, '').replace(/[\s.-]/g, '')}`;

    setErrorMessage(null);
    setSocialLoading('otp');
    try {
      await firebaseSendPhoneOtp(e164, RECAPTCHA_CONTAINER_ID);
      setOtpStep('awaiting');
      setOtpCooldown(PHONE_OTP_RESEND_COOLDOWN_SECONDS);
      toast.info(`Đã gửi mã OTP tới ${e164}. Kiểm tra tin nhắn SMS của bạn.`, 'Gửi OTP');
    } catch (err: any) {
      console.error('Send OTP error:', err);
      // Nếu Firebase reject request, cho phép thử lại sau khi reset verifier.
      resetPhoneVerification();
      const msg = err?.message || 'Không gửi được mã OTP. Vui lòng thử lại.';
      toast.error(msg, 'Gửi OTP Thất Bại');
      setErrorMessage(msg);
    } finally {
      setSocialLoading(null);
    }
  };

  // BƯỚC 2 Phone OTP: xác minh mã → ID Token → backend verify → JWT
  const handleVerifyPhoneOtp = async () => {
    const code = otpCode.trim();
    if (code.length < 6) {
      toast.warning('Vui lòng nhập đủ 6 số mã OTP', 'Mã OTP');
      return;
    }
    setErrorMessage(null);
    setSocialLoading('otp');
    try {
      const authData = await firebaseVerifyPhoneOtp(code);
      setOtpStep('idle');
      setOtpCode('');
      applyAuthSuccess(authData, authData.fullName || authData.phone || 'bạn');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      const msg = err?.code === 'auth/invalid-verification-code'
        ? 'Mã OTP không đúng. Vui lòng kiểm tra lại SMS.'
        : err?.message || 'Xác minh OTP không thành công';
      toast.error(msg, 'Xác Minh OTP Thất Bại');
      setErrorMessage(msg);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        identifier: loginIdentifier.trim(),
        password: loginPassword.trim()
      });

      if (res.data?.success && res.data?.data) {
        const authData = res.data.data;
        localStorage.setItem('traveleasy_token', authData.token);
        localStorage.setItem('traveleasy_user', JSON.stringify(authData));

        toast.success(`Đăng nhập thành công! Chào mừng ${authData.fullName}.`, 'Xác Thực Thành Công');
        setSuccessMessage(`Đăng nhập thành công! Chào mừng ${authData.fullName}.`);
        setTimeout(() => {
          const redirectParam = new URLSearchParams(location.search).get('redirect') || (location.state as any)?.from;
          if (redirectParam) {
            navigate(redirectParam);
            return;
          }
          // If customer, redirect home. If admin, redirect admin dashboard.
          if (authData.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (authData.role === 'OPERATOR') {
            navigate('/company/dashboard');
          } else {
            navigate('/');
          }
        }, 600);
      } else {
        const msg = res.data?.message || 'Đăng nhập không thành công';
        toast.error(msg, 'Đăng Nhập Thất Bại');
        setErrorMessage(msg);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Sai thông tin đăng nhập hoặc tài khoản không tồn tại';
      toast.error(msg, 'Đăng Nhập Thất Bại');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword.length < 6) {
      const msg = 'Mật khẩu phải có tối thiểu 6 ký tự';
      toast.warning(msg, 'Mật Khẩu Quá Ngắn');
      setErrorMessage(msg);
      return;
    }

    if (passwordCriteria.score < 2) {
      const missingList = passwordCriteria.checks.filter(c => !c.met).map(c => c.label).join(', ');
      const msg = `Mật khẩu còn yếu! Vui lòng bổ sung thêm: ${missingList}`;
      toast.warning(msg, 'Mật Khẩu Chưa Đủ Mạnh');
      setErrorMessage(msg);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập';
      toast.warning(msg, 'Mật Khẩu Không Khớp');
      setErrorMessage(msg);
      return;
    }

    if (!agreeTerms) {
      const msg = 'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật';
      toast.warning(msg, 'Chưa Xác Nhận');
      setErrorMessage(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword
      });

      if (res.data?.success && res.data?.data) {
        const authData = res.data.data;
        localStorage.setItem('traveleasy_token', authData.token);
        localStorage.setItem('traveleasy_user', JSON.stringify(authData));

        toast.success(`Đăng ký tài khoản thành công! Xin chào ${authData.fullName}.`, 'Đăng Ký Thành Công');
        setSuccessMessage('Đăng ký tài khoản thành công! Tự động đăng nhập...');
        setTimeout(() => {
          const redirectParam = new URLSearchParams(location.search).get('redirect') || (location.state as any)?.from;
          if (redirectParam) {
            navigate(redirectParam);
            return;
          }
          navigate('/');
        }, 800);
      } else {
        const msg = res.data?.message || 'Đăng ký không thành công';
        toast.error(msg, 'Đăng Ký Thất Bại');
        setErrorMessage(msg);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || 'Đăng ký thất bại. Email hoặc số điện thoại có thể đã được sử dụng.';
      toast.error(msg, 'Đăng Ký Thất Bại');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 480px) minmax(420px, 580px)',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 1px rgba(0,0,0,0.1)',
        maxWidth: '1080px',
        width: '100%',
        minHeight: '680px'
      }}>
        {/* =========================================================================
            LEFT COLUMN: VIP EXPERIENCE BRANDING (Chuẩn Screenshot 1)
            ========================================================================= */}
        <div style={{
          background: 'linear-gradient(160deg, #091c3e 0%, #0c2b5e 50%, #081a38 100%)',
          color: '#ffffff',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Light Gradient */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            left: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Brand Header */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  backgroundColor: '#2563eb',
                  padding: '7px',
                  borderRadius: '10px',
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                }}>
                  <Bus size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>TravelEasy</span>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>VIP PLATFORM</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#93c5fd', letterSpacing: '0.2px' }}>ĐẶT VÉ XE KHÁCH LIÊN TỈNH CAO CẤP</span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11px',
                color: '#67e8f9',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                Khẳng định an toàn 100%
              </div>
            </div>

            {/* Pill & Headline */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#fef08a',
              marginBottom: '14px',
              letterSpacing: '0.3px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#eab308' }} />
              TIÊU CHUẨN XE VIP LIMOUSINE CUNG ĐIỆN
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Trải nghiệm Đặt Vé Xe Khách VIP
            </h1>

            <p style={{
              fontSize: '13.5px',
              color: '#cbd5e1',
              lineHeight: 1.5,
              marginBottom: '28px'
            }}>
              Hệ thống đặt vé chính hãng hơn 50+ nhà xe uy tín (Phương Trang, Thành Bưởi, Hoa Mai...). Chọn chính xác vị trí giường nằm ưng ý theo thời gian thực.
            </p>

            {/* 3 Core Value Props */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '7px', borderRadius: '8px', color: '#38bdf8' }}>
                  <Lock size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                    Giữ chỗ độc quyền 10 phút, không sợ mất vé
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4 }}>
                    Cơ chế Pessimistic Locking chống Double Booking tuyệt đối, an tâm hoàn tất thanh toán.
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', padding: '7px', borderRadius: '8px', color: '#facc15' }}>
                  <Tag size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                    Tích điểm đổi mã giảm giá sau mỗi chuyến đi
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4 }}>
                    Nhận ngay voucher ưu đãi đến 50% cho thành viên thân thiết TravelEasy Rewards.
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '7px', borderRadius: '8px', color: '#34d399' }}>
                  <QrCode size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                    Quản lý vé điện tử & quét mã QR lên xe nhanh chóng
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4 }}>
                    Không cần in vé giấy, thẻ board hiển thị trực tiếp SMS/Zalo và Apple/Google Wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Box */}
          <div style={{ position: 'relative', zIndex: 10, marginTop: '24px' }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '14px 16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#facc15' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#facc15" />
                  ))}
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', marginLeft: '6px' }}>5.0/5.0</span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Khách hàng VIP đã trải nghiệm</span>
              </div>
              <p style={{ fontSize: '12px', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.45, marginBottom: '8px' }}>
                "Đặt vé cực kỳ nhanh, giao diện trực quan dễ dùng! Mình chọn được đúng buồng giường VIP tầng 1 nằm êm ái chống say xe cho cả gia đình."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#93c5fd' }}>
                <span style={{ fontWeight: 700 }}>Trần Minh Đức (Thành viên Diamond)</span>
                <span style={{ color: '#64748b' }}>Vé: TP.HCM - Đà Lạt</span>
              </div>
            </div>

            {/* Bottom mini info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                <PhoneCall size={12} /> Hotline 24/7: <strong style={{ color: '#cbd5e1' }}>1900 6868</strong>
              </div>
              <span>PCI DSS Bảo mật</span>
              <span>&copy; 2026 TravelEasy</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: AUTH TABS & FORMS (Chuẩn Screenshot 1)
            ========================================================================= */}
        <div style={{
          padding: '40px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Top link back & Partner link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <Link
                to="/company/login"
                style={{
                  color: '#0f766e',
                  textDecoration: 'none',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  fontSize: '11.5px'
                }}
                title="Cổng điều hành dành riêng cho Đối tác Nhà Xe"
              >
                🏢 Dành cho Đối Tác Nhà Xe →
              </Link>

              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: '#64748b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  transition: 'color 0.2s'
                }}
              >
                <ArrowLeft size={13} /> Về trang chủ
              </Link>
            </div>

            {/* TAB SWITCHER: [ĐĂNG NHẬP] | [ĐĂNG KÝ MỚI] */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '28px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                style={{
                  border: 'none',
                  backgroundColor: activeTab === 'login' ? '#ffffff' : 'transparent',
                  color: activeTab === 'login' ? '#0f172a' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <ArrowRight size={14} /> ĐĂNG NHẬP
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
                style={{
                  border: 'none',
                  backgroundColor: activeTab === 'register' ? '#ffffff' : 'transparent',
                  color: activeTab === 'register' ? '#0f172a' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <UserIcon size={14} /> ĐĂNG KÝ MỚI
              </button>
            </div>

            {/* ALERTS */}
            {errorMessage && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '20px',
                color: '#dc2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '20px',
                color: '#16a34a',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* =================================================================
                TAB 1: FORM ĐĂNG NHẬP (Screenshot 1 - Left View)
                ================================================================= */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
                    • XÁC THỰC KHÁCH HÀNG
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Chào mừng đến với TravelEasy
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Đăng nhập hoặc đăng ký để quản lý vé xe và nhận ưu đãi độc quyền.
                  </p>
                </div>

                {/* Quick Demo Customer Accounts */}
                <div style={{ marginBottom: '18px', padding: '10px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>
                    🔑 Tài khoản khách hàng mẫu (Mật khẩu demo: 123456789@):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      { label: 'Nguyễn Văn Du Khách', email: 'customer@gmail.com' },
                      { label: 'Trần Thị Bích Ngọc', email: 'tranthib@gmail.com' },
                    ].map((acc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(acc.email);
                          setLoginPassword('123456789@');
                        }}
                        style={{
                          background: loginIdentifier === acc.email ? '#2563eb' : '#ffffff',
                          color: loginIdentifier === acc.email ? '#ffffff' : '#1e40af',
                          border: '1px solid #93c5fd',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SỐ ĐIỆN THOẠI HOẶC EMAIL */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    SỐ ĐIỆN THOẠI HOẶC EMAIL *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder="vd: 0912345678 hoặc customer@gmail.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14.5px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* MẬT KHẨU */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    MẬT KHẨU *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME & FORGOT PASSWORD */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '15px', height: '15px', accentColor: '#059669', cursor: 'pointer' }}
                    />
                    Ghi nhớ đăng nhập (30 ngày)
                  </label>

                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotModal(true);
                    }}
                    style={{ fontSize: '12.5px', color: '#059669', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                {/* GREEN SUBMIT BUTTON (Chuẩn màu xanh lá #059669 như Screenshot 1) */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.8 : 1
                  }}
                >
                  {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY →'}
                </button>

                {/* SOCIAL DIVIDER */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '22px 0 16px',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  <span style={{ padding: '0 12px' }}>HOẶC ĐĂNG NHẬP NHANH BẰNG</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>

                {/* SOCIAL LOGIN BUTTONS - Firebase Google Sign-in + Phone OTP */}
                <div id={RECAPTCHA_CONTAINER_ID} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={socialLoading !== null}
                    style={{
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '10px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: socialLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: socialLoading && socialLoading !== 'google' ? 0.6 : 1
                    }}
                  >
                    {socialLoading === 'google' ? (
                      'Đang mở Google...'
                    ) : (
                      <>
                        <span style={{ color: '#ea4335', fontWeight: 900 }}>G</span> Google ID
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.info('Nhập số điện thoại dạng quốc tế (vd: +84912345678) vào ô bên dưới rồi bấm "GỬI MÃ OTP".', 'Đăng Nhập OTP')}
                    style={{
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '10px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ color: '#059669' }}>📱</span> Số điện thoại OTP
                  </button>
                </div>

                {/* PHONE OTP PANEL - Firebase Phone Auth (gửi SMS + xác minh mã) */}
                <div style={{
                  marginTop: '12px',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    • Đăng nhập bằng số điện thoại (Firebase OTP)
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="tel"
                      placeholder="+84912345678"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      disabled={otpStep === 'awaiting'}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={socialLoading !== null || otpCooldown > 0}
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: socialLoading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: otpStep === 'awaiting' ? 0.6 : 1
                      }}
                    >
                      {socialLoading === 'otp' && otpStep === 'idle' ? 'Đang gửi...' : otpCooldown > 0 ? `GỬI LẠI (${otpCooldown}s)` : 'GỬI MÃ OTP'}
                    </button>
                  </div>

                  {otpStep === 'awaiting' && (
                    <>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Nhập 6 số mã OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          letterSpacing: '4px',
                          textAlign: 'center',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={socialLoading !== null}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '9px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: socialLoading ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {socialLoading === 'otp' && otpStep === 'awaiting' ? 'Đang xác minh...' : 'XÁC MINH →'}
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: otpCooldown > 0 ? '#64748b' : '#dc2626' }}>
                      {otpCooldown > 0 ? `Bạn có thể yêu cầu mã mới sau ${otpCooldown} giây.` : 'Mã cũ có thể đã hết hạn. Bạn có thể gửi lại mã mới.'}
                    </div>
                    </>
                  )}

                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    Mã OTP được gửi qua SMS bằng Firebase Phone Auth. Ở chế độ dev (localhost), dùng số test +16505553434 với mã cố định.
                  </div>
                </div>
              </form>
            ) : (
              /* =================================================================
                  TAB 2: FORM ĐĂNG KÝ MỚI (Screenshot 1 - Right View)
                  ================================================================= */
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
                    • ĐĂNG KÝ TÀI KHOẢN MỚI
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Tạo tài khoản TravelEasy mới
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Đăng ký thành viên để nhận ngay voucher giảm 15% cho chuyến đi đầu tiên và quản lý vé tiện lợi.
                  </p>
                </div>

                {/* HỌ VÀ TÊN KHÁCH HÀNG */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    HỌ VÀ TÊN KHÁCH HÀNG *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Nguyễn Văn Du Khách"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* SỐ ĐIỆN THOẠI & EMAIL NHẬN VÉ (2 COLUMNS) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                        SỐ ĐIỆN THOẠI *
                      </label>
                      <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>Xác thực OTP</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="vd: 0912 345 678"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      EMAIL NHẬN VÉ ĐIỆN TỬ *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vd: customer@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* MẬT KHẨU & XÁC NHẬN MẬT KHẨU (2 COLUMNS) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      MẬT KHẨU *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 36px 11px 12px',
                          borderRadius: '10px',
                          border: `1px solid ${regPassword.length > 0 ? (passwordCriteria.score >= 2 ? '#86efac' : '#fca5a5') : '#cbd5e1'}`,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      XÁC NHẬN MẬT KHẨU *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 36px 11px 12px',
                          borderRadius: '10px',
                          border: `1px solid ${regConfirmPassword.length > 0 ? (regPassword === regConfirmPassword ? '#86efac' : '#fca5a5') : '#cbd5e1'}`,
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Inline password match notification */}
                    {regConfirmPassword.length > 0 && (
                      <div style={{
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: regPassword === regConfirmPassword ? '#16a34a' : '#dc2626'
                      }}>
                        {regPassword === regConfirmPassword ? (
                          <>
                            <CheckCircle size={12} /> Mật khẩu khớp hoàn toàn
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} /> Mật khẩu chưa khớp
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* DYNAMIC PASSWORD STRENGTH INDICATOR & REQUIREMENT CHECKLIST */}
                <div style={{ marginBottom: '16px' }}>
                  {/* Strength Bar & Status Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      {[1, 2, 3, 4].map((step) => {
                        const isFilled = passwordCriteria.score >= step;
                        return (
                          <div
                            key={step}
                            style={{
                              flex: 1,
                              height: '5px',
                              backgroundColor: isFilled ? passwordCriteria.strengthColor : '#e2e8f0',
                              borderRadius: '3px',
                              transition: 'all 0.25s ease'
                            }}
                          />
                        );
                      })}
                    </div>
                    <span style={{ 
                      fontSize: '11.5px', 
                      fontWeight: 800, 
                      color: passwordCriteria.strengthColor,
                      minWidth: '95px',
                      textAlign: 'right'
                    }}>
                      {passwordCriteria.strengthLabel}
                    </span>
                  </div>

                  {/* Guidance Box: Shows what is satisfied and what is still missing */}
                  <div style={{
                    backgroundColor: regPassword.length === 0 ? '#f8fafc' : (passwordCriteria.score === 4 ? '#f0fdf4' : '#fffbeb'),
                    border: `1px solid ${regPassword.length === 0 ? '#e2e8f0' : (passwordCriteria.score === 4 ? '#bbf7d0' : '#fef08a')}`,
                    borderRadius: '10px',
                    padding: '10px 12px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#334155'
                    }}>
                      <span>Yêu cầu mật khẩu an toàn:</span>
                      {regPassword.length > 0 && passwordCriteria.score < 4 && (
                        <span style={{ color: '#d97706', fontSize: '10.5px' }}>
                          ⚠️ Còn thiếu {4 - passwordCriteria.score} tiêu chí bên dưới
                        </span>
                      )}
                      {passwordCriteria.score === 4 && (
                        <span style={{ color: '#16a34a', fontSize: '10.5px' }}>
                          ✓ Đã đáp ứng mọi tiêu chí bảo mật
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {passwordCriteria.checks.map((chk) => (
                        <div
                          key={chk.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            color: chk.met ? '#16a34a' : (regPassword.length > 0 ? '#dc2626' : '#64748b'),
                            fontWeight: chk.met ? 700 : 500,
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {chk.met ? (
                            <CheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                          ) : (
                            <AlertCircle size={13} style={{ color: regPassword.length > 0 ? '#ef4444' : '#94a3b8', flexShrink: 0 }} />
                          )}
                          <span>{chk.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CHECKBOXES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={{ marginTop: '2px', accentColor: '#059669' }}
                    />
                    <span>Tôi đồng ý với <strong>Điều khoản dịch vụ</strong> và <strong>Chính sách bảo mật</strong> của TravelEasy Platform.</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    <input
                      type="checkbox"
                      checked={receiveNews}
                      onChange={(e) => setReceiveNews(e.target.checked)}
                      style={{ marginTop: '2px', accentColor: '#059669' }}
                    />
                    <span>Nhận thông báo khuyến mãi vé Tết, mã giảm giá qua Zalo/Email.</span>
                  </label>
                </div>

                {/* GREEN SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px',
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Đang khởi tạo tài khoản...' : 'TẠO TÀI KHOẢN NGAY →'}
                </button>

                {/* LINK TO LOGIN */}
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: '#64748b' }}>
                  Đã có tài khoản TravelEasy?{' '}
                  <span
                    onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                    style={{ color: '#059669', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Đăng nhập ngay
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Security Assurance */}
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#94a3b8' }}>
            Bảo mật thông tin thanh toán & vé xe theo chuẩn mã hóa SSL 256-bit
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        initialIdentifier={loginIdentifier}
        onClose={() => setShowForgotModal(false)}
        onResetSuccess={(resetEmail) => {
          setActiveTab('login');
          setLoginIdentifier(resetEmail);
          setLoginPassword('');
          setErrorMessage(null);
          setSuccessMessage('Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
        }}
      />

      {/* MODAL BỔ SUNG SỐ ĐIỆN THOẠI SAU KHI ĐĂNG NHẬP GOOGLE */}
      {googleUserMissingPhone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '12px',
                }}
              >
                📱
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                Bổ sung số điện thoại
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                Chào mừng <strong>{googleUserMissingPhone.fullName || 'bạn'}</strong>! Để nhận mã vé điện tử SMS và để tài xế liên hệ khi đón trả tận nơi, vui lòng cập nhật số điện thoại của bạn.
              </p>
            </div>

            {promptPhoneError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  color: '#dc2626',
                  fontSize: '12.5px',
                  lineHeight: 1.4,
                }}
              >
                {promptPhoneError}
              </div>
            )}

            <form onSubmit={handleSavePromptPhone}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  SỐ ĐIỆN THOẠI DI ĐỘNG *
                </label>
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="Ví dụ: 0988123456"
                  value={promptPhoneInput}
                  onChange={(e) => {
                    setPromptPhoneInput(e.target.value);
                    if (promptPhoneError) setPromptPhoneError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={savingPromptPhone}
                style={{
                  width: '100%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: savingPromptPhone ? 'not-allowed' : 'pointer',
                  opacity: savingPromptPhone ? 0.75 : 1,
                  boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.25)',
                }}
              >
                {savingPromptPhone ? 'Đang lưu số điện thoại...' : 'Lưu số điện thoại & Tiếp tục →'}
              </button>

              <button
                type="button"
                onClick={handleSkipPromptPhone}
                disabled={savingPromptPhone}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Để sau, tôi sẽ cập nhật trong Hồ sơ cá nhân
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAuthPage;

