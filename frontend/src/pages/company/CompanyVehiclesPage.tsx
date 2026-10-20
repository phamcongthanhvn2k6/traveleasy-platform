import React, { useState } from 'react';
import { Bus, Search, Plus, Eye, Edit2, Trash2, Calendar, User, Layers, Info } from 'lucide-react';

interface VehicleItem {
  id: string;
  plate: string;
  code: string;
  type: string;
  floors: number;
  year: number;
  operator: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  seatLayout: string;
  image?: string;
}

export const CompanyVehiclesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [vehicles, setVehicles] = useState<VehicleItem[]>([
    {
      id: 'v1',
      plate: '51B-123.45',
      code: 'v1',
      type: 'SLEEPER',
      floors: 2,
      year: 2022,
      operator: 'Phuong Trang',
      status: 'ACTIVE',
      statusLabel: 'Hoat dong',
      seatLayout: 'Giuong nam 2 tang 34 ch...',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=60',
    },
    {
      id: 'v2',
      plate: '51B-987.65',
      code: 'v2',
      type: 'LIMOUSINE',
      floors: 1,
      year: 2023,
      operator: 'Phuong Trang',
      status: 'ACTIVE',
      statusLabel: 'Hoat dong',
      seatLayout: 'Ghe ngoi 1 tang 24 cho (Li...',
    },
    {
      id: 'v4',
      plate: '51B-111.22',
      code: 'v4',
      type: 'SEATED',
      floors: 1,
      year: 2018,
      operator: 'Phuong Trang',
      status: 'INACTIVE',
      statusLabel: 'Ngung hoat dong',
      seatLayout: '—',
    },
  ]);

  const toggleStatus = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
              statusLabel: v.status === 'ACTIVE' ? 'Ngung hoat dong' : 'Hoat dong',
            }
          : v
      )
    );
  };

  const filtered = vehicles.filter((v) => {
    if (search && !v.plate.toLowerCase().includes(search.toLowerCase()) && !v.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Van hanh <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Doi xe
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Doi xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {vehicles.length}/{vehicles.length} xe · Phuong Trang FUTA
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
          <span>Them xe moi</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              width: '260px',
              gap: '8px'
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tim bien so, don vi, id..."
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
              minWidth: '150px'
            }}
          >
            <option value="ALL">Tat ca loai xe</option>
            <option value="SLEEPER">SLEEPER</option>
            <option value="LIMOUSINE">LIMOUSINE</option>
            <option value="SEATED">SEATED</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '160px'
            }}
          >
            <option value="ALL">Tat ca trang thai</option>
            <option value="ACTIVE">Hoat dong</option>
            <option value="INACTIVE">Ngung hoat dong</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Click badge Trang thai de toggle · F5 reset
        </div>
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>BIEN SO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LOAI XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TANG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NAM SX</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DON VI VAN HANH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SEAT LAYOUT</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const isActive = v.status === 'ACTIVE';
              return (
                <tr
                  key={v.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={v.plate}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: '#ecfdf5',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Bus size={18} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.plate}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{v.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {v.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                      <Layers size={13} color="#64748b" />
                      <span>{v.floors}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                      <Calendar size={13} color="#64748b" />
                      <span>{v.year}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                      <User size={13} color="#64748b" />
                      <span>{v.operator}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      onClick={() => toggleStatus(v.id)}
                      title="Click de toggle trang thai"
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: isActive ? '#ecfdf5' : '#f1f5f9',
                        color: isActive ? '#059669' : '#64748b',
                        border: isActive ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      {v.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12px' }}>
                    {v.seatLayout}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Xem"
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
                        <Eye size={15} />
                      </button>
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

      {/* Bottom Scope Note */}
      <div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
        Scope: chi hien thi Vehicle co bus_company_id === bc1 · Tao moi tu dong gan company hien tai · So do ghe hien thi tu VehicleSeatLayout -&gt; Template.
      </div>
    </div>
  );
};

export default CompanyVehiclesPage;

