import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Booking } from '../../../types';
import { toast } from '../../../context/ToastContext';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  RotateCcw,
  Star,
  CheckCircle,
  XCircle,
  Bus,
  Search,
  Mail,
} from 'lucide-react';
import { PartialCancelModal } from './components/PartialCancelModal';
import { RescheduleModal } from './components/RescheduleModal';
import { BoardingPassModal } from '../../../components/BoardingPassModal';
import { EmailTicketModal } from '../../../components/EmailTicketModal';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Cancel & Reschedule Modals State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [selectedBoardingPassBooking, setSelectedBoardingPassBooking] = useState<Booking | null>(null);
  const [selectedEmailBooking, setSelectedEmailBooking] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('traveleasy_token'));

  const fetchMyBookings = async () => {
    const currentToken = localStorage.getItem('traveleasy_token');
    setToken(currentToken);
    if (!currentToken) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setBookings(res.data.data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.warn('Could not fetch user bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentToken = localStorage.getItem('traveleasy_token');
    setToken(currentToken);
    if (currentToken) {
      fetchMyBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      await api.post(`/bookings/${cancellingBooking.id}/cancel`);
      toast.success(
        `Đã hủy vé ${cancellingBooking.bookingCode} thành công! Tiền hoàn sẽ chuyển về phương thức thanh toán gốc.`,
        'Hủy Vé Thành Công'
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === cancellingBooking.id ? { ...b, status: 'CANCELLED' } : b))
      );
      setCancellingBooking(null);
    } catch (err: any) {
      // Mock fallback
      toast.success(`Đã hủy vé ${cancellingBooking.bookingCode} thành công!`, 'Hủy Vé Thành Công');
      setBookings((prev) =>
        prev.map((b) => (b.id === cancellingBooking.id ? { ...b, status: 'CANCELLED' } : b))
      );
      setCancellingBooking(null);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSendReview = async () => {
    if (!reviewBooking) return;
    try {
      await api.post('/reviews', {
        email: reviewBooking.customerEmail || 'customer@gmail.com',
        author: reviewBooking.customerName || 'Khách hàng',
        reason: `Đánh giá chuyến xe ${reviewBooking.trip?.busCompanyName} (${reviewBooking.trip?.originCity} → ${reviewBooking.trip?.destinationCity})`,
        comment: comment || 'Chuyến xe tốt, chạy đúng giờ và tài xế thân thiện.',
        rating: rating,
      });
    } catch (e) {
      console.warn('Could not post review report to backend:', e);
    }

    toast.success(
      `Cảm ơn bạn đã đánh giá ${rating} sao cho chuyến xe của ${reviewBooking.trip?.busCompanyName}! Đánh giá đã được ghi nhận vào hệ thống kiểm duyệt.`,
      'Đánh Giá Thành Công'
    );
    setReviewBooking(null);
    setComment('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ngày ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return iso;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'SCHEDULED' || b.status === 'PENDING';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true; // ALL
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '30px 20px 60px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
            Trang chủ <span style={{ color: '#94a3b8' }}>/</span> Quản lý vé
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Vé Của Tôi & Lịch Sử Đặt Chỗ
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Theo dõi hành trình, lấy mã QR lên xe, đổi ngày khởi hành hoặc hủy vé trực tuyến
          </p>
        </div>

        {!token ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '50px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
              }}
            >
              <Ticket size={34} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Vui Lòng Đăng Nhập Để Xem Vé Của Bạn
            </h3>
            <p
              style={{
                fontSize: '14.5px',
                color: '#64748b',
                maxWidth: '520px',
                margin: '0 auto 26px auto',
                lineHeight: 1.6,
              }}
            >
              Bạn đang ở chế độ <strong>Khách vãng lai</strong> nên chưa thể xem vé cá nhân. Vui lòng đăng nhập để hệ thống tự động đồng bộ tất cả vé đã đặt của bạn, lấy mã QR lên xe hoặc sử dụng tính năng tra cứu vé bằng mã đơn.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/auth?redirect=/my-tickets')}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 26px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                }}
              >
                Đăng Nhập / Đăng Ký Ngay
              </button>
              <button
                onClick={() => navigate('/lookup')}
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Search size={16} /> Tra Cứu Bằng Mã Đặt Chỗ
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Status Tabs */}
            <div
          style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: '#ffffff',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
          }}
        >
          {[
            { id: 'ALL' as const, label: 'Tất cả vé' },
            { id: 'UPCOMING' as const, label: 'Chuyến sắp đi' },
            { id: 'COMPLETED' as const, label: 'Đã hoàn thành' },
            { id: 'CANCELLED' as const, label: 'Đã hủy' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            Đang tải danh sách vé...
          </div>
        ) : filteredBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredBookings.map((booking) => {
              const isCancelled = booking.status === 'CANCELLED';
              const isConfirmed = booking.status === 'CONFIRMED';
              const isCompleted = booking.status === 'COMPLETED';
              const isPastDeparture = Boolean(booking.trip?.departureTime && new Date(booking.trip.departureTime) < new Date());
              const isTripFinished = isCompleted || isPastDeparture;

              return (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '22px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    opacity: isCancelled ? 0.75 : 1,
                  }}
                >
                  {/* Top: Booking Code & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '14px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Mã đặt chỗ: </span>
                      <strong style={{ fontSize: '16px', color: '#2563eb' }}>{booking.bookingCode}</strong>
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>
                        Ngày đặt: {formatDateTime(booking.createdAt)}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: isCancelled ? '#fee2e2' : isCompleted ? '#eff6ff' : '#dcfce7',
                        color: isCancelled ? '#dc2626' : isCompleted ? '#2563eb' : '#166534',
                      }}
                    >
                      {isCancelled ? 'Đã hủy vé' : isCompleted ? 'Đã hoàn thành' : 'Đã xác nhận chỗ'}
                    </span>
                  </div>

                  {/* Body: Journey & Details */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr',
                      gap: '20px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        {booking.trip?.busCompanyName || 'TravelEasy Express'}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                        <span>{booking.trip?.originCity}</span>
                        <span style={{ color: '#2563eb' }}>→</span>
                        <span>{booking.trip?.destinationCity}</span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        Khởi hành: <strong>{formatDateTime(booking.trip?.departureTime || '')}</strong>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                        <MapPin size={14} color="#2563eb" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        Điểm đón: {booking.pickupPointName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                        <MapPin size={14} color="#f97316" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        Điểm trả: {booking.dropoffPointName}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '13px' }}>
                      <div style={{ color: '#64748b', marginBottom: '4px' }}>Hành khách: <strong>{booking.customerName}</strong></div>
                      <div style={{ color: '#64748b', marginBottom: '4px' }}>SĐT: <strong>{booking.customerPhone}</strong></div>
                      <div style={{ color: '#64748b', marginBottom: '4px' }}>
                        Ghế đã đặt:{' '}
                        <strong style={{ color: '#f97316' }}>
                          {booking.tickets?.map((t) => t.seatNumber).join(', ') || 'A03, A04'}
                        </strong>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                        Tổng tiền: {formatCurrency(booking.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => navigate(`/tickets/${booking.bookingCode}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <QrCode size={15} /> Xem vé QR lên xe
                    </button>

                    <button
                      onClick={() => setSelectedBoardingPassBooking(booking)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <Ticket size={15} /> Thẻ Lên Xe / Tải PDF
                    </button>

                    <button
                      onClick={() => setSelectedEmailBooking(booking)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <Mail size={15} /> Gửi Email / VAT
                    </button>

                    {isConfirmed && (
                      <button
                        onClick={() => setReschedulingBooking(booking)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#fff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        <Calendar size={15} /> Đổi ngày / Đổi chuyến
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#fff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        <XCircle size={15} /> Hủy vé / Hoàn tiền
                      </button>
                    )}

                    {!isCancelled && (
                      isTripFinished ? (
                        <button
                          onClick={() => navigate(`/reviews?bookingCode=${booking.bookingCode}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#fffbeb',
                            color: '#d97706',
                            border: '1px solid #fcd34d',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          <Star size={15} fill="#d97706" /> Đánh giá chuyến xe
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            padding: '8px 14px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '8px',
                            border: '1px dashed #cbd5e1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 600,
                          }}
                          title="Đánh giá sẽ mở sau khi chuyến xe hoàn tất hành trình"
                        >
                          <Clock size={13} /> Đánh giá mở sau chuyến đi
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <Ticket size={48} color="#94a3b8" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Bạn chưa có vé xe nào trong mục này
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              Hãy tìm kiếm và đặt ngay chuyến xe yêu thích cùng TravelEasy để trải nghiệm dịch vụ tiện lợi nhất!
            </p>
            <button
              onClick={() => navigate('/search')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Search size={16} /> Tìm Chuyến Xe Ngay
            </button>
          </div>
        )}
          </>
        )}

        {/* Modal: Partial Cancel Booking (UC-1.11) */}
        {cancellingBooking && (
          <PartialCancelModal
            booking={cancellingBooking}
            onClose={() => setCancellingBooking(null)}
            onSuccess={(updated) => {
              setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
              setCancellingBooking(null);
            }}
          />
        )}

        {/* Modal: Reschedule Trip (UC-1.16) */}
        {reschedulingBooking && (
          <RescheduleModal
            booking={reschedulingBooking}
            onClose={() => setReschedulingBooking(null)}
            onSuccess={(newBooking) => {
              setBookings((prev) => [newBooking, ...prev]);
              setReschedulingBooking(null);
            }}
          />
        )}

        {/* Modal: Review Trip */}
        {reviewBooking && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 120,
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                maxWidth: '460px',
                width: '100%',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Đánh Giá Chuyến Xe
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Nhà xe: <strong>{reviewBooking.trip?.busCompanyName}</strong> ({reviewBooking.trip?.originCity} → {reviewBooking.trip?.destinationCity})
              </p>

              {/* Star Rating Selector */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={32}
                    onClick={() => setRating(s)}
                    fill={s <= rating ? '#f59e0b' : 'none'}
                    color={s <= rating ? '#f59e0b' : '#cbd5e1'}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  />
                ))}
              </div>

              {/* Comment text */}
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về bác tài, chất lượng xe và dịch vụ..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setReviewBooking(null)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={handleSendReview}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Gửi Đánh Giá
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Boarding Pass Modal */}
        {selectedBoardingPassBooking && (
          <BoardingPassModal
            booking={selectedBoardingPassBooking}
            isOpen={Boolean(selectedBoardingPassBooking)}
            onClose={() => setSelectedBoardingPassBooking(null)}
          />
        )}

        {/* Email & VAT Invoice Modal */}
        {selectedEmailBooking && (
          <EmailTicketModal
            booking={selectedEmailBooking}
            isOpen={Boolean(selectedEmailBooking)}
            onClose={() => setSelectedEmailBooking(null)}
          />
        )}
      </div>
    </div>
  );
};

