import React, { useState } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, Map } from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  type: 'BUS_STATION' | 'TRANSIT_POINT';
  typeLabel: string;
  province: string;
  district: string;
  coordinates: string;
}

export const AdminLocationsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const locations: LocationItem[] = [
    {
      id: 'loc1',
      name: 'Ben xe Mien Dong',
      type: 'BUS_STATION',
      typeLabel: 'Ben xe',
      province: 'TP. HCM',
      district: 'Binh Thanh',
      coordinates: '10.8251, 106.6929',
    },
    {
      id: 'loc2',
      name: 'Ben xe Lien Tinh Da Lat',
      type: 'BUS_STATION',
      typeLabel: 'Ben xe',
      province: 'Lam Dong',
      district: 'TP. Da Lat',
      coordinates: '11.9465, 108.4419',
    },
    {
      id: 'loc3',
      name: 'Ben xe Nha Trang',
      type: 'BUS_STATION',
      typeLabel: 'Ben xe',
      province: 'Khanh Hoa',
      district: 'TP. Nha Trang',
      coordinates: '12.2453, 109.1983',
    },
    {
      id: 'loc4',
      name: 'Ben xe My Dinh',
      type: 'BUS_STATION',
      typeLabel: 'Ben xe',
      province: 'Ha Noi',
      district: 'Nam Tu Liem',
      coordinates: '21.0285, 105.7733',
    },
    {
      id: 'loc5',
      name: 'Tram trung chuyen Dau Giay',
      type: 'TRANSIT_POINT',
      typeLabel: 'Tram trung chuyen',
      province: 'Dong Nai',
      district: 'Thong Nhat',
      coordinates: '10.6065, 107.2388',
    },
  ];

  const filtered = locations.filter((loc) => {
    if (search && !loc.name.toLowerCase().includes(search.toLowerCase()) && !loc.province.toLowerCase().includes(search.toLowerCase()) && !loc.district.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'ALL' && loc.type !== typeFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            VeXeRe Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Danh muc <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Dia diem
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Dia diem
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {locations.length} dia diem trong he thong
          </div>
        </div>

        <button
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
          }}
        >
          <Plus size={16} />
          <span>Them dia diem</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '280px',
            gap: '8px'
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tim kiem ten, tinh, quan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              flex: 1
            }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          <option value="ALL">Tat ca loai</option>
          <option value="BUS_STATION">Ben xe</option>
          <option value="TRANSIT_POINT">Tram trung chuyen</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TEN DIA DIEM</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LOAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TINH/TP</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>QUAN/HUYEN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TOA DO</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isStation = item.type === 'BUS_STATION';
              const typeStyle = isStation
                ? { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' }
                : { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' };

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#fee2e2',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <MapPin size={14} />
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: typeStyle.bg,
                        color: typeStyle.text,
                        border: `1px solid ${typeStyle.border}`,
                      }}
                    >
                      {item.typeLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{item.province}</td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{item.district}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '12px' }}>
                      <Map size={13} color="#059669" />
                      <span>{item.coordinates}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Chinh sua"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#64748b',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        title="Xoa"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#64748b',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLocationsPage;

