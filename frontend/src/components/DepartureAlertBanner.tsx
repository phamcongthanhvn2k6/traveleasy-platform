import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, Bus, MapPin, X, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import { Booking } from '../types';

export const DepartureAlertBanner: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingBooking, setUpcomingBooking] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if user dismissed recently
    const dismissedTime = sessionStorage.getItem('traveleasy_dismiss_departure_alert');
    if (dismissedTime) {
      setIsDismissed(true);
      return;
    }

    // 2. Read from localStorage saved tickets or default demo booking
    try {
      const cacheRaw = localStorage.getItem('traveleasy_saved_tickets');
      let targetBooking: any = null;

      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw);
        const keys = Object.keys(cache);
        if (keys.length > 0) {
          // Take the most recent booking
          targetBooking = cache[keys[keys.length - 1]];
        }
      }

      // If no stored booking, create an intelligent realistic upcoming departure
      if (!targetBooking) {
        // Sample trip today departing in 3 hours
        const depTime = new Date(Date.now() + (3 * 3600 + 25 * 60) * 1000);
        targetBooking = {
          bookingCode: 'BK-20261030-8888',
          passengerName: 'Hành khách TravelEasy',
          trip: {
            originCity: 'Hà Nội',
            destinationCity: 'Sa Pa',
            busCompanyName: 'Sao Việt Express',
            departureTime: depTime.toISOString(),
            licensePlate: '29B-888.88',
          },
          pickupPointName: 'Bến xe Mỹ Đình (Cổng 2)',
          tickets: [{ seatNumber: 'A02' }],
        };
      }

      setUpcomingBooking(targetBooking);
    } catch {
      // Ignored
    }
  }, []);

  // Countdown timer effect
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
        {/* Left info */}
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

        {/* Right countdown & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Countdown Clock */}
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

          {/* Action button */}
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

          {/* Dismiss button */}
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

