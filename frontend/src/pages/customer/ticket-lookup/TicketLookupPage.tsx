import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { Booking } from '../../../types';
import { Search, ShieldCheck, QrCode, MapPin, Printer, ArrowLeft, Copy, Check, CheckCircle2, Ticket, Mail, Star, WifiOff, Radio, Navigation, Bus, Clock } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { BoardingPassModal } from '../../../components/BoardingPassModal';
import { EmailTicketModal } from '../../../components/EmailTicketModal';

export const TicketLookupPage: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isPaymentSuccess = new URLSearchParams(location.search).get('payment') === 'success';

  const [code, setCode] = useState(routeCode || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);

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

  const lookupByCode = async (searchCode: string) => {
    if (!searchCode.trim()) {
      toast.warning('Vui lòng nhập mã đặt vé để tra cứu!', 'Thiếu Mã Vé');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);
    setIsOfflineData(false);

    try {
      const res = await api.get(`/bookings/code/${searchCode.trim()}`);
      if (res.data?.data) {
        setBooking(res.data.data);
        saveBookingToOfflineCache(res.data.data);
        toast.success(`Tra cứu thành công đơn vé ${res.data.data.bookingCode}!`, 'Tra Cứu Vé');
      } else {
        // Fallback to offline cache
        const offlineBooking = getBookingFromOfflineCache(searchCode);
        if (offlineBooking) {
          setBooking(offlineBooking);
          setIsOfflineData(true);
          toast.info('Đang hiển thị vé từ bộ nhớ Offline của thiết bị!', 'Chế Độ Ngoại Tuyến');
        } else {
          const msg = 'Không tìm thấy thông tin đơn đặt vé với mã này!';
          setError(msg);
          toast.error(msg, 'Tra Cứu Thất Bại');
        }
      }
    } catch (err: any) {
      // Fallback to offline cache on network error
      const offlineBooking = getBookingFromOfflineCache(searchCode);
      if (offlineBooking) {
        setBooking(offlineBooking);
        setIsOfflineData(true);
        toast.info('Không thể kết nối máy chủ. Đang hiển thị vé từ bộ nhớ Offline!', 'Chế Độ Ngoại Tuyến');
      } else {
        const msg = err.response?.data?.message || 'Không tìm thấy thông tin đơn đặt vé với mã này!';
        setError(msg);
        toast.error(msg, 'Tra Cứu Thất Bại');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      lookupByCode(routeCode);
    }
  }, [routeCode]);

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
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto 60px auto', padding: '0 16px' }}>
      <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', textAlign: 'center', marginBottom: '8px' }}>
          Tra Cứu Vé & Lấy Mã QR Lên Xe
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Nhập mã đơn vé của bạn (VD: BK-20261019-XXXX) để kiểm tra trạng thái vé và vị trí ghế ngồi
        </p>

        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            required
            placeholder="Nhập mã đặt vé..."
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
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
            }}
          >
            <Search size={18} /> {loading ? 'Đang tìm...' : 'Tra Cứu'}
          </button>
        </form>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}

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
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.08)',
                }}
              >
                <WifiOff size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 800 }}>Chế Độ Ngoại Tuyến (Offline Mode):</span> Vé đã được bảo lưu an toàn trên bộ nhớ thiết bị. Bạn có thể xuất trình mã QR này trực tiếp cho tài xế/phụ xe tại bến ngay cả khi không có kết nối Internet!
                </div>
              </div>
            )}

            {/* Header of Ticket */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #bfdbfe', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Mã đặt vé:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb' }}>{booking.bookingCode}</span>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#475569',
                    }}
                  >
                    {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    {copied ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '13px' }}>
                {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : booking.status}
              </div>
            </div>

            {/* Itinerary details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px', fontSize: '14px' }}>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Nhà xe & Tuyến đường</div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', margin: '4px 0' }}>{booking.trip.busCompanyName}</div>
                <div style={{ color: '#334155', fontWeight: 600 }}>{booking.trip.originCity} ➔ {booking.trip.destinationCity}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Loại xe: {booking.trip.busType}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Hành khách</div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', margin: '4px 0' }}>{booking.customerName}</div>
                <div style={{ color: '#334155', fontWeight: 600 }}>{booking.customerPhone}</div>
                {booking.customerEmail && <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{booking.customerEmail}</div>}
              </div>
            </div>

            {/* Pickup & Dropoff */}
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '18px', backgroundColor: '#fff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', lineHeight: 1.6 }}>
              <div><MapPin size={15} style={{ display: 'inline', color: '#2563eb', marginRight: '6px', verticalAlign: '-2px' }} /> Điểm đón: <strong>{booking.pickupPointName}</strong></div>
              <div><MapPin size={15} style={{ display: 'inline', color: '#f97316', marginRight: '6px', verticalAlign: '-2px' }} /> Điểm trả: <strong>{booking.dropoffPointName}</strong></div>
            </div>

            {/* Real-time Transit Roadmap Tracker */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
                  <Radio size={16} color="#2563eb" />
                  <span>TIẾN TRÌNH HÀNH TRÌNH XE THỜI GIAN THỰC</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                  Xe Chạy Đúng Giờ
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>ĐIỂM XUẤT BẾN</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>{booking.pickupPointName || booking.trip?.originCity}</div>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
                    {booking.trip?.departureTime ? new Date(booking.trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Xuất bến'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2563eb' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', marginBottom: '2px' }}>Cao tốc</div>
                  <Navigation size={18} />
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '10.5px', color: '#1d4ed8', fontWeight: 700 }}>TRẠM TRUNG CHUYỂN</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e3a8a', margin: '3px 0' }}>Trạm Dừng Chân VIP</div>
                  <div style={{ fontSize: '10.5px', color: '#2563eb', fontWeight: 600 }}>Nghỉ 15 phút</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ea580c' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#ea580c', marginBottom: '2px' }}>Về đích</div>
                  <Bus size={18} />
                </div>

                <div style={{ backgroundColor: '#fff7ed', padding: '10px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '10.5px', color: '#c2410c', fontWeight: 700 }}>ĐIỂM TRẢ KHÁCH</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>{booking.dropoffPointName || booking.trip?.destinationCity}</div>
                  <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>
                    {booking.trip?.arrivalTime ? new Date(booking.trip.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Đến nơi'}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Cards with QR */}
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Danh Sách Vé Điện Tử (Đưa mã QR khi lên xe)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {booking.tickets.map(t => (
                <div key={t.id} style={{ backgroundColor: '#fff', padding: '18px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <QrCode size={56} color="#2563eb" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Mã vé: {t.ticketCode}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f97316', margin: '6px 0' }}>Ghế {t.seatNumber}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t.price.toLocaleString('vi-VN')} đ</div>
                  <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534' }}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Print & Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                <Mail size={16} /> Gửi Vé Qua Email / VAT
              </button>

              {Boolean(booking.status === 'COMPLETED' || (booking.trip?.departureTime && new Date(booking.trip.departureTime) < new Date())) && (
                <button
                  onClick={() => navigate(`/reviews?bookingCode=${booking.bookingCode}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fcd34d',
                    color: '#d97706',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <Star size={16} fill="#d97706" /> Đánh Giá Chuyến Xe
                </button>
              )}

              <button
                onClick={() => navigate('/my-tickets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Xem Vé Của Tôi
              </button>

              <button
                onClick={() => navigate('/search')}
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
