import React from 'react';
import { AdminNav } from '../components/AdminNav';
import { ShieldAlert, PlusCircle, CheckCircle, Percent, DollarSign, Clock } from 'lucide-react';

export const AdminPoliciesPage: React.FC = () => {
  const refundRules = [
    {
      id: 1,
      minHours: 24,
      maxHours: null,
      refundRate: 90,
      feeRate: 10,
      desc: 'Hủy vé trước giờ khởi hành trên 24 tiếng',
      status: 'ACTIVE'
    },
    {
      id: 2,
      minHours: 12,
      maxHours: 24,
      refundRate: 70,
      feeRate: 30,
      desc: 'Hủy vé từ 12 đến 24 tiếng trước giờ khởi hành',
      status: 'ACTIVE'
    },
    {
      id: 3,
      minHours: 0,
      maxHours: 12,
      refundRate: 0,
      feeRate: 100,
      desc: 'Hủy vé cận giờ (dưới 12 tiếng) hoặc sau giờ xe chạy',
      status: 'ACTIVE'
    }
  ];

  const seatPricingRules = [
    { type: 'Phòng VIP Tầng 1 (A01 - A17)', baseMultiplier: 1.0, surcharge: 0, desc: 'Tầng dưới chống say xe, êm ái, được chọn nhiều nhất' },
    { type: 'Phòng VIP Tầng 2 (B01 - B17)', baseMultiplier: 1.0, surcharge: 0, desc: 'Tầng trên tầm nhìn thoáng đãng, view ngắm cảnh đẹp' },
    { type: 'Phụ thu Cuối tuần (Thứ 6, 7, CN)', baseMultiplier: 1.15, surcharge: 40000, desc: 'Tự động áp dụng cho các chuyến xe xuất bến ngày cuối tuần' },
    { type: 'Phụ thu Dịp Lễ / Tết', baseMultiplier: 1.30, surcharge: 80000, desc: 'Cấu hình theo mùa cao điểm du lịch' }
  ];

  return (
    <div>
      <AdminNav />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}>
              UC-2.9 & BẢNG CANCELLATION_POLICY_RULES
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
              Chính Sách Hủy Vé, Hoàn Tiền & Định Giá Vé Động
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Quy tắc tính phí hoàn trả tự động theo mốc thời gian và chính sách phụ thu theo vị trí ghế/cuối tuần
            </p>
          </div>
          <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <PlusCircle size={18} /> Thêm Quy Tắc Hoàn Tiền
          </button>
        </div>

        {/* Quy Tắc Hủy Hoàn */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Bảng Quy Tắc Hoàn Tiền Khách Hàng (Tự Động Tính Toán Khi Hủy Vé)</span>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Khớp Trigger & Constraint CSDL</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Mốc Thời Gian Hủy</th>
                <th style={{ padding: '14px 20px' }}>Mô Tả Quy Định</th>
                <th style={{ padding: '14px 20px' }}>Tỷ Lệ Hoàn Tiền</th>
                <th style={{ padding: '14px 20px' }}>Phí Hủy Vé</th>
                <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {refundRules.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1e3a8a' }}>
                    {r.maxHours ? `${r.minHours}h ➔ ${r.maxHours}h` : `> ${r.minHours} tiếng`}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#334155' }}>{r.desc}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: r.refundRate > 0 ? '#16a34a' : '#dc2626' }}>
                      {r.refundRate}%
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>{r.feeRate}%</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Định Giá Ghế */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
            Quy Định Định Giá Ghế Động (Seat Pricing Multipliers)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {seatPricingRules.map((p, idx) => (
              <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>{p.type}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{p.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#475569' }}>Hệ số: x{p.baseMultiplier}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                    {p.surcharge > 0 ? `+${new Intl.NumberFormat('vi-VN').format(p.surcharge)}đ` : 'Giá chuẩn'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPoliciesPage;

