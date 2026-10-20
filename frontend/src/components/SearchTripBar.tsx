import React, { useState } from 'react';
import { MapPin, Calendar, Search } from 'lucide-react';

interface Props {
  onSearch: (origin: string, destination: string, date: string) => void;
}

export const SearchTripBar: React.FC<Props> = ({ onSearch }) => {
  const [origin, setOrigin] = useState('TP. Hồ Chí Minh');
  const [destination, setDestination] = useState('Đà Lạt');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(origin, destination, date);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      marginTop: '-40px',
      position: 'relative',
      zIndex: 20
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
        gap: '16px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            <MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#2563eb' }} /> Nơi xuất phát
          </label>
          <select 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600 }}
          >
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Lạt">Đà Lạt</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Sa Pa">Sa Pa</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            <MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#f97316' }} /> Nơi đến
          </label>
          <select 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600 }}
          >
            <option value="Đà Lạt">Đà Lạt</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Sa Pa">Sa Pa</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            <Calendar size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#10b981' }} /> Ngày khởi hành
          </label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
          />
        </div>

        <button 
          type="submit" 
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '48px',
            transition: 'background 0.2s'
          }}
        >
          <Search size={18} /> Tìm Chuyến Xe
        </button>
      </form>
    </div>
  );
};
