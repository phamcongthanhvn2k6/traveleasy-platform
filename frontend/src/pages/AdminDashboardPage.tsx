import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { Bus, DollarSign, Users, Ticket, PlusCircle } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);

  // Form state
  const [busCompanyId, setBusCompanyId] = useState('1');
  const [routeId, setRouteId] = useState('1');
  const [departureTime, setDepartureTime] = useState('2026-10-25T22:00');
  const [arrivalTime, setArrivalTime] = useState('2026-10-26T06:00');
  const [busType, setBusType] = useState('LIMOUSINE_34');
  const [price, setPrice] = useState('320000');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/trips', {
        busCompanyId: Number(busCompanyId),
        routeId: Number(routeId),
        departureTime: departureTime + ':00',
        arrivalTime: arrivalTime + ':00',
        busType,
        price: Number(price),
        totalSeats: 34
      });
      setMsg('Tạo chuyến xe và tự động sinh 34 ghế thành công!');
      setShowAddTrip(false);
      fetchStats();
    } catch (err: any) {
      setMsg('Lỗi tạo chuyến: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container" style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a' }}>Bảng Điều Khiển Quản Trị Nhà Xe</h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Quản lý chuyến xe, kho ghế và thống kê doanh thu</p>
        </div>
        <button
          onClick={() => setShowAddTrip(!showAddTrip)}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <PlusCircle size={18} /> Thêm Chuyến Xe Mới
        </button>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Tổng Chuyến Xe</span>
            <Bus size={22} color="#2563eb" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a' }}>{stats?.totalTrips ?? 0}</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{stats?.scheduledTrips ?? 0} chuyến đang mở bán</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Tổng Đơn Đặt Vé</span>
            <Ticket size={22} color="#f97316" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a' }}>{stats?.totalBookings ?? 0}</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{stats?.confirmedBookings ?? 0} vé đã xác nhận</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Tổng Doanh Thu</span>
            <DollarSign size={22} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
            {(stats?.totalRevenue ?? 0).toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Tính từ các vé đã thanh toán/xác nhận</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Khách Hàng</span>
            <Users size={22} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a' }}>{stats?.totalUsers ?? 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Hành khách đăng ký tài khoản</div>
        </div>
      </div>

      {/* Add Trip Form */}
      {showAddTrip && (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Thêm Chuyến Xe Mới (Tự động tạo 34 ghế)</h3>
          <form onSubmit={handleCreateTrip} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Nhà xe</label>
              <select value={busCompanyId} onChange={e => setBusCompanyId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="1">Phương Trang (FUTA Bus)</option>
                <option value="2">Thành Bưởi</option>
                <option value="3">Sao Việt</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Tuyến đường</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="1">TP. Hồ Chí Minh ➔ Đà Lạt (310km)</option>
                <option value="2">TP. Hồ Chí Minh ➔ Nha Trang (430km)</option>
                <option value="3">Hà Nội ➔ Sa Pa (320km)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Giờ xuất bến</label>
              <input type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Giờ đến dự kiến</label>
              <input type="datetime-local" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Loại xe</label>
              <select value={busType} onChange={e => setBusType(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="LIMOUSINE_34">Limousine 34 Phòng Nằm</option>
                <option value="SLEEPER_40">Giường nằm 40 chỗ</option>
                <option value="LUXURY_CABIN">Cabin VIP Cung Điện</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Giá vé (VNĐ)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowAddTrip(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy</button>
              <button type="submit" style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700 }}>Lưu & Tạo Kho Ghế</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
