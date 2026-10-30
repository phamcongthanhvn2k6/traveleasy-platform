import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, Bus, MapPin, X, QrCode } from 'lucide-react';

export const DepartureAlertBanner: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingBooking, setUpcomingBooking] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra nếu người dùng đã chủ động tắt thông báo trong phiên làm việc này
    const dismissedTime = sessionStorage.getItem('traveleasy_dismiss_departure_alert');
    if (dismissedTime) {
      setIsDismissed(true);
      return;
    }

    const checkUpcomingDeparture = async () => {
      const token = localStorage.getItem('traveleasy_token');
      const now = Date.now();
      let targetBooking: any = null;

      // Trường hợp 1: Người dùng đã đăng nhập -> Gọi API backend lấy danh sách vé thực tế
      if (token) {
        try {
          const res = await fetch('http://localhost:8080/api/v1/bookings/my-bookings', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            const bookings: any[] = data?.data || [];
            // Lọc các vé thực tế sắp khởi hành trong vòng 48 giờ tới
            const upcoming = bookings
              .filter(b => {
                if (b.status !== 'CONFIRMED' && b.status !== 'PAID') return false;
                if (!b.trip?.departureTime) return false;
                const depTime = new Date(b.trip.departureTime).getTime();
                const diff = depTime - now;
                return diff > 0 && diff <= 48 * 3600 * 1000;
              })
              .sort((a, b) => new Date(a.trip.departureTime).getTime() - new Date(b.trip.departureTime).getTime());

            if (upcoming.length > 0) {
              targetBooking = upcoming[0];
            }
          }
        } catch {
          // Bỏ qua lỗi mạng
        }
      }

      // Trường hợp 2: Nếu chưa đăng nhập, chỉ kiểm tra các vé người dùng vừa đặt thật trên thiết bị này (trong localStorage)
      if (!targetBooking) {
        try {
          const cacheRaw = localStorage.getItem('traveleasy_saved_tickets');
          if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            const validLocalBookings = Object.values(cache)
              .filter((b: any) => {
                if (!b?.trip?.departureTime) return false;
                const depTime = new Date(b.trip.departureTime).getTime();
                const diff = depTime - now;
                return diff > 0 && diff <= 48 * 3600 * 1000;
              })
              .sort((a: any, b: any) => new Date(a.trip.departureTime).getTime() - new Date(b.trip.departureTime).getTime());

            if (validLocalBookings.length > 0) {
              targetBooking = validLocalBookings[0];
            }
          }
        } catch {
          // Bỏ qua lỗi JSON
        }
      }

      // Tuyệt đối không dùng dữ liệu giả lập (mock data). Nếu người dùng chưa có vé thật -> Ẩn banner.
      setUpcomingBooking(targetBooking);
    };

    checkUpcomingDeparture();
  }, []);

  // Hiệu ứng đếm ngược thời gian thực
  useEffect(() => {
    if (!upcomingBooking?.trip?.departureTime) return;

    const targetDate = new Date(upcomingBooking.trip.departureTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [upcomingBooking]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('traveleasy_dismiss_departure_alert', 'true');
  };

  // Nếu người dùng đã tắt, hoặc chưa đăng nhập / không có vé thật sắp khởi hành -> Không hiển thị
  if (isDismissed || !upcomingBooking || !timeLeft) return null;

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fde68a',
        color: '#92400e',
        padding: '10px 16px',
        position: 'relative',
        zIndex: 40,
        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)',
        fontSize: '13px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Khối thông tin chuyến xe bên trái */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)',
            }}
          >
            <Bell size={15} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: '#b45309' }}>NHẮC NHỞ KHỞI HÀNH:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                Tuyến {upcomingBooking.trip?.originCity} ➔ {upcomingBooking.trip?.destinationCity} ({upcomingBooking.trip?.busCompanyName})
              </span>
              <span style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                Ghế {upcomingBooking.tickets?.[0]?.seatNumber || 'A01'}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#78350f', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={12} color="#d97706" />
              <span>Đón tại: <strong>{upcomingBooking.pickupPointName || 'Bến xe xuất phát'}</strong>. Quý khách vui lòng có mặt trước giờ xuất bến 30 phút.</span>
            </div>
          </div>
        </div>

        {/* Khối đồng hồ đếm ngược và nút hành động bên phải */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Đồng hồ đếm ngược */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              color: '#b45309',
            }}
          >
            <Clock size={14} color="#d97706" />
            <span>Xuất bến sau:</span>
            <span style={{ color: '#dc2626', letterSpacing: '0.5px' }}>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Nút xem mã QR vé */}
          <button
            onClick={() => navigate(`/lookup?code=${upcomingBooking.bookingCode}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(217, 119, 6, 0.25)',
            }}
          >
            <QrCode size={14} /> Xuất Trình Vé QR
          </button>

          {/* Nút đóng banner */}
          <button
            onClick={handleDismiss}
            title="Đóng thông báo"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
