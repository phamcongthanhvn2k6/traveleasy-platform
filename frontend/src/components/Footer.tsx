import React from 'react';
import { Bus, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '48px 0 24px', marginTop: '64px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', marginBottom: '16px' }}>
            <Bus size={24} color="#38bdf8" />
            <span style={{ fontSize: '20px', fontWeight: 800 }}>TravelEasy Platform</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
            Hệ thống quản lý nhà xe và bán vé xe khách trực tuyến hàng đầu. Kết nối hành khách với các nhà xe uy tín Phương Trang, Thành Bưởi, Sao Việt trên toàn quốc.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>Tuyến Đường Phổ Biến</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', lineHeight: 2 }}>
            <li>Xe đi Đà Lạt từ Sài Gòn</li>
            <li>Xe đi Nha Trang từ Sài Gòn</li>
            <li>Xe đi Sa Pa từ Hà Nội</li>
            <li>Xe đi Đà Nẵng từ Hà Nội</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>Đối Tác Nhà Xe</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', lineHeight: 2 }}>
            <li>TravelEasy Express Bus Lines</li>
            <li>Thành Bưởi Limousine</li>
            <li>Sao Việt Express</li>
            <li>Hải Vân Bus</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>Chính Sách & Hỗ Trợ</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', lineHeight: 2 }}>
            <li>Chính sách hoàn / huỷ vé 24/7</li>
            <li>Quy chế hoạt động sàn vé xe</li>
            <li>Cam kết giữ 100% chỗ ngồi</li>
            <li>Hỗ trợ kỹ thuật: support@traveleasy.vn</li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', textAlign: 'center', fontSize: '13px' }}>
        TravelEasy Platform &copy; 2026. Phát triển với <Heart size={14} color="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> cho kỳ bảo vệ tốt nghiệp Rikkei Pre-OJT.
      </div>
    </footer>
  );
};
