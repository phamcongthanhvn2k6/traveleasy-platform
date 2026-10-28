import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Clock,
  PhoneCall,
  Mail,
  MapPin,
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bus,
  LayoutDashboard
} from 'lucide-react';

export const PartnerComingSoonPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: '820px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Top Decorative Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
            padding: '36px 32px',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Clock size={14} /> Tính Năng Đang Phát Triển • Chưa Mở Công Khai
          </div>

          <div
            style={{
              width: '76px',
              height: '76px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <Building2 size={38} color="#0d9488" />
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Cổng Quản Trị Đối Tác Nhà Xe Chưa Được Hỗ Trợ
          </h1>

          <p style={{ fontSize: '15px', color: '#ccfbf1', maxWidth: '620px', margin: '0 auto', lineHeight: 1.5 }}>
            Hệ thống TravelEasy hiện đang ưu tiên tập trung hoàn thiện trải nghiệm đặt vé của <strong>Khách Hàng</strong> và phân hệ <strong>Quản Trị Sàn (Admin)</strong>.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '36px 32px' }}>
          {/* Notice Box */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}
          >
            <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>
                Thông báo phân quyền truy cập
              </div>
              <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
                Bạn đang cố gắng truy cập phân hệ Nhà xe đối tác (<code>/company/*</code>). Vì tính năng này đang trong quá trình phát triển nội bộ và yêu cầu tài khoản Nhà xe (<code>ROLE_OPERATOR</code>) đã ký hợp đồng với sàn, quyền truy cập công khai tạm thời được đóng để bảo vệ an toàn hệ thống.
              </div>
            </div>
          </div>

          {/* Upcoming Features Preview */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#0d9488" />
              Các tính năng đối tác sẽ ra mắt trong phiên bản kế tiếp:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bus size={15} color="#2563eb" /> Quản lý đội xe & kho ghế 2 tầng
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Cấu hình sơ đồ giường nằm 34-40 chỗ, khóa giữ chỗ linh hoạt cho nhà xe.
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#16a34a" /> Điều phối trạm đón & trung chuyển
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Thiết lập danh sách bến bãi, văn phòng đón trả khách kèm ETA chính xác.
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#d97706" /> Ứng dụng quét mã QR soát vé
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Dành riêng cho tài xế và phụ xe quét xác thực vé điện tử tại cửa xe.
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutDashboard size={15} color="#9333ea" /> Báo cáo doanh thu & đối soát tự động
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Thống kê doanh số bán vé sàn, tỷ lệ lấp đầy ghế và chu kỳ rút tiền.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support for Early Registration */}
          <div
            style={{
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: '32px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f766e', marginBottom: '8px' }}>
              Quý nhà xe có nhu cầu hợp tác & mở bán vé sớm trên sàn TravelEasy?
            </div>
            <div style={{ fontSize: '13px', color: '#115e59', marginBottom: '14px' }}>
              Vui lòng liên hệ trực tiếp với Phòng Phát Triển Đối Tác Doanh Nghiệp TravelEasy để nhận hồ sơ hướng dẫn và tài khoản thử nghiệm:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: '#0f766e', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneCall size={15} /> Hotline 24/7: <strong>1900 6868</strong> (Phím 2)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} /> Email: <strong>partner@traveleasy.vn</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} /> Trụ sở: Tòa nhà TravelEasy, Cầu Giấy, Hà Nội
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              <ArrowLeft size={16} /> Quay Lại Trang Chủ
            </button>

            <button
              onClick={() => navigate('/search')}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                border: '1px solid #cbd5e1',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Search size={16} /> Tìm Chuyến Xe Khách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerComingSoonPage;

