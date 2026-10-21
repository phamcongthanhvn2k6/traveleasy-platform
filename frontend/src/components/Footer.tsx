import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Heart, PhoneCall, Mail, ShieldCheck, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const linkStyle: React.CSSProperties = {
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  };

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '56px 0 28px', marginTop: '64px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '36px', marginBottom: '36px' }}>
        {/* Brand & Introduction */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Bus size={22} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>TravelEasy</span>
              <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 800, marginLeft: '4px' }}>.vn</span>
            </div>
          </div>
          <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#94a3b8', marginBottom: '16px' }}>
            Nền tảng công nghệ kết nối hành khách và các thương hiệu nhà xe uy tín toàn quốc. Đặt vé trực tuyến, chọn vị trí giường nằm 2 tầng trực quan, cam kết giữ chỗ 100%.
          </p>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
              <PhoneCall size={14} color="#38bdf8" /> Hotline CSKH 24/7: <strong>1900 6868</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
              <Mail size={14} color="#38bdf8" /> Email hỗ trợ: <strong>support@traveleasy.vn</strong>
            </span>
          </div>
        </div>

        {/* Popular Routes */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px', fontWeight: 800, letterSpacing: '0.2px' }}>
            Tuyến Đường Phổ Biến
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', lineHeight: 2.2 }}>
            <li>
              <Link to="/search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=%C4%90%C3%A0+L%E1%BA%A1t" style={linkStyle}>
                → Xe đi Đà Lạt từ Sài Gòn
              </Link>
            </li>
            <li>
              <Link to="/search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=Nha+Trang" style={linkStyle}>
                → Xe đi Nha Trang từ Sài Gòn
              </Link>
            </li>
            <li>
              <Link to="/search?origin=H%C3%A0+N%E1%BB%99i&destination=Sa+Pa" style={linkStyle}>
                → Xe đi Sa Pa từ Hà Nội
              </Link>
            </li>
            <li>
              <Link to="/search?origin=H%C3%A0+N%E1%BB%99i&destination=H%E1%BA%A3i+Ph%C3%B2ng" style={linkStyle}>
                → Xe đi Hải Phòng từ Hà Nội
              </Link>
            </li>
            <li>
              <Link to="/search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=V%C5%A9ng+T%C3%A0u" style={linkStyle}>
                → Xe đi Vũng Tàu từ Sài Gòn
              </Link>
            </li>
          </ul>
        </div>

        {/* Bus Companies */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px', fontWeight: 800, letterSpacing: '0.2px' }}>
            Đối Tác Nhà Xe
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', lineHeight: 2.2 }}>
            <li>
              <Link to="/search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=%C4%90%C3%A0+L%E1%BA%A1t" style={linkStyle}>
                → TravelEasy Express Lines
              </Link>
            </li>
            <li>
              <Link to="/search?origin=H%C3%A0+N%E1%BB%99i&destination=Sa+Pa" style={linkStyle}>
                → Sao Việt Express
              </Link>
            </li>
            <li>
              <Link to="/search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=Nha+Trang" style={linkStyle}>
                → Phương Trang FUTA Bus Lines
              </Link>
            </li>
            <li>
              <Link to="/company/login" style={{ ...linkStyle, color: '#38bdf8', fontWeight: 700 }}>
                → Cổng đăng nhập đối tác nhà xe
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies & Support */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px', fontWeight: 800, letterSpacing: '0.2px' }}>
            Chính Sách & Hỗ Trợ
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', lineHeight: 2.2 }}>
            <li>
              <Link to="/policy?tab=cancellation" style={linkStyle}>
                → Chính sách hoàn / hủy vé 24/7
              </Link>
            </li>
            <li>
              <Link to="/policy?tab=guarantee" style={linkStyle}>
                → Cam kết giữ 100% chỗ (Hoàn 150%)
              </Link>
            </li>
            <li>
              <Link to="/policy?tab=terms" style={linkStyle}>
                → Quy chế hoạt động sàn vé xe
              </Link>
            </li>
            <li>
              <Link to="/policy?tab=privacy" style={linkStyle}>
                → Bảo mật & An toàn thanh toán
              </Link>
            </li>
            <li>
              <Link to="/policy?tab=faq" style={linkStyle}>
                → Câu hỏi thường gặp (FAQ)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
        <div>
          TravelEasy Platform &copy; 2026. Bản quyền thuộc về Nhóm 7 — Khóa đào tạo Rikkei Pre-OJT.
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12.5px' }}>
          <Link to="/lookup" style={linkStyle}>Tra cứu vé điện tử</Link>
          <Link to="/my-tickets" style={linkStyle}>Vé của tôi</Link>
          <Link to="/profile" style={linkStyle}>Hồ sơ cá nhân</Link>
          <Link to="/admin/login" style={{ ...linkStyle, color: '#f59e0b' }}>Cổng Quản trị viên</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
