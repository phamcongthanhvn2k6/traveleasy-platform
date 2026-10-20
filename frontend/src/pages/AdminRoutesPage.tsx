import React from 'react';
import { AdminNav } from '../components/AdminNav';
import { MapPin, PlusCircle, Clock, Navigation } from 'lucide-react';

export const AdminRoutesPage: React.FC = () => {
  const routes = [
    {
      id: 1,
      name: 'TP. Hồ Chí Minh ➔ Đà Lạt',
      origin: 'TP. Hồ Chí Minh (Bến xe Miền Đông / An Sương)',
      destination: 'Lâm Đồng (Bến xe Liên tỉnh Đà Lạt)',
      distanceKm: 300,
      durationHours: 8,
      status: 'ACTIVE',
      stopsCount: 4,
      defaultPrice: 320000
    },
    {
      id: 2,
      name: 'Đà Lạt ➔ TP. Hồ Chí Minh',
      origin: 'Lâm Đồng (Bến xe Liên tỉnh Đà Lạt)',
      destination: 'TP. Hồ Chí Minh (Bến xe Miền Đông)',
      distanceKm: 300,
      durationHours: 8,
      status: 'ACTIVE',
      stopsCount: 4,
      defaultPrice: 320000
    },
    {
      id: 3,
      name: 'TP. Hồ Chí Minh ➔ Nha Trang',
      origin: 'TP. Hồ Chí Minh (Bến xe Miền Đông)',
      destination: 'Khánh Hòa (Bến xe Phía Nam Nha Trang)',
      distanceKm: 430,
      durationHours: 9,
      status: 'ACTIVE',
      stopsCount: 5,
      defaultPrice: 350000
    }
  ];

  const stops = [
    { seq: 1, name: 'Bến xe Miền Đông mới', type: 'PICKUP', province: 'TP. Hồ Chí Minh', etaOffset: '00:00' },
    { seq: 2, name: 'Ngã tư Dầu Giây', type: 'PICKUP', province: 'Đồng Nai', etaOffset: '+01:30' },
    { seq: 3, name: 'Trạm dừng chân Madagui (Ăn uống)', type: 'REST', province: 'Lâm Đồng', etaOffset: '+04:00' },
    { seq: 4, name: 'Bến xe Liên tỉnh Đà Lạt', type: 'DROPOFF', province: 'Lâm Đồng', etaOffset: '+08:00' },
  ];

  return (
    <div>
      <AdminNav />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '4px' }}>
              UC-3.3 & UC-3.6
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
              Quản Lý Tuyến Đường & Điểm Đón / Trả (Routes & Stops)
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Thiết lập danh mục tuyến xe liên tỉnh, khoảng cách km, điểm đón/trả và mốc giờ dự kiến (ETA)
            </p>
          </div>
          <button style={{ backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <PlusCircle size={18} /> Tạo Tuyến Đường Mới
          </button>
        </div>

        {/* Danh Sách Tuyến Đường */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Danh Sách Tuyến Đường Liên Tỉnh Đang Khai Thác</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{routes.length} Tuyến đường</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Mã Tuyến</th>
                <th style={{ padding: '14px 20px' }}>Tên Lộ Trình</th>
                <th style={{ padding: '14px 20px' }}>Cự Ly / Thời Gian</th>
                <th style={{ padding: '14px 20px' }}>Số Điểm Dừng</th>
                <th style={{ padding: '14px 20px' }}>Giá Vé Mặc Định</th>
                <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1e3a8a' }}>ROUTE-0{r.id}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{r.origin} ➔ {r.destination}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{r.distanceKm} km</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Khoảng {r.durationHours} tiếng</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600 }}>{r.stopsCount} Trạm dừng</td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#15803d' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.defaultPrice)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Điểm Dừng Tuyến Mẫu */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
            Lộ Trình Trạm Dừng & Điểm Đón/Trả Mẫu: Tuyến TP.HCM ➔ Đà Lạt
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {stops.map((s) => (
              <div key={s.seq} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                    TRẠM #{s.seq}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
                    {s.etaOffset}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.province} • Loại: {s.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutesPage;

