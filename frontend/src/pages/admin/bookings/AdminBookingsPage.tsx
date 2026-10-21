import React, { useState, useEffect } from 'react';
import { Ticket, Search, CheckCircle, Ban, RefreshCw, QrCode, Phone, Mail, User } from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';

interface BookingItem {
  id: number;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  trip: {
    id: number;
    busCompanyName: string;
    originCity: string;
    destinationCity: string;
    departureTime: string;
  };
  pickupPointName: string;
  dropoffPointName: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  createdAt: string;
  tickets?: Array<{
    id: number;
    seatNumber: string;
    price: number;
    ticketCode: string;
  }>;
}

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED' | 'PENDING'>('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setBookings(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load bookings from API:', err);
      toast.error('Không thể tải danh sách đơn đặt vé từ CSDL', 'Lỗi Kết Nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleToggleStatus = async (booking: BookingItem) => {
    const nextStatus = booking.status === 'CONFIRMED' ? 'CANCELLED' : 'CONFIRMED';
    const actionLabel = nextStatus === 'CANCELLED' ? 'HỦY ĐƠN VÉ' : 'XÁC NHẬN ĐƠN VÉ';

    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} cho đơn ${booking.bookingCode} (${booking.customerName})?`)) {
      return;
    }

    try {
      await api.patch(`/admin/bookings/${booking.id}/status`, null, {
        params: { status: nextStatus }
      });

      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: nextStatus } : b));

      if (nextStatus === 'CANCELLED') {
        toast.warning(`Đã hủy đơn vé #${booking.bookingCode}. Doanh thu tổng trên Dashboard sẽ được khấu trừ tự động.`, 'Đồng Bộ CSDL');
      } else {
        toast.success(`Đã xác nhận đơn vé #${booking.bookingCode}.`, 'Đồng Bộ CSDL');
      }
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      toast.error('Cập nhật trạng thái đơn vé thất bại!', 'Lỗi');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCode = b.bookingCode.toLowerCase().includes(q);
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchPhone = b.customerPhone?.includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đơn vé khách hàng
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Đơn Đặt Vé Khách Hàng
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng số: <strong>{bookings.length}</strong> đơn đặt vé • Doanh thu xác nhận: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}</strong>
          </div>
        </div>

        <button
          onClick={fetchBookings}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '9px 14px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} /> Làm mới CSDL
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo Mã đơn (BK-...), Họ tên khách hàng hoặc Số điện thoại..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Tab buttons */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                backgroundColor: statusFilter === tab ? '#ffffff' : 'transparent',
                color: statusFilter === tab ? '#1e3a8a' : '#64748b',
                fontWeight: statusFilter === tab ? 700 : 500,
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: statusFilter === tab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab === 'ALL' ? 'Tất cả đơn' : tab === 'CONFIRMED' ? 'Đã thanh toán (CONFIRMED)' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>MÃ ĐƠN & NGÀY ĐẶT</th>
              <th style={{ padding: '12px 16px' }}>HÀNH KHÁCH</th>
              <th style={{ padding: '12px 16px' }}>CHUYẾN XE & NHÀ XE</th>
              <th style={{ padding: '12px 16px' }}>GHẾ ĐÃ CHỌN</th>
              <th style={{ padding: '12px 16px' }}>TỔNG TIỀN & PTTT</th>
              <th style={{ padding: '12px 16px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải dữ liệu đơn đặt vé từ CSDL...
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy đơn đặt vé nào.
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Ticket size={14} color="#2563eb" /> {b.bookingCode}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(b.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {b.customerName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      📞 {b.customerPhone}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {b.trip?.originCity} → {b.trip?.destinationCity}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#2563eb', marginTop: '2px' }}>
                      🏢 {b.trip?.busCompanyName}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {b.tickets?.map(t => (
                        <span
                          key={t.id}
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                          }}
                        >
                          {t.seatNumber}
                        </span>
                      )) || <span style={{ color: '#94a3b8' }}>-</span>}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount)}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      {b.paymentMethod}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: b.status === 'CONFIRMED' ? '#f0fdf4' : b.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb',
                        color: b.status === 'CONFIRMED' ? '#16a34a' : b.status === 'CANCELLED' ? '#ef4444' : '#d97706',
                        border: `1px solid ${b.status === 'CONFIRMED' ? '#bbf7d0' : b.status === 'CANCELLED' ? '#fecaca' : '#fed7aa'}`,
                      }}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(b)}
                      style={{
                        backgroundColor: b.status === 'CONFIRMED' ? '#fff1f2' : '#f0fdf4',
                        color: b.status === 'CONFIRMED' ? '#e11d48' : '#16a34a',
                        border: `1px solid ${b.status === 'CONFIRMED' ? '#fecdd3' : '#bbf7d0'}`,
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {b.status === 'CONFIRMED' ? (
                        <>
                          <Ban size={13} /> Hủy đơn
                        </>
                      ) : (
                        <>
                          <CheckCircle size={13} /> Xác nhận lại
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
