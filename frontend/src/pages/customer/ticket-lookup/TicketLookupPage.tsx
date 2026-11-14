import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import jsQR from 'jsqr';
import api from '../../../services/api';
import { Booking } from '../../../types';
import { 
  Search, 
  ShieldCheck, 
  QrCode, 
  MapPin, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Ticket, 
  Mail, 
  Star, 
  WifiOff, 
  Radio, 
  Navigation, 
  Bus, 
  Clock,
  Camera,
  CameraOff,
  Lock,
  HelpCircle,
  Sparkles,
  Upload,
  RotateCcw,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { BoardingPassModal } from '../../../components/BoardingPassModal';
import { EmailTicketModal } from '../../../components/EmailTicketModal';

// ponytail: helper to mask customer phone on public ticket view
const maskDisplayPhone = (p?: string) => {
  if (!p) return '';
  if (p.includes('*')) return p;
  if (p.length <= 6) return p;
  return p.substring(0, 3) + '****' + p.substring(p.length - 3);
};

export const TicketLookupPage: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isPaymentSuccess = new URLSearchParams(location.search).get('payment') === 'success';
  const initialMode = new URLSearchParams(location.search).get('mode') === 'camera' ? 'CAMERA' : 'MANUAL';

  const [activeTab, setActiveTab] = useState<'MANUAL' | 'CAMERA' | 'UPLOAD'>(initialMode);
  const [code, setCode] = useState(routeCode || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [verifiedTicketStatus, setVerifiedTicketStatus] = useState<{
    status: 'VALID' | 'ALREADY_CHECKED_IN' | 'CANCELLED' | 'INVALID';
    message: string;
    ticketCode?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);

  // Camera & Scanner refs
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const saveBookingToOfflineCache = (data: Booking) => {
    try {
      const cacheRaw = localStorage.getItem('traveleasy_saved_tickets');
      const cache: Record<string, Booking> = cacheRaw ? JSON.parse(cacheRaw) : {};
      cache[data.bookingCode.toUpperCase()] = data;
      localStorage.setItem('traveleasy_saved_tickets', JSON.stringify(cache));
    } catch (e) {
      console.warn('Could not cache booking offline:', e);
    }
  };

  const getBookingFromOfflineCache = (searchCode: string): Booking | null => {
    try {
      const cacheRaw = localStorage.getItem('traveleasy_saved_tickets');
      if (!cacheRaw) return null;
      const cache: Record<string, Booking> = JSON.parse(cacheRaw);
      return cache[searchCode.trim().toUpperCase()] || null;
    } catch {
      return null;
    }
  };

  // Clean raw QR code text into pure code
  const cleanQrCode = (raw: string): string => {
    let clean = raw.trim();
    if (clean.includes('/tickets/')) {
      clean = clean.split('/tickets/')[1].split('?')[0];
    } else if (clean.includes('code=')) {
      clean = clean.split('code=')[1].split('&')[0];
    } else if (clean.includes('|')) {
      const parts = clean.split('|');
      for (const part of parts) {
        if (part.startsWith('TK-') || part.startsWith('BK-') || part.startsWith('BKG-')) {
          clean = part;
          break;
        }
      }
    }
    return clean;
  };

  const lookupByCode = async (searchCode: string) => {
    const rawClean = cleanQrCode(searchCode);
    if (!rawClean) {
      toast.warning('Vui lòng nhập hoặc quét mã vé để tra cứu!', 'Thiếu Mã Vé');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);
    setVerifiedTicketStatus(null);
    setIsOfflineData(false);

    try {
      // ponytail: Real phone number lookup integration if input is 9-11 digits
      if (/^[0-9]{9,11}$/.test(rawClean)) {
        try {
          const phoneRes = await api.get(`/bookings/phone/${encodeURIComponent(rawClean)}`);
          const bookingsList = phoneRes.data?.data;
          if (bookingsList && bookingsList.length > 0) {
            setBooking(bookingsList[0]);
            saveBookingToOfflineCache(bookingsList[0]);
            toast.success(`Tìm thấy ${bookingsList.length} đơn đặt vé cho SĐT ${rawClean}!`, 'Tra Cứu Vé');
            setLoading(false);
            return;
          }
        } catch (phoneErr: any) {
          // If not found by phone, continue to fallback
        }
      }

      // 1. Try finding booking by booking code first
      let res: any = null;
      try {
        res = await api.get(`/bookings/code/${encodeURIComponent(rawClean)}`);
      } catch (e: any) {
        // If not found as bookingCode, might be a TicketCode (TK-...)
        if (rawClean.startsWith('TK-') || rawClean.includes('-TK-')) {
          const verifyRes = await api.get(`/bookings/verify-ticket/${encodeURIComponent(rawClean)}`);
          if (verifyRes.data?.data) {
            const vData = verifyRes.data.data;
            setVerifiedTicketStatus({
              status: vData.validationStatus,
              message: vData.validationMessage,
              ticketCode: vData.ticketCode
            });
            if (vData.bookingCode) {
              res = await api.get(`/bookings/code/${encodeURIComponent(vData.bookingCode)}`);
            }
          }
        } else {
          throw e;
        }
      }

      if (res?.data?.data) {
        setBooking(res.data.data);
        saveBookingToOfflineCache(res.data.data);
        toast.success(`Tra cứu thành công đơn vé ${res.data.data.bookingCode}!`, 'Tra Cứu Vé');
      } else {
        // Fallback to offline cache
        const offlineBooking = getBookingFromOfflineCache(rawClean);
        if (offlineBooking) {
          setBooking(offlineBooking);
          setIsOfflineData(true);
          toast.info('Đang hiển thị vé từ bộ nhớ Offline của thiết bị!', 'Chế Độ Ngoại Tuyến');
        } else {
          const msg = 'Không tìm thấy thông tin đơn đặt vé với mã: ' + rawClean;
          setError(msg);
          toast.error(msg, 'Tra Cứu Thất Bại');
        }
      }
    } catch (err: any) {
      // Fallback to offline cache on network error
      const offlineBooking = getBookingFromOfflineCache(rawClean);
      if (offlineBooking) {
        setBooking(offlineBooking);
        setIsOfflineData(true);
        toast.info('Không thể kết nối máy chủ. Đang hiển thị vé từ bộ nhớ Offline!', 'Chế Độ Ngoại Tuyến');
      } else {
        const msg = err.response?.data?.message || 'Không tìm thấy thông tin đơn đặt vé với mã: ' + rawClean;
        setError(msg);
        toast.error(msg, 'Tra Cứu Thất Bại');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      setCode(routeCode);
      lookupByCode(routeCode);
    }
  }, [routeCode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Frame scanner loop
  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            stopCamera();
            const decoded = cleanQrCode(qrCode.data);
            setCode(decoded);
            setActiveTab('MANUAL');
            toast.success(`Đã nhận diện mã QR: ${decoded}`, 'Quét Thành Công');
            lookupByCode(decoded);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  // Start Camera
  // Demo QR Simulator
  const handleUseDemoQr = () => {
    stopCamera();
    const demoCode = 'BK-20261025-001';
    setCode(demoCode);
    setActiveTab('MANUAL');
    toast.success('Đã áp dụng mã vé mẫu để kiểm tra hệ thống: ' + demoCode, 'Quét Mẫu QR');
    lookupByCode(demoCode);
  };

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    // Multi-level fallback stream getter
    const getMediaStream = async (targetFacing: 'environment' | 'user'): Promise<MediaStream> => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NOT_SUPPORTED');
      }

      // Level 1: Soft ideal constraint (works on mobile back camera)
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (e1) {
        console.warn('Camera Level 1 failed, trying opposite facing mode:', e1);
      }

      // Level 2: Inverted facing mode (essential for laptops where only front webcam exists)
      try {
        const altFacing = targetFacing === 'environment' ? 'user' : 'environment';
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: altFacing } },
        });
      } catch (e2) {
        console.warn('Camera Level 2 failed, trying generic video=true:', e2);
      }

      // Level 3: Any video device without constraints
      try {
        return await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (e3) {
        console.warn('Camera Level 3 failed, trying enumerateDevices:', e3);
      }

      // Level 4: Explicit deviceId lookup
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 0) {
          return await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: videoDevices[0].deviceId } },
          });
        }
      }

      throw new Error('NO_CAMERA_FOUND');
    };

    try {
      const stream = await getMediaStream(facingMode);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let title = 'Không thể mở Camera';
      let desc = 'Vui lòng kiểm tra quyền truy cập camera trong cài đặt trình duyệt hoặc dùng chế độ Tải Ảnh QR / Nhập Mã.';
      let type = 'general';

      const errName = err?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        title = 'Trình duyệt đang chặn quyền Camera';
        desc = 'Hãy bấm vào biểu tượng 🔒 hoặc icon Camera trên thanh địa chỉ trình duyệt (cạnh URL) -> Chọn Cho Phép (Allow) Camera -> Bấm Thử Lại.';
        type = 'permission';
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        title = 'Camera đang bị ứng dụng khác chiếm dụng';
        desc = 'Webcam có thể đang được mở trong phần mềm Camera Windows, Zoom, Teams, Zalo hoặc OBS. Vui lòng đóng phần mềm đó rồi thử lại.';
        type = 'busy';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError' || err?.message === 'NO_CAMERA_FOUND') {
        title = 'Không tìm thấy thiết bị Camera / Webcam';
        desc = 'Máy tính chưa gắn webcam hoặc camera đã bị tắt trong Device Manager / Cài đặt quyền riêng tư của Windows.';
        type = 'notfound';
      } else if (err?.message === 'NOT_SUPPORTED') {
        title = 'Trình duyệt không hỗ trợ Camera ở giao thức này';
        desc = 'Tính năng Camera yêu cầu kết nối an toàn (HTTPS hoặc localhost).';
        type = 'general';
      }

      setCameraError({ title, desc, type });
      setIsScanning(false);
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  // Handle Image Upload for QR Scan
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode && qrCode.data) {
          const decoded = cleanQrCode(qrCode.data);
          setCode(decoded);
          setActiveTab('MANUAL');
          toast.success(`Đã nhận diện mã QR từ ảnh: ${decoded}`, 'Đọc Mã Thành Công');
          lookupByCode(decoded);
        } else {
          toast.error('Không tìm thấy mã QR trong hình ảnh này. Vui lòng thử ảnh rõ nét hơn!', 'Lỗi Đọc Ảnh');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    lookupByCode(code);
  };

  const handleCopyCode = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    toast.success(`Đã sao chép mã vé: ${booking.bookingCode}`, 'Đã Sao Chép');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    setShowBoardingPass(true);
  };

  return (
    <div className="container" style={{ maxWidth: '860px', margin: '40px auto 60px auto', padding: '0 16px' }}>
      <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <ShieldCheck size={14} /> XÁC THỰC VÉ CHÍNH HÃNG 100%
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 6px 0' }}>
            Tra Cứu Vé & Quét Mã QR Lên Xe
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Nhập mã vé, số điện thoại hoặc dùng camera điện thoại quét mã QR để kiểm tra thông tin chuyến xe tức thì
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('MANUAL')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'MANUAL' ? '#2563eb' : 'transparent',
              color: activeTab === 'MANUAL' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'MANUAL' ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
            }}
          >
            <Search size={16} /> Nhập Mã Thủ Công
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CAMERA')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'CAMERA' ? '#2563eb' : 'transparent',
              color: activeTab === 'CAMERA' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'CAMERA' ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
            }}
          >
            <Camera size={16} /> Quét Camera Trực Tiếp
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'UPLOAD' ? '#2563eb' : 'transparent',
              color: activeTab === 'UPLOAD' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'UPLOAD' ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
            }}
          >
            <Upload size={16} /> Tải Ảnh Chụp QR
          </button>
        </div>

        {/* Tab 1: Manual Input */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleLookup} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input
              type="text"
              required
              placeholder="Nhập mã đặt vé (BK-..., TK-...) hoặc Số điện thoại người đặt vé..."
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Search size={18} /> {loading ? 'Đang tìm...' : 'Tra Cứu'}
            </button>
          </form>
        )}

        {/* Tab 2: Live Camera View */}
        {activeTab === 'CAMERA' && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                minHeight: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                style={{ width: '100%', maxHeight: '360px', objectFit: 'cover' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Viewfinder Target */}
              {isScanning && (
                <div
                  style={{
                    position: 'absolute',
                    width: '220px',
                    height: '220px',
                    border: '3px solid #10b981',
                    borderRadius: '16px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#34d399',
                      boxShadow: '0 0 8px #34d399',
                      animation: 'scanLine 2s infinite ease-in-out',
                    }}
                  />
                </div>
              )}

              {/* Error Warning */}
              {cameraError && (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: '#ffffff', maxWidth: '440px', margin: '0 auto' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto',
                    color: '#f87171'
                  }}>
                    {cameraError.type === 'permission' ? <Lock size={26} /> : <CameraOff size={26} />}
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#fca5a5' }}>
                    {cameraError.title}
                  </h4>

                  <p style={{ margin: '0 0 18px 0', fontSize: '13px', lineHeight: 1.5, color: '#cbd5e1' }}>
                    {cameraError.desc}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <RotateCcw size={14} /> Thử Lại Camera
                    </button>

                    {/* ponytail: only show demo simulator in DEV */}
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={handleUseDemoQr}
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Sparkles size={14} /> Quét Thử Vé Mẫu (Demo)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab('UPLOAD')}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={14} /> Tải Ảnh QR
                    </button>
                  </div>
                </div>
              )}

              {/* Quick actions while camera is active - DEV only */}
              {isScanning && import.meta.env.DEV && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                  <button
                    type="button"
                    onClick={handleUseDemoQr}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={13} /> Thử Vé Mẫu
                  </button>
                </div>
              )}

              {/* Flip camera */}
              {isScanning && (
                <button
                  type="button"
                  onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={14} /> Đổi Camera
                </button>
              )}
            </div>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12.5px', marginTop: '8px' }}>
              💡 Đưa mã QR trên vé xe vào khung ngắm xanh để hệ thống tự động nhận diện và tra cứu
            </p>
          </div>
        )}

        {/* Tab 3: Upload Image */}
        {activeTab === 'UPLOAD' && (
          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              marginBottom: '24px',
            }}
          >
            <Upload size={36} color="#2563eb" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a' }}>
              Tải lên hình ảnh có chứa mã QR vé xe
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Hỗ trợ ảnh chụp màn hình điện thoại hoặc ảnh tải về từ email xác nhận
            </p>
            <label
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Chọn Ảnh Từ Máy Tính / Điện Thoại
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

        {/* Error message banner with Emergency Hotline */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '16px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>⚠️ {error}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
              Quý khách đang ở bến xe hoặc cần xác nhận vé gấp để kịp giờ khởi hành?
            </div>
            <a
              href="tel:19008888"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
              }}
            >
              📞 Hotline Hỗ Trợ Tại Bến: 1900 8888 (24/7)
            </a>
          </div>
        )}

        {/* Payment success banner */}
        {isPaymentSuccess && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(5,150,105,0.08)',
            }}
          >
            <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: '#047857' }}>Thanh Toán Thành Công!</div>
              <div style={{ fontSize: '13px', color: '#065f46', marginTop: '2px' }}>
                Hệ thống TravelEasy đã xác nhận thanh toán hợp lệ. Vé điện tử và mã QR lên xe của bạn đã sẵn sàng dưới đây.
              </div>
            </div>
          </div>
        )}

        {/* Verified Ticket Status Badge (from QR verification) */}
        {verifiedTicketStatus && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: verifiedTicketStatus.status === 'VALID' ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${verifiedTicketStatus.status === 'VALID' ? '#a7f3d0' : '#fde68a'}`,
            }}
          >
            {verifiedTicketStatus.status === 'VALID' ? (
              <CheckCircle2 size={20} color="#059669" />
            ) : (
              <AlertTriangle size={20} color="#d97706" />
            )}
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: verifiedTicketStatus.status === 'VALID' ? '#065f46' : '#92400e' }}>
              {verifiedTicketStatus.message}
            </div>
          </div>
        )}

        {/* BOOKING DETAILS CARD */}
        {booking && (
          <div style={{ border: '2px dashed #93c5fd', borderRadius: '14px', padding: '26px', backgroundColor: '#f0f9ff' }}>
            {/* Offline Alert Badge */}
            {isOfflineData && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#b45309',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <WifiOff size={18} color="#d97706" />
                <span>
                  <strong>Chế độ Ngoại Tuyến (Offline):</strong> Bạn đang xem vé từ bộ nhớ đệm thiết bị. Mã QR và thông tin ghế vẫn hợp lệ để xuất trình lên xe!
                </span>
              </div>
            )}

            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0f2fe', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ĐƠN ĐẶT VÉ ĐIỆN TỬ
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0c4a6e', margin: 0 }}>
                    {booking.bookingCode}
                  </h3>
                  <button
                    onClick={handleCopyCode}
                    title="Sao chép mã đơn vé"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: copied ? '#059669' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <span
                style={{
                  backgroundColor:
                    booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                      ? '#dcfce7'
                      : booking.status === 'PENDING'
                      ? '#fef3c7'
                      : '#fee2e2',
                  color:
                    booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                      ? '#15803d'
                      : booking.status === 'PENDING'
                      ? '#b45309'
                      : '#b91c1c',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {booking.status === 'CONFIRMED' ? (
                  <>
                    <CheckCircle2 size={14} /> ĐÃ XÁC NHẬN
                  </>
                ) : booking.status === 'COMPLETED' ? (
                  <>
                    <CheckCircle2 size={14} /> HOÀN THÀNH
                  </>
                ) : booking.status === 'PENDING' ? (
                  <>
                    <Clock size={14} /> CHỜ THANH TOÁN (10 PHÚT)
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> ĐÃ HỦY
                  </>
                )}
              </span>
            </div>

            {/* Trip Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Hành khách:</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{booking.customerName}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{maskDisplayPhone(booking.customerPhone)}</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Vị trí ghế / giường:</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#2563eb' }}>
                  {(booking as any).seatNumbers || booking.tickets?.map(t => t.seatNumber).join(', ') || 'Ghế tiêu chuẩn'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {booking.trip?.busCompanyName || 'Nhà xe TravelEasy'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng tiền thanh toán:</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#dc2626' }}>
                  {Number(booking.totalAmount).toLocaleString('vi-VN')} đ
                </div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                  Phương thức: {booking.paymentMethod || 'Online'}
                </div>
              </div>
            </div>

            {/* Route Box */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700, color: '#0369a1', fontSize: '14px' }}>
                <Bus size={16} /> Tuyến đường: {booking.trip?.originCity || 'Điểm đi'} ➔ {booking.trip?.destinationCity || 'Điểm đến'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                <Clock size={14} color="#f59e0b" />
                Giờ khởi hành: <strong>{booking.trip?.departureTime ? new Date(booking.trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(booking.trip.departureTime).toLocaleDateString('vi-VN') : 'Theo lịch xe'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <MapPin size={14} color="#ef4444" />
                Điểm đón: <strong>{booking.pickupPointName || 'Bến xe xuất phát'}</strong> ➔ Điểm trả: <strong>{booking.dropoffPointName || 'Bến xe đích'}</strong>
              </div>
            </div>

            {/* Ticket Cards with QR */}
            {booking.tickets && booking.tickets.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Danh Sách Vé Điện Tử (Xuất trình mã QR khi lên xe)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {booking.tickets.map(t => (
                    <div key={t.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <QrCode size={48} color="#2563eb" style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Mã vé: {t.ticketCode}</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#f97316', margin: '4px 0' }}>Ghế {t.seatNumber}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{t.price?.toLocaleString('vi-VN')} đ</div>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534' }}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0d9488',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                }}
              >
                <Printer size={16} /> Thẻ Lên Xe / Tải PDF
              </button>

              <button
                onClick={() => setShowEmailModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                }}
              >
                <Mail size={16} /> Gửi Vé Qua Email
              </button>

              <button
                onClick={() => navigate('/search')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đặt Thêm Vé Xe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Boarding Pass Modal */}
      {booking && (
        <BoardingPassModal
          booking={booking}
          isOpen={showBoardingPass}
          onClose={() => setShowBoardingPass(false)}
        />
      )}

      {/* Email & VAT Invoice Modal */}
      {booking && (
        <EmailTicketModal
          booking={booking}
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};

export default TicketLookupPage;
