import React, { useState } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [tempOrigin, setTempOrigin] = useState(origin);
  const [tempDestination, setTempDestination] = useState(destination);
  const [tempDate, setTempDate] = useState(departureDate);

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
    setIsEditing(false);
  };

  const changeDateByDays = (days: number) => {
    const current = new Date(departureDate);
    current.setDate(current.getDate() + days);
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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
        marginBottom: '20px',
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
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>
              Vé xe khách <span style={{ color: '#94a3b8' }}>/</span> Tuyến đường phổ biến
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{origin}</span>
              <span style={{ color: '#2563eb' }}>→</span>
              <span>{destination}</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                {totalTrips} chuyến
              </span>
            </h1>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isEditing ? '#f1f5f9' : '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
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

        {/* Collapsible Edit Search Form */}
        {isEditing && (
          <form
            onSubmit={handleApplyEdit}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
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
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Nơi xuất phát
              </label>
              <select
                value={tempOrigin}
                onChange={(e) => setTempOrigin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
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
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#2563eb',
                }}
              >
                <ArrowLeftRight size={15} />
              </button>
            </div>

            {/* Destination */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Nơi đến
              </label>
              <select
                value={tempDestination}
                onChange={(e) => setTempDestination(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                {popularCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure Date */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Ngày đi
              </label>
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            {/* Submit */}
            <div style={{ paddingTop: '16px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
                }}
              >
                Tìm Chuyến
              </button>
            </div>
          </form>
        )}

        {/* Date Stepper Bar: Hôm qua | [Thứ Tư, 21/10/2026] | Ngày mai */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            onClick={() => changeDateByDays(-1)}
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
        </div>
      </div>
    </div>
  );
};

