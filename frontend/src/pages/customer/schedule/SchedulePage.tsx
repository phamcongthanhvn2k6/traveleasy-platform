import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { RouteScheduleResponse, ScheduleTripItem, Point } from '../../../types';
import { 
  Bus, 
  MapPin, 
  ArrowRight, 
  ArrowLeftRight, 
  Clock, 
  Calendar, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  CheckCircle2, 
  Info,
  Sparkles,
  Compass,
  Search,
  Navigation,
  ShieldCheck
} from 'lucide-react';

type DirectionTab = 'OUTBOUND' | 'INBOUND';
type TimeSlot = 'ALL' | 'EARLY' | 'MORNING' | 'AFTERNOON' | 'EVENING';

const POPULAR_ROUTES = [
  { origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt', label: 'Sài Gòn ⇄ Đà Lạt', distance: '305 km', time: '6.5h' },
  { origin: 'Hà Nội', destination: 'Sa Pa', label: 'Hà Nội ⇄ Sa Pa', distance: '315 km', time: '5.5h' },
  { origin: 'TP. Hồ Chí Minh', destination: 'Vũng Tàu', label: 'Sài Gòn ⇄ Vũng Tàu', distance: '105 km', time: '2.0h' },
  { origin: 'TP. Hồ Chí Minh', destination: 'Nha Trang', label: 'Sài Gòn ⇄ Nha Trang', distance: '435 km', time: '8.0h' },
  { origin: 'Hà Nội', destination: 'Hải Phòng', label: 'Hà Nội ⇄ Hải Phòng', distance: '120 km', time: '1.5h' },
  { origin: 'Đà Nẵng', destination: 'Huế', label: 'Đà Nẵng ⇄ Huế', distance: '100 km', time: '2.5h' },
];

export const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search queries from URL or defaults
  const paramOrigin = searchParams.get('origin') || 'TP. Hồ Chí Minh';
  const paramDestination = searchParams.get('destination') || 'Đà Lạt';

  const [origin, setOrigin] = useState(paramOrigin);
  const [destination, setDestination] = useState(paramDestination);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<RouteScheduleResponse | null>(null);

  // Filter & UI States
  const [activeTab, setActiveTab] = useState<DirectionTab>('OUTBOUND');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('ALL');
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  // Sync state with URL params
  useEffect(() => {
    setOrigin(paramOrigin);
    setDestination(paramDestination);
    fetchSchedule(paramOrigin, paramDestination);
  }, [paramOrigin, paramDestination]);

  const fetchSchedule = async (fromCity: string, toCity: string) => {
    try {
      setLoading(true);
      const res = await api.get('/trips/schedule', {
        params: {
          origin: fromCity,
          destination: toCity
        }
      });
      if (res.data && res.data.data) {
        setScheduleData(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng lịch trình:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    setSearchParams({ origin, destination });
  };

  const handleSwapLocations = () => {
    const newOrigin = destination;
    const newDestination = origin;
    setOrigin(newOrigin);
    setDestination(newDestination);
    setSearchParams({ origin: newOrigin, destination: newDestination });
  };

  const handleSelectPopularRoute = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    setSearchParams({ origin: from, destination: to });
  };

  const handlePrint = () => {
    window.print();
  };

  // Switch between Outbound and Inbound trips
  const currentTrips: ScheduleTripItem[] = useMemo(() => {
    if (!scheduleData) return [];
    const trips = activeTab === 'OUTBOUND' ? scheduleData.outboundTrips : scheduleData.inboundTrips;
    if (!trips) return [];

    return trips.filter(trip => {
      if (timeSlot === 'ALL') return true;
      const hour = new Date(trip.departureTime).getHours();
      if (timeSlot === 'EARLY') return hour >= 0 && hour < 6;
      if (timeSlot === 'MORNING') return hour >= 6 && hour < 12;
      if (timeSlot === 'AFTERNOON') return hour >= 12 && hour < 18;
      if (timeSlot === 'EVENING') return hour >= 18 && hour < 24;
      return true;
    });
  }, [scheduleData, activeTab, timeSlot]);

  const toggleAccordion = (tripId: number) => {
    setExpandedTripId(prev => (prev === tripId ? null : tripId));
  };

  const currentDirectionLabel = activeTab === 'OUTBOUND' 
    ? `${scheduleData?.originCity || origin} ➔ ${scheduleData?.destinationCity || destination}`
    : `${scheduleData?.destinationCity || destination} ➔ ${scheduleData?.originCity || origin}`;

  return (
    <div className="schedule-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print, header, footer, .navbar-container { display: none !important; }
          .schedule-page { background: #fff !important; padding: 0 !important; }
          .schedule-card { box-shadow: none !important; border: 1px solid #cbd5e1 !important; page-break-inside: avoid; }
          body { font-size: 12pt; color: #000; }
        }
      `}</style>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', padding: '36px 20px', position: 'relative' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
              <Compass size={14} /> Mạng Lưới Tuyến Xe Liên Tỉnh Toàn Quốc
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Lịch Trình & Bảng Giờ Chạy Xe Khách
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', maxWidth: '600px' }}>
              Tra cứu chính xác giờ xuất bến, điểm đón/trả dọc đường và tần suất xe chạy định kỳ giữa các tỉnh thành phố.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="no-print"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#1e3a8a',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <Printer size={16} /> In / Lưu Bảng Giờ
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1140px', margin: '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Route Selector Box */}
        <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Origin Input */}
            <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                📍 Nơi Đi
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  list="origins-list"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <datalist id="origins-list">
                  {scheduleData?.availableOrigins?.map((city, idx) => (
                    <option key={idx} value={city} />
                  ))}
                </datalist>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#2563eb' }} />
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapLocations}
              title="Đảo chiều Nơi đi ⇄ Nơi đến"
              style={{
                alignSelf: 'flex-end',
                marginBottom: '2px',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <ArrowLeftRight size={18} />
            </button>

            {/* Destination Input */}
            <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                🏁 Nơi Đến
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  list="destinations-list"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ví dụ: Đà Lạt"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <datalist id="destinations-list">
                  {scheduleData?.availableDestinations?.map((city, idx) => (
                    <option key={idx} value={city} />
                  ))}
                </datalist>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 22px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  height: '42px'
                }}
              >
                <Search size={16} /> Xem Lịch Trình
              </button>
            </div>
          </form>

          {/* Popular shortcuts */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Tuyến phổ biến:</span>
            {POPULAR_ROUTES.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPopularRoute(r.origin, r.destination)}
                style={{
                  background: (origin === r.origin && destination === r.destination) ? '#dbeafe' : '#f1f5f9',
                  color: (origin === r.origin && destination === r.destination) ? '#1d4ed8' : '#334155',
                  border: (origin === r.origin && destination === r.destination) ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Route Overview Metric Banner */}
        {scheduleData && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '18px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Thông Tin Tuyến Đường</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{scheduleData.originCity}</span>
                <ArrowLeftRight size={18} style={{ color: '#2563eb' }} />
                <span>{scheduleData.destinationCity}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cự Ly</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{scheduleData.distanceKm} km</div>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Thời Gian Chạy</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>~{scheduleData.durationHours} giờ</div>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tần Suất Chạy</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>{scheduleData.frequency}</div>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Giá Vé Dao Động</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#d97706' }}>
                  {scheduleData.minPrice.toLocaleString('vi-VN')}đ - {scheduleData.maxPrice.toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Direction Tabs (Round-Trip Switcher) */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
          <button
            onClick={() => setActiveTab('OUTBOUND')}
            style={{
              padding: '10px 18px',
              fontSize: '14.5px',
              fontWeight: activeTab === 'OUTBOUND' ? 700 : 600,
              color: activeTab === 'OUTBOUND' ? '#2563eb' : '#64748b',
              backgroundColor: activeTab === 'OUTBOUND' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'OUTBOUND' ? '3px solid #2563eb' : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Bus size={17} />
            <span>Chiều Đi: {scheduleData?.originCity || origin} ➔ {scheduleData?.destinationCity || destination}</span>
            <span style={{
              backgroundColor: activeTab === 'OUTBOUND' ? '#dbeafe' : '#f1f5f9',
              color: activeTab === 'OUTBOUND' ? '#1d4ed8' : '#64748b',
              fontSize: '11.5px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 700
            }}>
              {scheduleData?.outboundTrips?.length || 0} chuyến
            </span>
          </button>

          <button
            onClick={() => setActiveTab('INBOUND')}
            style={{
              padding: '10px 18px',
              fontSize: '14.5px',
              fontWeight: activeTab === 'INBOUND' ? 700 : 600,
              color: activeTab === 'INBOUND' ? '#2563eb' : '#64748b',
              backgroundColor: activeTab === 'INBOUND' ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'INBOUND' ? '3px solid #2563eb' : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Bus size={17} style={{ transform: 'scaleX(-1)' }} />
            <span>Chiều Về: {scheduleData?.destinationCity || destination} ➔ {scheduleData?.originCity || origin}</span>
            <span style={{
              backgroundColor: activeTab === 'INBOUND' ? '#dbeafe' : '#f1f5f9',
              color: activeTab === 'INBOUND' ? '#1d4ed8' : '#64748b',
              fontSize: '11.5px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 700
            }}>
              {scheduleData?.inboundTrips?.length || 0} chuyến
            </span>
          </button>
        </div>

        {/* Minimalist Time-Slot Filter Chips */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>Lọc giờ khởi hành:</span>
          {[
            { key: 'ALL', label: 'Tất cả các giờ' },
            { key: 'EARLY', label: '🌅 Sáng sớm (00h - 06h)' },
            { key: 'MORNING', label: '☀️ Buổi sáng (06h - 12h)' },
            { key: 'AFTERNOON', label: '🌤️ Buổi chiều (12h - 18h)' },
            { key: 'EVENING', label: '🌙 Buổi tối (18h - 24h)' },
          ].map(slot => (
            <button
              key={slot.key}
              onClick={() => setTimeSlot(slot.key as TimeSlot)}
              style={{
                backgroundColor: timeSlot === slot.key ? '#1e293b' : '#fff',
                color: timeSlot === slot.key ? '#fff' : '#475569',
                border: timeSlot === slot.key ? '1px solid #1e293b' : '1px solid #cbd5e1',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Đang tải bảng lịch trình xuất bến...</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty State */}
        {!loading && currentTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Info size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>Không tìm thấy chuyến xe phù hợp với khung giờ</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
              Hãy thử chọn khung giờ khác hoặc liên hệ hotline 1900 6868 để được hỗ trợ sắp xếp chuyến.
            </p>
            <button
              onClick={() => setTimeSlot('ALL')}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Xem tất cả các khung giờ
            </button>
          </div>
        )}

        {/* Timetable Matrix Card List */}
        {!loading && currentTrips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentTrips.map((trip) => {
              const isExpanded = expandedTripId === trip.id;
              const hasStops = (trip.pickupPoints && trip.pickupPoints.length > 0) || (trip.dropoffPoints && trip.dropoffPoints.length > 0);

              return (
                <div
                  key={trip.id}
                  className="schedule-card"
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Left: Time Timeline */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {trip.departureTimeFormatted || new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', maxWidth: '140px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={trip.mainPickupPoint}>
                            {trip.mainPickupPoint || trip.originCity}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', marginBottom: '4px' }}>
                            {trip.durationFormatted || '6.0h'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ height: '2px', backgroundColor: '#cbd5e1', flex: 1 }} />
                            <ArrowRight size={14} style={{ color: '#2563eb', margin: '0 -2px' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {trip.arrivalTimeFormatted || new Date(trip.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', maxWidth: '140px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={trip.mainDropoffPoint}>
                            {trip.mainDropoffPoint || trip.destinationCity}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Bus Company & Vehicle Type */}
                      <div style={{ flex: '1 1 200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{trip.busCompanyName}</span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            <Star size={11} fill="#b45309" /> 4.9
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#2563eb',
                            backgroundColor: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #dbeafe'
                          }}>
                            {trip.busTypeName || 'Limousine 34 Phòng'}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: trip.availableSeats > 5 ? '#059669' : '#dc2626',
                            backgroundColor: trip.availableSeats > 5 ? '#ecfdf5' : '#fef2f2',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            Còn {trip.availableSeats} chỗ trống
                          </span>
                        </div>
                      </div>

                      {/* Right: Price & Book Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>
                            {trip.price.toLocaleString('vi-VN')} đ
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Đã gồm VAT & bảo hiểm</div>
                        </div>

                        <button
                          onClick={() => {
                            // Navigate directly to Search / Seat selection with trip pre-selected
                            const depDateStr = new Date(trip.departureTime).toISOString().split('T')[0];
                            navigate(`/search?origin=${encodeURIComponent(trip.originCity)}&destination=${encodeURIComponent(trip.destinationCity)}&date=${depDateStr}&tripId=${trip.id}`);
                          }}
                          className="no-print"
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Đặt Chuyến Này <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Accordion Action */}
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleAccordion(trip.id)}
                        className="no-print"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: 0
                        }}
                      >
                        <MapPin size={14} />
                        <span>{isExpanded ? 'Thu gọn danh sách điểm đón/trả' : 'Xem danh sách điểm đón & trả dọc đường'}</span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>

                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                        <span>Chạy đúng giờ cam kết</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Stops Accordion */}
                  {isExpanded && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {/* Pickup Points */}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
                            <span>ĐIỂM ĐÓN KHÁCH (Lên xe)</span>
                          </div>
                          {trip.pickupPoints && trip.pickupPoints.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #a7f3d0', paddingLeft: '14px', marginLeft: '4px' }}>
                              {trip.pickupPoints.map((pt, i) => (
                                <div key={pt.id || i} style={{ position: 'relative' }}>
                                  <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', border: '2px solid #fff' }} />
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{pt.name}</div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{pt.address}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Bến xe trung tâm {trip.originCity}</div>
                          )}
                        </div>

                        {/* Dropoff Points */}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                            <span>ĐIỂM TRẢ KHÁCH (Xuống xe)</span>
                          </div>
                          {trip.dropoffPoints && trip.dropoffPoints.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #fecaca', paddingLeft: '14px', marginLeft: '4px' }}>
                              {trip.dropoffPoints.map((pt, i) => (
                                <div key={pt.id || i} style={{ position: 'relative' }}>
                                  <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', border: '2px solid #fff' }} />
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{pt.name}</div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{pt.address}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Bến xe trung tâm {trip.destinationCity}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Commitment Footer Notice */}
        <div style={{ marginTop: '28px', backgroundColor: '#eff6ff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldCheck size={28} style={{ color: '#2563eb', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.5 }}>
            <strong>Cam kết chất lượng vận hành TravelEasy:</strong> Giờ xuất bến được đồng bộ trực tiếp từ hệ thống điều vận của nhà xe. Quý khách vui lòng có mặt tại điểm đón trước <strong>15 - 30 phút</strong> để thuận tiện lên xe.
          </div>
        </div>
      </div>
    </div>
  );
};
