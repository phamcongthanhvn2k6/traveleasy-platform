import React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Truck, PlusCircle, CheckCircle, Award, Phone, Mail, MapPin } from 'lucide-react';

export const AdminFleetPage: React.FC = () => {
  const companies = [
    {
      id: 1,
      name: 'Công ty Cổ phần Xe khách Phương Trang (FUTA Bus Lines)',
      code: 'FUTA',
      phone: '1900 6067',
      email: 'hotro@futa.vn',
      address: 'Bến xe Miền Đông, TP. Hồ Chí Minh',
      rating: 4.8,
      vehicles: 45,
      activeTrips: 18
    },
    {
      id: 2,
      name: 'Công ty TNHH Vận tải Thành Bưởi Limousine',
      code: 'THANHBUOI',
      phone: '1900 6079',
      email: 'chamsoc@thanhbuoi.com.vn',
      address: '266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh',
      rating: 4.9,
      vehicles: 38,
      activeTrips: 14
    }
  ];

  const vehicles = [
    { plate: '51B-123.45', company: 'Phương Trang', type: 'Limousine 34 Phòng VIP', floors: 2, seats: 34, status: 'ACTIVE' },
    { plate: '51B-678.90', company: 'Phương Trang', type: 'Limousine 34 Phòng VIP', floors: 2, seats: 34, status: 'MAINTENANCE' },
    { plate: '49B-234.56', company: 'Thành Bưởi', type: 'Limousine 34 Phòng VIP', floors: 2, seats: 34, status: 'ACTIVE' },
    { plate: '49B-789.01', company: 'Thành Bưởi', type: 'Giường Nằm 40 Chỗ Tiêu Chuẩn', floors: 2, seats: 40, status: 'ACTIVE' },
  ];

  return (
    <div>
      <AdminNav />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px' }}>
              UC-3.2 & UC-2.2
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
              Quản Lý Nhà Xe Đối Tác & Đội Xe (Fleet Management)
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Danh mục nhà xe được cấp phép hoạt động trên sàn, quản lý phương tiện và cấu hình sơ đồ ghế mẫu
            </p>
          </div>
          <button style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <PlusCircle size={18} /> Thêm Nhà Xe Mới
          </button>
        </div>

        {/* Danh Sách Nhà Xe */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Nhà Xe Đối Tác Chiến Lược</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {companies.map((c) => (
              <div key={c.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>MÃ: {c.code}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{c.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}>
                    ★ {c.rating}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color="#64748b" /> {c.phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color="#64748b" /> {c.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} color="#64748b" /> {c.address}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: '#2563eb' }}>{c.vehicles} Phương tiện</span>
                  <span style={{ color: '#16a34a' }}>{c.activeTrips} Chuyến đang chạy</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danh Sách Phương Tiện */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Danh Sách Phương Tiện & Biển Số Xe (Vehicles)</span>
            <button style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              + Đăng Ký Xe Mới
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Biển Số Xe</th>
                <th style={{ padding: '14px 20px' }}>Nhà Xe Sở Hữu</th>
                <th style={{ padding: '14px 20px' }}>Loại Xe / Sơ Đồ</th>
                <th style={{ padding: '14px 20px' }}>Số Tầng & Chỗ</th>
                <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.plate} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1e3a8a' }}>{v.plate}</td>
                  <td style={{ padding: '16px 20px', fontWeight: 600 }}>{v.company}</td>
                  <td style={{ padding: '16px 20px', color: '#475569' }}>{v.type}</td>
                  <td style={{ padding: '16px 20px' }}>{v.floors} Tầng • {v.seats} Chỗ</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: v.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: v.status === 'ACTIVE' ? '#15803d' : '#b91c1c'
                    }}>
                      {v.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang bảo dưỡng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFleetPage;

