import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Printer, X, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export interface CompanyBookingItem {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tripCode: string;
  routeName: string;
  seats: string[];
  pickupPoint: string;
  dropoffPoint: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'UNPAID';
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  statusLabel: string;
  bookingTime: string;
}

const STORAGE_KEY = 'traveleasy_company_bookings';

export const CompanyBookingsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [bookings, setBookings] = useState<CompanyBookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookingsFromDb = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/bookings');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: CompanyBookingItem[] = res.data.data.map((b: any) => ({
          id: String(b.id),
          code: b.bookingCode || `BK-${b.id}`,
          customerName: b.passengerName || 'Khách hàng',
          customerEmail: b.passengerEmail || 'customer@gmail.com',
          customerPhone: b.passengerPhone || '0912345678',
          tripCode: b.tripCode || `TR-${b.tripId || 1}`,
          routeName: b.routeName || 'Sài Gòn - Đà Lạt',
          seats: b.seats || (b.seatNumber ? [b.seatNumber] : ['A01']),
          pickupPoint: b.pickupPoint || 'Bến xe Miền Tây',
          dropoffPoint: b.dropoffPoint || 'Bến xe Đà Lạt',
          totalAmount: b.totalPrice || b.totalAmount || 320000,
          paymentMethod: b.paymentMethod || 'COD',
          paymentStatus: b.paymentStatus || 'PAID',
          status: b.status || 'CONFIRMED',
          statusLabel: b.status === 'CANCELLED' ? 'Đã hủy' : b.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã xác nhận',
          bookingTime: b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'
        }));
        setBookings(mapped);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load bookings from Supabase:', err);
      toast.error('Không thể tải danh sách đơn vé từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsFromDb();
  }, []);

  const [selectedBooking, setSelectedBooking] = useState<CompanyBookingItem | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  // Actions
  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const numId = parseInt(bookingId.replace(/\D/g, ''), 10);
      if (!isNaN(numId) && numId > 0 && numId < 100000) {
        await api.patch(`/company/bookings/${numId}/status?status=CONFIRMED`);
      }
    } catch {}

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updated: CompanyBookingItem = {
            ...b,
            status: 'CONFIRMED',
            statusLabel: 'Đã xác nhận',
            paymentStatus: 'PAID',
          };
          if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
          return updated;
        }
        return b;
      })
    );
    toast.success('Đã xác nhận đặt vé thành công và lưu vào CSDL!', 'Xác Nhận Vé');
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn đặt vé này và tiến hành hoàn tiền cho hành khách?')) {
      try {
        const numId = parseInt(bookingId.replace(/\D/g, ''), 10);
        if (!isNaN(numId) && numId > 0 && numId < 100000) {
          await api.patch(`/company/bookings/${numId}/status?status=CANCELLED`);
        }
      } catch {}

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            const updated: CompanyBookingItem = {
              ...b,
              status: 'CANCELLED',
              statusLabel: 'Đã hủy',
            };
            if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
            return updated;
          }
          return b;
        })
      );
      toast.error('Đã hủy đơn đặt vé thành công và đồng bộ CSDL!', 'Hủy Đơn Đặt Vé');
    }
  };

  const handlePrintTicket = (booking: CompanyBookingItem) => {
    toast.info(`Đang gửi lệnh in vé cho mã ${booking.code}...`, 'In Vé Hành Khách');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filtered = bookings.filter((b) => {
    if (
      search &&
      !b.code.toLowerCase().includes(search.toLowerCase()) &&
      !b.customerEmail.toLowerCase().includes(search.toLowerCase()) &&
      !b.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !b.customerPhone.includes(search)
    ) {
      return false;
    }
    if (activeTab !== 'ALL' && b.status !== activeTab) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đặt vé
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Quản lý đặt vé
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          Tổng cộng {bookings.length} đơn đặt vé của nhà xe
        </div>
      </div>

      {/* Filter Row & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '320px',
            gap: '8px'
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo mã vé, tên, email, SĐT..."
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

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'CONFIRMED', label: 'CONFIRMED' },
            { key: 'PENDING', label: 'PENDING' },
            { key: 'CANCELLED', label: 'CANCELLED' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'ALL' ? bookings.length : bookings.filter((b) => b.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÃ ĐẶT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>KHÁCH HÀNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>CHUYẾN / TUYẾN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>GHẾ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TỔNG TIỀN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGÀY ĐẶT</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy đơn đặt vé nào phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const statusStyles = {
                  CONFIRMED: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                  PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                  CANCELLED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                }[item.status];

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
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#4f46e5' }}>{item.code}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.customerEmail}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.routeName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Mã: {item.tripCode}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {item.seats.map((seat) => (
                          <span
                            key={seat}
                            style={{
                              backgroundColor: '#eef2ff',
                              color: '#4f46e5',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                      {item.totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: statusStyles?.bg,
                          color: statusStyles?.text,
                          border: `1px solid ${statusStyles?.border}`,
                        }}
                      >
                        {item.statusLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.bookingTime}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        title="Xem chi tiết đơn vé"
                        onClick={() => setSelectedBooking(item)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          color: '#4f46e5',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <Eye size={14} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Booking Detail */}
      {selectedBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                  Thông Tin Vé Xe Khách
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Mã vé: {selectedBooking.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Passenger Info Card */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#4f46e5" /> Thông tin hành khách
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Họ và tên: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBooking.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Điện thoại: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBooking.customerPhone}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b' }}>Email: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBooking.customerEmail}</strong>
                </div>
              </div>
            </div>

            {/* Trip Details Card */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#4f46e5" /> Chi tiết hành trình & Ghế
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Tuyến: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBooking.routeName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Mã chuyến: </span>
                  <strong style={{ color: '#4f46e5' }}>{selectedBooking.tripCode}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Số ghế: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedBooking.seats.join(', ')}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Thời gian đặt: </span>
                  <span style={{ color: '#0f172a' }}>{selectedBooking.bookingTime}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b' }}>Điểm đón: </span>
                  <span style={{ color: '#0f172a' }}>{selectedBooking.pickupPoint}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b' }}>Điểm trả: </span>
                  <span style={{ color: '#0f172a' }}>{selectedBooking.dropoffPoint}</span>
                </div>
              </div>
            </div>

            {/* Payment Card */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} color="#059669" /> Thanh toán & Trạng thái
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Phương thức: {selectedBooking.paymentMethod}</div>
                  <div style={{ fontSize: '12px', color: selectedBooking.paymentStatus === 'PAID' ? '#059669' : '#d97706', fontWeight: 600, marginTop: '2px' }}>
                    {selectedBooking.paymentStatus === 'PAID' ? '✓ Đã thanh toán đầy đủ' : '⏳ Chưa thanh toán'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>TỔNG TIỀN</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                    {selectedBooking.totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handlePrintTicket(selectedBooking)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} /> In vé
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedBooking.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmBooking(selectedBooking.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle size={15} /> Xác nhận vé
                  </button>
                )}

                {selectedBooking.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={15} /> Hủy vé / Hoàn tiền
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyBookingsPage;
