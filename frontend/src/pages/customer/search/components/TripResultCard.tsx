import React, { useState, useEffect } from 'react';
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

export const TripResultCard: React.FC<Props> = ({ trip, onBook }) => {
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

  // Lắng nghe luồng SSE cập nhật ghế theo thời gian thực
  useEffect(() => {
    if (!expanded || activeTab !== 'SEATS') {
      setSseConnected(false);
      return;
    }

    const sseUrl = `/api/v1/trips/${trip.id}/seats/stream`;
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
    if (!expanded && !tripDetail) {
      setLoadingDetail(true);
      try {
        const res = await api.get(`/trips/${trip.id}`);
        const data = res.data.data;
        setTripDetail(data);
        if (data.pickupPoints?.length > 0) {
          setSelectedPickup(data.pickupPoints[0].id);
        }
        if (data.dropoffPoints?.length > 0) {
          setSelectedDropoff(data.dropoffPoints[0].id);
        }
      } catch (err) {
        console.error('Failed to load trip detail:', err);
      } finally {
        setLoadingDetail(false);
      }
    }
    setExpanded(!expanded);
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

  const pickupPointObj = tripDetail?.pickupPoints.find((p) => p.id === selectedPickup);
  const dropoffPointObj = tripDetail?.dropoffPoints.find((p) => p.id === selectedDropoff);

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
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
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
                src={trip.busCompanyLogo || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150'}
                alt={trip.busCompanyName}
                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {trip.busCompanyName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
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
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>(128)</span>
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              {trip.busType === 'LIMOUSINE' ? 'Limousine VIP 34 phòng' : 'Giường nằm cao cấp 40 chỗ'}
            </div>
          </div>

          {/* Column 2: Timeline & Journey */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {formatTime(trip.departureTime)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  {trip.originCity}
                </div>
              </div>

              {/* Arrow Journey Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>
                  {trip.durationHours || 6} giờ di chuyển
                </span>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  <div style={{ flex: 1, height: '2px', backgroundColor: '#cbd5e1' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  {trip.distanceKm ? `${trip.distanceKm} km` : 'Tuyến cố định'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {formatTime(trip.arrivalTime)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  {trip.destinationCity}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Price & Action */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb' }}>
              {formatCurrency(trip.price)}
            </div>

            <div style={{ fontSize: '12px', color: trip.availableSeats < 10 ? '#ea580c' : '#16a34a', fontWeight: 700, margin: '4px 0 10px 0' }}>
              {trip.availableSeats > 0 ? `Còn ${trip.availableSeats} chỗ trống` : 'Hết vé'}
            </div>

            <button
              onClick={toggleExpand}
              style={{
                backgroundColor: expanded ? '#f1f5f9' : '#2563eb',
                color: expanded ? '#1e293b' : '#ffffff',
                border: expanded ? '1px solid #cbd5e1' : 'none',
                padding: '9px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {expanded ? 'Đóng' : 'Chọn chuyến'}
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
            borderTop: '1px solid #f1f5f9',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('SEATS');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'SEATS' && expanded ? '#2563eb' : '#64748b' }}
          >
            Chỗ trống ({trip.availableSeats})
          </span>
          <span>•</span>
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('IMAGES');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'IMAGES' && expanded ? '#2563eb' : '#64748b' }}
          >
            Hình ảnh xe
          </span>
          <span>•</span>
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('POLICY');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'POLICY' && expanded ? '#2563eb' : '#64748b' }}
          >
            Chính sách hủy đổi
          </span>
          <span>•</span>
          <span
            onClick={() => {
              if (!expanded) toggleExpand();
              setActiveTab('REVIEWS');
            }}
            style={{ cursor: 'pointer', color: activeTab === 'REVIEWS' && expanded ? '#2563eb' : '#64748b' }}
          >
            Đánh giá (128)
          </span>
        </div>
      </div>

      {/* Expanded Accordion Area */}
      {expanded && (
        <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '20px 24px' }}>
          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
            <button
              onClick={() => setActiveTab('SEATS')}
              style={{
                backgroundColor: activeTab === 'SEATS' ? '#ffffff' : 'transparent',
                border: activeTab === 'SEATS' ? '1px solid #bfdbfe' : 'none',
                color: activeTab === 'SEATS' ? '#2563eb' : '#64748b',
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
                backgroundColor: activeTab === 'IMAGES' ? '#ffffff' : 'transparent',
                border: activeTab === 'IMAGES' ? '1px solid #bfdbfe' : 'none',
                color: activeTab === 'IMAGES' ? '#2563eb' : '#64748b',
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
                backgroundColor: activeTab === 'POLICY' ? '#ffffff' : 'transparent',
                border: activeTab === 'POLICY' ? '1px solid #bfdbfe' : 'none',
                color: activeTab === 'POLICY' ? '#2563eb' : '#64748b',
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
                backgroundColor: activeTab === 'REVIEWS' ? '#ffffff' : 'transparent',
                border: activeTab === 'REVIEWS' ? '1px solid #bfdbfe' : 'none',
                color: activeTab === 'REVIEWS' ? '#2563eb' : '#64748b',
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

          {/* TAB 1: SEATS & STOPS */}
          {activeTab === 'SEATS' && (
            <div>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Đang tải sơ đồ ghế và điểm đón trả...
                </div>
              ) : tripDetail ? (
                <div>
                  {/* Grid 2 Columns: Left is Bus Seat Map, Right is Pickup/Dropoff selection */}
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
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          Chọn vị trí ghế (Tối đa 6 vé/lần đặt)
                        </div>

                        {/* Live SSE Status Badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: sseConnected ? '#f0fdf4' : '#f8fafc',
                            border: sseConnected ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: sseConnected ? '#15803d' : '#64748b',
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

                      {/* Interactive Demo Simulation Toolbar */}
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px dashed #cbd5e1',
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
                              color: '#1e293b',
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
                              color: '#2563eb',
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
                              borderTop: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                              Chọn ghế thử:
                            </span>
                            <select
                              value={simSeatNumber}
                              onChange={(e) => setSimSeatNumber(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: '#ffffff',
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
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
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
                                border: '1px solid #94a3b8',
                                backgroundColor: '#cbd5e1',
                                color: '#334155',
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
                                border: '1px solid #3b82f6',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
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
                      />
                    </div>

                    {/* Right: Pickup & Dropoff Selection */}
                    <div>
                      {/* Pickup Selection */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                          Điểm đón tại {trip.originCity}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {tripDetail.pickupPoints.map((pt) => (
                            <label
                              key={pt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                backgroundColor: selectedPickup === pt.id ? '#eff6ff' : '#ffffff',
                                border: selectedPickup === pt.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
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
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                  {pt.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{pt.address}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Dropoff Selection */}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                          Điểm trả tại {trip.destinationCity}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {tripDetail.dropoffPoints.map((pt) => (
                            <label
                              key={pt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                backgroundColor: selectedDropoff === pt.id ? '#eff6ff' : '#ffffff',
                                border: selectedDropoff === pt.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
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
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                  {pt.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{pt.address}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer for Selected Seats */}
                  {selectedSeats.length > 0 && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 6px -1px rgba(37,99,235,0.1)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Ghế đã chọn: <strong style={{ color: '#2563eb' }}>{selectedSeats.join(', ')}</strong> ({selectedSeats.length} vé)
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                          Tổng tạm tính: {formatCurrency(totalPrice)}
                        </div>
                      </div>

                      <button
                        onClick={handleProceedBooking}
                        style={{
                          backgroundColor: '#f97316',
                          color: '#ffffff',
                          border: 'none',
                          padding: '12px 28px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '15px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.4)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Tiếp Tục Đặt Vé →
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: IMAGES */}
          {activeTab === 'IMAGES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80"
                alt="Nội thất xe"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <img
                src="https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&auto=format&fit=crop&q=80"
                alt="Ghế nằm VIP"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <img
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80"
                alt="Cabin tiện nghi"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}

          {/* TAB 3: POLICY */}
          {activeTab === 'POLICY' && (
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: 1.6 }}>
              <h4 style={{ fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>
                Chính sách hủy đổi vé chuẩn Vexere & TravelEasy
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569' }}>
                <li>Hủy trước 24 giờ so với giờ khởi hành: Hoàn tiền 90% (phí hủy 10%).</li>
                <li>Hủy từ 12 đến 24 giờ trước khởi hành: Hoàn tiền 70% (phí hủy 30%).</li>
                <li>Hủy dưới 12 giờ trước giờ khởi hành: Không hỗ trợ hoàn tiền.</li>
                <li>Hỗ trợ đổi ngày / đổi chuyến miễn phí trước giờ chạy 2 tiếng (chính sách PBD-02).</li>
              </ul>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'REVIEWS' && (
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>4.8</span>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Dựa trên 128 đánh giá thực tế</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                    <span>Nguyễn Văn An</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>19/10/2026</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
                    Xe chạy êm, bác tài lái rất cẩn thận, đón đúng giờ tại bến xe Miền Tây. Sẽ tiếp tục ủng hộ!
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                    <span>Trần Thị Hương</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>17/10/2026</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
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

