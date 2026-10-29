import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  CreditCard,
  Download,
  Building,
  FileSpreadsheet,
  Printer,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface PartnerSettlementRecord {
  id: string;
  code: string;
  periodName: string;
  startDate: string;
  endDate: string;
  ticketCount: number;
  grossAmount: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  netReceived: number;
  status: 'PENDING' | 'RECONCILED' | 'PAID';
  reconciledAt?: string;
  paidAt?: string;
  payoutTxHash?: string;
}

export const CompanySettlementsPage: React.FC = () => {
  const [settlements, setSettlements] = useState<PartnerSettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PartnerSettlementRecord | null>(null);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/settlements');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSettlements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load settlements from Supabase:', err);
      toast.error('Không thể tải dữ liệu quyết toán từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const totalGross = settlements.reduce((a, b) => a + b.grossAmount, 0);
  const totalPaid = settlements.filter(s => s.status === 'PAID').reduce((a, b) => a + b.netReceived, 0);
  const totalPending = settlements.filter(s => s.status !== 'PAID').reduce((a, b) => a + b.netReceived, 0);

  const handleExportCSV = () => {
    const headers = [
      'Mã Đối Soát',
      'Kỳ Quyết Toán',
      'Số Lượng Vé',
      'Doanh Số Bán Vé (VNĐ)',
      'Phí Sàn TravelEasy (%)',
      'Phí Dịch Vụ Sàn (VNĐ)',
      'Thực Nhận Về Tài Khoản (VNĐ)',
      'Trạng Thái',
      'Mã Giao Dịch Chuyển Khoản'
    ];

    const rows = settlements.map(s => [
      `"${s.code}"`,
      `"${s.periodName}"`,
      s.ticketCount,
      s.grossAmount,
      s.platformFeeRate,
      s.platformFeeAmount,
      s.netReceived,
      s.status === 'PAID' ? 'ĐÃ NHẬN TIỀN' : s.status === 'RECONCILED' ? 'ĐÃ CHỐT SỐ' : 'ĐANG ĐỐI SOÁT',
      `"${s.payoutTxHash || '-'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Doi_Soat_Doanh_Thu_Nha_Xe_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã tải bảng đối soát thu nhập nhà xe thành công!', 'Xuất Dữ Liệu');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Đối tác TravelEasy <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tài chính <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đối soát & Quyết toán
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Doanh Thu & Đối Soát Nhận Tiền Từ Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Theo dõi chi tiết số tiền bán vé qua sàn TravelEasy và tiến độ chuyển khoản giải ngân về tài khoản nhà xe
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            backgroundColor: '#0d9488',
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
            boxShadow: '0 2px 4px rgba(13, 148, 136, 0.25)',
          }}
        >
          <FileSpreadsheet size={15} /> Xuất Báo Cáo Excel
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Tổng Bán Vé Qua Sàn</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '12px' }}>
            {totalGross.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Tổng số vé xuất: <strong>3.070 vé</strong>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Đã Nhận Về Tài Khoản</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginTop: '12px' }}>
            {totalPaid.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
            ✓ Đã tất toán kỳ 1 thành công
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Đang Chờ Sàn Quyết Toán</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#d97706', marginTop: '12px' }}>
            {totalPending.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Dự kiến chuyển khoản ngày 02/11/2026
          </div>
        </div>
      </div>

      {/* Bank Account Details Banner */}
      <div
        style={{
          backgroundColor: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600 }}>TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN ĐÃ ĐĂNG KÝ VỚI SÀN</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              Vietcombank - Chi nhánh Sài Gòn • STK: <strong>0071000123456</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Chủ tài khoản: CÔNG TY CỔ PHẦN XE KHÁCH PHƯƠNG TRANG FUTA BUS LINES
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 700, backgroundColor: '#ccfbf1', padding: '4px 10px', borderRadius: '6px' }}>
            ✓ ĐÃ XÁC THỰC KYC DOANH NGHIỆP
          </span>
        </div>
      </div>

      {/* Table of Settlement Periods */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>Mã Đối Soát</th>
              <th style={{ padding: '14px 18px' }}>Chu Kỳ</th>
              <th style={{ padding: '14px 18px' }}>Vé Bán Sàn</th>
              <th style={{ padding: '14px 18px' }}>Tổng Doanh Số</th>
              <th style={{ padding: '14px 18px' }}>Phí Dịch Vụ Sàn</th>
              <th style={{ padding: '14px 18px' }}>Thực Nhận Về TK</th>
              <th style={{ padding: '14px 18px' }}>Trạng Thái</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => {
              const isPaid = s.status === 'PAID';
              const isPending = s.status === 'PENDING';

              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                    {s.code}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{s.periodName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.startDate} - {s.endDate}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                    {s.ticketCount.toLocaleString('vi-VN')} vé
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    {s.grossAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#dc2626' }}>
                      -{s.platformFeeAmount.toLocaleString('vi-VN')} đ
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Chiết khấu {s.platformFeeRate}%</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 800, color: '#0d9488', fontSize: '15px' }}>
                      {s.netReceived.toLocaleString('vi-VN')} đ
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
                        color: isPaid ? '#059669' : '#d97706',
                        border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {isPaid ? 'ĐÃ NHẬN TIỀN' : 'CHỜ ĐỐI SOÁT'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedRecord(s)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Xem Biên Bản
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Receipt */}
      {selectedRecord && (
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
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '580px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                Biên Bản Đối Soát Doanh Thu Đối Tác
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kỳ quyết toán:</span>
                <strong>{selectedRecord.periodName} ({selectedRecord.startDate} - {selectedRecord.endDate})</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng số vé đặt thành công:</span>
                <strong>{selectedRecord.ticketCount.toLocaleString('vi-VN')} vé</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Doanh số bán vé:</span>
                <strong>{selectedRecord.grossAmount.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Phí dịch vụ nền tảng sàn ({selectedRecord.platformFeeRate}%):</span>
                <strong>-{selectedRecord.platformFeeAmount.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '14px 16px', backgroundColor: '#f0fdfa', borderRadius: '10px', border: '1px solid #99f6e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f766e' }}>Số tiền thực nhận về tài khoản:</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#0d9488' }}>
                  {selectedRecord.netReceived.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {selectedRecord.payoutTxHash && (
                <div style={{ fontSize: '12px', color: '#64748b', padding: '6px 0' }}>
                  Mã giao dịch ngân hàng: <strong style={{ color: '#0f172a' }}>{selectedRecord.payoutTxHash}</strong> (Đã ghi có ngày {selectedRecord.paidAt})
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
                onClick={() => setSelectedRecord(null)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#0d9488',
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

export default CompanySettlementsPage;

