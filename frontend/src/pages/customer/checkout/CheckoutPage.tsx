import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Trip, Booking } from '../../../types';
import { CheckoutTimer } from './components/CheckoutTimer';
import { PassengerInfoForm, PassengerInfo } from './components/PassengerInfoForm';
import { PaymentMethodSelector, PaymentMethodType } from './components/PaymentMethodSelector';
import { OrderSummaryPanel } from './components/OrderSummaryPanel';
import { QrPaymentModal } from './components/QrPaymentModal';
import { toast } from '../../../context/ToastContext';
import { Check, ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('VNPAY_QR');
  const [loading, setLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

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
        paymentMethod: paymentMethod === 'VNPAY_QR' ? 'VNPAY' : paymentMethod,
        note: passengerInfo.note,
      };

      const res = await api.post('/bookings', payload);
      const bookingData: Booking = res.data.data;
      setCreatedBooking(bookingData);

      if (paymentMethod === 'VNPAY_QR') {
        // Open QR Modal
        setShowQrModal(true);
      } else {
        // Direct Success
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

  const handleQrSuccess = () => {
    setShowQrModal(false);
    sessionStorage.removeItem('traveleasy_checkout_data');
    if (createdBooking) {
      toast.success('Hệ thống đã nhận được thanh toán chuyển khoản! Vé đã được kích hoạt.', 'Thanh Toán Thành Công');
      navigate(`/tickets/${createdBooking.bookingCode}`);
    } else {
      navigate('/lookup');
    }
  };

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

      {/* QR Payment Banking Modal */}
      {showQrModal && createdBooking && (
        <QrPaymentModal
          bookingCode={createdBooking.bookingCode}
          totalAmount={createdBooking.totalAmount}
          onSuccess={handleQrSuccess}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};

