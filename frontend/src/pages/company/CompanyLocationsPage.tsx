import React, { useState } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, Info } from 'lucide-react';

interface CompanyLocationItem {
  id: string;
  code: string;
  displayName: string;
  masterLocation: string;
  masterSub: string;
  address: string;
  pickupGuide: string;
}

export const CompanyLocationsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const locations: CompanyLocationItem[] = [
    {
      id: 'cl1',
      code: 'b11',
      displayName: 'PT - BX Mien Dong',
      masterLocation: 'Ben xe Mien Dong',
      masterSub: 'TP. HCM · BUS_STATION',
      address: '292 Dinh Bo Linh, Q.Binh Thanh',
      pickupGuide: 'Den quay 12-14 truoc gio xuat phat 3...',
    },
    {
      id: 'cl2',
      code: 'b12',
      displayName: 'PT - BX Da Lat',
      masterLocation: 'Ben xe Lien Tinh Da Lat',
      masterSub: 'Lam Dong · BUS_STATION',
      address: '1 Duong 3/4, TP. Da Lat',
      pickupGuide: 'Den quay ve so 5',
    },
  ];

  const filtered = locations.filter((loc) => {
    if (search && !loc.displayName.toLowerCase().includes(search.toLowerCase()) && !loc.masterLocation.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Dia diem
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Dia diem nha xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {locations.length}/{locations.length} cau hinh — Phuong Trang FUTA
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
          <span>Gan dia diem</span>
        </button>
      </div>

      {/* Info Pill */}
      <div style={{ marginBottom: '16px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500
          }}
        >
          <strong style={{ fontWeight: 700 }}>Phuong Trang FUTA</strong>
          <span>Admin Location (master) → BusCompanyLocationConfig — Company hien tai</span>
        </span>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
            placeholder="Tim ten hien thi, dia diem goc..."
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

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          F5 reset ve mock ban dau · Doi Nha xe o header de test cross-company
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TEN HIEN THI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DIA DIEM GOC (MASTER)</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DIA CHI CHI TIET</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HUONG DAN DON</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
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
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <MapPin size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.displayName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.code}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.masterLocation}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.masterSub}</div>
                </td>
                <td style={{ padding: '14px 18px', color: '#334155' }}>{item.address}</td>
                <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>{item.pickupGuide}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
        <Info size={14} color="#94a3b8" />
        <span>Khi Them: chi chon Location master dang ton tai — config thuoc dung bc1. Doi company o header → list loc lai ngay.</span>
      </div>
    </div>
  );
};

export default CompanyLocationsPage;

