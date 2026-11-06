import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { Trip, TripDetail } from '../../../../types';
import { BusSeatMap } from '../../../../components/BusSeatMap';
import api from '../../../../services/api';
import { toast } from '../../../../context/ToastContext';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  MessageSquare,
  Bus,
  CheckCircle2,
  Info,
  Zap,
  Radio,
} from 'lucide-react';

interface Props {
  trip: Trip;
  onBook: (
    trip: Trip,
    selectedSeats: string[],
    points: { pickup?: number; dropoff?: number; pickupName?: string; dropoffName?: string }
  ) => void;
}

// Skeleton loading representation for 2-deck bus seat map
const SeatMapSkeleton: React.FC<{ isDark?: boolean; totalSeats?: number }> = ({ isDark, totalSeats = 34 }) => {
  const seatsPerFloor = Math.ceil(totalSeats / 2);

  return (
    <div
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '14px',
          color: '#3b82f6',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>⚡ Đang đồng bộ sơ đồ ghế thời gian thực...</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Tầng 1 */}
        <div
          style={{
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            padding: '12px',
            borderRadius: '10px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <div
            style={{
              height: '16px',
              backgroundColor: isDark ? '#334155' : '#cbd5e1',
              borderRadius: '4px',
              width: '60%',
              margin: '0 auto 12px auto',
              opacity: 0.6,
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Array.from({ length: seatsPerFloor }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  height: '38px',
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  borderRadius: '6px',
                  border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDark ? '#475569' : '#94a3b8',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              >
                A{String(idx + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>

        {/* Tầng 2 */}
        <div
          style={{
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            padding: '12px',
            borderRadius: '10px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <div
            style={{
              height: '16px',
              backgroundColor: isDark ? '#334155' : '#cbd5e1',
              borderRadius: '4px',
              width: '60%',
              margin: '0 auto 12px auto',
              opacity: 0.6,
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Array.from({ length: seatsPerFloor }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  height: '38px',
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  borderRadius: '6px',
                  border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDark ? '#475569' : '#94a3b8',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              >
                B{String(idx + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TripResultCard: React.FC<Props> = ({ trip, onBook }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'SEATS' | 'IMAGES' | 'POLICY' | 'REVIEWS'>('SEATS');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<number | undefined>();
  const [selectedDropoff, setSelectedDropoff] = useState<number | undefined>();
  const [sseConnected, setSseConnected] = useState(false);
  const [simSeatNumber, setSimSeatNumber] = useState('A02');
  const [simulating, setSimulating] = useState(false);
  const [showSimPanel, setShowSimPanel] = useState(false);

  // Đọc phiên giữ chỗ còn hiệu lực trong sessionStorage
  const [activeHold, setActiveHold] = useState<{
    tripId: number;
    seats: string[];
    expiry: number;
  } | null>(() => {
    try {
      const raw = sessionStorage.getItem('traveleasy_checkout_data');
      const expStr = sessionStorage.getItem('traveleasy_hold_expiry');
      if (!raw || !expStr) return null;
      const exp = Number(expStr);
      if (Date.now() >= exp) {
        sessionStorage.removeItem('traveleasy_checkout_data');
        sessionStorage.removeItem('traveleasy_hold_expiry');
        return null;
      }
      const data = JSON.parse(raw);
      if (data.trip?.id === trip.id && data.selectedSeats?.length > 0) {
        return {
          tripId: data.trip.id,
          seats: data.selectedSeats,
          expiry: exp,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [remainingHoldSeconds, setRemainingHoldSeconds] = useState<number>(() => {
    if (!activeHold) return 0;
    return Math.max(0, Math.floor((activeHold.expiry - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!activeHold) return;
    const interval = setInterval(() => {
      const rem = Math.max(0, Math.floor((activeHold.expiry - Date.now()) / 1000));
      setRemainingHoldSeconds(rem);
      if (rem <= 0) {
        clearInterval(interval);
        setActiveHold(null);
        sessionStorage.removeItem('traveleasy_checkout_data');
        sessionStorage.removeItem('traveleasy_hold_expiry');
        toast.warning('Thời gian giữ chỗ 10 phút của bạn đã hết hạn. Ghế đã được hoàn trả lại cho sàn!', 'Hết Hạn Giữ Chỗ');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHold]);

  const handleResumeCheckout = () => {
    navigate('/checkout');
  };

  const handleCancelActiveHold = async () => {
    if (!activeHold) return;
    if (window.confirm(`Bạn có chắc chắn muốn hủy giữ chỗ các ghế [${activeHold.seats.join(', ')}] và hoàn trả lại cho sàn?`)) {
      try {
        await api.post(`/trips/${trip.id}/seats/release`, {
          seatCodes: activeHold.seats,
        });
        toast.info('Đã hủy giữ chỗ thành công. Ghế đã được mở lại cho khách khác đặt!', 'Đã Hủy');
      } catch (e) {
        console.error(e);
      }
      sessionStorage.removeItem('traveleasy_checkout_data');
      sessionStorage.removeItem('traveleasy_hold_expiry');
      setActiveHold(null);
      setTripDetail((prev) => {
        if (!prev) return prev;
        const updated = prev.seats.map((s) =>
          activeHold.seats.includes(s.seatNumber) ? { ...s, status: 'AVAILABLE' as const } : s
        );
        return { ...prev, seats: updated };
      });
    }
  };

  // Số chỗ trống theo thời gian thực (tự động cập nhật khi ghế được chọn/giữ/đặt hoặc qua SSE)
  const displayAvailableSeats = useMemo(() => {
    if (tripDetail?.seats && tripDetail.seats.length > 0) {
      return tripDetail.seats.filter((s) => s.status === 'AVAILABLE').length;
    }
    return trip.availableSeats;
  }, [tripDetail, trip.availableSeats]);

  // Lắng nghe luồng SSE cập nhật ghế theo thời gian thực
  useEffect(() => {
    if (!expanded || activeTab !== 'SEATS') {
      setSseConnected(false);
      return;
    }

    const rawBase = api.defaults.baseURL || '/api/v1';
    const cleanBase = rawBase.replace(/\/+$/, '');
    const sseUrl = `${cleanBase}/trips/${trip.id}/seats/stream`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.addEventListener('INIT', () => {
      setSseConnected(true);
    });

    eventSource.addEventListener('SEAT_UPDATE', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Cập nhật trạng thái ghế trong tripDetail
        setTripDetail((prev) => {
          if (!prev) return prev;
          const updatedSeats = prev.seats.map((s) =>
            s.seatNumber === data.seatNumber ? { ...s, status: data.status } : s
          );
          return { ...prev, seats: updatedSeats };
        });

        // Nếu ghế này đang nằm trong selectedSeats của khách hiện tại và bị người khác giữ hoặc mua:
        if (data.status !== 'AVAILABLE') {
          setSelectedSeats((prevSelected) => {
            if (prevSelected.includes(data.seatNumber)) {
              const statusName =
                data.status === 'LOCKED'
                  ? 'giữ chỗ thanh toán (Màu Vàng)'
                  : 'đặt mua thành công (Màu Xám)';
              toast.warning(
                `Ghế ${data.seatNumber} vừa có khách khác ${statusName}! Hệ thống đã gỡ ghế khỏi lựa chọn của bạn.`,
                'Cập Nhật Ghế Real-Time'
              );
              return prevSelected.filter((s) => s !== data.seatNumber);
            }
            return prevSelected;
          });
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp SEAT_UPDATE SSE:', err);
      }
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
      setSseConnected(false);
    };
  }, [expanded, activeTab, trip.id]);

  const handleSimulateAction = async (action: 'HOLD' | 'BOOK' | 'RELEASE') => {
    if (!simSeatNumber) return;
    setSimulating(true);
    try {
      await api.post(`/trips/${trip.id}/seats/simulate`, {
        seatNumber: simSeatNumber,
        action: action,
      });
      const actionText =
        action === 'HOLD'
          ? 'Đang thanh toán (Vàng / LOCKED)'
          : action === 'BOOK'
          ? 'Đã mua xong (Xám / BOOKED)'
          : 'Mở lại trống (Trắng / AVAILABLE)';
      toast.success(`⚡ Đã kích hoạt giả lập: Ghế ${simSeatNumber} -> ${actionText}`, 'Giả Lập Realtime');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi lệnh giả lập', 'Lỗi Giả Lập');
    } finally {
      setSimulating(false);
    }
  };

  const toggleExpand = async () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    // Điểm đón / trả: Khởi tạo NGAY LẬP TỨC từ prop trip để người dùng tương tác tức thì
    if (!selectedPickup && trip.pickupPoints && trip.pickupPoints.length > 0) {
      setSelectedPickup(trip.pickupPoints[0].id);
    }
    if (!selectedDropoff && trip.dropoffPoints && trip.dropoffPoints.length > 0) {
      setSelectedDropoff(trip.dropoffPoints[0].id);
    }

    // Tải sơ đồ ghế ngầm và luôn làm mới trạng thái ghế thực tế
    if (nextExpanded) {
      setLoadingDetail(true);
      try {
        const res = await api.get(`/trips/${trip.id}`);
        const data = res.data.data;
        setTripDetail(data);
        if (data.pickupPoints?.length > 0 && !selectedPickup) {
          setSelectedPickup(data.pickupPoints[0].id);
        }
        if (data.dropoffPoints?.length > 0 && !selectedDropoff) {
          setSelectedDropoff(data.dropoffPoints[0].id);
        }
      } catch (err) {
        console.error('Failed to load trip detail:', err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const handleToggleSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 6) {
        toast.warning('Mỗi đơn đặt tối đa 6 vé theo quy định vận chuyển.', 'Giới Hạn Vé');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '00:00';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Điểm đón & trả ưu tiên lấy từ tripDetail, nếu đang tải thì lấy ngay tức thì từ prop trip
  const pickupList = (tripDetail?.pickupPoints && tripDetail.pickupPoints.length > 0)
    ? tripDetail.pickupPoints
    : (trip.pickupPoints || []);

  const dropoffList = (tripDetail?.dropoffPoints && tripDetail.dropoffPoints.length > 0)
    ? tripDetail.dropoffPoints
    : (trip.dropoffPoints || []);

  const pickupPointObj = pickupList.find((p) => p.id === selectedPickup);
  const dropoffPointObj = dropoffList.find((p) => p.id === selectedDropoff);

  const totalPrice = selectedSeats.length * trip.price;

  const handleProceedBooking = () => {
    onBook(trip, selectedSeats, {
      pickup: selectedPickup,
      dropoff: selectedDropoff,
      pickupName: pickupPointObj?.name || trip.originCity,
      dropoffName: dropoffPointObj?.name || trip.destinationCity,
    });
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? '#111827' : '#ffffff',
        borderRadius: '14px',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.03)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Main Trip Card Header */}
      <div style={{ padding: '20px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 2fr 1.1fr',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Column 1: Bus Company Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <img
                src={trip.busCompanyLogo || 'https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289372/traveleasy/bus-companies/logo_futa_buslines.jpg'}
                alt={trip.busCompanyName}
                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {trip.busCompanyName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                  color: isDark ? '#4ade80' : '#166534',
                  border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : 'none',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ShieldCheck size={12} /> Cam kết giữ chỗ
              </span>

              <span
                style={{
                  fontSize: '12px',
                  color: '#d97706',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <Star size={13} fill="#f59e0b" color="#f59e0b" /> {(trip.busCompanyRating ?? 4.8).toFixed(1)}
                <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>(128)</span>
              </span>
            </div>

            <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
              {trip.busType === 'LIMOUSINE' ? 'Limousine VIP 34 phòng' : 'Giường nằm cao cấp 40 chỗ'}
            </div>
          </div>

          {/* Column 2: Timeline & Journey */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {formatTime(trip.departureTime)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}>
                  {trip.originCity}
                </div>
              </div>

              {/* Arrow Journey Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '2px' }}>
                  {trip.durationHours || 6} giờ di chuyển
                </span>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  <div style={{ flex: 1, height: '2px', backgroundColor: isDark ? '#334155' : '#cbd5e1' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                </div>
                <span style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#94a3b8', marginTop: '2px' }}>
                  {trip.distanceKm ? `${trip.distanceKm} km` : 'Tuyến cố định'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {formatTime(trip.arrivalTime)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}>
                  {trip.destinationCity}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Price & Action */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: isDark ? '#38bdf8' : '#2563eb' }}>
              {formatCurrency(trip.price)}
            </div>

            <div style={{
              fontSize: '12px',
              color: displayAvailableSeats === 0 ? '#ef4444' : (displayAvailableSeats < 10 ? '#ea580c' : '#16a34a'),
              fontWeight: 700,
              margin: '4px 0 10px 0'
            }}>
              {displayAvailableSeats > 0 ? `Còn ${displayAvailableSeats} chỗ trống` : 'Hết vé'}
            </div>

            <button
              onClick={displayAvailableSeats === 0 ? undefined : toggleExpand}
              disabled={displayAvailableSeats === 0}
              style={{
                backgroundColor: displayAvailableSeats === 0
                  ? (isDark ? '#334155' : '#cbd5e1')
                  : (expanded
                    ? (isDark ? '#1e293b' : '#f1f5f9')
                    : '#2563eb'),
                color: displayAvailableSeats === 0
                  ? (isDark ? '#94a3b8' : '#64748b')
                  : (expanded
                    ? (isDark ? '#f8fafc' : '#1e293b')
                    : '#ffffff'),
                border: expanded ? `1px solid ${isDark ? '#334155' : '#cbd5e1'}` : 'none',
                padding: '9px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: displayAvailableSeats === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {displayAvailableSeats === 0 ? 'Hết vé' : (expanded ? 'Đóng' : 'Chọn chuyến')}
              {displayAvailableSeats === 0 ? null : (expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </button>
          </div>
        </div>

        {/* Quick Links Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
            fontSize: '12px',
            fontWeight: 600,
            color: isDark ? '#94a3b8' : '#64748b',
          }}
        >
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('SEATS');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'SEATS' && expanded ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b') }}
          >
            Chỗ trống ({displayAvailableSeats})
          </span>
          <span>•</span>
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('IMAGES');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'IMAGES' && expanded ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b') }}
          >
            Hình ảnh xe
          </span>
          <span>•</span>
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('POLICY');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'POLICY' && expanded ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b') }}
          >
            Chính sách hủy đổi
          </span>
          <span>•</span>
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('REVIEWS');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'REVIEWS' && expanded ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b') }}
          >
            Đánh giá (128)
          </span>
        </div>
      </div>

      {/* Expanded Accordion Area */}
      {expanded && (
        <div style={{
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          padding: '20px 24px',
          color: isDark ? '#f8fafc' : '#0f172a',
          transition: 'all 0.25s ease'
        }}>
          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingBottom: '12px', marginBottom: '18px' }}>
            <button
              onClick={() => setActiveTab('SEATS')}
              style={{
                backgroundColor: activeTab === 'SEATS' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                border: activeTab === 'SEATS' ? `1px solid ${isDark ? '#38bdf8' : '#bfdbfe'}` : 'none',
                color: activeTab === 'SEATS' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '13px',
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Chọn Chỗ & Điểm Đón/Trả
            </button>
            <button
              onClick={() => setActiveTab('IMAGES')}
              style={{
                backgroundColor: activeTab === 'IMAGES' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                border: activeTab === 'IMAGES' ? `1px solid ${isDark ? '#38bdf8' : '#bfdbfe'}` : 'none',
                color: activeTab === 'IMAGES' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '13px',
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Hình Ảnh Xe
            </button>
            <button
              onClick={() => setActiveTab('POLICY')}
              style={{
                backgroundColor: activeTab === 'POLICY' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                border: activeTab === 'POLICY' ? `1px solid ${isDark ? '#38bdf8' : '#bfdbfe'}` : 'none',
                color: activeTab === 'POLICY' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '13px',
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Chính Sách Hủy Đổi
            </button>
            <button
              onClick={() => setActiveTab('REVIEWS')}
              style={{
                backgroundColor: activeTab === 'REVIEWS' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                border: activeTab === 'REVIEWS' ? `1px solid ${isDark ? '#38bdf8' : '#bfdbfe'}` : 'none',
                color: activeTab === 'REVIEWS' ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '13px',
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Đánh Giá & Nhận Xét
            </button>
          </div>

          {/* Persistent 10-Minute Active Hold Banner (Chuẩn Vexere) */}
          {activeHold && remainingHoldSeconds > 0 && (
            <div
              style={{
                backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                border: `1.5px solid ${isDark ? '#3b82f6' : '#2563eb'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 12px rgba(37,99,235,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>⏱️</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                    Bạn đang có phiên giữ chỗ cho ghế: <span style={{ textDecoration: 'underline' }}>{activeHold.seats.join(', ')}</span> ({activeHold.seats.length} vé)
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#4b5563', marginTop: '2px' }}>
                    Thời gian giữ chỗ còn lại: <strong style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: '14px' }}>
                      {Math.floor(remainingHoldSeconds / 60)}:{(remainingHoldSeconds % 60).toString().padStart(2, '0')}
                    </strong> (Ghế được giữ độc quyền cho bạn)
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleResumeCheckout}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
                  }}
                >
                  Tiếp Tục Đặt Vé ➔
                </button>
                <button
                  type="button"
                  onClick={handleCancelActiveHold}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy giữ chỗ
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: SEATS & STOPS */}
          {activeTab === 'SEATS' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                {/* Left: Seat Map */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                      Chọn vị trí ghế (Tối đa 6 vé/lần đặt)
                    </div>

                    {/* Live SSE Status Badge */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: sseConnected ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4') : (isDark ? '#1e293b' : '#f8fafc'),
                        border: sseConnected ? (isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #bbf7d0') : (isDark ? '1px solid #334155' : '1px solid #e2e8f0'),
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: sseConnected ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#94a3b8' : '#64748b'),
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: sseConnected ? '#22c55e' : '#94a3b8',
                          boxShadow: sseConnected ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : 'none',
                        }}
                      />
                      {sseConnected ? 'SSE Live: Đang đồng bộ thời gian thực' : 'Đang kết nối luồng...'}
                    </div>
                  </div>

                  {loadingDetail || !tripDetail ? (
                    <SeatMapSkeleton isDark={isDark} totalSeats={trip.totalSeats} />
                  ) : (
                    <>
                      {/* Interactive Demo Simulation Toolbar */}
                      <div
                        style={{
                          backgroundColor: isDark ? '#111827' : '#f8fafc',
                          border: isDark ? '1px dashed #334155' : '1px dashed #cbd5e1',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          marginBottom: '12px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isDark ? '#f8fafc' : '#1e293b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Zap size={14} color="#f59e0b" />
                            🧪 Thử Nghiệm Real-time (Đổi màu Vàng / Xám trực tiếp)
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowSimPanel(!showSimPanel)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: isDark ? '#38bdf8' : '#2563eb',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            {showSimPanel ? '▲ Đóng bảng thử' : '▼ Bật giả lập kiểm thử'}
                          </button>
                        </div>

                        {showSimPanel && (
                          <div
                            style={{
                              marginTop: '10px',
                              paddingTop: '8px',
                              borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }}>
                              Chọn ghế thử:
                            </span>
                            <select
                              value={simSeatNumber}
                              onChange={(e) => setSimSeatNumber(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                color: isDark ? '#f8fafc' : '#0f172a',
                              }}
                            >
                              {tripDetail.seats.map((s) => (
                                <option key={s.id} value={s.seatNumber}>
                                  Ghế {s.seatNumber} ({s.status === 'AVAILABLE' ? 'Trống' : s.status === 'LOCKED' ? 'Vàng' : 'Xám'})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              disabled={simulating}
                              onClick={() => handleSimulateAction('HOLD')}
                              title="Giả lập khách khác đang ở bước thanh toán giữ ghế"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #f59e0b',
                                backgroundColor: isDark ? '#451a03' : '#fef3c7',
                                color: isDark ? '#fbbf24' : '#b45309',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: simulating ? 'not-allowed' : 'pointer',
                              }}
                            >
                              🟡 Đổi Vàng (Đang TT)
                            </button>

                            <button
                              type="button"
                              disabled={simulating}
                              onClick={() => handleSimulateAction('BOOK')}
                              title="Giả lập khách khác đã thanh toán vé thành công"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: isDark ? '1px solid #475569' : '1px solid #94a3b8',
                                backgroundColor: isDark ? '#334155' : '#cbd5e1',
                                color: isDark ? '#cbd5e1' : '#334155',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: simulating ? 'not-allowed' : 'pointer',
                              }}
                            >
                              ⚫ Đổi Xám (Đã Bán)
                            </button>

                            <button
                              type="button"
                              disabled={simulating}
                              onClick={() => handleSimulateAction('RELEASE')}
                              title="Mở lại ghế về trống"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: isDark ? '1px solid #1d4ed8' : '1px solid #3b82f6',
                                backgroundColor: isDark ? 'rgba(30,58,138,0.3)' : '#eff6ff',
                                color: isDark ? '#93c5fd' : '#1d4ed8',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: simulating ? 'not-allowed' : 'pointer',
                              }}
                            >
                              ⚪ Trả Về Trống
                            </button>
                          </div>
                        )}
                      </div>

                      <BusSeatMap
                        seats={tripDetail.seats}
                        selectedSeatNumbers={selectedSeats}
                        onToggleSeat={handleToggleSeat}
                        myHeldSeats={activeHold ? activeHold.seats : []}
                      />
                    </>
                  )}
                </div>

                    {/* Right: Pickup & Dropoff Selection */}
                    <div>
                      {/* Pickup Selection */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '8px' }}>
                          Điểm đón tại {trip.originCity}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {pickupList.map((pt) => (
                            <label
                              key={pt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                backgroundColor: selectedPickup === pt.id ? (isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff') : (isDark ? '#1e293b' : '#ffffff'),
                                border: selectedPickup === pt.id ? `1px solid ${isDark ? '#38bdf8' : '#2563eb'}` : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={`pickup-${trip.id}`}
                                checked={selectedPickup === pt.id}
                                onChange={() => setSelectedPickup(pt.id)}
                                style={{ marginTop: '3px', accentColor: '#2563eb' }}
                              />
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                                  {pt.name}
                                </div>
                                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>{pt.address}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Dropoff Selection */}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '8px' }}>
                          Điểm trả tại {trip.destinationCity}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dropoffList.map((pt) => (
                            <label
                              key={pt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                backgroundColor: selectedDropoff === pt.id ? (isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff') : (isDark ? '#1e293b' : '#ffffff'),
                                border: selectedDropoff === pt.id ? `1px solid ${isDark ? '#38bdf8' : '#2563eb'}` : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={`dropoff-${trip.id}`}
                                checked={selectedDropoff === pt.id}
                                onChange={() => setSelectedDropoff(pt.id)}
                                style={{ marginTop: '3px', accentColor: '#2563eb' }}
                              />
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                                  {pt.name}
                                </div>
                                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>{pt.address}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer for Active Hold Session */}
                  {activeHold && remainingHoldSeconds > 0 && selectedSeats.length === 0 && (
                    <div
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                        border: `1.5px solid ${isDark ? '#3b82f6' : '#2563eb'}`,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', color: isDark ? '#93c5fd' : '#1e40af', fontWeight: 700 }}>
                          ⭐ Bạn đang giữ chỗ các ghế: <strong style={{ color: '#2563eb', fontSize: '15px' }}>{activeHold.seats.join(', ')}</strong> ({activeHold.seats.length} vé)
                        </div>
                        <div style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#475569', marginTop: '2px' }}>
                          Thời gian giữ chỗ còn lại: <strong style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: '14px' }}>
                            {Math.floor(remainingHoldSeconds / 60)}:{(remainingHoldSeconds % 60).toString().padStart(2, '0')}
                          </strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={handleResumeCheckout}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                          }}
                        >
                          Tiếp Tục Đặt Vé ➔
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelActiveHold}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #fca5a5',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Hủy giữ chỗ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Footer for Selected Seats */}
                  {selectedSeats.length > 0 && (
                    <div
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(37,99,235,0.1)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#64748b' }}>
                          Ghế đã chọn: <strong style={{ color: isDark ? '#38bdf8' : '#2563eb' }}>{selectedSeats.join(', ')}</strong> ({selectedSeats.length} vé)
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                          Tổng tạm tính: {formatCurrency(totalPrice)}
                        </div>
                      </div>

                      <button
                        onClick={handleProceedBooking}
                        style={{
                          backgroundColor: localStorage.getItem('traveleasy_token') ? '#f97316' : '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '12px 28px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '15px',
                          cursor: 'pointer',
                          boxShadow: localStorage.getItem('traveleasy_token') ? '0 4px 6px -1px rgba(249, 115, 22, 0.4)' : '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {localStorage.getItem('traveleasy_token') ? 'Tiếp Tục Đặt Vé →' : 'Đăng Nhập Để Đặt Vé →'}
                      </button>
                    </div>
                  )}
            </div>
          )}

          {/* TAB 2: IMAGES */}
          {activeTab === 'IMAGES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <img
                src="https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289365/traveleasy/banners/banner_hero_dalat_mongmo.jpg"
                alt="Nội thất xe"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <img
                src="https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289364/traveleasy/banners/banner_hero_sapa_fansipan.jpg"
                alt="Ghế nằm VIP"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <img
                src="https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289367/traveleasy/banners/banner_hero_tet_payos.jpg"
                alt="Cabin tiện nghi"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}

          {/* TAB 3: POLICY */}
          {activeTab === 'POLICY' && (
            <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, fontSize: '13px', lineHeight: 1.6 }}>
              <h4 style={{ fontWeight: 700, margin: '0 0 8px 0', color: isDark ? '#f8fafc' : '#0f172a' }}>
                Chính sách hủy đổi vé chuẩn Vexere & TravelEasy
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: isDark ? '#cbd5e1' : '#475569' }}>
                <li>Hủy trước 24 giờ so với giờ khởi hành: Hoàn tiền 90% (phí hủy 10%).</li>
                <li>Hủy từ 12 đến 24 giờ trước khởi hành: Hoàn tiền 70% (phí hủy 30%).</li>
                <li>Hủy dưới 12 giờ trước giờ khởi hành: Không hỗ trợ hoàn tiền.</li>
                <li>Hỗ trợ đổi ngày / đổi chuyến miễn phí trước giờ chạy 2 tiếng (chính sách PBD-02).</li>
              </ul>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'REVIEWS' && (
            <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>4.8</span>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>Dựa trên 128 đánh giá thực tế</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`, paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    <span>Nguyễn Văn An</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>19/10/2026</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', color: isDark ? '#cbd5e1' : '#475569' }}>
                    Xe chạy êm, bác tài lái rất cẩn thận, đón đúng giờ tại bến xe Miền Tây. Sẽ tiếp tục ủng hộ!
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    <span>Trần Thị Hương</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>17/10/2026</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', color: isDark ? '#cbd5e1' : '#475569' }}>
                    Khoang nằm VIP sạch sẽ, có nước uống và sạc điện thoại. Đặt vé trực tuyến rất tiện lợi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

