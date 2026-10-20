import React from 'react';
import { AdminNav } from '../components/AdminNav';
import { FileText, ShieldCheck, Clock, User, CheckCircle, Star } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const auditLogs = [
    {
      id: 'LOG-001',
      action: 'SYSTEM_SEED_INITIALIZATION',
      entity: 'DATABASE',
      performedBy: 'SYSTEM (DataInitializer)',
      ipAddress: '127.0.0.1',
      timestamp: '2026-10-20 08:00:00',
      details: 'Khởi tạo thành công 36 bảng CSDL và nạp dữ liệu mẫu seed data'
    },
    {
      id: 'LOG-002',
      action: 'CREATE_TRIP_AUTO_SEATS',
      entity: 'Trip #1',
      performedBy: 'Phamcongt56@gmail.com (ADMIN)',
      ipAddress: '192.168.1.10',
      timestamp: '2026-10-20 08:30:15',
      details: 'Tạo chuyến xe Sài Gòn - Đà Lạt và tự động sinh 34 ghế Limousine'
    },
    {
      id: 'LOG-003',
      action: 'CONFIRM_BOOKING',
      entity: 'Booking #BK-20261025-001',
      performedBy: 'GUEST_CHECKOUT',
      ipAddress: '14.161.20.88',
      timestamp: '2026-10-20 09:12:44',
      details: 'Hành khách đặt thành công 2 ghế A01, A02. Phương thức: COD'
    },
    {
      id: 'LOG-004',
      action: 'VERIFY_QR_TICKET',
      entity: 'Ticket #TK-001',
      performedBy: 'taixe.tran@thanhbuoi.vn (DRIVER)',
      ipAddress: '172.16.0.4',
      timestamp: '2026-10-20 09:40:22',
      details: 'Tài xế quét mã QR kiểm tra vé hợp lệ khi hành khách lên xe'
    }
  ];

  const reviews = [
    {
      id: 1,
      customer: 'Lê Thị Hằng',
      trip: 'TP.HCM ➔ Đà Lạt (Phương Trang)',
      rating: 5,
      comment: 'Xe Limousine 34 phòng rất êm ái, sạch sẽ, tài xế lái cẩn thận và đón đúng giờ tại bến xe Miền Đông!',
      date: '2026-10-20 10:00',
      status: 'APPROVED'
    },
    {
      id: 2,
      customer: 'Trần Văn Nam',
      trip: 'Đà Lạt ➔ TP.HCM (Thành Bưởi)',
      rating: 5,
      comment: 'Trải nghiệm đặt vé trực tuyến rất tiện lợi, chọn ghế tầng 1 chống say xe cực kỳ chuẩn xác.',
      date: '2026-10-19 16:30',
      status: 'APPROVED'
    }
  ];

  return (
    <div>
      <AdminNav />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0891b2', backgroundColor: '#ecfeff', padding: '4px 8px', borderRadius: '4px' }}>
              UC-3.11 & UC-3.9
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
              Nhật Ký Kiểm Toán (Audit Logs) & Kiểm Duyệt Đánh Giá
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Theo dõi toàn bộ lịch sử truy vết bảo mật của hệ thống và phản hồi chất lượng từ khách hàng
            </p>
          </div>
        </div>

        {/* Bảng Audit Logs */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Nhật Ký Thao Tác Hệ Thống (System Audit Trail)</span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Bảo mật & Bất biến (Immutable)</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Mã Log</th>
                <th style={{ padding: '14px 20px' }}>Hành Động</th>
                <th style={{ padding: '14px 20px' }}>Đối Tượng</th>
                <th style={{ padding: '14px 20px' }}>Thực Hiện Bởi</th>
                <th style={{ padding: '14px 20px' }}>Thời Gian</th>
                <th style={{ padding: '14px 20px' }}>Chi Tiết Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0891b2' }}>{log.id}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{log.entity}</td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>{log.performedBy}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{log.timestamp}</td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Đánh Giá Khách Hàng */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
            Kiểm Duyệt Đánh Giá Chuyến Đi Từ Hành Khách (Reviews Moderation)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.customer}</span>
                  <div style={{ display: 'flex', color: '#eab308' }}>
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#eab308" />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginBottom: '6px' }}>{r.trip}</div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>"{r.comment}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                  <span>{r.date}</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ ĐÃ DUYỆT HIỂN THỊ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;

