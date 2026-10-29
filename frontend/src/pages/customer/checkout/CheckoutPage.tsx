import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { paymentService, PaymentInitResponse } from '../../../services/paymentService';
import { Trip, Booking } from '../../../types';
import { CheckoutTimer } from './components/CheckoutTimer';
import { PassengerInfoForm, PassengerInfo } from './components/PassengerInfoForm';
import { PaymentMethodSelector, PaymentMethodType } from './components/PaymentMethodSelector';
import { OrderSummaryPanel } from './components/OrderSummaryPanel';
import { QrPaymentModal } from './components/QrPaymentModal';
import { VnPayModal } from './components/VnPayModal';
import { toast } from '../../../context/ToastContext';
import { Check, ChevronRight, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load state from location.state or sessionStorage
  const [checkoutData, setCheckoutData] = useState<{
    trip: Trip;
    selectedSeats: string[];
    points: { pickup?: number; dropoff?: number; pickupName?: string; dropoffName?: string };
  } | null>(() => {
    if (location.state?.trip) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('traveleasy_checkout_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fallback sample data if direct access without previous step
  const trip: Trip = checkoutData?.trip || {
    id: 1,
    busCompanyId: 1,
    busCompanyName: 'TravelEasy Express',
    busCompanyLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150',
    routeId: 1,
    originCity: 'TP. Hồ Chí Minh',
    destinationCity: 'Đà Lạt',
    distanceKm: 305,
    durationHours: 6,
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 21600000).toISOString(),
    busType: 'SLEEPER',
    price: 320000,
    totalSeats: 34,
    availableSeats: 30,
    status: 'SCHEDULED',
  };

  const selectedSeats: string[] = checkoutData?.selectedSeats?.length
    ? checkoutData.selectedSeats
    : ['A03', 'A04'];

  const points = checkoutData?.points || {
    pickup: 1,
    dropoff: 3,
    pickupName: 'Bến xe Miền Tây',
    dropoffName: 'Bến xe Liên tỉnh Đà Lạt',
  };

  // Form State
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>(() => {
    try {
      const savedUser = localStorage.getItem('traveleasy_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      return {
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        note: '',
        hasInsurance: true,
        termsAccepted: true,
      };
    } catch {
      return {
        fullName: '',
        phone: '',
        email: '',
        note: '',
        hasInsurance: true,
        termsAccepted: true,
      };
    }
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('PAYOS');
  const [loading, setLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // QR Modal & Payment State
  const [showQrModal, setShowQrModal] = useState(false);
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [paymentInitData, setPaymentInitData] = useState<PaymentInitResponse | null>(null);

  // Check if returning from VNPAY with failure
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('vnpay_status') === 'failed') {
      const bookingCode = params.get('bookingCode');
      toast.warning(
        `Giao dịch VNPAY cho đơn ${bookingCode || ''} chưa hoàn tất hoặc bạn đã hủy thao tác. Bạn vẫn còn thời gian giữ chỗ để thử lại!`,
        'Thanh Toán Chưa Hoàn Tất'
      );
    }
  }, [location.search]);

  const handleTimerExpire = () => {
    toast.error('Thời gian giữ chỗ 10 phút đã hết hạn! Ghế đã được giải phóng.', 'Hết Hạn');
    sessionStorage.removeItem('traveleasy_checkout_data');
    navigate('/search');
  };

  const handleApplyVoucher = (amount: number, code: string) => {
    setDiscountAmount(amount);
  };

  const validateForm = () => {
    if (!passengerInfo.fullName.trim()) {
      toast.warning('Vui lòng điền họ và tên hành khách!', 'Thiếu Thông Tin');
      return false;
    }
    if (!passengerInfo.phone.trim()) {
      toast.warning('Vui lòng điền số điện thoại nhận vé!', 'Thiếu Thông Tin');
      return false;
    }
    if (!passengerInfo.email.trim()) {
      toast.warning('Vui lòng điền email nhận hóa đơn điện tử!', 'Thiếu Thông Tin');
      return false;
    }
    if (!passengerInfo.termsAccepted) {
      toast.warning('Vui lòng đồng ý với điều khoản sử dụng!', 'Điều Khoản');
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = async () => {
    const currentToken = localStorage.getItem('traveleasy_token');
    if (!currentToken) {
      toast.warning('Vui lòng đăng nhập tài khoản để tiến hành đặt vé và thanh toán!', 'Yêu Cầu Đăng Nhập');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        tripId: trip.id,
        seatNumbers: selectedSeats,
        customerName: passengerInfo.fullName,
        customerPhone: passengerInfo.phone,
        customerEmail: passengerInfo.email,
        pickupPointId: points.pickup,
        dropoffPointId: points.dropoff,
        paymentMethod: paymentMethod,
        note: passengerInfo.note,
      };

      // 1. Tạo đơn đặt vé trong database
      const res = await api.post('/bookings', payload);
      const bookingData: Booking = res.data.data;
      setCreatedBooking(bookingData);

      // 2. Khởi tạo phiên thanh toán qua Payment API
      const initRes = await paymentService.initiatePayment({
        bookingCode: bookingData.bookingCode,
        paymentMethod: paymentMethod,
      });
      setPaymentInitData(initRes);

      if (paymentMethod === 'VNPAY') {
        // Mở Modal VNPAY với nút Demo duyệt ngay và nút chuyển hướng Sandbox
        setShowVnPayModal(true);
      } else if (paymentMethod === 'PAYOS' || paymentMethod === 'VIETQR') {
        // Mở Modal PayOS / VietQR Napas 24/7 (MB Bank - PHAM CONG THANH)
        setShowQrModal(true);
      } else if (paymentMethod === 'MOMO' || paymentMethod === 'ZALOPAY') {
        if (initRes.paymentUrl) {
          toast.info(`Đang mở cổng thanh toán ${paymentMethod}...`, 'Ví Điện Tử');
          window.open(initRes.paymentUrl, '_blank');
        }
        setShowQrModal(true);
      } else {
        // COD - Tiền mặt khi lên xe
        toast.success(`Đặt vé thành công! Mã đơn: ${bookingData.bookingCode}`, 'Thành Công');
        sessionStorage.removeItem('traveleasy_checkout_data');
        navigate(`/tickets/${bookingData.bookingCode}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đặt vé. Vui lòng thử lại!';
      toast.error(msg, 'Thất Bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVnPaySuccess = () => {
    setShowVnPayModal(false);
    sessionStorage.removeItem('traveleasy_checkout_data');
    if (createdBooking) {
      navigate(`/tickets/${createdBooking.bookingCode}?payment=success`);
    } else {
      navigate('/lookup');
    }
  };

  const handleQrSuccess = () => {
    setShowQrModal(false);
    sessionStorage.removeItem('traveleasy_checkout_data');
    if (createdBooking) {
      toast.success('Hệ thống đã nhận được thanh toán chuyển khoản! Vé đã được kích hoạt.', 'Thanh Toán Thành Công');
      navigate(`/tickets/${createdBooking.bookingCode}?payment=success`);
    } else {
      navigate('/lookup');
    }
  };

  // Guard against unauthenticated users attempting to view checkout / book
  const token = localStorage.getItem('traveleasy_token');
  if (!token) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '44px 36px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.2)'
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.3px' }}>
            Yêu Cầu Đăng Nhập Tài Khoản
          </h2>

          <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '22px' }}>
            Theo quy định an toàn và quản lý vé điện tử, <strong>chỉ khách hàng đã đăng nhập mới được đặt vé và thanh toán</strong>. Khi chưa đăng nhập, quý khách chỉ được tra cứu thông tin chuyến xe.
          </p>

          {/* Trip summary badge if available */}
          {trip && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}>
                🚌 {trip.busCompanyName}
              </div>
              <div style={{ color: '#475569', fontSize: '13px' }}>
                Tuyến: <strong>{trip.originCity} ➔ {trip.destinationCity}</strong>
              </div>
              <div style={{ color: '#64748b', fontSize: '12.5px', marginTop: '4px' }}>
                Ghế chọn: <strong style={{ color: '#2563eb' }}>{selectedSeats.join(', ')}</strong> • Ngày đi: {new Date(trip.departureTime).toLocaleDateString('vi-VN')}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => navigate('/login?redirect=/checkout')}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '14px 20px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            >
              ĐĂNG NHẬP ĐỂ TIẾP TỤC ĐẶT VÉ →
            </button>

            <button
              onClick={() => navigate('/search')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ← Quay lại tìm chuyến xe (Chế độ xem)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '30px 20px 80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách chuyến
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
            <ShieldCheck size={16} /> Giao dịch được mã hóa an toàn 100%
          </div>
        </div>

        {/* Stepper Header (Chuẩn Vexere) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              ✓
            </div>
            1. Chọn tuyến & giờ
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              ✓
            </div>
            2. Chọn ghế & điểm đón
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 800, fontSize: '13px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              3
            </div>
            3. Thông tin & Thanh toán
          </div>

          <ChevronRight size={16} color="#cbd5e1" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontWeight: 600, fontSize: '13px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              4
            </div>
            4. Nhận vé QR
          </div>
        </div>

        {/* 10-Minute Hard-Hold Countdown Timer */}
        <CheckoutTimer initialSeconds={600} onExpire={handleTimerExpire} />

        {/* Main 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Form & Payment Method */}
          <div>
            <PassengerInfoForm
              info={passengerInfo}
              onChange={setPassengerInfo}
              seatCount={selectedSeats.length}
            />

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div>
            <OrderSummaryPanel
              trip={trip}
              selectedSeats={selectedSeats}
              points={points}
              hasInsurance={passengerInfo.hasInsurance}
              onApplyVoucher={handleApplyVoucher}
              onSubmit={handleCheckoutSubmit}
              loading={loading}
              disabled={!passengerInfo.termsAccepted}
            />
          </div>
        </div>
      </div>

      {/* QR Payment Banking Modal (VietQR Napas 24/7) */}
      {showQrModal && createdBooking && (
        <QrPaymentModal
          bookingCode={createdBooking.bookingCode}
          totalAmount={createdBooking.totalAmount}
          qrCodeUrl={paymentInitData?.qrCodeUrl}
          paymentUrl={paymentInitData?.paymentUrl}
          bankDetails={paymentInitData?.bankDetails}
          onSuccess={handleQrSuccess}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* VNPAY Payment Confirmation Modal */}
      {showVnPayModal && createdBooking && (
        <VnPayModal
          bookingCode={createdBooking.bookingCode}
          totalAmount={createdBooking.totalAmount}
          paymentUrl={paymentInitData?.paymentUrl}
          onSuccess={handleVnPaySuccess}
          onClose={() => setShowVnPayModal(false)}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
