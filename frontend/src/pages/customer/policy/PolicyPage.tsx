import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  RotateCcw,
  FileText,
  HelpCircle,
  Award,
  Lock,
  PhoneCall,
  Mail,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Bus
} from 'lucide-react';

export const PolicyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'cancellation';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '36px 16px 80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Trang chủ</Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Chính sách & Quy chế hoạt động</span>
        </div>

        {/* Main Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Chính Sách & Quy Chế Hoạt Động Sàn TravelEasy
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748b', margin: 0 }}>
            Minh bạch quyền lợi hành khách, quy định hoàn hủy vé và cam kết chất lượng dịch vụ vận chuyển.
          </p>
        </div>

        {/* Layout: Sidebar Tabs on Left + Content on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }}>
          {/* Left Navigation Tabs */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '12px', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <button
              onClick={() => setTab('cancellation')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: currentTab === 'cancellation' ? '#eff6ff' : 'transparent',
                color: currentTab === 'cancellation' ? '#1d4ed8' : '#334155',
                fontWeight: currentTab === 'cancellation' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                marginBottom: '4px',
              }}
            >
              <RotateCcw size={17} color={currentTab === 'cancellation' ? '#2563eb' : '#64748b'} />
              <span>Chính sách hoàn / hủy vé</span>
            </button>

            <button
              onClick={() => setTab('guarantee')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: currentTab === 'guarantee' ? '#eff6ff' : 'transparent',
                color: currentTab === 'guarantee' ? '#1d4ed8' : '#334155',
                fontWeight: currentTab === 'guarantee' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                marginBottom: '4px',
              }}
            >
              <Award size={17} color={currentTab === 'guarantee' ? '#2563eb' : '#64748b'} />
              <span>Cam kết giữ chỗ & Hoàn 150%</span>
            </button>

            <button
              onClick={() => setTab('terms')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: currentTab === 'terms' ? '#eff6ff' : 'transparent',
                color: currentTab === 'terms' ? '#1d4ed8' : '#334155',
                fontWeight: currentTab === 'terms' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                marginBottom: '4px',
              }}
            >
              <FileText size={17} color={currentTab === 'terms' ? '#2563eb' : '#64748b'} />
              <span>Quy chế hoạt động sàn</span>
            </button>

            <button
              onClick={() => setTab('privacy')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: currentTab === 'privacy' ? '#eff6ff' : 'transparent',
                color: currentTab === 'privacy' ? '#1d4ed8' : '#334155',
                fontWeight: currentTab === 'privacy' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                marginBottom: '4px',
              }}
            >
              <Lock size={17} color={currentTab === 'privacy' ? '#2563eb' : '#64748b'} />
              <span>Bảo mật & Thanh toán</span>
            </button>

            <button
              onClick={() => setTab('faq')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: currentTab === 'faq' ? '#eff6ff' : 'transparent',
                color: currentTab === 'faq' ? '#1d4ed8' : '#334155',
                fontWeight: currentTab === 'faq' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <HelpCircle size={17} color={currentTab === 'faq' ? '#2563eb' : '#64748b'} />
              <span>Câu hỏi thường gặp (FAQ)</span>
            </button>

            {/* Hotline Box */}
            <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneCall size={14} /> Tổng đài hỗ trợ 24/7
              </div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#15803d' }}>
                1900 6868
              </div>
              <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                Hỗ trợ hủy vé & khiếu nại cước phí
              </div>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            {/* TAB 1: CANCELLATION */}
            {currentTab === 'cancellation' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Chính Sách Hoàn / Hủy Vé & Đổi Chuyến Xe Khách
                </h2>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  TravelEasy áp dụng quy chuẩn hoàn vé tự động (Automated Refund) và đổi chuyến linh hoạt theo tài liệu đặc tả <strong>SRS UC-1.11</strong> và chính sách <strong>PBD-02</strong> nhằm tối đa hóa quyền lợi khách hàng.
                </p>

                {/* Table of Refund Tiers */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#334155' }}>
                        <th style={{ padding: '12px 16px' }}>Thời Gian Hủy Trước Giờ Chạy</th>
                        <th style={{ padding: '12px 16px' }}>Tỷ Lệ Hoàn Tiền Vé</th>
                        <th style={{ padding: '12px 16px' }}>Phí Đổi Chuyến Mới</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>Trước trên 24 giờ (&gt; 24h)</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#16a34a' }}>Hoàn 90% - 100% giá vé</td>
                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600 }}>Miễn phí 100% (0đ)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#d97706' }}>Từ 12 đến 24 giờ trước giờ chạy</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#d97706' }}>Hoàn 70% giá vé</td>
                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600 }}>Miễn phí (chỉ bù trừ chênh lệch vé)</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ef4444' }}>Dưới 12 giờ trước giờ chạy (&lt; 12h)</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#ef4444' }}>Không hoàn tiền (0%)</td>
                        <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: 600 }}>Không hỗ trợ đổi chuyến</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                    💡 Hỗ trợ Hủy Vé Từng Phần (Partial Cancellation)
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.5 }}>
                    Nếu bạn đặt nhiều vé trong một đơn (ví dụ: A01, A02, A03), bạn có thể chọn hủy riêng lẻ từng ghế mà không ảnh hưởng đến các hành khách còn lại. Hệ thống sẽ tự động tính toán tiền hoàn và gửi thông báo xác nhận.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link
                    to="/my-tickets"
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw size={15} /> Thực hiện hủy / đổi vé tại "Vé của tôi"
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: GUARANTEE */}
            {currentTab === 'guarantee' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Chính Sách Cam Kết 100% Giữ Chỗ & Hoàn Tiền 150%
                </h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
                  <Award size={32} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                      Cam Kết Hoàn Tiền 150% Nếu Nhà Xe Không Cung Cấp Dịch Vụ
                    </div>
                    <div style={{ fontSize: '13px', color: '#15803d', lineHeight: 1.5 }}>
                      TravelEasy cam kết bảo vệ quyền lợi tối đa cho mọi hành khách đặt vé trên sàn. Nếu quý khách đã có mã vé xác nhận hợp lệ nhưng nhà xe hủy chuyến hoặc không bố trí chỗ ngồi đúng loại xe đã cam kết, TravelEasy sẽ hoàn 100% tiền vé đồng thời bồi thường thêm 50% giá trị vé.
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Các trường hợp được bồi thường 150%:
                </h3>
                <ul style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '24px' }}>
                  <li>Nhà xe tự ý hủy chuyến mà không thông báo trước cho hành khách tối thiểu 6 giờ.</li>
                  <li>Nhà xe tự ý chuyển đổi từ xe Giường nằm / VIP Cabin sang xe ghế ngồi thông thường.</li>
                  <li>Khách hàng có mặt đúng giờ hẹn đón nhưng nhà xe bỏ khách và không có xe trung chuyển thay thế.</li>
                </ul>
              </div>
            )}

            {/* TAB 3: TERMS */}
            {currentTab === 'terms' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Quy Chế Hoạt Động Sàn Thương Mại Điện Tử Vé Xe TravelEasy
                </h2>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                  TravelEasy là sàn thương mại điện tử kết nối hành khách có nhu cầu di chuyển với các doanh nghiệp, hợp tác xã vận tải hành khách hợp pháp tại Việt Nam.
                </p>

                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  1. Quyền và trách nhiệm của Hành Khách:
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                  Cung cấp chính xác họ tên và số điện thoại liên hệ để nhận tin nhắn mã vé và thông báo đón xe. Có mặt tại điểm đón trước giờ khởi hành tối thiểu 15-30 phút. Tuân thủ nội quy an toàn trên xe của đối tác vận tải.
                </p>

                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  2. Trách nhiệm của Đối Tác Nhà Xe:
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                  Cung cấp dịch vụ vận tải đúng biển số xe, loại xe, giờ xuất bến và vị trí giường nằm đã xác nhận trên sàn TravelEasy. Không tự ý thu thêm bất kỳ phụ phí nào ngoài giá vé đã niêm yết công khai.
                </p>
              </div>
            )}

            {/* TAB 4: PRIVACY */}
            {currentTab === 'privacy' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Chính Sách Bảo Mật Thông Tin & An Toàn Thanh Toán
                </h2>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  TravelEasy cam kết bảo mật tuyệt đối dữ liệu người dùng theo tiêu chuẩn an toàn bảo mật thông tin quốc tế.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '6px' }}>
                      🔒 Mã Hóa Dữ Liệu SSL 256-Bit
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                      Toàn bộ dữ liệu giao dịch và thông tin thẻ đều được mã hóa đường truyền bằng công nghệ SSL/TLS 256-bit cao cấp nhất.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '6px' }}>
                      💳 Tiêu Chuẩn PCI-DSS Cổng Thanh Toán
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                      TravelEasy không lưu trữ số thẻ tín dụng hoặc thông tin ngân hàng của bạn; mọi giao dịch được điều hướng trực tiếp qua VNPay và Napas.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FAQ */}
            {currentTab === 'faq' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>
                  Câu Hỏi Thường Gặp (FAQ) Khi Đặt Vé
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '6px' }}>
                      ❓ Sau khi thanh toán, tôi nhận vé bằng cách nào?
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      Ngay sau khi giao dịch thành công, hệ thống sẽ gửi SMS và Email chứa đường dẫn xem <strong>Vé điện tử kèm Mã QR</strong>. Bạn chỉ cần xuất trình mã QR này trên điện thoại cho tài xế hoặc phụ xe khi lên xe mà không cần in vé giấy.
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '6px' }}>
                      ❓ Tôi có thể đổi giờ đi sang chuyến khác được không?
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      Được! Bạn có thể vào mục <strong>"Vé của tôi"</strong> hoặc gọi Tổng đài <strong>1900 6868</strong> để đổi sang chuyến xe cùng tuyến trước 12-24 giờ hoàn toàn miễn phí (chỉ bù trừ chênh lệch giá vé nếu chuyến mới có giá cao hơn).
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '6px' }}>
                      ❓ Trẻ em đi cùng có cần mua vé riêng không?
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      Trẻ em dưới 5 tuổi hoặc dưới 100cm ngồi chung giường/ghế với bố mẹ được miễn phí vé (tối đa 1 trẻ/người lớn). Trẻ em từ 6 tuổi trở lên hoặc cần giường riêng tính giá vé như người lớn.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;

