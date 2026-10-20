import React, { useState, useEffect } from 'react';
import { AdminNav } from '../components/AdminNav';
import api from '../services/api';
import { Trip } from '../types';
import { Calendar, PlusCircle, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const AdminTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips/search', { params: { origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt' } });
      setTrips(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleUpdateStatus = async (tripId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/trips/${tripId}/status`, { status: newStatus });
      setStatusMsg(`Đã cập nhật trạng thái chuyến #${tripId} thành ${newStatus}!`);
      fetchTrips();
    } catch (err: any) {
      setStatusMsg(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px' }}>
              UC-3.5 & UC-2.5
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
              Quản Trị Lịch Trình & Điều Hành Chuyến Xe
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Lập lịch chạy, tự động sinh kho 34 ghế Limousine, điều phối tài xế và chuyển đổi trạng thái chuyến xe
            </p>
          </div>
        </div>

        {statusMsg && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            {statusMsg}
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Danh Sách Chuyến Xe Trong Hệ Thống</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Hiển thị {trips.length} chuyến xe</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Mã Chuyến</th>
                <th style={{ padding: '14px 20px' }}>Nhà Xe & Tuyến</th>
                <th style={{ padding: '14px 20px' }}>Giờ Xuất Bến</th>
                <th style={{ padding: '14px 20px' }}>Loại Xe / Ghế</th>
                <th style={{ padding: '14px 20px' }}>Giá Vé</th>
                <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#1e3a8a' }}>#{t.id}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.busCompanyName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{t.originCity || t.departureLocation} ➔ {t.destinationCity || t.arrivalLocation}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{t.departureTime.replace('T', ' ')}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Đến: {t.arrivalTime.replace('T', ' ')}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      {t.busType}
                    </span>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Còn {t.availableSeats}/34 chỗ</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#15803d' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.price)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 700,
                      backgroundColor: t.status === 'SCHEDULED' ? '#dcfce7' : t.status === 'DEPARTED' ? '#fef3c7' : '#f1f5f9',
                      color: t.status === 'SCHEDULED' ? '#15803d' : t.status === 'DEPARTED' ? '#b45309' : '#475569'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {t.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'DEPARTED')}
                          style={{ backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Xuất Bến
                        </button>
                      )}
                      {t.status === 'DEPARTED' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                          style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Hoàn Thành
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'CANCELLED')}
                        style={{ backgroundColor: '#f1f5f9', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Hủy
                      </button>
                    </div>
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

export default AdminTripsPage;
