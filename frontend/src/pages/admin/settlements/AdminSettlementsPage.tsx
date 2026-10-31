import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  Building,
  CreditCard,
  Printer,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export interface SettlementPeriod {
  id: string;
  code: string;
  companyId: number;
  companyName: string;
  companyLogo: string;
  periodName: string;
  startDate: string;
  endDate: string;
  ticketCount: number;
  grossAmount: number;
  commissionRate: number; // e.g. 10 (%)
  platformCommission: number;
  netPayable: number;
  bankAccount: {
    bankCode?: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'PENDING' | 'RECONCILED' | 'PAID';
  reconciledAt?: string;
  paidAt?: string;
  payoutTxHash?: string;
  payoutNote?: string;
}

export const AdminSettlementsPage: React.FC = () => {
  const [settlements, setSettlements] = useState<SettlementPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RECONCILED' | 'PAID'>('ALL');

  // Modals
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementPeriod | null>(null);
  const [payoutModalSettlement, setPayoutModalSettlement] = useState<SettlementPeriod | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settlements');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSettlements(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load settlements:', err);
      toast.error('Không thể tải dữ liệu quyết toán từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
    toast.info(`Đã sao chép ${label}: ${text}`, 'Clipboard');
  };

  const handleReconcile = async (s: SettlementPeriod) => {
    if (!window.confirm(`Xác nhận chốt số liệu đối soát cho ${s.companyName} với số tiền thực chuyển: ${s.netPayable.toLocaleString('vi-VN')} đ?`)) {
      return;
    }

    try {
      await api.patch(`/admin/settlements/${s.id}/reconcile`);
      setSettlements((prev) =>
        prev.map((item) =>
          item.id === s.id
            ? {
                ...item,
                status: 'RECONCILED',
                reconciledAt: new Date().toLocaleString('vi-VN'),
              }
            : item
        )
      );
      toast.success(`Đã xác nhận chốt đối soát hồ sơ #${s.code}! Trạng thái chuyển sang CHỜ GIẢI NGÂN.`, 'Chốt Đối Soát');
    } catch (err: any) {
      console.error('Failed to reconcile:', err);
      toast.error('Chốt đối soát thất bại', 'Lỗi');
    }
  };

  const openPayoutModal = (s: SettlementPeriod) => {
    setPayoutModalSettlement(s);
    setTxHashInput(`VCB-FT-${Date.now().toString().slice(-8)}`);
    setNoteInput(`Quyet toan hoa hong ky TravelEasy cho ${s.companyName}`);
  };

  const handleExecutePayout = async () => {
    if (!payoutModalSettlement) return;

    setSubmittingPayout(true);
    try {
      await api.patch(`/admin/settlements/${payoutModalSettlement.id}/pay`, null, {
        params: {
          payoutTxHash: txHashInput.trim(),
          note: noteInput.trim(),
        },
      });

      setSettlements((prev) =>
        prev.map((item) =>
          item.id === payoutModalSettlement.id
            ? {
                ...item,
                status: 'PAID',
                paidAt: new Date().toLocaleString('vi-VN'),
                payoutTxHash: txHashInput.trim(),
                payoutNote: noteInput.trim(),
              }
            : item
        )
      );

      toast.success(
        `Đã giải ngân & chuyển khoản quyết toán thành công ${payoutModalSettlement.netPayable.toLocaleString('vi-VN')} đ cho ${payoutModalSettlement.companyName}!`,
        'Giải Ngân Thành Công'
      );
      setPayoutModalSettlement(null);
    } catch (err: any) {
      console.error('Failed to pay settlement:', err);
      toast.error('Cập nhật trạng thái giải ngân thất bại', 'Lỗi');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const filtered = settlements.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.companyName.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.periodName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalGMV = settlements.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalCommission = settlements.reduce((acc, curr) => acc + curr.platformCommission, 0);
  const totalPaid = settlements
    .filter((s) => s.status === 'PAID')
    .reduce((acc, curr) => acc + curr.netPayable, 0);
  const totalPending = settlements
    .filter((s) => s.status !== 'PAID')
    .reduce((acc, curr) => acc + curr.netPayable, 0);

  const handleExportCSV = () => {
    const headers = [
      'Mã Đối Soát',
      'Tên Nhà Xe',
      'Kỳ Quyết Toán',
      'Số Lượng Vé',
      'Tổng Doanh Thu (VNĐ)',
      'Tỷ Lệ Phí Sàn (%)',
      'Phí Sàn Thu (VNĐ)',
      'Thực Trả Nhà Xe (VNĐ)',
      'Ngân Hàng Thụ Hưởng',
      'Số Tài Khoản',
      'Chủ Tài Khoản',
      'Trạng Thái',
      'Mã Giao Dịch Ngân Hàng',
    ];

    const rows = filtered.map((s) => [
      `"${s.code}"`,
      `"${s.companyName}"`,
      `"${s.periodName}"`,
      s.ticketCount,
      s.grossAmount,
      s.commissionRate,
      s.platformCommission,
      s.netPayable,
      `"${s.bankAccount?.bankName || ''}"`,
      `"${s.bankAccount?.accountNumber || ''}"`,
      `"${s.bankAccount?.accountHolder || ''}"`,
      s.status === 'PAID' ? 'ĐÃ GIẢI NGÂN' : s.status === 'RECONCILED' ? 'ĐÃ CHỐT ĐỐI SOÁT' : 'CHỜ ĐỐI SOÁT',
      `"${s.payoutTxHash || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Ke_Chi_Tra_Nha_Xe_TravelEasy_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã tải bảng kê chi trả đối tác thành công!', 'Xuất Dữ Liệu');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tài chính{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đối soát & Quyết toán
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Đối Soát & Quyết Toán Hoa Hồng Sàn Cho Nhà Xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
            Quản lý tỷ lệ chiết khấu, đối chiếu vé thực bán và chuyển khoản giải ngân (Payout 24/7) cho đối tác
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchSettlements}
            style={{
              backgroundColor: '#ffffff',
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
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
            }}
          >
            <FileSpreadsheet size={15} /> Xuất Bảng Kê Ngân Hàng
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>TỔNG DOANH THU VÉ (GMV)</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
            {totalGMV.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>Tổng tiền thu hộ từ hành khách</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>HOA HỒNG SÀN GIỮ LẠI (10%)</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginTop: '10px' }}>
            {totalCommission.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>Doanh thu thực sàn TravelEasy</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>ĐÃ GIẢI NGÂN CHO NHÀ XE</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
            {totalPaid.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Tiền đã về tài khoản ngân hàng nhà xe</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>CHỜ GIẢI NGÂN / ĐỐI SOÁT</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '10px' }}>
            {totalPending.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#d97706', marginTop: '4px' }}>Cần chuyển khoản cho đối tác</div>
        </div>
      </div>

      {/* 3. Filter Row */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Tìm theo Mã đối soát, Tên nhà xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          {[
            { key: 'ALL', label: `Tất cả (${settlements.length})` },
            { key: 'PAID', label: `Đã giải ngân (${settlements.filter((s) => s.status === 'PAID').length})` },
            { key: 'RECONCILED', label: `Chờ chuyển tiền (${settlements.filter((s) => s.status === 'RECONCILED').length})` },
            { key: 'PENDING', label: `Đang đối soát (${settlements.filter((s) => s.status === 'PENDING').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
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
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>MÃ ĐỐI SOÁT & KỲ</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>ĐỐI TÁC NHÀ XE</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>TK NGÂN HÀNG THỤ HƯỞNG</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>SỐ VÉ BÁN</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>DOANH THU GỘP</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>HOA HỒNG SÀN</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>THỰC CHUYỂN NHÀ XE</th>
                <th style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                <th style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Đang nạp dữ liệu quyết toán từ CSDL...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Không có bản ghi quyết toán nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '5px', border: '1px solid #bfdbfe' }}>
                        {s.code}
                      </span>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>{s.periodName}</div>
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.companyName}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        Mã đối tác: #{s.companyId}
                      </div>
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                        {s.bankAccount?.accountNumber}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                        {s.bankAccount?.bankName}
                      </div>
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {s.ticketCount.toLocaleString('vi-VN')} vé
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', fontWeight: 700 }}>
                      {s.grossAmount.toLocaleString('vi-VN')} đ
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', color: '#16a34a', fontWeight: 700 }}>
                      -{s.platformCommission.toLocaleString('vi-VN')} đ{' '}
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({s.commissionRate}%)</span>
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', fontWeight: 900, color: '#2563eb', fontSize: '14px' }}>
                      {s.netPayable.toLocaleString('vi-VN')} đ
                    </td>

                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor:
                            s.status === 'PAID'
                              ? '#f0fdf4'
                              : s.status === 'RECONCILED'
                              ? '#eff6ff'
                              : '#fffbeb',
                          color:
                            s.status === 'PAID'
                              ? '#16a34a'
                              : s.status === 'RECONCILED'
                              ? '#2563eb'
                              : '#d97706',
                          border: `1px solid ${
                            s.status === 'PAID'
                              ? '#bbf7d0'
                              : s.status === 'RECONCILED'
                              ? '#bfdbfe'
                              : '#fed7aa'
                          }`,
                        }}
                      >
                        {s.status === 'PAID' && '● ĐÃ GIẢI NGÂN'}
                        {s.status === 'RECONCILED' && '⏳ CHỜ GIẢI NGÂN'}
                        {s.status === 'PENDING' && '⚙️ ĐANG ĐỐI SOÁT'}
                      </span>
                    </td>

                    <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {s.status === 'PENDING' && (
                          <button
                            onClick={() => handleReconcile(s)}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Chốt Đối Soát
                          </button>
                        )}

                        {s.status === 'RECONCILED' && (
                          <button
                            onClick={() => openPayoutModal(s)}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 4px rgba(22,163,74,0.25)',
                            }}
                          >
                            <QrCode size={13} /> VietQR Payout
                          </button>
                        )}

                        {s.status === 'PAID' && (
                          <button
                            onClick={() => setSelectedSettlement(s)}
                            style={{
                              backgroundColor: '#f8fafc',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Biên Lai #{s.payoutTxHash?.slice(-6) || 'PAID'}
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedSettlement(s)}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Chi Tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL CHUYỂN KHOẢN VIETQR PAYOUT 24/7 (INTERACTIVE PAYOUT MODAL)       */}
      {/* ========================================================================= */}
      {payoutModalSettlement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !submittingPayout && setPayoutModalSettlement(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={20} color="#16a34a" /> Chuyển Khoản Quyết Toán (VietQR Payout 24/7)
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Hồ sơ đối soát #{payoutModalSettlement.code} • Đơn vị: <strong>{payoutModalSettlement.companyName}</strong>
                </div>
              </div>
              {!submittingPayout && (
                <button
                  onClick={() => setPayoutModalSettlement(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* QR & Bank Details Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Cột 1: Mã VietQR động */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img
                  src={`https://img.vietqr.io/image/${payoutModalSettlement.bankAccount?.bankCode || 'VCB'}-${payoutModalSettlement.bankAccount?.accountNumber}-compact2.png?amount=${payoutModalSettlement.netPayable}&addInfo=TRAVELEASY+QUYET+TOAN+${payoutModalSettlement.code}&accountName=${encodeURIComponent(payoutModalSettlement.bankAccount?.accountHolder || '')}`}
                  alt="VietQR Payout"
                  style={{ width: '180px', height: '180px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '8px', lineHeight: 1.4 }}>
                  Quét bằng App Ngân hàng (VCB, MB, Techcombank...) để bắn tiền tức thì 24/7
                </div>
              </div>

              {/* Cột 2: Thông tin tài khoản thụ hưởng có nút Copy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>NGÂN HÀNG THỤ HƯỞNG</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {payoutModalSettlement.bankAccount?.bankName}
                  </div>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SỐ TÀI KHOẢN (STK)</div>
                    <div style={{ fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace', fontSize: '14px', marginTop: '2px' }}>
                      {payoutModalSettlement.bankAccount?.accountNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(payoutModalSettlement.bankAccount?.accountNumber || '', 'Số tài khoản')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'Số tài khoản' ? '#16a34a' : '#64748b', padding: '4px' }}
                  >
                    {copiedField === 'Số tài khoản' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TÊN CHỦ TÀI KHOẢN</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {payoutModalSettlement.bankAccount?.accountHolder}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(payoutModalSettlement.bankAccount?.accountHolder || '', 'Tên chủ tài khoản')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'Tên chủ tài khoản' ? '#16a34a' : '#64748b', padding: '4px' }}
                  >
                    {copiedField === 'Tên chủ tài khoản' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>SỐ TIỀN THỰC CHUYỂN</div>
                    <div style={{ fontWeight: 900, color: '#059669', fontSize: '18px', marginTop: '2px' }}>
                      {payoutModalSettlement.netPayable.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(payoutModalSettlement.netPayable.toString(), 'Số tiền')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'Số tiền' ? '#16a34a' : '#059669', padding: '4px' }}
                  >
                    {copiedField === 'Số tiền' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Input Transaction Reference */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '18px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Mã giao dịch ngân hàng / Ủy nhiệm chi (Transaction ID) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  placeholder="Ví dụ: VCB-FT-88992019"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#1e3a8a',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Ghi chú chứng từ chuyển tiền (tùy chọn)
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Ví dụ: Đã chuyển khoản qua Internet Banking VCB lệnh số #991"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={submittingPayout}
                onClick={() => setPayoutModalSettlement(null)}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: submittingPayout ? 'not-allowed' : 'pointer',
                }}
              >
                Hủy Bỏ
              </button>

              <button
                disabled={submittingPayout || !txHashInput.trim()}
                onClick={handleExecutePayout}
                style={{
                  padding: '9px 20px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: submittingPayout || !txHashInput.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(22,163,74,0.25)',
                }}
              >
                {submittingPayout ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Đang cập nhật CSDL...
                  </>
                ) : (
                  'Xác Nhận Đã Chuyển Khoản & Lưu Biên Lai'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL CHI TIẾT BIÊN BẢN & PHIẾU CHI ĐIỆN TỬ (PRINT VOUCHER)              */}
      {/* ========================================================================= */}
      {selectedSettlement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSettlement(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Biên Bản Quyết Toán & Phiếu Chi Điện Tử
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Mã hồ sơ: <strong>{selectedSettlement.code}</strong> • {selectedSettlement.periodName}
                </div>
              </div>
              <button
                onClick={() => setSelectedSettlement(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Đơn vị thụ hưởng:</span>
                <strong style={{ color: '#0f172a' }}>{selectedSettlement.companyName}</strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tài khoản ngân hàng:</span>
                <strong>
                  {selectedSettlement.bankAccount?.bankName} - {selectedSettlement.bankAccount?.accountNumber}
                </strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng số vé sàn đã xuất:</span>
                <strong>{selectedSettlement.ticketCount.toLocaleString('vi-VN')} vé</strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng doanh thu bán vé (GMV):</span>
                <strong>{selectedSettlement.grossAmount.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Phí dịch vụ sàn TravelEasy ({selectedSettlement.commissionRate}%):</span>
                <strong>-{selectedSettlement.platformCommission.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e3a8a' }}>Thực chuyển khoản nhà xe:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>
                  {selectedSettlement.netPayable.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {selectedSettlement.status === 'PAID' && (
                <div style={{ padding: '12px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '13px' }}>
                    <ShieldCheck size={16} /> ĐÃ GIẢI NGÂN HOÀN TẤT VỀ NGÂN HÀNG
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Mã giao dịch ngân hàng: <strong style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>{selectedSettlement.payoutTxHash}</strong>
                  </div>
                  {selectedSettlement.paidAt && (
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Thời gian chuyển tiền: {selectedSettlement.paidAt}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={14} /> In Biên Bản
              </button>
              <button
                onClick={() => setSelectedSettlement(null)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettlementsPage;
