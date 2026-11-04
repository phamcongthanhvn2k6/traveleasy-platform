import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Bus, Plane, Train, Car, Calendar, ArrowRightLeft, Search, Plus, Check } from 'lucide-react';
import { getLocalTodayDateString, getLocalNextDayString } from '../utils/dateUtils';
import { POPULAR_CITIES } from '../constants/popularCities';

interface Props {
  onSearch: (origin: string, destination: string, date: string, returnDate?: string) => void;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export const SearchTripBar: React.FC<Props> = ({ 
  onSearch, 
  defaultOrigin = 'TP. Hồ Chí Minh', 
  defaultDestination = 'Đà Lạt' 
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'bus' | 'plane' | 'train' | 'car'>('bus');
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [departureDate, setDepartureDate] = useState(() => getLocalTodayDateString());
  const [hasReturnDate, setHasReturnDate] = useState(false);
  const [returnDate, setReturnDate] = useState(() => getLocalNextDayString(undefined, 2));
  const [isNewAddress, setIsNewAddress] = useState(true);

  // Danh sách 24 điểm xuất phát & điểm đến phổ biến toàn quốc (Đạt chuẩn trải nghiệm du lịch liên tỉnh)
  const popularCities = POPULAR_CITIES;

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [swapRotation, setSwapRotation] = useState(0);
  const [tabNotice, setTabNotice] = useState<string | null>(null);

  const handleSwap = () => {
    setValidationError(null);
    setSwapRotation(prev => prev + 180);
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleDepartureDateChange = (val: string) => {
    setDepartureDate(val);
    setValidationError(null);
    if (hasReturnDate && returnDate && returnDate < val) {
      setReturnDate(getLocalNextDayString(val, 1));
    }
  };

  const handleTabChange = (tab: 'bus' | 'plane' | 'train' | 'car') => {
    setActiveTab(tab);
    if (tab !== 'bus') {
      setTabNotice(`Dịch vụ ${tab === 'plane' ? 'Vé Máy Bay' : tab === 'train' ? 'Tàu Hỏa' : 'Thuê Xe'} đang liên kết mở rộng cùng đối tác hàng không/đường sắt. Hiện tại hệ thống đang ưu tiên tìm kiếm chuyến Xe Khách toàn quốc.`);
      setTimeout(() => setTabNotice(null), 4000);
    } else {
      setTabNotice(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!origin.trim() || !destination.trim()) {
      setValidationError('Vui lòng chọn đầy đủ điểm xuất phát và điểm đến.');
      return;
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setValidationError('Điểm xuất phát và điểm đến không được trùng nhau. Vui lòng chọn lộ trình hợp lệ.');
      return;
    }

    if (!departureDate || !departureDate.trim()) {
      setValidationError('Vui lòng chọn ngày khởi hành.');
      return;
    }

    const today = getLocalTodayDateString();
    if (departureDate < today) {
      setValidationError('Ngày khởi hành không thể ở trong quá khứ. Vui lòng chọn từ ngày hôm nay trở đi.');
      return;
    }

    if (hasReturnDate) {
      if (!returnDate || !returnDate.trim()) {
        setValidationError('Vui lòng chọn ngày về cho chuyến xe khứ hồi.');
        return;
      }
      if (returnDate < departureDate) {
        setValidationError('Ngày về phải diễn ra sau hoặc cùng ngày với ngày khởi hành.');
        return;
      }
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      onSearch(origin.trim(), destination.trim(), departureDate, hasReturnDate ? returnDate : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: isDark ? '#111827' : '#ffffff',
      borderRadius: '20px',
      border: `1px solid ${isDark ? '#1e293b' : 'transparent'}`,
      boxShadow: isDark ? '0 20px 40px -10px rgba(0, 0, 0, 0.6)' : '0 20px 40px -10px rgba(0, 50, 150, 0.2), 0 0 1px rgba(0,0,0,0.1)',
      padding: '24px',
      maxWidth: '1160px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 30,
      color: isDark ? '#f8fafc' : '#0f172a',
      transition: 'all 0.25s ease'
    }}>
      {/* 1. Header Tabs: Xe Khách, Máy Bay, Tàu Hỏa, Thuê Xe (Chuẩn Screenshot 1) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Toggle Địa chỉ mới */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <div 
              onClick={() => setIsNewAddress(!isNewAddress)}
              style={{
                width: '38px',
                height: '22px',
                backgroundColor: isNewAddress ? '#22c55e' : '#cbd5e1',
                borderRadius: '20px',
                position: 'relative',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: isNewAddress ? '19px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Địa chỉ mới</span>
          </label>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Tab Xe Khách */}
          <button
            type="button"
            onClick={() => handleTabChange('bus')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'bus' ? '3px solid #2563eb' : '3px solid transparent',
              padding: '6px 8px 12px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'bus' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Bus size={18} color={activeTab === 'bus' ? '#2563eb' : '#64748b'} />
            Xe khách
          </button>

          {/* Tab Máy Bay */}
          <button
            type="button"
            onClick={() => handleTabChange('plane')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'plane' ? '3px solid #2563eb' : '3px solid transparent',
              padding: '6px 8px 12px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'plane' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative'
            }}
          >
            <Plane size={18} color={activeTab === 'plane' ? '#2563eb' : '#64748b'} />
            Máy bay
            <span style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '6px',
              marginLeft: '2px'
            }}>
              -50k
            </span>
          </button>

          {/* Tab Tàu Hỏa */}
          <button
            type="button"
            onClick={() => handleTabChange('train')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'train' ? '3px solid #2563eb' : '3px solid transparent',
              padding: '6px 8px 12px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'train' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Train size={18} color={activeTab === 'train' ? '#2563eb' : '#64748b'} />
            Tàu hỏa
            <span style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '6px',
              marginLeft: '2px'
            }}>
              Vé Tết
            </span>
          </button>

          {/* Tab Thuê Xe */}
          <button
            type="button"
            onClick={() => handleTabChange('car')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'car' ? '3px solid #2563eb' : '3px solid transparent',
              padding: '6px 8px 12px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'car' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Car size={18} color={activeTab === 'car' ? '#2563eb' : '#64748b'} />
            Thuê xe
            <span style={{
              backgroundColor: '#ea580c',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '6px',
              marginLeft: '2px'
            }}>
              Mới
            </span>
          </button>
        </div>
      </div>

      {/* 2. Unified Search Inputs Container with Golden Search CTA Button */}
      <form onSubmit={handleSubmit}>
        <style>{`
          @media (max-width: 900px) {
            .search-bar-grid {
              grid-template-columns: 1fr !important;
            }
            .search-swap-btn {
              margin: 4px auto !important;
            }
          }
        `}</style>

        {tabNotice && (
          <div
            role="status"
            style={{
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>ℹ️</span> {tabNotice}
          </div>
        )}

        {validationError && (
          <div 
            role="alert"
            style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span> {validationError}
          </div>
        )}
        <div 
          className="search-bar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: hasReturnDate 
              ? 'minmax(200px, 1.2fr) auto minmax(200px, 1.2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto'
              : 'minmax(220px, 1.3fr) auto minmax(220px, 1.3fr) minmax(180px, 1.1fr) auto auto',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          {/* Nơi xuất phát */}
          <div style={{
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            position: 'relative'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }} />
              Nơi xuất phát
            </div>
            <select
              value={origin}
              aria-label="Chọn điểm xuất phát"
              onChange={(e) => setOrigin(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '15.5px',
                fontWeight: 700,
                color: isDark ? '#f8fafc' : '#1e293b',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>-- Chọn điểm xuất phát --</option>
              {popularCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            title="Đổi chiều xuất phát / điểm đến"
            aria-label="Đổi chiều xuất phát và điểm đến"
            className="search-swap-btn"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#3b82f6',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transform: `rotate(${swapRotation}deg)`,
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ArrowRightLeft size={16} />
          </button>

          {/* Nơi đến */}
          <div style={{
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              Nơi đến
            </div>
            <select
              value={destination}
              aria-label="Chọn điểm đến"
              onChange={(e) => setDestination(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '15.5px',
                fontWeight: 700,
                color: isDark ? '#f8fafc' : '#1e293b',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>-- Chọn điểm đến --</option>
              {popularCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Ngày đi */}
          <div style={{
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Calendar size={12} color="#10b981" />
              Ngày đi
            </div>
            <input
              type="date"
              aria-label="Ngày khởi hành"
              value={departureDate}
              min={getLocalTodayDateString()}
              onChange={(e) => handleDepartureDateChange(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '14.5px',
                fontWeight: 700,
                color: isDark ? '#f8fafc' : '#1e293b',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Ngày về (nếu bật khứ hồi) hoặc Nút + Thêm ngày về */}
          {hasReturnDate ? (
            <div style={{
              borderRadius: '12px',
              padding: '10px 14px',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              position: 'relative'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Calendar size={12} color="#f59e0b" />
                Ngày về
                <button 
                  type="button"
                  onClick={() => setHasReturnDate(false)}
                  aria-label="Xóa ngày về khứ hồi"
                  style={{
                    marginLeft: 'auto',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  ✕ Xóa
                </button>
              </div>
              <input
                type="date"
                aria-label="Ngày về khứ hồi"
                value={returnDate}
                min={departureDate || getLocalTodayDateString()}
                onChange={(e) => setReturnDate(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: isDark ? '#f8fafc' : '#1e293b',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setHasReturnDate(true);
                setValidationError(null);
                if (!returnDate || returnDate < departureDate) {
                  setReturnDate(getLocalNextDayString(departureDate, 2));
                }
              }}
              style={{
                background: 'none',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '16px 14px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#2563eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                height: '56px'
              }}
            >
              <Plus size={16} /> Thêm ngày về
            </button>
          )}

          {/* Primary Action Button "Tìm kiếm" (Vibrant Golden Yellow #ffc700 - Chuẩn Vexere) */}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label="Tìm kiếm chuyến xe"
            aria-busy={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#cbd5e1' : '#ffc700',
              color: isSubmitting ? '#64748b' : '#111827',
              border: 'none',
              borderRadius: '12px',
              padding: '0 32px',
              height: '56px',
              fontSize: '16.5px',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(255, 199, 0, 0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              opacity: isSubmitting ? 0.75 : 1
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #64748b',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Đang tìm...
              </>
            ) : (
              <>
                <Search size={20} strokeWidth={2.5} />
                Tìm kiếm
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchTripBar;
