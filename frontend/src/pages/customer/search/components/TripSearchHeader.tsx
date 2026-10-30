import React, { useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { ArrowLeftRight, Calendar, ChevronLeft, ChevronRight, Search, MapPin } from 'lucide-react';

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  totalTrips: number;
  onSearchChange: (origin: string, destination: string, date: string) => void;
}

export const TripSearchHeader: React.FC<Props> = ({
  origin,
  destination,
  departureDate,
  totalTrips,
  onSearchChange,
}) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(true);
  const [tempOrigin, setTempOrigin] = useState(origin);
  const [tempDestination, setTempDestination] = useState(destination);
  const [tempDate, setTempDate] = useState(departureDate);

  // Synchronize internal state with incoming props
  React.useEffect(() => {
    setTempOrigin(origin);
    setTempDestination(destination);
    setTempDate(departureDate);
  }, [origin, destination, departureDate]);

  const popularCities = [
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Sa Pa',
    'Nha Trang',
    'Đà Nẵng',
    'Vũng Tàu',
    'Hải Phòng',
    'Cần Thơ',
    'Quy Nhơn',
    'Huế',
    'Phan Thiết',
  ];

  const handleSwap = () => {
    const swap = tempOrigin;
    setTempOrigin(tempDestination);
    setTempDestination(swap);
  };

  const handleApplyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(tempOrigin, tempDestination, tempDate);
  };

  const handleShowAll = () => {
    setTempOrigin('');
    setTempDestination('');
    setTempDate('');
    onSearchChange('', '', '');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const changeDateByDays = (days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = departureDate ? new Date(departureDate) : new Date();
    current.setDate(current.getDate() + days);
    if (current < today) {
      return;
    }
    const newDateStr = current.toISOString().split('T')[0];
    onSearchChange(origin, destination, newDateStr);
  };

  const formatDateVietnamese = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? '#111827' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.03)',
        marginBottom: '20px',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 20px' }}>
        {/* Top line: Route title & Change search button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500, marginBottom: '2px' }}>
              Vé xe khách <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>/</span> {!origin && !destination ? 'Tất cả tuyến đường toàn quốc' : 'Tuyến đường đang chọn'}
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: isDark ? '#f8fafc' : '#0f172a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {!origin && !destination ? (
                <span>Toàn bộ chuyến xe toàn quốc</span>
              ) : (
                <>
                  <span>{origin || 'Tất cả điểm đi'}</span>
                  <span style={{ color: isDark ? '#38bdf8' : '#2563eb' }}>→</span>
                  <span>{destination || 'Tất cả điểm đến'}</span>
                </>
              )}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                  color: isDark ? '#38bdf8' : '#2563eb',
                  border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                {totalTrips} chuyến
              </span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(origin || destination || departureDate) && (
              <button
                type="button"
                onClick={handleShowAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fef2f2',
                  color: isDark ? '#f87171' : '#dc2626',
                  border: isDark ? '1px solid rgba(220, 38, 38, 0.35)' : '1px solid #fecaca',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Bỏ lọc để xem toàn bộ danh sách chuyến xe trên toàn hệ thống"
              >
                ✕ Xem toàn bộ tuyến
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isEditing
                  ? (isDark ? '#1e293b' : '#f1f5f9')
                  : (isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff'),
                color: isDark ? '#60a5fa' : '#2563eb',
                border: isDark ? '1px solid #334155' : '1px solid #bfdbfe',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Search size={16} />
              {isEditing ? 'Đóng bộ tìm kiếm' : 'Đổi hành trình'}
            </button>
          </div>
        </div>

        {/* Collapsible Edit Search Form */}
        {isEditing && (
          <form
            onSubmit={handleApplyEdit}
            style={{
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px',
              display: 'grid',
              gridTemplateColumns: '1.2fr auto 1.2fr 1fr auto',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            {/* Origin */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                Nơi xuất phát
              </label>
              <select
                value={tempOrigin}
                onChange={(e) => setTempOrigin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                <option value="">Tất cả điểm xuất phát (Toàn quốc)</option>
                {popularCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <div style={{ paddingTop: '16px' }}>
              <button
                type="button"
                onClick={handleSwap}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Đảo chiều nơi xuất phát và nơi đến"
              >
                <ArrowLeftRight size={16} color={isDark ? '#94a3b8' : '#475569'} />
              </button>
            </div>

            {/* Destination */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                Nơi đến
              </label>
              <select
                value={tempDestination}
                onChange={(e) => setTempDestination(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                <option value="">Tất cả điểm đến (Toàn quốc)</option>
                {popularCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                Ngày đi (tùy chọn)
              </label>
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ paddingTop: '16px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                Tìm Chuyến
              </button>
            </div>
          </form>
        )}

        {/* Date Stepper Bar: Hôm qua | [Thứ Tư, 21/10/2026] | Ngày mai | Bỏ lọc ngày */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          {departureDate ? (
            <>
              <button
                disabled={Boolean(departureDate && departureDate <= todayStr)}
                onClick={() => changeDateByDays(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: Boolean(departureDate && departureDate <= todayStr) ? '#f1f5f9' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Boolean(departureDate && departureDate <= todayStr) ? '#94a3b8' : '#475569',
                  cursor: Boolean(departureDate && departureDate <= todayStr) ? 'not-allowed' : 'pointer',
                  opacity: Boolean(departureDate && departureDate <= todayStr) ? 0.6 : 1,
                }}
                title={Boolean(departureDate && departureDate <= todayStr) ? 'Không thể tìm chuyến cho ngày trong quá khứ' : 'Xem ngày hôm trước'}
              >
                <ChevronLeft size={16} /> Hôm trước
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '6px 18px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                <Calendar size={15} />
                <span>{formatDateVietnamese(departureDate)}</span>
              </div>

              <button
                onClick={() => changeDateByDays(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Hôm sau <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => onSearchChange(origin, destination, '')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #94a3b8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
                title="Bỏ lọc theo ngày để xem chuyến xe của mọi ngày"
              >
                ✕ Xem mọi ngày
              </button>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb' }}>
                <Calendar size={16} />
                <span>Đang hiển thị chuyến xe của <strong>tất cả các ngày</strong></span>
              </div>
              <button
                type="button"
                onClick={() => onSearchChange(origin, destination, new Date().toISOString().split('T')[0])}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Lọc chuyến hôm nay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

