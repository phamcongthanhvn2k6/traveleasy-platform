import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Bus,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  Smartphone,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  DollarSign,
  Calendar,
  Send,
  Zap,
  Check,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';

export const PartnerCooperationPage: React.FC = () => {
  const { isDark } = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    routes: '',
    fleetSize: '6-20',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng điền đầy đủ tên nhà xe, người liên hệ và số điện thoại.', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);

    // Giả lập gửi thông tin đăng ký hợp tác
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success(
        `Chúc mừng nhà xe ${formData.companyName}! Yêu cầu hợp tác đã được tiếp nhận thành công. Chuyên viên của TravelEasy sẽ liên hệ trong vòng 24h làm việc.`,
        'Đăng Ký Thành Công'
      );
    }, 1000);
  };

  const FAQS = [
    {
      q: 'Chi phí tham gia mở bán vé trên TravelEasy là bao nhiêu?',
      a: 'TravelEasy hoàn toàn MIỄN PHÍ khởi tạo tài khoản, miễn phí số hóa đội xe và sơ đồ ghế ban đầu. Chúng tôi chỉ áp dụng mức phí hoa hồng dịch vụ cố định ưu đãi (5% - 8%) trên mỗi vé bán thành công. Nhà xe không phải chịu bất kỳ chi phí duy trì hàng tháng nào.',
    },
    {
      q: 'Nhà xe nhận tiền thanh toán từ khách như thế nào và chu kỳ ra sao?',
      a: 'Tiền vé của hành khách thanh toán trực tuyến qua VietQR / VNPAY được hệ thống ghi nhận chính xác theo thời gian thực. TravelEasy thực hiện đối soát tự động và chuyển khoản doanh thu vé về tài khoản ngân hàng của nhà xe định kỳ vào ngày 15 và ngày cuối cùng mỗi tháng kèm bảng kê chi tiết từng chuyến xe.',
    },
    {
      q: 'Nhà xe đã có quầy bán vé offline, liệu có bị trùng ghế với khách đặt online không?',
      a: 'Hoàn toàn không! TravelEasy cung cấp cơ chế khóa ghế thời gian thực (Real-time SSE). Khi có khách giữ chỗ trên website, ghế sẽ tự động đổi màu vàng và khóa trong 10 phút. Nhà xe có thể chủ động đóng/mở bán các dãy ghế trên hệ thống để phục vụ song song cả khách tại quầy và khách đặt online.',
    },
    {
      q: 'Tài xế và phụ xe có cần thiết bị đặc biệt nào để soát vé không?',
      a: 'Không cần mua máy quét chuyên dụng đắt tiền! Tài xế và phụ xe chỉ cần dùng chính chiếc điện thoại thông minh (smartphone) có camera, mở trang web Soát Vé của TravelEasy là có thể quét mã QR trên vé hành khách để kiểm tra tính hợp lệ và cho khách lên xe trong vòng 1 giây.',
    },
    {
      q: 'Nhà xe chưa quen sử dụng công nghệ thì có được hướng dẫn không?',
      a: 'Đội ngũ chuyên viên kỹ thuật của TravelEasy sẽ đồng hành 1-1 tận nơi hoặc qua Ultraviewer / Zalo để cài đặt danh mục tuyến đường, thiết lập sơ đồ xe và hướng dẫn chi tiết cho nhân viên điều hành của nhà xe đến khi thuần thục.',
    },
  ];

  const PARTNERS_LIST = [
    { name: 'Phương Trang (FUTA Bus Lines)', route: 'Tuyến Bắc - Nam, Miền Tây, Đà Lạt', badge: '5 sao', fleet: '100+ xe' },
    { name: 'Thành Bưởi Limousine', route: 'Sài Gòn - Đà Lạt - Cần Thơ', badge: 'VIP Cabin', fleet: '50+ xe' },
    { name: 'Hoa Mai Vũng Tàu', route: 'Sài Gòn - Vũng Tàu Cao Tốc', badge: 'Tần suất 15p', fleet: '40+ xe' },
    { name: 'Sao Việt Express', route: 'Hà Nội - Lào Cai - Sa Pa', badge: 'Cabin Đôi', fleet: '45+ xe' },
    { name: 'Hoàng Long Asia', route: 'Hà Nội - Đà Nẵng - Sài Gòn', badge: 'Chất lượng cao', fleet: '60+ xe' },
    { name: 'Cúc Tùng Limousine', route: 'Nha Trang - Đà Lạt - Buôn Ma Thuột', badge: 'Hạng thương gia', fleet: '35+ xe' },
  ];

  return (
    <div style={{ backgroundColor: isDark ? '#0b0f19' : '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* 1. HERO BANNER SECTION */}
      <section
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)'
            : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          color: '#ffffff',
          padding: '70px 20px 80px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${isDark ? '#1e293b' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
            {/* Tag Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fef08a',
              }}
            >
              <Sparkles size={16} color="#facc15" />
              <span>CHƯƠNG TRÌNH HỢP TÁC NHÀ XE CHIẾN LƯỢC 2026</span>
            </div>

            {/* Main Title */}
            <h1
              style={{
                fontSize: 'clamp(28px, 4.5vw, 46px)',
                fontWeight: 900,
                lineHeight: 1.25,
                maxWidth: '920px',
                letterSpacing: '-0.5px',
              }}
            >
              Đồng Hành Cùng TravelEasy — Đột Phá Doanh Thu & Số Hóa Toàn Diện Nhà Xe
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 17.5px)',
                color: '#e2e8f0',
                maxWidth: '820px',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Nền tảng kết nối hơn <strong>100.000+ hành khách</strong> mỗi tháng với các thương hiệu nhà xe uy tín trên toàn quốc. Chuyển đổi số bán vé trực tuyến, sơ đồ ghế 2 tầng thời gian thực và quản trị điều hành thông minh.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '12px',
              }}
            >
              <a
                href="#register-form"
                style={{
                  backgroundColor: '#f59e0b',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#1e3a8a',
                  fontWeight: 800,
                  fontSize: '15px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.5)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>Đăng Ký Tư Vấn Hợp Tác Ngay</span>
                <ArrowRight size={18} />
              </a>

              <Link
                to="/company/login"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '14px 26px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
              >
                <Building2 size={18} />
                <span>Đăng Nhập Cổng Điều Hành Xe</span>
              </Link>
            </div>

            {/* Metrics Counter Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '980px',
                marginTop: '45px',
                padding: '24px 28px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#facc15' }}>500+</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px' }}>Nhà xe đối tác chiến lược</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#67e8f9' }}>100.000+</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px' }}>Lượt khách đặt vé/tháng</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#86efac' }}>63 / 63</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px' }}>Tỉnh thành kết nối toàn quốc</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#f472b6' }}>+35%</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px' }}>Tăng trưởng doanh thu trung bình</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR CORE BENEFITS SECTION */}
      <section style={{ padding: '70px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: isDark ? '#38bdf8' : '#2563eb',
            }}
          >
            LỢI THẾ CẠNH TRANH DÀNH CHO ĐỐI TÁC
          </span>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 900,
              marginTop: '8px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            Tại Sao Nhà Xe Nên Chọn Mở Bán Cùng TravelEasy?
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: isDark ? '#94a3b8' : '#64748b',
              maxWidth: '650px',
              margin: '10px auto 0',
            }}
          >
            Chúng tôi cung cấp giải pháp toàn diện giúp doanh nghiệp vận tải tối ưu chi phí, nâng tầm thương hiệu và tăng trưởng lượng hành khách bền vững.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '20px',
              padding: '30px 24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <TrendingUp size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Tối Đa Doanh Thu & Lấp Đầy Ghế
            </h3>
            <p style={{ fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Tiếp cận nguồn khách hàng khổng lồ từ các kênh tìm kiếm và mạng xã hội. Giảm thiểu tình trạng xe chạy rỗng ghế trên các tuyến liên tỉnh, tăng tỷ lệ lấp đầy bình quân thêm 35%.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '20px',
              padding: '30px 24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Zap size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Sơ Đồ Ghế Thời Gian Thực (SSE)
            </h3>
            <p style={{ fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Không bao giờ lo trùng ghế! Khách hàng chọn chỗ trực tiếp trên sơ đồ 2 tầng; hệ thống tự động khóa giữ chỗ trong 10 phút và đồng bộ tức thì sang Cổng điều hành của nhà xe.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '20px',
              padding: '30px 24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}
            >
              <DollarSign size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Quyết Toán Nhanh & Minh Bạch
            </h3>
            <p style={{ fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Tích hợp sẵn các cổng thanh toán VietQR Napas PayOS (MB Bank) và VNPAY. Tiền vé chuyển khoản tự động định kỳ vào ngày 15 và cuối tháng, đối soát chi tiết từng mã vé.
            </p>
          </div>

          {/* Card 4 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '20px',
              padding: '30px 24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
              }}
            >
              <Smartphone size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Bộ Công Cụ Quản Trị 4.0 Miễn Phí
            </h3>
            <p style={{ fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Nhà xe được cấp quyền truy cập Cổng điều hành xe riêng biệt, quản lý danh sách đội xe, phân quyền nhân viên và ứng dụng quét QR soát vé bằng điện thoại thông minh.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TECHNOLOGY ECOSYSTEM SHOWCASE */}
      <section
        style={{
          backgroundColor: isDark ? '#0f172a' : '#eff6ff',
          padding: '70px 20px',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#dbeafe'}`,
          borderBottom: `1px solid ${isDark ? '#1e293b' : '#dbeafe'}`,
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: isDark ? '#38bdf8' : '#2563eb',
              }}
            >
              HỆ SINH THÁI CÔNG NGHỆ CHUYÊN NGHIỆP
            </span>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 900,
                marginTop: '8px',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            >
              Giải Pháp Vận Hành Toàn Diện Cho Nhà Xe
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Eco 1 */}
            <div
              style={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderRadius: '20px',
                padding: '28px',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px', borderRadius: '12px' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Cổng Điều Hành Chuyến Xe (Portal)
                  </h3>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Phân hệ dành riêng cho ban điều hành</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Quản lý lịch chạy, điều chỉnh giá vé linh hoạt theo ngày lễ/Tết.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Theo dõi sơ đồ ghế trực quan 2 tầng kèm họ tên khách từng vị trí.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Cập nhật danh sách điểm đón, điểm trả dọc tuyến đường.</span>
                </li>
              </ul>
            </div>

            {/* Eco 2 */}
            <div
              style={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderRadius: '20px',
                padding: '28px',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px', borderRadius: '12px' }}>
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Ứng Dụng Soát Vé Mã QR Di Động
                  </h3>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Tiện ích cho phụ xe & tài xế tại cửa xe</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Quét mã QR trên điện thoại hành khách trong 1 giây.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Cảnh báo tức thì nếu vé giả mạo, vé hết hạn hoặc trùng lặp.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Tự động cập nhật trạng thái "Đã lên xe" về hệ thống quản lý.</span>
                </li>
              </ul>
            </div>

            {/* Eco 3 */}
            <div
              style={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderRadius: '20px',
                padding: '28px',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '10px', borderRadius: '12px' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Huy Hiệu "Cam Kết Giữ Chỗ 100%"
                  </h3>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Bảo chứng uy tín và nâng cao độ tin cậy</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Được gắn huy hiệu xác thực và cam kết hoàn 150% trên trang chủ.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Ưu tiên hiển thị trên bộ lọc tìm kiếm vé xe phổ biến toàn quốc.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Hỗ trợ đẩy mạnh các chiến dịch truyền thông và voucher độc quyền.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR-STEP ONBOARDING PROCESS */}
      <section style={{ padding: '70px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: isDark ? '#38bdf8' : '#2563eb',
            }}
          >
            QUY TRÌNH HỢP TÁC TINH GỌN
          </span>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 900,
              marginTop: '8px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            4 Bước Để Nhà Xe Bắt Đầu Mở Bán
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            position: 'relative',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: isDark ? '#1e3a8a' : '#dbeafe',
                marginBottom: '8px',
              }}
            >
              01
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '6px' }}>
              Đăng Ký Trực Tuyến
            </h4>
            <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
              Điền thông tin liên hệ và số lượng phương tiện của nhà xe tại biểu mẫu bên dưới (mất 2 phút).
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: isDark ? '#1e3a8a' : '#dbeafe',
                marginBottom: '8px',
              }}
            >
              02
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '6px' }}>
              Ký Hợp Đồng Điện Tử
            </h4>
            <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
              Chuyên viên liên hệ trong 24h để tư vấn mức chiết khấu và hỗ trợ ký kết hợp đồng hợp tác nhanh chóng.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: isDark ? '#1e3a8a' : '#dbeafe',
                marginBottom: '8px',
              }}
            >
              03
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '6px' }}>
              Cài Đặt Sơ Đồ Xe & Tuyến
            </h4>
            <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
              Kỹ thuật viên TravelEasy hỗ trợ số hóa miễn phí mẫu ghế 2 tầng, danh sách xe và lịch xuất bến.
            </p>
          </div>

          {/* Step 4 */}
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: '#10b981',
                marginBottom: '8px',
              }}
            >
              04
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '6px' }}>
              Mở Bán & Nhận Doanh Thu
            </h4>
            <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
              Chuyến xe xuất hiện trên sàn toàn quốc; hành khách bắt đầu đặt chỗ và thanh toán tức thì.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ONLINE REGISTRATION FORM SECTION */}
      <section
        id="register-form"
        style={{
          padding: '70px 20px',
          backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        }}
      >
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: '24px',
              padding: 'clamp(24px, 5vw, 44px)',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.08)',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                  color: isDark ? '#38bdf8' : '#2563eb',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <Building2 size={15} />
                <span>FORM ĐĂNG KÝ HỢP TÁC</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Đăng Ký Mở Bán Vé Cùng TravelEasy
              </h3>
              <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                Để lại thông tin bên dưới, chuyên viên phụ trách đối tác sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ.
              </p>
            </div>

            {submitted ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? '#059669' : '#a7f3d0'}`,
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Check size={36} />
                </div>
                <h4 style={{ fontSize: '22px', fontWeight: 900, color: isDark ? '#a7f3d0' : '#065f46' }}>
                  Đã Gửi Đăng Ký Thành Công!
                </h4>
                <p
                  style={{
                    fontSize: '14.5px',
                    color: isDark ? '#d1fae5' : '#047857',
                    maxWidth: '520px',
                    margin: '10px auto 20px',
                    lineHeight: 1.6,
                  }}
                >
                  Cảm ơn <strong>nhà xe {formData.companyName}</strong> đã tin tưởng lựa chọn TravelEasy. Đội ngũ chuyên viên vùng sẽ liên hệ trực tiếp qua số <strong>{formData.phone}</strong> để tư vấn hợp đồng và hỗ trợ nhập liệu xe.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 22px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Gửi Thêm Yêu Cầu Khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      Tên Nhà Xe / Đơn Vị Vận Tải <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Xe Khách Nam Cường Limousine"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      Người Đại Diện / Quản Lý <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      Số Điện Thoại Liên Hệ <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      Địa Chỉ Email Doanh Nghiệp
                    </label>
                    <input
                      type="email"
                      placeholder="dieuhanh@nhaxe.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      Các Tuyến Đường Chính Khai Thác
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Sài Gòn - Đà Lạt, Nha Trang..."
                      value={formData.routes}
                      onChange={(e) => setFormData({ ...formData, routes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      Quy Mô Đội Xe Hiện Có
                    </label>
                    <select
                      value={formData.fleetSize}
                      onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="1-5">1 - 5 xe (Quy mô nhỏ)</option>
                      <option value="6-20">6 - 20 xe (Quy mô vừa)</option>
                      <option value="21-50">21 - 50 xe (Doanh nghiệp lớn)</option>
                      <option value=">50">Trên 50 xe (Tập đoàn liên tỉnh)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                    Ghi Chú Hoặc Nhu Cầu Cần Hỗ Trợ Thêm
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Cần hướng dẫn kết nối phần mềm bán vé tại quầy có sẵn, tư vấn bảng phí hoa hồng..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#2563eb',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Đang gửi thông tin...' : 'GỬI YÊU CẦU HỢP TÁC NGAY'}</span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                  🔒 Thông tin của quý nhà xe được bảo mật tuyệt đối theo tiêu chuẩn TravelEasy Security 2026.
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. TRUSTED PARTNERS LIST */}
      <section style={{ padding: '70px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: isDark ? '#38bdf8' : '#2563eb',
            }}
          >
            MẠNG LƯỚI ĐỐI TÁC HÀNG ĐẦU
          </span>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 900,
              marginTop: '8px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            Hơn 500+ Nhà Xe Uy Tín Đang Đồng Hành
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {PARTNERS_LIST.map((partner, pIdx) => (
            <div
              key={pIdx}
              style={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                  }}
                >
                  <Bus size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {partner.name}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    {partner.route}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5',
                    color: '#10b981',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {partner.badge}
                </span>
                <div style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                  {partner.fleet}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section
        style={{
          padding: '70px 20px',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        }}
      >
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: isDark ? '#38bdf8' : '#2563eb',
              }}
            >
              GIẢI ĐÁP THẮC MẮC
            </span>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 900,
                marginTop: '8px',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            >
              Câu Hỏi Thường Gặp Của Nhà Xe
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((faq, fIdx) => (
              <div
                key={fIdx}
                style={{
                  backgroundColor: isDark ? '#111827' : '#f8fafc',
                  border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => toggleFaq(fIdx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === fIdx ? <ChevronUp size={18} color="#2563eb" /> : <ChevronDown size={18} color="#64748b" />}
                </button>
                {openFaq === fIdx && (
                  <div
                    style={{
                      padding: '0 20px 20px 20px',
                      fontSize: '14px',
                      color: isDark ? '#cbd5e1' : '#475569',
                      lineHeight: 1.6,
                      borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                      paddingTop: '14px',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER CALL TO ACTION */}
      <section
        style={{
          marginTop: '60px',
          padding: '50px 20px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          maxWidth: '1200px',
          margin: '60px auto 0',
          textAlign: 'center',
          boxShadow: '0 20px 50px -10px rgba(37, 99, 235, 0.4)',
        }}
      >
        <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900 }}>
          Sẵn Sàng Đột Phá Doanh Số Bán Vé Cùng TravelEasy?
        </h3>
        <p style={{ fontSize: '15px', color: '#bfdbfe', maxWidth: '600px', margin: '10px auto 25px' }}>
          Gia nhập mạng lưới hơn 500 nhà xe hàng đầu ngay hôm nay. Đăng ký hoàn toàn miễn phí và bắt đầu đón nhận hành khách trực tuyến.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="#register-form"
            style={{
              backgroundColor: '#f59e0b',
              color: '#1e3a8a',
              fontWeight: 800,
              fontSize: '15px',
              padding: '12px 26px',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            Đăng Ký Tư Vấn Miễn Phí
          </a>
          <a
            href="tel:19008888"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '15px',
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Phone size={16} />
            <span>Hotline Đối Tác: 1900 8888</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default PartnerCooperationPage;
