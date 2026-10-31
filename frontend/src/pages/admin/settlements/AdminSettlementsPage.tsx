import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Building,
  CreditCard,
  ArrowUpRight,
  Printer,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet
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
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'PENDING' | 'RECONCILED' | 'PAID';
  reconciledAt?: string;
  paidAt?: string;
}

const SAMPLE_SETTLEMENTS_UNUSED: SettlementPeriod[] = [
  {
    id: 's1',
    code: 'DS-202610-FUTA',
    companyId: 1,
    companyName: 'Phương Trang FUTA Bus Lines',
    companyLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150',
    periodName: 'Kỳ 1 - Tháng 10/2026',
    startDate: '01/10/2026',
    endDate: '15/10/2026',
    ticketCount: 1420,
    grossAmount: 497000000,
    commissionRate: 10,
    platformCommission: 49700000,
    netPayable: 447300000,
    bankAccount: {
      bankName: 'Vietcombank - Chi nhánh Sài Gòn',
      accountNumber: '0071000123456',
      accountHolder: 'CTY CP XE KHACH PHUONG TRANG',
    },
    status: 'PAID',
    reconciledAt: '16/10/2026 10:30',
    paidAt: '17/10/2026 14:15',
  },
  {
    id: 's2',
    code: 'DS-202610-TB',
    companyId: 2,
    companyName: 'Thành Bưởi Limousine',
    companyLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150',
    periodName: 'Kỳ 1 - Tháng 10/2026',
    startDate: '01/10/2026',
    endDate: '15/10/2026',
    ticketCount: 860,
    grossAmount: 301000000,
    commissionRate: 10,
    platformCommission: 30100000,
    netPayable: 270900000,
    bankAccount: {
      bankName: 'MBBank - CN Lê Hồng Phong',
      accountNumber: '9990188888888',
      accountHolder: 'CTY TNHH THANH BUOI',
    },
    status: 'PAID',
    reconciledAt: '16/10/2026 11:20',
    paidAt: '17/10/2026 14:30',
  },
  {
    id: 's3',
    code: 'DS-202610-SV',
    companyId: 3,
    companyName: 'Sao Việt Express',
    companyLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150',
    periodName: 'Kỳ 2 - Tháng 10/2026',
    startDate: '16/10/2026',
    endDate: '31/10/2026',
    ticketCount: 520,
    grossAmount: 182000000,
    commissionRate: 8,
    platformCommission: 14560000,
    netPayable: 167440000,
    bankAccount: {
      bankName: 'Techcombank - CN Mỹ Đình',
      accountNumber: '19034567890012',
      accountHolder: 'CONG TY SAO VIET EXPRESS',
    },
    status: 'RECONCILED',
    reconciledAt: '26/10/2026 09:15',
  },
  {
    id: 's4',
    code: 'DS-202610-FUTA2',
    companyId: 1,
    companyName: 'Phương Trang FUTA Bus Lines',
    companyLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150',
    periodName: 'Kỳ 2 - Tháng 10/2026',
    startDate: '16/10/2026',
    endDate: '31/10/2026',
    ticketCount: 1650,
    grossAmount: 577500000,
    commissionRate: 10,
    platformCommission: 57750000,
    netPayable: 519750000,
    bankAccount: {
      bankName: 'Vietcombank - Chi nhánh Sài Gòn',
      accountNumber: '0071000123456',
      accountHolder: 'CTY CP XE KHACH PHUONG TRANG',
    },
    status: 'PENDING',
  },
  {
    id: 's5',
    code: 'DS-202610-HL',
    companyId: 4,
    companyName: 'Hoa Mai Vũng Tàu',
    companyLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150',
    periodName: 'Kỳ 2 - Tháng 10/2026',
    startDate: '16/10/2026',
    endDate: '31/10/2026',
    ticketCount: 420,
    grossAmount: 84000000,
    commissionRate: 8,
    platformCommission: 6720000,
    netPayable: 77280000,
    bankAccount: {
      bankName: 'ACB - CN Vũng Tàu',
      accountNumber: '2468101214',
      accountHolder: 'DOANH NGHIEP XE HOA MAI',
    },
    status: 'PENDING',
  },
];

export const AdminSettlementsPage: React.FC = () => {
  const [settlements, setSettlements] = useState<SettlementPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RECONCILED' | 'PAID'>('ALL');
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementPeriod | null>(null);

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

  const handleReconcile = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'RECONCILED',
              reconciledAt: new Date().toLocaleString('vi-VN'),
            }
          : s
      )
    );
    toast.success('Đã xác nhận chốt số liệu đối soát cho nhà xe!', 'Chốt Đối Soát');
  };

  const handlePay = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'PAID',
              paidAt: new Date().toLocaleString('vi-VN'),
            }
          : s
      )
    );
    toast.success('Đã giải ngân & chuyển khoản quyết toán thành công!', 'Giải Ngân Thành Công');
  };

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
      `"${s.bankAccount.bankName}"`,
      `"${s.bankAccount.accountNumber}"`,
      `"${s.bankAccount.accountHolder}"`,
      s.status === 'PAID' ? 'ĐÃ GIẢI NGÂN' : s.status === 'RECONCILED' ? 'ĐÃ CHỐT ĐỐI SOÁT' : 'CHỜ ĐỐI SOÁT',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bien_Ban_Doi_Soat_TravelEasy_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã tải file Excel đối soát thành công!', 'Xuất Dữ Liệu');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tài chính <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đối soát & Hoa hồng
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Đối Soát Doanh Thu & Quyết Toán Hoa Hồng Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Quản lý tỷ lệ chiết khấu, đối chiếu vé thực bán và giải ngân lợi nhuận cho đối tác nhà xe
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: '#16a34a',
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
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
            }}
          >
            <FileSpreadsheet size={15} /> Xuất Báo Cáo Excel
          </button>
        </div>
      </div>

      {/* 4 Summary Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Tổng GMV Toàn Sàn</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '10px' }}>
            {totalGMV.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
            ↑ +18.4% so với tháng trước
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Hoa Hồng Sàn Thu Được</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669', marginTop: '10px' }}>
            {totalCommission.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
            Tỷ lệ trung bình: <strong>9.8%</strong> / giao dịch
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Đã Giải Ngân Cho Nhà Xe</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', marginTop: '10px' }}>
            {totalPaid.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
            2 kỳ quyết toán đã hoàn tất
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Chờ Đối Soát & Giải Ngân</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#d97706', marginTop: '10px' }}>
            {totalPending.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
            3 nhà xe cần xử lý chốt số
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tên nhà xe, mã đối soát (DS-202610...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
            }}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          {(['ALL', 'PENDING', 'RECONCILED', 'PAID'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: statusFilter === st ? '#ffffff' : 'transparent',
                color: statusFilter === st ? '#0f172a' : '#64748b',
                boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {st === 'ALL'
                ? 'Tất cả'
                : st === 'PENDING'
                ? 'Chờ đối soát'
                : st === 'RECONCILED'
                ? 'Đã chốt số'
                : 'Đã giải ngân'}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Settlement Periods */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>Mã & Chu Kỳ</th>
              <th style={{ padding: '14px 18px' }}>Nhà Xe Đối Tác</th>
              <th style={{ padding: '14px 18px' }}>Số Vé</th>
              <th style={{ padding: '14px 18px' }}>Tổng Doanh Số</th>
              <th style={{ padding: '14px 18px' }}>Phí Sàn</th>
              <th style={{ padding: '14px 18px' }}>Thực Trả Nhà Xe</th>
              <th style={{ padding: '14px 18px' }}>Tài Khoản Thụ Hưởng</th>
              <th style={{ padding: '14px 18px' }}>Trạng Thái</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy kỳ đối soát nào phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isPaid = s.status === 'PAID';
                const isReconciled = s.status === 'RECONCILED';
                const isPending = s.status === 'PENDING';

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.code}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {s.startDate} - {s.endDate}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={s.companyLogo}
                          alt={s.companyName}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{s.companyName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                      {s.ticketCount.toLocaleString('vi-VN')} vé
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      {s.grossAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#059669' }}>
                        {s.platformCommission.toLocaleString('vi-VN')} đ
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Chiết khấu {s.commissionRate}%</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '14px' }}>
                        {s.netPayable.toLocaleString('vi-VN')} đ
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                        {s.bankAccount.accountNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{s.bankAccount.bankName}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          backgroundColor: isPaid ? '#ecfdf5' : isReconciled ? '#eff6ff' : '#fffbeb',
                          color: isPaid ? '#059669' : isReconciled ? '#2563eb' : '#d97706',
                          border: `1px solid ${isPaid ? '#a7f3d0' : isReconciled ? '#bfdbfe' : '#fde68a'}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {isPaid ? 'ĐÃ GIẢI NGÂN' : isReconciled ? 'ĐÃ CHỐT SỐ' : 'CHỜ ĐỐI SOÁT'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {isPending && (
                          <button
                            onClick={() => handleReconcile(s.id)}
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
                            Chốt Số Liệu
                          </button>
                        )}

                        {isReconciled && (
                          <button
                            onClick={() => handlePay(s.id)}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(22,163,74,0.2)',
                            }}
                          >
                            Giải Ngân Tiền
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedSettlement(s)}
                          style={{
                            backgroundColor: '#f1f5f9',
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail & Print Receipt */}
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
              maxWidth: '620px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Biên Bản Đối Soát Quyết Toán Tài Chính
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Đơn vị thụ hưởng:</span>
                <strong style={{ color: '#0f172a' }}>{selectedSettlement.companyName}</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tài khoản ngân hàng:</span>
                <strong>{selectedSettlement.bankAccount.bankName} - {selectedSettlement.bankAccount.accountNumber}</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng số vé sàn đã xuất:</span>
                <strong>{selectedSettlement.ticketCount.toLocaleString('vi-VN')} vé</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng doanh thu bán vé (GMV):</span>
                <strong>{selectedSettlement.grossAmount.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Phí dịch vụ sàn TravelEasy ({selectedSettlement.commissionRate}%):</span>
                <strong>-{selectedSettlement.platformCommission.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '14px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a' }}>Thực chuyển khoản nhà xe:</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb' }}>
                  {selectedSettlement.netPayable.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  window.print();
                }}
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
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettlementsPage;

