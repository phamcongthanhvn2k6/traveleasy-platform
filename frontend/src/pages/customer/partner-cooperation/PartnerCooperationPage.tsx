import React, { useState, useMemo } from 'react';
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
  Calculator,
  BarChart3,
  Layers,
  Cpu,
  QrCode,
  Wallet,
  Bot,
  HelpCircle,
  FileCheck2,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';

export const PartnerCooperationPage: React.FC = () => {
  const { isDark } = useTheme();

  // =========================================================================
  // 1. STATE BỘ CÔNG CỤ TÍNH LỢI NHUẬN DỰ PHÓNG (INTERACTIVE ROI CALCULATOR)
  // =========================================================================
  const [calcFleetSize, setCalcFleetSize] = useState<number>(8);
  const [calcTripsPerDay, setCalcTripsPerDay] = useState<number>(2);
  const [calcAvgPrice, setCalcAvgPrice] = useState<number>(250000);

  // Tính toán kết quả thời gian thực:
  // Giả định trung bình sàn TravelEasy giúp lấp đầy thêm 7 vé/chuyến
  const roiCalculations = useMemo(() => {
    const extraSeatsPerTrip = 7;
    const daysInMonth = 30;
    const totalExtraTickets = calcFleetSize * calcTripsPerDay * extraSeatsPerTrip * daysInMonth;
    const grossAddedRevenue = totalExtraTickets * calcAvgPrice;
    const platformFeeRate = 0.06; // Phí hoa hồng ưu đãi 6%
    const platformFee = grossAddedRevenue * platformFeeRate;
    const netAddedProfit = grossAddedRevenue - platformFee;

    return {
      totalExtraTickets,
      grossAddedRevenue,
      platformFee,
      netAddedProfit,
    };
  }, [calcFleetSize, calcTripsPerDay, calcAvgPrice]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  // =========================================================================
  // 2. STATE TAB HỆ SINH THÁI CÔNG NGHỆ 4.0 (TECH ECOSYSTEM TABS)
  // =========================================================================
  const [activeTechTab, setActiveTechTab] = useState<'portal' | 'scanner' | 'settlement' | 'ai'>('portal');

  // =========================================================================
  // 3. STATE FORM ĐĂNG KÝ HỢP TÁC (PARTNER REGISTRATION FORM)
  // =========================================================================
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    routes: '',
    fleetSize: '6 - 20 xe',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Quick route suggestion pills
  const POPULAR_ROUTES = [
    'Sài Gòn ⇄ Đà Lạt',
    'Hà Nội ⇄ Sa Pa',
    'Sài Gòn ⇄ Nha Trang',
    'Hà Nội ⇄ Đà Nẵng',
    'Sài Gòn ⇄ Vũng Tàu',
    'Hà Nội ⇄ Hải Phòng',
  ];

  const handleQuickAddRoute = (route: string) => {
    if (!formData.routes) {
      setFormData({ ...formData, routes: route });
    } else if (!formData.routes.includes(route)) {
      setFormData({ ...formData, routes: `${formData.routes}, ${route}` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng điền đầy đủ Tên nhà xe, Người liên hệ và Số điện thoại.', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success(
        `Chúc mừng nhà xe ${formData.companyName}! Yêu cầu hợp tác đã được ghi nhận. Chuyên viên vùng của TravelEasy sẽ liên hệ qua SĐT ${formData.phone} trong vòng 24 giờ.`,
        'Đăng Ký Thành Công'
      );
    }, 900);
  };

  // =========================================================================
  // 4. STATE FAQ ACCORDION
  // =========================================================================
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const FAQS = [
    {
      q: 'Chi phí tham gia mở bán vé trên TravelEasy là bao nhiêu?',
      a: 'TravelEasy hoàn toàn MIỄN PHÍ khởi tạo tài khoản, miễn phí số hóa đội xe và sơ đồ ghế ban đầu. Chúng tôi chỉ áp dụng mức phí hoa hồng dịch vụ cố định ưu đãi (5% - 8%) trên mỗi vé bán thành công. Nhà xe không phải chịu bất kỳ chi phí duy trì hàng tháng nào.',
    },
    {
      q: 'Nhà xe nhận tiền thanh toán từ khách như thế nào và chu kỳ ra sao?',
      a: 'Tiền vé của hành khách thanh toán trực tuyến qua VietQR Napas MB Bank hoặc VNPAY được ghi nhận tức thì theo thời gian thực. TravelEasy thực hiện đối soát tự động và chuyển khoản doanh thu vé về tài khoản ngân hàng của nhà xe định kỳ vào ngày 15 và ngày cuối cùng mỗi tháng kèm bảng kê chi tiết từng chuyến xe.',
    },
    {
      q: 'Nhà xe đã có quầy bán vé offline, liệu có bị trùng ghế với khách đặt online không?',
      a: 'Hoàn toàn không! TravelEasy cung cấp cơ chế khóa ghế thời gian thực (Real-time SSE). Khi khách hàng chọn giữ chỗ trên web, ghế sẽ tự động đổi màu và khóa trong 10 phút. Nhà xe có thể chủ động đóng/mở bán các dãy ghế trên Cổng Quản Trị Nhà Xe để phục vụ song song cả khách tại quầy và khách đặt online.',
    },
    {
      q: 'Tài xế và phụ xe có cần mua máy quét chuyên dụng đắt tiền không?',
      a: 'Không cần mua máy quét tốn kém! Tài xế và phụ xe chỉ cần dùng chính chiếc điện thoại thông minh (smartphone) có camera, mở trang web Soát Vé của TravelEasy là có thể quét mã QR trên vé hành khách để kiểm tra tính hợp lệ và cho khách lên xe trong vòng 0.5 giây.',
    },
    {
      q: 'Nhà xe chưa quen sử dụng công nghệ thì có được hướng dẫn tận nơi không?',
      a: 'Đội ngũ chuyên viên kỹ thuật của TravelEasy sẽ đồng hành 1-1 tận nơi hoặc qua Ultraviewer / Zalo để cài đặt danh mục tuyến đường, thiết lập sơ đồ xe và hướng dẫn chi tiết cho nhân viên điều hành của nhà xe đến khi thuần thục hoàn toàn.',
    },
    {
      q: 'Hợp đồng hợp tác được ký kết như thế nào?',
      a: 'Hai bên có thể ký hợp đồng điện tử có giá trị pháp lý trong vòng 10 phút hoặc ký kết bằng văn bản truyền thống có dấu mộc gửi phát nhanh. Nhà xe có thể bắt đầu mở bán thử nghiệm ngay sau khi hợp đồng được xác lập.',
    },
  ];

  // Danh sách đối tác nổi bật
  const PARTNERS_LIST = [
    { name: 'Phương Trang (FUTA Bus Lines)', route: 'Tuyến Bắc - Nam, Miền Tây, Đà Lạt', badge: '5 sao uy tín', fleet: '100+ xe', rating: '4.9' },
    { name: 'Thành Bưởi Limousine', route: 'Sài Gòn - Đà Lạt - Cần Thơ', badge: 'VIP Cabin Đôi', fleet: '50+ xe', rating: '4.85' },
    { name: 'Sao Việt Express', route: 'Hà Nội - Lào Cai - Sa Pa', badge: 'Chuyên Tuyến Sa Pa', fleet: '45+ xe', rating: '4.9' },
    { name: 'Hoa Mai Vũng Tàu', route: 'Sài Gòn - Vũng Tàu Cao Tốc', badge: 'Tần Suất 15 Phút', fleet: '40+ xe', rating: '4.8' },
    { name: 'Hoàng Long Asia', route: 'Hà Nội - Đà Nẵng - Sài Gòn', badge: 'Thương Hiệu Quốc Gia', fleet: '60+ xe', rating: '4.85' },
    { name: 'Cúc Tùng Limousine', route: 'Nha Trang - Đà Lạt - Buôn Ma Thuột', badge: 'Hạng Thương Gia', fleet: '35+ xe', rating: '4.8' },
  ];

  const TESTIMONIALS = [
    {
      name: 'Ông Nguyễn Văn Thành',
      role: 'Giám Đốc Điều Hành',
      company: 'Sao Việt Express (Tuyến Hà Nội - Sa Pa)',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      comment:
        'Từ khi mở bán trực tuyến trên TravelEasy, tỷ lệ lấp đầy ghế các ngày trong tuần tăng thêm 35%. Cơ chế khóa ghế thời gian thực hoạt động rất chuẩn, không bao giờ bị trùng ghế với khách mua tại văn phòng.',
    },
    {
      name: 'Bà Lê Thị Hồng Phúc',
      role: 'Phó Tổng Giám Đốc',
      company: 'Hoa Mai Limousine (Sài Gòn - Vũng Tàu)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      comment:
        'Tài xế của chúng tôi dùng ngay điện thoại cá nhân để quét QR soát vé cực kỳ nhanh gọn. Bộ phận kế toán cũng đỡ vất vả nhờ tiền vé đối soát tự động qua VietQR, minh bạch từng giao dịch.',
    },
    {
      name: 'Ông Trần Minh Đức',
      role: 'Trưởng Phòng Vé Miền Trung',
      company: 'Hoàng Long Asia Lines',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      comment:
        'Đội ngũ kỹ thuật của TravelEasy hỗ trợ số hóa sơ đồ xe 34 phòng VIP rất nhanh chỉ trong 1 buổi chiều. Lượng khách trẻ đặt vé từ ứng dụng tăng vọt vào các dịp nghỉ lễ.',
    },
  ];

  return (
    <div style={{ backgroundColor: isDark ? '#080d1a' : '#f8fafc', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* =========================================================================
          1. HERO SECTION LUNG LINH HIỆN ĐẠI (GRADIENT MESH & GLOW EFFECTS)
         ========================================================================= */}
      <section
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0c1222 55%, #080d1a 100%)'
            : 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)',
          color: '#ffffff',
          padding: '80px 20px 90px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${isDark ? '#1e293b' : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        {/* Subtle dot matrix grid background overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        {/* Glowing gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 65%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234, 179, 8, 0.22) 0%, transparent 65%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '22px' }}>
            {/* Strategy Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#fef08a',
                letterSpacing: '0.4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Sparkles size={16} color="#facc15" />
              <span>CHƯƠNG TRÌNH HỢP TÁC ĐỐI TÁC NHÀ XE 2026 • TRAVELEASY ECOSYSTEM</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(30px, 4.8vw, 52px)',
                fontWeight: 900,
                lineHeight: 1.2,
                maxWidth: '960px',
                letterSpacing: '-0.8px',
              }}
            >
              Nâng Tầm Nhà Xe Thời Đại Số —{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #67e8f9 0%, #facc15 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Đột Phá Doanh Thu & Số Hóa Toàn Diện
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                color: '#e2e8f0',
                maxWidth: '860px',
                lineHeight: 1.65,
                fontWeight: 400,
              }}
            >
              Nền tảng kết nối hơn <strong>100.000+ hành khách</strong> mỗi tháng với các thương hiệu nhà xe hàng đầu. Hỗ trợ chuyển đổi số bán vé online, sơ đồ ghế 2 tầng thời gian thực, quét mã QR soát xe và đối soát tự động minh bạch.
            </p>

            {/* Call To Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '10px',
              }}
            >
              <a
                href="#roi-calculator"
                style={{
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
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.45)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Calculator size={18} />
                <span>Tính Thử Doanh Thu Tăng Thêm</span>
                <ArrowRight size={18} />
              </a>

              <a
                href="#register-form"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '14px 26px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)')}
              >
                <Send size={16} />
                <span>Đăng Ký Tư Vấn Hợp Tác</span>
              </a>

              <Link
                to="/company/login"
                style={{
                  backgroundColor: 'transparent',
                  color: '#93c5fd',
                  fontWeight: 700,
                  fontSize: '14.5px',
                  padding: '14px 22px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(147, 197, 253, 0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 197, 253, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#93c5fd';
                }}
              >
                <Building2 size={17} />
                <span>Cổng Điều Hành Nhà Xe</span>
              </Link>
            </div>

            {/* Live Metrics Floating Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '1060px',
                marginTop: '45px',
                padding: '24px 30px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                borderRadius: '22px',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#facc15' }}>500+</span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>Nhà xe đối tác tin cậy</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#67e8f9' }}>100.000+</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>Lượt khách đặt vé/tháng</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#86efac' }}>+35%</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>Tăng trưởng doanh thu vé</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#f472b6' }}>0.05s</div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>Khóa ghế Real-time SSE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BỘ CÔNG CỤ TÍNH LỢI NHUẬN THỜI GIAN THỰC (INTERACTIVE ROI CALCULATOR)
         ========================================================================= */}
      <section
        id="roi-calculator"
        style={{
          padding: '80px 20px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: isDark ? '#38bdf8' : '#2563eb',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            BỘ CÔNG CỤ DỰ PHÓNG LỢI NHUẬN ĐỘT PHÁ
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.8vw, 40px)',
              fontWeight: 900,
              marginTop: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              letterSpacing: '-0.5px',
            }}
          >
            Ước Tính Doanh Thu Bổ Sung Khi Mở Bán Cùng TravelEasy
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: isDark ? '#94a3b8' : '#64748b',
              maxWidth: '720px',
              margin: '10px auto 0',
              lineHeight: 1.6,
            }}
          >
            Kéo các thanh trượt theo quy mô thực tế của nhà xe. Thuật toán sẽ tính toán lượng ghế trống được lấp đầy thêm và doanh thu thu về sau hoa hồng dịch vụ.
          </p>
        </div>

        <div
          style={{
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            borderRadius: '24px',
            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            padding: '40px',
            boxShadow: isDark ? '0 20px 40px -15px rgba(0,0,0,0.6)' : '0 20px 40px -15px rgba(37,99,235,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Sliders Input Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Slider 1: Quy mô đội xe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14.5px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bus size={18} color="#3b82f6" />
                  <span>Số lượng xe đang khai thác:</span>
                </label>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#2563eb',
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
                    padding: '2px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {calcFleetSize} xe
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={calcFleetSize}
                onChange={(e) => setCalcFleetSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                <span>1 xe</span>
                <span>25 xe</span>
                <span>50 xe</span>
              </div>
            </div>

            {/* Slider 2: Chuyến chạy / ngày mỗi xe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14.5px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={18} color="#10b981" />
                  <span>Số chuyến chạy bình quân / ngày / xe:</span>
                </label>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#10b981',
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
                    padding: '2px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {calcTripsPerDay} chuyến
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={calcTripsPerDay}
                onChange={(e) => setCalcTripsPerDay(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                <span>1 chuyến/ngày</span>
                <span>3 chuyến/ngày</span>
                <span>5 chuyến/ngày</span>
              </div>
            </div>

            {/* Slider 3: Giá vé trung bình */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14.5px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={18} color="#f59e0b" />
                  <span>Giá vé trung bình / giường:</span>
                </label>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#d97706',
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
                    padding: '2px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {formatCurrency(calcAvgPrice)}
                </span>
              </div>
              <input
                type="range"
                min="120000"
                max="600000"
                step="10000"
                value={calcAvgPrice}
                onChange={(e) => setCalcAvgPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                <span>120.000 đ</span>
                <span>350.000 đ</span>
                <span>600.000 đ</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                padding: '14px 18px',
                borderRadius: '12px',
                borderLeft: '4px solid #3b82f6',
                fontSize: '13px',
                color: isDark ? '#cbd5e1' : '#475569',
                lineHeight: 1.5,
              }}
            >
              💡 <em>TravelEasy kết nối trực tiếp hành khách tìm vé tuyến của bạn, giúp lấp đầy bình quân thêm 7 ghế/chuyến vốn thường bị trống khi chỉ bán vé offline tại bến.</em>
            </div>
          </div>

          {/* Computed Results Card */}
          <div
            style={{
              background: isDark
                ? 'linear-gradient(145deg, #1e1b4b 0%, #1e293b 100%)'
                : 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '20px',
              border: `2px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
              padding: '34px 28px',
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(37,99,235,0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <BarChart3 size={22} color="#2563eb" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#93c5fd' : '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                KẾT QUẢ DỰ PHÓNG MỖI THÁNG
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`, paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#475569' }}>Lượng vé bán thêm qua sàn:</span>
                <span style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  +{formatNumber(roiCalculations.totalExtraTickets)} vé / tháng
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`, paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#475569' }}>Doanh thu bổ sung dự kiến:</span>
                <span style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  +{formatCurrency(roiCalculations.grossAddedRevenue)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`, paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#475569' }}>Phí hoa hồng dịch vụ (6%):</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444' }}>
                  -{formatCurrency(roiCalculations.platformFee)}
                </span>
              </div>

              {/* Big Highlight: Net Profit */}
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px 20px',
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : '#a7f3d0'}`,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  LỢI NHUẬN RÒNG TĂNG THÊM / THÁNG
                </div>
                <div
                  style={{
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    fontWeight: 900,
                    color: '#059669',
                    marginTop: '4px',
                    letterSpacing: '-0.5px',
                  }}
                >
                  +{formatCurrency(roiCalculations.netAddedProfit)}
                </div>
                <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#047857', marginTop: '4px' }}>
                  ✔ Tiền được chuyển khoản tự động vào ngày 15 & cuối tháng qua VietQR Napas
                </div>
              </div>

              <a
                href="#register-form"
                style={{
                  marginTop: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '15px',
                  padding: '13px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px -4px rgba(37,99,235,0.4)',
                }}
              >
                <span>Bắt Đầu Hợp Tác Ngay Hôm Nay</span>
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. 4 LỢI THẾ CẠNH TRANH CỐT LÕI (FOUR PILLARS OF ADVANTAGE)
         ========================================================================= */}
      <section style={{ padding: '40px 20px 80px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: isDark ? '#38bdf8' : '#2563eb',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            ĐẶC QUYỀN DÀNH RIÊNG CHO ĐỐI TÁC
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.8vw, 40px)',
              fontWeight: 900,
              marginTop: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              letterSpacing: '-0.5px',
            }}
          >
            Tại Sao 500+ Nhà Xe Tin Tưởng Mở Bán Cùng TravelEasy?
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: isDark ? '#94a3b8' : '#64748b',
              maxWidth: '680px',
              margin: '10px auto 0',
              lineHeight: 1.6,
            }}
          >
            Chúng tôi cung cấp giải pháp công nghệ toàn diện giúp doanh nghiệp vận tải tối ưu chi phí vận hành, loại bỏ sai sót thủ công và phát triển bền vững.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '32px 26px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <TrendingUp size={30} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Tăng 35% Tỷ Lệ Lấp Đầy Ghế
            </h3>
            <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Tiếp cận nguồn khách hàng khổng lồ từ Google Tìm Kiếm và Mạng xã hội. Giảm thiểu xe chạy rỗng ghế trên các tuyến liên tỉnh, biến những ghế trống thành dòng tiền lợi nhuận tức thì.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '32px 26px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Zap size={30} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Khóa Ghế Real-Time (SSE)
            </h3>
            <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Không bao giờ lo trùng ghế! Khách hàng chọn chỗ trực tiếp trên sơ đồ 2 tầng; hệ thống tự động khóa giữ chỗ trong 10 phút và đồng bộ tức thì sang Cổng điều hành của nhà xe.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '32px 26px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}
            >
              <DollarSign size={30} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Đối Soát Tự Động VietQR
            </h3>
            <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Tích hợp sẵn các cổng thanh toán VietQR Napas PayOS và VNPAY. Tiền vé chuyển khoản tự động định kỳ vào ngày 15 và cuối tháng, đối soát chi tiết từng mã vé không thất thoát 1 đồng.
            </p>
          </div>

          {/* Card 4 */}
          <div
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '32px 26px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
              }}
            >
              <Smartphone size={30} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              App Quét QR Soát Vé 0.5s
            </h3>
            <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
              Tài xế và phụ xe chỉ cần dùng điện thoại cá nhân mở ứng dụng Soát Vé web của TravelEasy để kiểm tra vé hành khách nhanh chóng, chống vé giả và theo dõi chính xác vị trí điểm đón.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HỆ SINH THÁI CÔNG NGHỆ 4.0 (INTERACTIVE TECH TABS SHOWCASE)
         ========================================================================= */}
      <section
        style={{
          backgroundColor: isDark ? '#0c1222' : '#eff6ff',
          padding: '80px 20px',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#dbeafe'}`,
          borderBottom: `1px solid ${isDark ? '#1e293b' : '#dbeafe'}`,
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#38bdf8' : '#2563eb',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#ffffff',
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'inline-block',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              TRỌN BỘ CÔNG NGHỆ TRAVELEASY 4.0
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.8vw, 40px)',
                fontWeight: 900,
                marginTop: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
                letterSpacing: '-0.5px',
              }}
            >
              Hệ Sinh Thái Phần Mềm Quản Trị & Vận Hành Chuyên Sâu
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: isDark ? '#94a3b8' : '#64748b',
                maxWidth: '680px',
                margin: '10px auto 0',
                lineHeight: 1.6,
              }}
            >
              Trực quan hóa mọi nghiệp vụ nhà xe: từ xếp chỗ, phân tài xế, quản lý doanh thu tới tự động đối soát thanh toán.
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '35px',
            }}
          >
            {[
              { id: 'portal', label: 'Cổng Quản Trị Nhà Xe', icon: Building2 },
              { id: 'scanner', label: 'Ứng Dụng Quét QR Soát Vé', icon: QrCode },
              { id: 'settlement', label: 'Hệ Thống Đối Soát Doanh Thu', icon: Wallet },
              { id: 'ai', label: 'Trợ Lý AI Tối Ưu Lịch Chạy', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTechTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTechTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isActive
                      ? '2px solid #2563eb'
                      : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    backgroundColor: isActive
                      ? '#2563eb'
                      : isDark
                      ? '#1e293b'
                      : '#ffffff',
                    color: isActive ? '#ffffff' : isDark ? '#cbd5e1' : '#334155',
                    boxShadow: isActive ? '0 8px 20px -4px rgba(37,99,235,0.4)' : 'none',
                  }}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display Card */}
          <div
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              padding: '40px',
              boxShadow: isDark ? '0 20px 40px -15px rgba(0,0,0,0.6)' : '0 20px 40px -15px rgba(0,0,0,0.06)',
            }}
          >
            {activeTechTab === 'portal' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '35px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' }}>
                    <Building2 size={16} /> PORTAL QUẢN TRỊ ĐỘI XE DÀNH CHO OPERATOR
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '12px' }}>
                    Quản Lý Chuyến Xe & Sơ Đồ Ghế Thời Gian Thực
                  </h3>
                  <p style={{ fontSize: '14.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.65, marginBottom: '20px' }}>
                    Cổng điều hành riêng biệt với tên miền bảo mật. Cho phép điều độ viên tạo chuyến xe theo lịch, xem danh sách hành khách lên xuống tại từng trạm đón, và chủ động giữ/nhả ghế linh hoạt trong 1 click.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Sơ đồ trực quan 2 tầng xe giường nằm 34 phòng / Limousine VIP', 'Cảnh báo tự động các vé chưa thanh toán hoặc quá hạn giữ chỗ', 'Xuất danh sách lệnh vận chuyển và danh sách hành khách ra Excel / PDF'].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#e2e8f0' : '#334155' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <Link
                      to="/company/login"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        padding: '11px 22px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Trải Nghiệm Cổng Đối Tác</span>
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>

                {/* Mockup Preview Box */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    padding: '24px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginLeft: '6px' }}>portal.traveleasy.vn/company/trips</span>
                    </div>
                    <span style={{ fontSize: '11px', backgroundColor: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>LIVE SYNC</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: isDark ? '#f8fafc' : '#0f172a' }}>Chuyến 08:30 • Sài Gòn ⇄ Đà Lạt</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Xe Limousine 34 Giường VIP • Biển số: 51B-889.92</div>
                      </div>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>Đã kín 32/34 ghế (94%)</span>
                    </div>
                    <div style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: isDark ? '#f8fafc' : '#0f172a' }}>Chuyến 11:00 • Sài Gòn ⇄ Nha Trang</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Xe Giường Nằm Luxury • Biển số: 79B-662.15</div>
                      </div>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>Đang mở bán • Còn 8 chỗ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTechTab === 'scanner' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '35px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' }}>
                    <QrCode size={16} /> SOÁT VÉ KHÔNG CẦN MÁY QUÉT ĐẮT TIỀN
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '12px' }}>
                    Ứng Dụng Quét QR Soát Xe Bằng Smartphone
                  </h3>
                  <p style={{ fontSize: '14.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.65, marginBottom: '20px' }}>
                    Tài xế và phụ xe chỉ cần mở camera điện thoại, đưa vào mã QR trên vé điện tử của khách. Hệ thống xác thực danh tính hành khách, số ghế và điểm đón/trả trong vòng chưa đầy 0.5 giây.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Chống gian lận và phát hiện vé giả mạo hoặc vé đã lên xe trước đó', 'Hiển thị chính xác điểm hẹn đón trả khách trên lộ trình', 'Hoạt động mượt mà cả khi kết nối 4G/3G chập chờn'].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#e2e8f0' : '#334155' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <Link
                      to="/scanner"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '11px 22px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}
                    >
                      <QrCode size={16} />
                      <span>Xem Demo Quét Vé QR</span>
                    </Link>
                  </div>
                </div>

                {/* Scanner Visual Card */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={44} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>VÉ HỢP LỆ • ĐƯỢC PHÉP LÊN XE</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Hành khách: Nguyễn Hoàng Nam • Ghế B04 (Tầng 2)</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Điểm đón: Cây xăng Petrolimex Hàng Xanh • SĐT: 0918***789</div>
                </div>
              </div>
            )}

            {activeTechTab === 'settlement' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '35px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb', color: '#f59e0b', padding: '4px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' }}>
                    <Wallet size={16} /> DÒNG TIỀN MINH BẠCH 100%
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '12px' }}>
                    Đối Soát Tự Động Qua VietQR & VNPAY
                  </h3>
                  <p style={{ fontSize: '14.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.65, marginBottom: '20px' }}>
                    Không còn cảnh nhân viên kế toán phải cộng dồn từng cuống vé giấy. Tiền vé trực tuyến được ghi nhận tức thì vào hệ thống và đối soát định kỳ về tài khoản ngân hàng của nhà xe kèm biên bản quyết toán điện tử.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Chuyển khoản định kỳ vào ngày 15 và ngày cuối cùng mỗi tháng', 'Chi tiết đối soát từng mã đơn đặt vé, số tiền và tên khách hàng', 'Hỗ trợ xuất hóa đơn điện tử VAT tự động cho các doanh nghiệp'].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#e2e8f0' : '#334155' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    padding: '24px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>PHIÊN ĐỐI SOÁT GẦN NHẤT</div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a' }}>186.450.000 đ</div>
                  <div style={{ fontSize: '12.5px', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>✔ Đã chuyển khoản thành công vào tài khoản MB Bank</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Mã đối soát: STL-202610-FUTA • 622 vé thành công</div>
                </div>
              </div>
            )}

            {activeTechTab === 'ai' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '35px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#f5f3ff', color: '#8b5cf6', padding: '4px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, marginBottom: '12px' }}>
                    <Bot size={16} /> TRỢ LÝ TRÍ TUỆ NHÂN TẠO 2026
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '12px' }}>
                    Dự Báo Nhu Cầu Vé & Tối Ưu Lịch Chạy Xe
                  </h3>
                  <p style={{ fontSize: '14.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.65, marginBottom: '20px' }}>
                    Hệ thống AI phân tích dữ liệu đặt vé trên toàn quốc để dự báo trước các cung đường và khung giờ hành khách có nhu cầu cao (như cuối tuần, dịp lễ Tết, Festival), gợi ý nhà xe tăng chuyến để tối đa hóa doanh thu.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Gợi ý khung giờ vàng xuất bến có tỷ lệ lấp đầy cao nhất', 'Dự báo xu hướng tăng vé vào các dịp Lễ 30/4, 2/9 và Tết Nguyên Đán', 'Tự động kích hoạt cơ chế tăng chuyến nhanh chóng trong 1 thao tác'].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: isDark ? '#e2e8f0' : '#334155' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    padding: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Sparkles size={18} color="#8b5cf6" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#8b5cf6' }}>AI INSIGHTS ĐỀ XUẤT</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Tuyến Sài Gòn → Đà Lạt chiều thứ 6 tuần tới:
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                    Dự báo nhu cầu đặt vé đạt <strong>140% công suất</strong> hiện tại. Đề xuất mở thêm <strong>02 chuyến phụ vào lúc 22:30 và 23:15</strong> để đón thêm khoảng 68 khách hàng.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BẢNG SO SÁNH: BÁN VÉ TRUYỀN THỐNG VS TRAVELEASY 4.0
         ========================================================================= */}
      <section style={{ padding: '80px 20px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: isDark ? '#38bdf8' : '#2563eb',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            BẢNG SO SÁNH TOÀN DIỆN
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.8vw, 40px)',
              fontWeight: 900,
              marginTop: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              letterSpacing: '-0.5px',
            }}
          >
            Bán Vé Truyền Thống vs. Hợp Tác Cùng TravelEasy
          </h2>
        </div>

        <div
          style={{
            overflowX: 'auto',
            borderRadius: '20px',
            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.05)',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderBottom: `2px solid ${isDark ? '#334155' : '#cbd5e1'}` }}>
                <th style={{ padding: '18px 24px', fontSize: '14px', fontWeight: 800, color: isDark ? '#f8fafc' : '#1e293b' }}>TIÊU CHÍ VẬN HÀNH</th>
                <th style={{ padding: '18px 24px', fontSize: '14px', fontWeight: 800, color: '#ef4444' }}>❌ MÔ HÌNH TRUYỀN THỐNG</th>
                <th style={{ padding: '18px 24px', fontSize: '14px', fontWeight: 900, color: '#10b981', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5' }}>
                  🚀 NỀN TẢNG TRAVELEASY 4.0
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { criterion: 'Kênh tiếp cận khách hàng', oldWay: 'Phụ thuộc khách quen và khách vãng lai tại bến xe', newWay: 'Tiếp cận 100.000+ khách tìm vé trực tuyến toàn quốc' },
                { criterion: 'Khóa chỗ & Sơ đồ ghế', oldWay: 'Dùng sổ ghi tay, dễ nhầm lẫn hoặc trùng ghế khách', newWay: 'Khóa giữ chỗ thời gian thực SSE 10 phút, chống trùng 100%' },
                { criterion: 'Soát vé hành khách lên xe', oldWay: 'Tài xế xé vé giấy thủ công, mất thời gian và dễ thất lạc', newWay: 'Quét mã QR bằng điện thoại smartphone trong 0.5 giây' },
                { criterion: 'Chi phí đầu tư công nghệ', oldWay: 'Phải bỏ hàng trăm triệu mua phần mềm & máy chủ riêng', newWay: '0 ĐỒNG phí khởi tạo, chỉ tính hoa hồng khi có vé bán ra' },
                { criterion: 'Đối soát và chuyển tiền vé', oldWay: 'Kế toán cộng sổ thủ công nhiều ngày, dễ sai sót', newWay: 'Tự động đối soát chi tiết, chuyển khoản đúng ngày 15 & 30' },
                { criterion: 'Hỗ trợ kỹ thuật & Đào tạo', oldWay: 'Tự xoay xở khi phần mềm gặp trục trặc kỹ thuật', newWay: 'Đội ngũ chuyên viên hỗ trợ 1-1 tận nơi hoặc qua Ultraviewer 24/7' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{row.criterion}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>{row.oldWay}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: 600, color: isDark ? '#86efac' : '#047857', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4', lineHeight: 1.5 }}>
                    ✔ {row.newWay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          6. QUY TRÌNH 4 BƯỚC THAM GIA SIÊU TỐC (ONBOARDING ROADMAP)
         ========================================================================= */}
      <section
        style={{
          backgroundColor: isDark ? '#0c1222' : '#f1f5f9',
          padding: '80px 20px',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#38bdf8' : '#2563eb',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#ffffff',
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'inline-block',
              }}
            >
              TRIỂN KHAI NHANH GỌN
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.8vw, 40px)',
                fontWeight: 900,
                marginTop: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
                letterSpacing: '-0.5px',
              }}
            >
              4 Bước Để Bắt Đầu Mở Bán Trong Vòng 24 Giờ
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                step: '01',
                title: 'Đăng Ký Trực Tuyến',
                desc: 'Điền thông tin nhà xe, tuyến đường và quy mô đội xe tại form bên dưới (chỉ mất 2 phút).',
                tag: '2 phút',
              },
              {
                step: '02',
                title: 'Tư Vấn & Ký Hợp Đồng',
                desc: 'Chuyên viên TravelEasy liên hệ tư vấn biểu phí hoa hồng ưu đãi và gửi hợp đồng điện tử tiện lợi.',
                tag: 'Trong ngày',
              },
              {
                step: '03',
                title: 'Số Hóa Xe & Đào Tạo',
                desc: 'Kỹ thuật viên hỗ trợ vẽ sơ đồ ghế xe VIP/Luxury, hướng dẫn dùng Cổng điều hành và quét mã QR.',
                tag: 'Miễn phí',
              },
              {
                step: '04',
                title: 'Chính Thức Mở Bán',
                desc: 'Các chuyến xe được hiển thị trên hệ thống tìm kiếm TravelEasy, đón nhận những đơn vé online đầu tiên.',
                tag: 'Go Live',
              },
            ].map((st, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                  boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '36px',
                      fontWeight: 900,
                      color: isDark ? '#38bdf8' : '#2563eb',
                      letterSpacing: '-1px',
                    }}
                  >
                    {st.step}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                      color: isDark ? '#38bdf8' : '#2563eb',
                      padding: '3px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    {st.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. ĐỐI TÁC TIÊU BIỂU & ĐÁNH GIÁ THỰC TẾ (TESTIMONIALS)
         ========================================================================= */}
      <section style={{ padding: '80px 20px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: isDark ? '#38bdf8' : '#2563eb',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            ĐỐI TÁC CHIẾN LƯỢC TOÀN QUỐC
          </span>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.8vw, 40px)',
              fontWeight: 900,
              marginTop: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              letterSpacing: '-0.5px',
            }}
          >
            Được Hơn 500+ Nhà Xe Uy Tín Tin Tưởng Đồng Hành
          </h2>
        </div>

        {/* Brand Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '60px',
          }}
        >
          {PARTNERS_LIST.map((partner, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderRadius: '16px',
                padding: '20px 22px',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bus size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {partner.name}
                  </div>
                  <div style={{ fontSize: '12.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    {partner.route}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: isDark ? 'rgba(234,179,8,0.2)' : '#fef3c7',
                    color: isDark ? '#facc15' : '#b45309',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {partner.badge}
                </span>
                <div style={{ fontSize: '11.5px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                  {partner.fleet}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Quotes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderRadius: '20px',
                padding: '30px 24px',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '3px', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" />
                ))}
              </div>
              <p style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.65, fontStyle: 'italic' }}>
                "{t.comment}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`, paddingTop: '14px' }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {t.role} • {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. FORM ĐĂNG KÝ MỞ BÁN VÉ LUNG LINH HIỆN ĐẠI (REGISTRATION FORM)
         ========================================================================= */}
      <section
        id="register-form"
        style={{
          padding: '40px 20px 80px',
          maxWidth: '920px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            borderRadius: '24px',
            padding: '44px 36px',
            border: `2px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
            boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.7)' : '0 25px 50px -12px rgba(37,99,235,0.12)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                color: '#2563eb',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: 800,
                marginBottom: '10px',
              }}
            >
              <Building2 size={16} />
              <span>ĐĂNG KÝ HỢP TÁC CHIẾN LƯỢC</span>
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.5px' }}>
              Bắt Đầu Mở Bán Cùng TravelEasy
            </h3>
            <p style={{ fontSize: '14.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
              Để lại thông tin bên dưới, chuyên viên hỗ trợ vùng của chúng tôi sẽ liên hệ trong vòng 24 giờ làm việc.
            </p>
          </div>

          {submitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                borderRadius: '18px',
                border: `1px solid ${isDark ? '#059669' : '#a7f3d0'}`,
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Check size={40} />
              </div>
              <h4 style={{ fontSize: '23px', fontWeight: 900, color: isDark ? '#a7f3d0' : '#065f46' }}>
                Gửi Thông Tin Hợp Tác Thành Công!
              </h4>
              <p
                style={{
                  fontSize: '15px',
                  color: isDark ? '#d1fae5' : '#047857',
                  maxWidth: '540px',
                  margin: '10px auto 22px',
                  lineHeight: 1.65,
                }}
              >
                Cảm ơn <strong>nhà xe {formData.companyName}</strong> đã tin tưởng lựa chọn TravelEasy. Chuyên viên vùng sẽ liên hệ trực tiếp qua số <strong>{formData.phone}</strong> để gửi hợp đồng và hướng dẫn số hóa xe.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 24px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Gửi Thêm Thông Tin Khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                    Tên Nhà Xe / Doanh Nghiệp Vận Tải <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Xe Khách Nam Cường Limousine"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                    Họ Và Tên Người Đại Diện / Quản Lý <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
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
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                    Email Công Ty (Tùy Chọn)
                  </label>
                  <input
                    type="email"
                    placeholder="Ví dụ: dieuhanh@namcuongbus.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Tuyến đường đang khai thác with Quick Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: isDark ? '#e2e8f0' : '#334155' }}>
                  Tuyến Đường Chính Đang Khai Thác
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sài Gòn ⇄ Đà Lạt, Nha Trang ⇄ Buôn Ma Thuột..."
                  value={formData.routes}
                  onChange={(e) => setFormData({ ...formData, routes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '14.5px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Gợi ý nhanh:</span>
                  {POPULAR_ROUTES.map((route, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAddRoute(route)}
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                        color: isDark ? '#38bdf8' : '#2563eb',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + {route}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quy mô đội xe radio selector */}
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '8px', color: isDark ? '#e2e8f0' : '#334155' }}>
                  Quy Mô Đội Xe Hiện Tại
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {['1 - 5 xe', '6 - 20 xe', '21 - 50 xe', 'Trên 50 xe'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, fleetSize: size })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: formData.fleetSize === size ? '2px solid #2563eb' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                        backgroundColor: formData.fleetSize === size ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#1e293b' : '#f8fafc'),
                        color: formData.fleetSize === size ? (isDark ? '#ffffff' : '#1e40af') : (isDark ? '#cbd5e1' : '#475569'),
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '16px 28px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '10px',
                  boxShadow: '0 10px 25px -5px rgba(37,99,235,0.5)',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? (
                  <span>Đang Gửi Yêu Cầu...</span>
                ) : (
                  <>
                    <span>Gửi Yêu Cầu Hợp Tác Ngay</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '12.5px', color: isDark ? '#94a3b8' : '#64748b' }}>
                🔒 TravelEasy cam kết bảo mật 100% dữ liệu danh tính và thông tin kinh doanh của nhà xe.
              </div>
            </form>
          )}
        </div>
      </section>

      {/* =========================================================================
          9. CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION)
         ========================================================================= */}
      <section style={{ padding: '0 20px 80px', maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
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
            Những Câu Hỏi Thường Gặp Của Nhà Xe
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontWeight: 800,
                    fontSize: '15.5px',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} color="#2563eb" /> : <ChevronDown size={20} color="#64748b" />}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 24px 20px',
                      fontSize: '14px',
                      color: isDark ? '#cbd5e1' : '#475569',
                      lineHeight: 1.65,
                      borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                      paddingTop: '16px',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          10. BOTTOM BANNER CALL TO ACTION
         ========================================================================= */}
      <section style={{ padding: '0 20px', maxWidth: '1240px', margin: '0 auto' }}>
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)'
              : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            borderRadius: '24px',
            padding: '50px 30px',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(37,99,235,0.3)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, marginBottom: '14px' }}>
            Sẵn Sàng Đột Phá Lợi Nhuận Cùng TravelEasy Ngay Hôm Nay?
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Đội ngũ chuyên viên vùng của chúng tôi sẵn sàng hỗ trợ nhà xe thiết lập toàn bộ danh mục tuyến đường và sơ đồ xe trong 24 giờ.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#register-form"
              style={{
                backgroundColor: '#f59e0b',
                color: '#1e3a8a',
                padding: '13px 28px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Đăng Ký Tư Vấn Ngay</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="tel:19006868"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '13px 26px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Phone size={17} />
              <span>Hotline 24/7: 1900 6868</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerCooperationPage;
