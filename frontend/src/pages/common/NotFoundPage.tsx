import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Bus, 
  Plane, 
  Train, 
  Car, 
  Tag, 
  ArrowLeft, 
  Search, 
  Home, 
  PhoneCall, 
  Compass, 
  Sparkles, 
  Calendar, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface Props {
  feature?: string;
}

export const NotFoundPage: React.FC<Props> = ({ feature }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tự động nhận diện nếu đường dẫn là tính năng dự kiến phát triển
  const knownFeatures: Record<string, { title: string; desc: string; icon: any; color: string; bg: string; eta: string }> = {
    '/flights': {
      title: 'Vé Máy Bay Trực Tuyến',
      desc: 'Hệ thống đặt vé máy bay nội địa & quốc tế (Vietnam Airlines, Vietjet Air, Bamboo Airways). Tích hợp so sánh giá vé và giữ chỗ tức thì.',
      icon: Plane,
      color: '#0284c7',
      bg: '#f0f9ff',
      eta: 'Dự kiến Quý 1 / 2027',
    },
    '/trains': {
      title: 'Vé Tàu Hỏa Đường Sắt Bắc Nam',
      desc: 'Kết nối trực tiếp hệ thống Tổng công ty Đường sắt Việt Nam (VNR). Chọn toa giường nằm, ghế mềm điều hòa và thanh toán điện tử.',
      icon: Train,
      color: '#d97706',
      bg: '#fffbeb',
      eta: 'Dự kiến Quý 4 / 2026',
    },
    '/car-rental': {
      title: 'Thuê Xe Tự Lái & Du Lịch',
      desc: 'Dịch vụ thuê xe 4 - 45 chỗ có tài xế hoặc tự lái cho chuyến công tác, du lịch gia đình với bảng giá niêm yết minh bạch.',
      icon: Car,
      color: '#059669',
      bg: '#ecfdf5',
      eta: 'Dự kiến Quý 2 / 2027',
    },
    '/promotions': {
      title: 'Mã Giảm Giá & Ưu Đãi Nhà Xe',
      desc: 'Tổng hợp hàng trăm voucher giảm giá đến 50%, mã hoàn tiền VNPAY và chương trình ưu đãi dành cho khách hàng thân thiết.',
      icon: Tag,
      color: '#dc2626',
      bg: '#fef2f2',
      eta: 'Đang cập nhật danh mục ưu đãi...',
    },
    '/hotel': {
      title: 'Khách Sạn & Homestay Điểm Đến',
      desc: 'Combo vé xe khách + phòng nghỉ tiết kiệm tại Đà Lạt, Nha Trang, Vũng Tàu, Sa Pa... Xác nhận phòng tức thì không cần đặt cọc.',
      icon: Compass,
      color: '#7c3aed',
      bg: '#f5f3ff',
      eta: 'Dự kiến Quý 1 / 2027',
    },
  };

  const featureInfo = feature
    ? {
        title: feature,
        desc: 'Tính năng này đang được đội ngũ kỹ sư TravelEasy tích hợp API và hoàn thiện trong lộ trình phát triển phiên bản mới.',
        icon: Sparkles,
        color: '#2563eb',
        bg: '#eff6ff',
        eta: 'Lộ trình cập nhật v2.0',
      }
    : knownFeatures[location.pathname];

  const isComingSoon = !!featureInfo;
  const FeatureIcon = featureInfo?.icon || Sparkles;

  return (
    <div
      style={{
        minHeight: '75vh',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(37, 99, 235, 0.05) 0%, transparent 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '44px 36px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
          boxSizing: 'border-box',
        }}
      >
        {isComingSoon ? (
          /* ======================================================== */
          /* GIAO DIỆN: TÍNH NĂNG ĐANG ĐƯỢC PHÁT TRIỂN (COMING SOON) */
          /* ======================================================== */
          <div>
            {/* Top Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: featureInfo.bg,
                color: featureInfo.color,
                border: `1px solid ${featureInfo.color}30`,
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                marginBottom: '20px',
              }}
            >
              <Calendar size={14} />
              <span>LỘ TRÌNH PHÁT TRIỂN • {featureInfo.eta}</span>
            </div>

            {/* Feature Icon Animation */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '22px',
                backgroundColor: featureInfo.bg,
                color: featureInfo.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: `0 8px 24px ${featureInfo.color}25`,
              }}
            >
              <FeatureIcon size={44} />
            </div>

            <h1
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#0f172a',
                margin: '0 0 10px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Dịch Vụ {featureInfo.title}
            </h1>

            <p
              style={{
                fontSize: '14.5px',
                color: '#475569',
                lineHeight: 1.6,
                margin: '0 auto 24px auto',
                maxWidth: '540px',
              }}
            >
              {featureInfo.desc}
            </p>

            {/* Development Roadmap Cards */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                textAlign: 'left',
                marginBottom: '28px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#2563eb" /> TIẾN ĐỘ TÍCH HỢP HỆ THỐNG:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>✓</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>Khảo sát nhu cầu người dùng & Thiết kế kiến trúc CSDL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>⚙</span>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>Đang kết nối API nhà cung cấp & Cổng thanh toán trực tuyến</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>•</span>
                  <span style={{ color: '#64748b' }}>Kiểm thử End-to-End và phát hành chính thức toàn quốc</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* GIAO DIỆN: 404 KHÔNG TÌM THẤY TRANG (NOT FOUND)          */
          /* ======================================================== */
          <div>
            <div
              style={{
                fontSize: '84px',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-3px',
                color: '#e2e8f0',
                marginBottom: '4px',
              }}
            >
              404
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={13} />
              <span>TRANG KHÔNG TỒN TẠI</span>
            </div>

            <h1
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#0f172a',
                margin: '0 0 10px 0',
                letterSpacing: '-0.3px',
              }}
            >
              Đường Dẫn Không Hợp Lệ
            </h1>

            <p
              style={{
                fontSize: '14.5px',
                color: '#64748b',
                lineHeight: 1.6,
                margin: '0 auto 28px auto',
                maxWidth: '480px',
              }}
            >
              Trang bạn đang tìm kiếm (<code style={{ color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>{location.pathname}</code>) có thể đã bị đổi tên, gỡ bỏ hoặc bạn đã nhập sai địa chỉ URL.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* CÁC NÚT ĐIỀU HƯỚNG HÀNH ĐỘNG HỮU ÍCH (ACTION BUTTONS)      */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/search"
              style={{
                flex: 1,
                minWidth: '200px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 18px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Bus size={18} />
              <span>Đặt Vé Xe Khách Ngay</span>
            </Link>

            <Link
              to="/"
              style={{
                flex: 1,
                minWidth: '160px',
                backgroundColor: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '13px 18px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Home size={17} />
              <span>Về Trang Chủ</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
            }}
          >
            <ArrowLeft size={15} />
            <span>Quay lại trang trước đó</span>
          </button>
        </div>

        {/* Footer Support Info */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '18px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '12.5px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <PhoneCall size={14} color="#0d9488" />
          <span>Tổng đài CSKH 24/7 hỗ trợ đặt vé:</span>
          <strong style={{ color: '#0d9488' }}>1900 6868</strong>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
