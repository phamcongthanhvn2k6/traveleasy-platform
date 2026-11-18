import React, { useState } from 'react';
import {
  Ticket,
  Search,
  CheckCircle,
  Ban,
  RefreshCw,
  QrCode,
  Phone,
  Mail,
  User,
  Eye,
  AlertTriangle,
  FileText,
  Calendar,
  MapPin,
  Building2,
  X,
  ShieldAlert,
  CreditCard,
  Clock,
  Check,
  Copy,
} from 'lucide-react';
import api from '../../../services/api';
import { Pagination } from '../../../components/Pagination';
import { useAdminPagedList } from '../shared/useAdminPagedList';
import { AdminDepartureFilters } from '../shared/AdminDepartureFilters';
import { toast } from '../../../context/ToastContext';

interface TicketItem {
  id: number;
  ticketCode: string;
  seatNumber: string;
  price: number;
  qrCodeHash?: string;
  status: 'ISSUED' | 'USED' | 'CANCELLED';
  createdAt?: string;
}

interface BookingItem {
  id: number;
  bookingCode: string;
  userId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  trip: {
    id: number;
    busCompanyName: string;
    originCity: string;
    destinationCity: string;
    departureTime: string;
    busType?: string;
    licensePlate?: string;
    price?: number;
  };
  pickupPointName?: string;
  dropoffPointName?: string;
  totalAmount: number;
  originalAmount?: number;
  discountAmount?: number;
  insuranceAmount?: number;
  voucherCode?: string;
  paymentMethod: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  note?: string;
  createdAt: string;
  tickets?: TicketItem[];

  // Thông tin hoàn tiền
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  refundAmount?: number;
  refundFee?: number;
  refundStatus?: 'NONE' | 'PENDING' | 'REFUNDED' | 'REJECTED';
  refundReason?: string;
  refundTxCode?: string;
  refundedAt?: string;
}

interface BookingSummary {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  confirmedRevenue: number;
}

export const AdminBookingsPage: React.FC = () => {
  const list = useAdminPagedList<BookingItem, BookingSummary>('bookings', 10);
  const { page, summary, loading, filters, search, currentPage, pageSize, refresh } = list;
  const paginatedBookings = page?.items ?? [];
  const totalItems = page?.totalElements ?? 0;
  const totalPages = page?.totalPages ?? 0;
  const totalBookings = summary?.total ?? 0;
  const confirmedCount = summary?.confirmed ?? 0;
  const pendingCount = summary?.pending ?? 0;
  const cancelledCount = summary?.cancelled ?? 0;
  const confirmedRevenue = summary?.confirmedRevenue ?? 0;
  const statusFilter = filters.status ?? 'ALL';
  const companyFilter = filters.busCompanyId?.toString() ?? 'ALL';

  // Modal states
  const [detailBooking, setDetailBooking] = useState<BookingItem | null>(null);
  const [interventionBooking, setInterventionBooking] = useState<BookingItem | null>(null);
  const [interventionTarget, setInterventionTarget] = useState<'CONFIRMED' | 'CANCELLED' | null>(null);
  const [interventionReason, setInterventionReason] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Form STK hoàn tiền khi Admin can thiệp hủy đơn
  const [adminRefundBank, setAdminRefundBank] = useState('MB');
  const [adminRefundAccount, setAdminRefundAccount] = useState('');
  const [adminRefundHolder, setAdminRefundHolder] = useState('');

  // Copy indicator
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Copy helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
    toast.info(`Đã sao chép mã đơn #${code}`, 'Clipboard');
  };

  // Open intervention modal
  const openIntervention = (booking: BookingItem, target: 'CONFIRMED' | 'CANCELLED') => {
    setInterventionBooking(booking);
    setInterventionTarget(target);
    setInterventionReason('');
    setCustomNote('');
    setAdminRefundBank(booking.refundBankName || 'MB');
    setAdminRefundAccount(booking.refundAccountNumber || '');
    setAdminRefundHolder(booking.refundAccountHolder || booking.customerName || '');
  };

  // Confirm refund execution
  const handleConfirmRefund = async (bookingId: number) => {
    const tx = prompt('Nhập mã đối soát / mã giao dịch chuyển khoản ngân hàng (Audit Code):', 'VIETQR-' + Date.now().toString().slice(-6));
    if (tx === null) return;
    try {
      const { data } = await api.post<{ data: BookingItem }>(`/admin/bookings/${bookingId}/confirm-refund`, null, {
        params: { txCode: tx || 'VIETQR-MANUAL' }
      });
      refresh();
      setDetailBooking(prev => prev?.id === bookingId ? data.data : prev);
      toast.success('Đã xác nhận chuyển khoản hoàn tiền thành công cho khách hàng!', 'Hoàn Tiền Hoàn Tất');
    } catch (err: any) {
      toast.error('Không thể xác nhận hoàn tiền: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Submit intervention
  const handleExecuteIntervention = async () => {
    if (!interventionBooking || !interventionTarget) return;

    if (!interventionReason.trim()) {
      toast.warning('Vui lòng chọn hoặc nhập lý do can thiệp bắt buộc để ghi nhận nhật ký kiểm toán.', 'Thiếu thông tin');
      return;
    }

    let fullReason = customNote.trim()
      ? `${interventionReason} - Ghi chú: ${customNote.trim()}`
      : interventionReason;

    if (interventionTarget === 'CANCELLED' && adminRefundAccount.trim()) {
      fullReason += ` [STK hoàn: ${adminRefundBank} - ${adminRefundAccount.trim()} - ${adminRefundHolder.trim().toUpperCase()}]`;
    }

    setSubmitting(true);
    try {
      const { data } = await api.patch<{ data: BookingItem }>(`/admin/bookings/${interventionBooking.id}/status`, null, {
        params: {
          status: interventionTarget,
          reason: fullReason,
        },
      });

      refresh();

      setDetailBooking(prev => prev?.id === interventionBooking.id ? data.data : prev);

      if (interventionTarget === 'CANCELLED') {
        toast.warning(
          `Đã can thiệp hủy đơn #${interventionBooking.bookingCode}. Ghế trên xe đã được giải phóng và doanh thu được khấu trừ tự động.`,
          'Can Thiệp Hoàn Tất'
        );
      } else {
        toast.success(
          `Đã xác nhận thanh toán đơn #${interventionBooking.bookingCode}. Ghế đã được khóa an toàn trên sơ đồ xe.`,
          'Can Thiệp Hoàn Tất'
        );
      }

      setInterventionBooking(null);
      setInterventionTarget(null);
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      const msg = err?.response?.data?.message || 'Cập nhật trạng thái đơn vé thất bại!';
      toast.error(msg, 'Thao Tác Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. Header & Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị sàn{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Giám sát đơn đặt vé
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Giám Sát & Đối Soát Đơn Đặt Vé Toàn Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
            Theo dõi dòng tiền, hỗ trợ xử lý khiếu nại và can thiệp giải quyết sự cố vé thời gian thực
          </div>
        </div>

        <button
          onClick={refresh}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            border: '1px solid #cbd5e1',
            borderRadius: '9px',
            padding: '9px 15px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới CSDL
        </button>
      </div>

      {/* 2. KPI Summary Command Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        {/* KPI 1: Tổng đơn vé */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ticket size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TỔNG ĐƠN ĐẶT VÉ</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {totalBookings} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>đơn</span>
            </div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
              {confirmedCount} đơn thành công ({totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* KPI 2: Doanh thu thực tế */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>DOANH THU THỰC NHẬN</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', lineHeight: 1.2 }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(confirmedRevenue)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Từ {confirmedCount} đơn CONFIRMED
            </div>
          </div>
        </div>

        {/* KPI 3: Chờ thanh toán */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CHỜ THANH TOÁN</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706', lineHeight: 1.2 }}>
              {pendingCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>đơn</span>
            </div>
            <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px', fontWeight: 500 }}>
              Cần đối soát PayOS/MoMo
            </div>
          </div>
        </div>

        {/* KPI 4: Đã hủy vé */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ban size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ĐÃ HỦY / BỒI HOÀN</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', lineHeight: 1.2 }}>
              {cancelledCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>đơn</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Đã giải phóng ghế trống
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '480px' }}>
          <input
            type="text"
            placeholder="Tìm theo Mã đơn (BK-...), Khách hàng, SĐT hoặc Email..."
            value={search}
            onChange={e => list.setFilter('search', e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#f8fafc',
            }}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          {search && (
            <button
              onClick={() => list.setFilter('search', '')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Nhà xe */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Nhà xe:</span>
          <select
            value={companyFilter}
            onChange={e => list.setFilter('busCompanyId', e.target.value === 'ALL' ? '' : e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">Tất cả nhà xe ({list.companies.length})</option>
            {companyFilter !== 'ALL' && !list.companies.some(company => String(company.id) === companyFilter) && (
              <option value={companyFilter}>Nhà xe #{companyFilter}</option>
            )}
            {list.companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <AdminDepartureFilters list={list} />

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
          {[
            { key: 'ALL', label: `Tất cả (${totalBookings})` },
            { key: 'CONFIRMED', label: `Đã thanh toán (${confirmedCount})` },
            { key: 'PENDING', label: `Chờ thanh toán (${pendingCount})` },
            { key: 'CANCELLED', label: `Đã hủy (${cancelledCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => list.setFilter('status', tab.key)}
              style={{
                backgroundColor: statusFilter === tab.key ? '#ffffff' : 'transparent',
                color: statusFilter === tab.key ? '#1e3a8a' : '#64748b',
                fontWeight: statusFilter === tab.key ? 700 : 500,
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: statusFilter === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bookings Table (Wrapped in responsive container with anti-squishing) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table aria-busy={loading} style={{ width: '100%', minWidth: '1180px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>MÃ ĐƠN & THỜI GIAN</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>HÀNH KHÁCH</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>LỘ TRÌNH & NHÀ XE</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>GHẾ ĐÃ CHỌN</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>TỔNG TIỀN & PTTT</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                <th style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>THAO TÁC QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody>
              {loading && !page ? (
                <tr>
                  <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={24} className="animate-spin" color="#2563eb" />
                      <div>Đang tải dữ liệu đơn đặt vé từ Supabase CSDL...</div>
                    </div>
                  </td>
                </tr>
              ) : list.dateError || list.failed ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }} role="alert">
                  {list.dateError || 'Không thể tải danh sách đơn đặt vé.'}
                </td></tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '45px', textAlign: 'center', color: '#94a3b8' }}>
                    <Ticket size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 600, color: '#64748b' }}>Không tìm thấy đơn đặt vé nào phù hợp</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>Hãy thử đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc</div>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map(b => (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                      backgroundColor: '#ffffff',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Mã đơn & Thời gian */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: '#1e3a8a',
                            fontSize: '12.5px',
                            backgroundColor: '#eff6ff',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            border: '1px solid #bfdbfe',
                            letterSpacing: '0.2px',
                          }}
                        >
                          {b.bookingCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(b.bookingCode)}
                          title="Sao chép mã đơn"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            color: copiedCode === b.bookingCode ? '#16a34a' : '#94a3b8',
                          }}
                        >
                          {copiedCode === b.bookingCode ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                        {new Date(b.createdAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Hành khách */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={13} color="#64748b" /> {b.customerName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#2563eb', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} /> {b.customerPhone}
                      </div>
                    </td>

                    {/* Lộ trình & Nhà xe */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {b.trip?.originCity} → {b.trip?.destinationCity}
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: '#475569',
                          marginTop: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#f1f5f9',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        <Building2 size={11} color="#2563eb" /> {b.trip?.busCompanyName}
                      </div>
                    </td>

                    {/* Ghế đã chọn */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {b.tickets && b.tickets.length > 0 ? (
                          b.tickets.map(t => (
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
                          ))
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '2px' }}>
                          ({b.tickets?.length || 1} vé)
                        </span>
                      </div>
                    </td>

                    {/* Tổng tiền & PTTT */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount)}
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              b.paymentMethod === 'PAYOS'
                                ? '#eff6ff'
                                : b.paymentMethod === 'MOMO'
                                ? '#fdf2f8'
                                : '#f8fafc',
                            color:
                              b.paymentMethod === 'PAYOS'
                                ? '#1d4ed8'
                                : b.paymentMethod === 'MOMO'
                                ? '#be185d'
                                : '#475569',
                            border: `1px solid ${
                              b.paymentMethod === 'PAYOS'
                                ? '#bfdbfe'
                                : b.paymentMethod === 'MOMO'
                                ? '#fbcfe8'
                                : '#e2e8f0'
                            }`,
                          }}
                        >
                          {b.paymentMethod}
                        </span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor:
                            b.status === 'CONFIRMED'
                              ? '#f0fdf4'
                              : b.status === 'CANCELLED'
                              ? '#fef2f2'
                              : '#fffbeb',
                          color:
                            b.status === 'CONFIRMED'
                              ? '#16a34a'
                              : b.status === 'CANCELLED'
                              ? '#ef4444'
                              : '#d97706',
                          border: `1px solid ${
                            b.status === 'CONFIRMED'
                              ? '#bbf7d0'
                              : b.status === 'CANCELLED'
                              ? '#fecaca'
                              : '#fed7aa'
                          }`,
                        }}
                      >
                        {b.status === 'CONFIRMED' && '● ĐÃ THANH TOÁN'}
                        {b.status === 'PENDING' && '⏳ CHỜ THANH TOÁN'}
                        {b.status === 'CANCELLED' && '✕ ĐÃ HỦY VÉ'}
                      </span>
                    </td>

                    {/* Thao tác Quản trị */}
                    <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Nút Chi tiết */}
                        <button
                          onClick={() => setDetailBooking(b)}
                          title="Xem chi tiết đơn vé & Mã QR"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#1e3a8a',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            minWidth: '78px',
                            height: '28px',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Eye size={13} /> Chi tiết
                        </button>

                        {/* Nút Can thiệp an toàn có phân quyền */}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => openIntervention(b, 'CANCELLED')}
                            title="Xử lý khiếu nại / Hủy đơn hoàn tiền"
                            style={{
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              minWidth: '82px',
                              height: '28px',
                              boxSizing: 'border-box',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Ban size={13} /> Hủy đơn
                          </button>
                        )}

                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => openIntervention(b, 'CONFIRMED')}
                            title="Đối soát cổng thanh toán & Kích hoạt vé"
                            style={{
                              backgroundColor: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              minWidth: '82px',
                              height: '28px',
                              boxSizing: 'border-box',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <CheckCircle size={13} /> Kích hoạt
                          </button>
                        )}

                        {b.status === 'CANCELLED' && (
                          <span
                            style={{
                              backgroundColor: '#f8fafc',
                              color: '#94a3b8',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              minWidth: '82px',
                              height: '28px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <Ban size={13} color="#94a3b8" /> Đã hủy
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={Math.min(currentPage, totalPages)}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={list.setCurrentPage}
          onPageSizeChange={list.setPageSize}
          resetOnPageSizeChange={false}
          pageSizeOptions={list.pageSizes}
          itemLabel="đơn vé"
        />
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL 1: CHI TIẾT ĐƠN VÉ & TRA CỨU QR                                    */}
      {/* ========================================================================= */}
      {detailBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setDetailBooking(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Chi Tiết Đơn Đặt Vé #{detailBooking.bookingCode}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        detailBooking.status === 'CONFIRMED'
                          ? '#f0fdf4'
                          : detailBooking.status === 'CANCELLED'
                          ? '#fef2f2'
                          : '#fffbeb',
                      color:
                        detailBooking.status === 'CONFIRMED'
                          ? '#16a34a'
                          : detailBooking.status === 'CANCELLED'
                          ? '#ef4444'
                          : '#d97706',
                      border: `1px solid ${
                        detailBooking.status === 'CONFIRMED'
                          ? '#bbf7d0'
                          : detailBooking.status === 'CANCELLED'
                          ? '#fecaca'
                          : '#fed7aa'
                      }`,
                    }}
                  >
                    {detailBooking.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Ngày tạo: {new Date(detailBooking.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <button
                onClick={() => setDetailBooking(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px' }}>
              {/* Grid 2 cột: Khách hàng & Chuyến xe */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Khối Khách hàng */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> THÔNG TIN HÀNH KHÁCH
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{detailBooking.customerName}</div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>📞 {detailBooking.customerPhone}</div>
                  {detailBooking.customerEmail && (
                    <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>✉️ {detailBooking.customerEmail}</div>
                  )}
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                    <strong>Điểm đón:</strong> {detailBooking.pickupPointName || 'Bến xe xuất phát'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    <strong>Điểm trả:</strong> {detailBooking.dropoffPointName || 'Bến xe đích'}
                  </div>
                </div>

                {/* Khối Chuyến xe */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} /> THÔNG TIN CHUYẾN XE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {detailBooking.trip?.originCity} → {detailBooking.trip?.destinationCity}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
                    🏢 {detailBooking.trip?.busCompanyName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    🕒 Khởi hành:{' '}
                    <strong>
                      {new Date(detailBooking.trip?.departureTime).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                    <strong>Phương thức thanh toán:</strong> {detailBooking.paymentMethod}
                  </div>
                  {detailBooking.voucherCode && (
                    <div style={{ fontSize: '12px', color: '#c026d3', marginTop: '4px', fontWeight: 700 }}>
                      🎁 Voucher ({detailBooking.voucherCode}): -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailBooking.discountAmount || 0)} (Sàn tài trợ Marketing)
                    </div>
                  )}
                  {detailBooking.originalAmount && detailBooking.discountAmount ? (
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Giá vé gốc niêm yết: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailBooking.originalAmount)}
                    </div>
                  ) : null}
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px', fontWeight: 700 }}>
                    <strong>Hành khách thực trả:</strong>{' '}
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailBooking.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Danh sách vé điện tử & Mã QR tra cứu */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ticket size={15} color="#2563eb" /> DANH SÁCH VÉ ĐIỆN TỬ THEO TỪNG GHẾ ({detailBooking.tickets?.length || 0} VÉ)
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '8px 12px' }}>MÃ VÉ</th>
                        <th style={{ padding: '8px 12px' }}>GHẾ</th>
                        <th style={{ padding: '8px 12px' }}>GIÁ NIÊM YẾT</th>
                        <th style={{ padding: '8px 12px' }}>TRẠNG THÁI</th>
                        <th style={{ padding: '8px 12px' }}>MÃ CHECK-IN / QR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailBooking.tickets && detailBooking.tickets.length > 0 ? (
                        detailBooking.tickets.map(t => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                              {t.ticketCode}
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <span
                                style={{
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '4px',
                                  padding: '1px 6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {t.seatNumber}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', fontWeight: 600 }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.price)}
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: t.status === 'ISSUED' ? '#16a34a' : '#ef4444',
                                }}
                              >
                                {t.status === 'ISSUED' ? '● HỢP LỆ' : '✕ ĐÃ HỦY'}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                              {t.qrCodeHash ? `${t.qrCodeHash.substring(0, 16)}...` : 'TK-' + t.ticketCode}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                            Không có thông tin vé con
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* THÔNG TIN HOÀN TIỀN CHO KHÁCH HÀNG (Nếu đơn đã hủy hoặc có yêu cầu hoàn tiền) */}
              {(detailBooking.status === 'CANCELLED' || (detailBooking.refundAmount && detailBooking.refundAmount > 0)) && (
                <div style={{ marginTop: '20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💰 THÔNG TIN ĐỐI SOÁT & HOÀN TIỀN (VIETQR NAPAS 24/7)
                    </div>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: detailBooking.refundStatus === 'REFUNDED' ? '#dcfce7' : '#fef3c7',
                      color: detailBooking.refundStatus === 'REFUNDED' ? '#15803d' : '#b45309',
                      border: `1px solid ${detailBooking.refundStatus === 'REFUNDED' ? '#86efac' : '#fde68a'}`,
                    }}>
                      {detailBooking.refundStatus === 'REFUNDED' ? '● ĐÃ HOÀN TIỀN THÀNH CÔNG' : '⏳ CHỜ CHUYỂN KHOẢN HOÀN TIỀN'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng:</span>{' '}
                      <strong>{detailBooking.refundBankName || 'MB Bank (Quân Đội)'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Số tài khoản:</span>{' '}
                      <strong style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>{detailBooking.refundAccountNumber || 'Chưa cung cấp'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>{' '}
                      <strong>{detailBooking.refundAccountHolder || detailBooking.customerName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Số tiền hoàn (90%):</span>{' '}
                      <strong style={{ color: '#ea580c', fontSize: '14px' }}>
                        {(detailBooking.refundAmount || Math.round(detailBooking.totalAmount * 0.9)).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                    {detailBooking.refundTxCode && (
                      <div style={{ gridColumn: 'span 2', color: '#16a34a', fontSize: '12px' }}>
                        Mã giao dịch đối soát ngân hàng: <strong>{detailBooking.refundTxCode}</strong>
                      </div>
                    )}
                  </div>

                  {/* Ảnh VietQR Chuyển Khoản Tự Động */}
                  {detailBooking.refundAccountNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', marginBottom: '10px' }}>
                      <img
                        src={`https://img.vietqr.io/image/${detailBooking.refundBankName || 'MB'}-${detailBooking.refundAccountNumber}-compact2.png?amount=${Math.round(detailBooking.refundAmount || detailBooking.totalAmount * 0.9)}&addInfo=HOANTIEN+${detailBooking.bookingCode}&accountName=${encodeURIComponent(detailBooking.refundAccountHolder || detailBooking.customerName)}`}
                        alt="VietQR Payout"
                        style={{ width: '105px', height: '105px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Mã VietQR Chuyển Tiền Hoàn Tức Thì</div>
                        Quét mã QR bằng App Ngân Hàng bất kỳ (MB Bank, VCB, BIDV, MoMo) để chuyển khoản hoàn tiền ngay lập tức mà không cần gõ STK.
                      </div>
                    </div>
                  )}

                  {detailBooking.refundStatus !== 'REFUNDED' && (
                    <button
                      onClick={() => handleConfirmRefund(detailBooking.id)}
                      style={{
                        width: '100%',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      <CheckCircle size={15} /> Xác Nhận Đã Chuyển Khoản Hoàn Tiền Thành Công
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                backgroundColor: '#f8fafc',
                gap: '10px',
              }}
            >
              <button
                onClick={() => setDetailBooking(null)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL 2: CAN THIỆP ĐƠN VÉ (HỦY / ĐỐI SOÁT XÁC NHẬN CÓ LÝ DO KIỂM TOÁN)   */}
      {/* ========================================================================= */}
      {interventionBooking && interventionTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => !submitting && setInterventionBooking(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(560px, 94vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: interventionTarget === 'CANCELLED' ? '#fff1f2' : '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: interventionTarget === 'CANCELLED' ? '#fecdd3' : '#bbf7d0',
                    color: interventionTarget === 'CANCELLED' ? '#e11d48' : '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {interventionTarget === 'CANCELLED' ? <ShieldAlert size={20} /> : <CheckCircle size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {interventionTarget === 'CANCELLED'
                      ? 'Quy Trình Hủy Vé & Bồi Hoàn (Dispute)'
                      : 'Đối Soát Cổng Thanh Toán & Kích Hoạt'}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Đơn vé: <strong>#{interventionBooking.bookingCode}</strong> ({interventionBooking.customerName})
                  </div>
                </div>
              </div>

              {!submitting && (
                <button
                  onClick={() => setInterventionBooking(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: '22px' }}>
              {/* Alert Warning */}
              <div
                style={{
                  backgroundColor: interventionTarget === 'CANCELLED' ? '#fef2f2' : '#eff6ff',
                  border: `1px solid ${interventionTarget === 'CANCELLED' ? '#fecaca' : '#bfdbfe'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '12.5px',
                  color: interventionTarget === 'CANCELLED' ? '#991b1b' : '#1e40af',
                  lineHeight: 1.5,
                }}
              >
                {interventionTarget === 'CANCELLED' ? (
                  <>
                    ⚠️ <strong>Cảnh báo an toàn:</strong> Thao tác này sẽ hủy vé, điều chỉnh doanh thu và tự động{' '}
                    <strong>giải phóng các ghế về trạng thái AVAILABLE</strong> trên sơ đồ chuyến xe. Hãy đảm bảo quy trình đối soát hoàn tiền cho khách trước khi duyệt.
                  </>
                ) : (
                  <>
                    ℹ️ <strong>Xác nhận đối soát:</strong> Thao tác này xác nhận khách đã thanh toán thành công qua cổng thanh toán (PayOS/MoMo/VNPay). Hệ thống sẽ kiểm tra ghế an toàn và{' '}
                    <strong>khóa ghế (BOOKED)</strong> tránh tình trạng trùng vé.
                  </>
                )}
              </div>

              {/* Thông tin hoàn tiền & STK khách hàng */}
              {interventionTarget === 'CANCELLED' && (
                <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#9a3412' }}>
                      💰 Thông Tin Chuyển Khoản Hoàn Tiền (Napas 24/7)
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c' }}>
                      Số tiền hoàn (90%): {((interventionBooking.refundAmount || Math.round(interventionBooking.totalAmount * 0.9))).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Ngân hàng nhận hoàn
                      </label>
                      <select
                        value={adminRefundBank}
                        onChange={e => setAdminRefundBank(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#ffffff' }}
                      >
                        <option value="MB">MB Bank (Quân Đội)</option>
                        <option value="VCB">Vietcombank</option>
                        <option value="TCB">Techcombank</option>
                        <option value="BIDV">BIDV</option>
                        <option value="CTG">VietinBank</option>
                        <option value="ACB">ACB</option>
                        <option value="VPB">VPBank</option>
                        <option value="TPB">TPBank</option>
                        <option value="VBA">Agribank</option>
                        <option value="STB">Sacombank</option>
                        <option value="MOMO">Ví MoMo</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Số tài khoản thụ hưởng
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập STK khách..."
                        value={adminRefundAccount}
                        onChange={e => setAdminRefundAccount(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Tên chủ tài khoản (viết hoa)
                    </label>
                    <input
                      type="text"
                      placeholder="Tên chủ tài khoản..."
                      value={adminRefundHolder}
                      onChange={e => setAdminRefundHolder(e.target.value.toUpperCase())}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {adminRefundAccount.trim() && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #fdba74', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={`https://img.vietqr.io/image/${adminRefundBank}-${adminRefundAccount.trim()}-compact2.png?amount=${Math.round(interventionBooking.refundAmount || interventionBooking.totalAmount * 0.9)}&addInfo=HOANTIEN+${interventionBooking.bookingCode}&accountName=${encodeURIComponent(adminRefundHolder.trim())}`}
                        alt="VietQR Refund"
                        style={{ width: '95px', height: '95px', borderRadius: '8px', border: '1px solid #fdba74', objectFit: 'contain', backgroundColor: '#ffffff' }}
                      />
                      <div style={{ fontSize: '11.5px', color: '#7c2d12', lineHeight: 1.5 }}>
                        <strong>Mã VietQR Chuyển Tiền Hoàn 24/7:</strong><br />
                        Kế toán quét mã này bằng App ngân hàng (MB Bank, VCB, MoMo) để chuyển khoản hoàn tiền ngay lập tức mà không sợ gõ sai STK hay số tiền.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preset Reason Select */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Lý do can thiệp bắt buộc (Audit Trail) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={interventionReason}
                  onChange={e => setInterventionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Chọn lý do can thiệp --</option>
                  {interventionTarget === 'CANCELLED' ? (
                    <>
                      <option value="Khách hàng yêu cầu hủy qua tổng đài hỗ trợ">Khách hàng yêu cầu hủy qua tổng đài hỗ trợ</option>
                      <option value="Nhà xe báo đổi lịch / hủy chuyến do sự cố kỹ thuật">Nhà xe báo đổi lịch / hủy chuyến do sự cố kỹ thuật</option>
                      <option value="Giao dịch lỗi cổng thanh toán / Khách hàng đã được hoàn tiền">Giao dịch lỗi cổng thanh toán / Khách hàng đã được hoàn tiền</option>
                      <option value="Phát hiện gian lận hoặc vi phạm quy chế sàn">Phát hiện gian lận hoặc vi phạm quy chế sàn</option>
                      <option value="Khác (Ghi rõ chi tiết bên dưới)">Khác (Ghi rõ chi tiết bên dưới)</option>
                    </>
                  ) : (
                    <>
                      <option value="Đã đối soát cổng thanh toán: Giao dịch thành công (PAID)">Đã đối soát cổng thanh toán: Giao dịch thành công (PAID)</option>
                      <option value="Khách hàng chuyển khoản ủy nhiệm chi ngân hàng có xác nhận">Khách hàng chuyển khoản ủy nhiệm chi ngân hàng có xác nhận</option>
                      <option value="Xử lý bồi hoàn / Đổi chuyến xe hỗ trợ đặc biệt">Xử lý bồi hoàn / Đổi chuyến xe hỗ trợ đặc biệt</option>
                      <option value="Khác (Ghi rõ chi tiết bên dưới)">Khác (Ghi rõ chi tiết bên dưới)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Custom Note */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Ghi chú nội bộ / Mã biên bản đối soát (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Mã đối soát PayOS #TXN-9912, khách đã nhận tiền qua STK VCB..."
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                backgroundColor: '#f8fafc',
              }}
            >
              <button
                disabled={submitting}
                onClick={() => setInterventionBooking(null)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                Hủy bỏ
              </button>

              <button
                disabled={submitting}
                onClick={handleExecuteIntervention}
                style={{
                  backgroundColor: interventionTarget === 'CANCELLED' ? '#e11d48' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Đang đồng bộ CSDL...
                  </>
                ) : interventionTarget === 'CANCELLED' ? (
                  'Xác Nhận Hủy Vé & Trả Ghế'
                ) : (
                  'Xác Nhận Kích Hoạt & Khóa Ghế'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
