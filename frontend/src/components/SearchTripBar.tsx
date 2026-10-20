import React, { useState } from 'react';
import { Bus, Plane, Train, Car, Calendar, ArrowRightLeft, Search, Plus, Check } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'bus' | 'plane' | 'train' | 'car'>('bus');
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasReturnDate, setHasReturnDate] = useState(false);
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [isNewAddress, setIsNewAddress] = useState(true);

  // Danh sách các điểm xuất phát & điểm đến phổ biến
  const popularCities = [
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Nha Trang',
    'Đà Nẵng',
    'Vũng Tàu',
    'Sa Pa',
    'Hải Phòng',
    'Cần Thơ',
    'Huế',
    'Quy Nhơn',
    'Phan Thiết'
  ];

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(origin, destination, departureDate, hasReturnDate ? returnDate : undefined);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 20px 40px -10px rgba(0, 50, 150, 0.2), 0 0 1px rgba(0,0,0,0.1)',
      padding: '24px',
      maxWidth: '1160px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 30
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
                backgroundColor: '#ffffff',
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
            onClick={() => setActiveTab('bus')}
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
            onClick={() => setActiveTab('plane')}
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
            onClick={() => setActiveTab('train')}
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
            onClick={() => setActiveTab('car')}
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: hasReturnDate 
            ? 'minmax(200px, 1.2fr) auto minmax(200px, 1.2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto'
            : 'minmax(220px, 1.3fr) auto minmax(220px, 1.3fr) minmax(180px, 1.1fr) auto auto',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Nơi xuất phát */}
          <div style={{
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            position: 'relative'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }} />
              Nơi xuất phát
            </div>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '15.5px',
                fontWeight: 700,
                color: '#1e293b',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
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
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#3b82f6',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s'
            }}
          >
            <ArrowRightLeft size={16} />
          </button>

          {/* Nơi đến */}
          <div style={{
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              Nơi đến
            </div>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '15.5px',
                fontWeight: 700,
                color: '#1e293b',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              {popularCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Ngày đi */}
          <div style={{
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Calendar size={12} color="#10b981" />
              Ngày đi
            </div>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#1e293b',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Ngày về (nếu bật khứ hồi) hoặc Nút + Thêm ngày về */}
          {hasReturnDate ? (
            <div style={{
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              position: 'relative'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Calendar size={12} color="#f59e0b" />
                Ngày về
                <span 
                  onClick={() => setHasReturnDate(false)}
                  style={{ marginLeft: 'auto', color: '#ef4444', cursor: 'pointer', fontSize: '10px', fontWeight: 800 }}
                >
                  Xóa
                </span>
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: '#1e293b',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasReturnDate(true)}
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
            style={{
              backgroundColor: '#ffc700',
              color: '#111827',
              border: 'none',
              borderRadius: '12px',
              padding: '0 32px',
              height: '56px',
              fontSize: '16.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(255, 199, 0, 0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <Search size={20} strokeWidth={2.5} />
            Tìm kiếm
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchTripBar;
