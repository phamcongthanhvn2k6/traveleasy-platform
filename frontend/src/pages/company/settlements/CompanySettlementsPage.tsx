import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  CreditCard,
  Building,
  FileSpreadsheet,
  Printer,
  AlertCircle,
  RefreshCw,
  ArrowDownToLine,
  ShieldCheck,
  X,
  Send,
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

  // Withdrawal request modal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawNote, setWithdrawNote] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/settlements');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSettlements(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
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

  const openWithdrawModal = () => {
    setWithdrawAmount(totalPending > 0 ? totalPending : 50000000);
    setWithdrawNote('Đề nghị sàn TravelEasy tất toán kỳ hiện tại vào tài khoản Vietcombank của nhà xe');
    setWithdrawModalOpen(true);
  };

  const handleSendWithdrawRequest = async () => {
    setSubmittingWithdraw(true);
    try {
      await api.post('/company/settlements/request-payout', null, {
        params: { amount: withdrawAmount },
      });
      toast.success(
        `Đã gửi yêu cầu rút ${withdrawAmount.toLocaleString('vi-VN')} đ tới Kế toán Sàn TravelEasy. Tiền sẽ được giải ngân trong 24h!`,
        'Yêu Cầu Rút Tiền'
      );
      setWithdrawModalOpen(false);
    } catch (err: any) {
      console.error('Failed to request payout:', err);
      toast.error('Gửi yêu cầu rút tiền thất bại', 'Lỗi');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

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
      'Mã Giao Dịch Chuyển Khoản',
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
      `"${s.payoutTxHash || '-'}"`,
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Đối tác TravelEasy <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tài chính{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đối soát & Quyết toán
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Doanh Thu & Đối Soát Nhận Tiền Từ Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
            Theo dõi chi tiết số tiền bán vé qua sàn TravelEasy và tiến độ chuyển khoản giải ngân về tài khoản nhà xe
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={openWithdrawModal}
            style={{
              backgroundColor: '#2563eb',
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
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
            }}
          >
            <ArrowDownToLine size={15} /> Yêu Cầu Rút Tiền Về Ngân Hàng
          </button>

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
      </div>

      {/* 2. Bank Profile Box */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
                Tài khoản ngân hàng nhận tiền quyết toán (Payout)
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ShieldCheck size={12} /> Đã liên kết & xác thực chính chủ
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '3px' }}>
              Ngân hàng: <strong>Vietcombank - Chi nhánh Sài Gòn</strong> • STK:{' '}
              <strong style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>0071000987101</strong> • Chủ TK:{' '}
              <strong>CTY CP XE KHACH PHUONG TRANG</strong>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Chu kỳ quyết toán: <strong>Ngày 16 & Ngày 01 hàng tháng</strong> (Tự động chuyển khoản 24/7)
        </div>
      </div>

      {/* 3. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>TỔNG BÁN VÉ QUA SÀN</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '12px' }}>
            {totalGross.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Tổng doanh thu tiền vé khách đặt</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>TIỀN ĐÃ NHẬN VỀ NGÂN HÀNG</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '12px' }}>
            {totalPaid.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>Đã bắn tiền vào tài khoản Vietcombank</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>CHỜ GIẢI NGÂN / ĐỐI SOÁT</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#d97706', marginTop: '12px' }}>
            {totalPending.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', marginTop: '4px' }}>Sẽ giải ngân vào kỳ thanh toán tới</div>
        </div>
      </div>

      {/* 4. Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 18px' }}>MÃ ĐỐI SOÁT & KỲ</th>
              <th style={{ padding: '12px 18px' }}>THỜI GIAN KỲ</th>
              <th style={{ padding: '12px 18px' }}>SỐ VÉ ĐÃ BÁN</th>
              <th style={{ padding: '12px 18px' }}>DOANH THU VÉ</th>
              <th style={{ padding: '12px 18px' }}>PHÍ SÀN (10%)</th>
              <th style={{ padding: '12px 18px' }}>THỰC NHẬN VỀ TK</th>
              <th style={{ padding: '12px 18px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải dữ liệu quyết toán từ CSDL...
                </td>
              </tr>
            ) : settlements.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Chưa có hồ sơ đối soát nào.
                </td>
              </tr>
            ) : (
              settlements.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '5px', border: '1px solid #bfdbfe' }}>
                      {s.code}
                    </span>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>{s.periodName}</div>
                  </td>

                  <td style={{ padding: '14px 18px', color: '#475569' }}>
                    {s.startDate} → {s.endDate}
                  </td>

                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                    {s.ticketCount.toLocaleString('vi-VN')} vé
                  </td>

                  <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                    {s.grossAmount.toLocaleString('vi-VN')} đ
                  </td>

                  <td style={{ padding: '14px 18px', color: '#0d9488', fontWeight: 600 }}>
                    -{s.platformFeeAmount.toLocaleString('vi-VN')} đ
                  </td>

                  <td style={{ padding: '14px 18px', fontWeight: 900, color: '#16a34a', fontSize: '14px' }}>
                    {s.netReceived.toLocaleString('vi-VN')} đ
                  </td>

                  <td style={{ padding: '14px 18px' }}>
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
                      {s.status === 'PAID' && '● ĐÃ NHẬN TIỀN'}
                      {s.status === 'RECONCILED' && '⏳ ĐÃ CHỐT SỐ (CHỜ TIỀN)'}
                      {s.status === 'PENDING' && '⚙️ ĐANG ĐỐI SOÁT'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedRecord(s)}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#1e3a8a',
                        border: '1px solid #cbd5e1',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Chi Tiết & Biên Lai
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL YÊU CẦU RÚT TIỀN / TẤT TOÁN SỚM                                    */}
      {/* ========================================================================= */}
      {withdrawModalOpen && (
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
          onClick={() => !submittingWithdraw && setWithdrawModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownToLine size={20} color="#2563eb" /> Đề Nghị Tất Toán / Rút Tiền Về Ngân Hàng
              </h3>
              {!submittingWithdraw && (
                <button onClick={() => setWithdrawModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
              Số tiền yêu cầu sẽ được Bộ phận Kế toán Sàn TravelEasy kiểm tra đối soát và chuyển khoản trực tiếp vào tài khoản ngân hàng chính chủ đã đăng ký.
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ color: '#64748b' }}>Tài khoản nhận tiền:</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                Vietcombank • 0071000987101 • CTY CP XE KHACH PHUONG TRANG
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Số tiền yêu cầu rút (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Ghi chú yêu cầu
              </label>
              <textarea
                rows={2}
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={submittingWithdraw}
                onClick={() => setWithdrawModalOpen(false)}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: submittingWithdraw ? 'not-allowed' : 'pointer',
                }}
              >
                Hủy
              </button>

              <button
                disabled={submittingWithdraw || withdrawAmount <= 0}
                onClick={handleSendWithdrawRequest}
                style={{
                  padding: '9px 20px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: submittingWithdraw || withdrawAmount <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {submittingWithdraw ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Đang gửi yêu cầu...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Gửi Yêu Cầu Rút Tiền
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL CHI TIẾT BIÊN BẢN & MÃ GIAO DỊCH CHUYỂN KHOẢN                     */}
      {/* ========================================================================= */}
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
          onClick={() => setSelectedRecord(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Biên Bản Đối Soát Doanh Thu Chi Tiết
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Hồ sơ: <strong>{selectedRecord.code}</strong> • {selectedRecord.periodName}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kỳ tính toán:</span>
                <strong>{selectedRecord.startDate} đến {selectedRecord.endDate}</strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng số vé bán ra:</span>
                <strong>{selectedRecord.ticketCount.toLocaleString('vi-VN')} vé</strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng tiền vé thu hộ:</span>
                <strong>{selectedRecord.grossAmount.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Phí dịch vụ sàn ({selectedRecord.platformFeeRate}%):</span>
                <strong>-{selectedRecord.platformFeeAmount.toLocaleString('vi-VN')} đ</strong>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#16a34a' }}>Thực nhận về tài khoản ngân hàng:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                  {selectedRecord.netReceived.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {selectedRecord.status === 'PAID' && (
                <div style={{ padding: '12px 14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: 800, fontSize: '13px' }}>
                    <CheckCircle size={16} /> TIỀN ĐÃ ĐƯỢC CHUYỂN KHOẢN THÀNH CÔNG
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '4px' }}>
                    Mã đối soát ngân hàng: <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{selectedRecord.payoutTxHash}</strong>
                  </div>
                  {selectedRecord.paidAt && (
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Thời gian giải ngân: {selectedRecord.paidAt}
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
