import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PromoCarousel } from './components/PromoCarousel';
import { VoucherFilter } from './components/VoucherFilter';
import { VoucherCard } from './components/VoucherCard';
import { VoucherDetailModal } from './components/VoucherDetailModal';
import { FilterType, IVoucher, IBannerSlide } from './types';
import { 
  Gift, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

// 1. CAROUSEL SLIDES (Chương trình khuyến mãi tháng này)
const PROMO_SLIDES: IBannerSlide[] = [
  {
    id: 1,
    title: 'Mùa Thu Vàng Săn Mây Sa Pa - Giảm 20% Vé Limousine',
    subtitle: 'Đồng hành cùng Sao Việt Express & Hải Vân Interbus Lines khám phá nóc nhà Đông Dương Fansipan và thung lũng Mường Hoa.',
    tag: 'ƯU ĐÃI ĐỘC QUYỀN',
    badge: 'HOT DEAL THÁNG NÀY',
    voucherCode: 'SAPA20',
    discountHighlight: 'GIẢM 20%',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Đặt Vé Sa Pa Ngay',
  },
  {
    id: 2,
    title: 'Thành Bưởi Cung Điện VIP Đà Lạt - Giảm Ngay 50.000đ',
    subtitle: 'Tận hưởng khoang phòng nằm riêng tư với rèm che kín đáo, màn hình giải trí và cổng sạc nhanh chuẩn chuyên cơ mặt đất.',
    tag: 'TUYẾN HOT SÀI GÒN - ĐÀ LẠT',
    badge: 'TIẾT KIỆM 50K',
    voucherCode: 'DALAT50K',
    discountHighlight: 'GIẢM 50.000Đ',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Săn Vé Đi Đà Lạt',
  },
  {
    id: 3,
    title: 'Quét Mã PayOS VietQR MB Bank - Giảm Thêm 10% Tối Đa 40K',
    subtitle: 'Thanh toán tự động duyệt vé tức thì trong 3 giây. Áp dụng cho mọi nhà xe trên toàn quốc khi thanh toán chuyển khoản Napas 24/7.',
    tag: 'THANH TOÁN THÔNG MINH',
    badge: 'PAYOS VIETQR',
    voucherCode: 'PAYOS10',
    discountHighlight: 'GIẢM 10%',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1400&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Thanh Toán PayOS Ngay',
  },
  {
    id: 4,
    title: 'Quà Tặng Thành Viên Mới - Giảm 15% Chuyến Xe Đầu Tiên',
    subtitle: 'Tạo tài khoản TravelEasy ngay hôm nay để nhận ngay bộ voucher giảm giá lên đến 150.000đ cho mọi chuyến du hành.',
    tag: 'DÀNH RIÊNG BẠN MỚI',
    badge: 'WELCOME GIFT',
    voucherCode: 'BANMOI15',
    discountHighlight: 'GIẢM 15%',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1400&auto=format&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(147, 51, 234, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Nhận Quà Bạn Mới',
  },
];

// 2. VOUCHER MOCK DATA (Ít nhất 8 voucher đa dạng tuyến & hình thức thanh toán)
const INITIAL_VOUCHERS: IVoucher[] = [
  {
    id: 'v-new-1',
    code: 'BANMOI15',
    title: 'Giảm 15% Cho Khách Hàng Mới Lần Đầu Đặt Vé',
    description: 'Áp dụng cho tài khoản đăng ký mới, giảm trực tiếp 15% trên tổng giá vé, tối đa 60.000đ.',
    discountType: 'PERCENT',
    discountValue: 15,
    maxDiscount: 60000,
    minSpend: 200000,
    category: 'NEW_USER',
    categoryLabel: 'Khách Mới',
    badge: 'BẠN MỚI',
    expiryDate: '30/11/2026',
    totalQuantity: 1000,
    usedQuantity: 742,
    applicableRoutes: ['Tất cả các tuyến xe toàn quốc'],
    applicablePaymentMethods: ['PayOS VietQR', 'VNPAY', 'MoMo', 'ZaloPay', 'Tiền mặt (COD)'],
    terms: [
      'Mỗi tài khoản chỉ được sử dụng mã 01 lần duy nhất cho chuyến đi đầu tiên.',
      'Không áp dụng chung với các chương trình khuyến mãi mã giảm giá khác.',
      'Vé áp dụng mã khi hủy sẽ không được hoàn lại mã voucher.',
      'Áp dụng cho mọi hãng xe đối tác chính thức của TravelEasy.',
    ],
  },
  {
    id: 'v-new-2',
    code: 'WELCOME30K',
    title: 'Giảm Ngay 30.000đ Vé Xe Bất Kỳ Khi Tải Ứng Dụng',
    description: 'Tặng ngay 30.000đ vào đơn hàng từ 150.000đ khi đặt vé lần đầu tiên trên TravelEasy.',
    discountType: 'FIXED',
    discountValue: 30000,
    minSpend: 150000,
    category: 'NEW_USER',
    categoryLabel: 'Khách Mới',
    badge: 'TẶNG 30K',
    expiryDate: '15/12/2026',
    totalQuantity: 800,
    usedQuantity: 490,
    applicableRoutes: ['Tất cả các tuyến xe toàn quốc'],
    applicablePaymentMethods: ['Tất cả phương thức thanh toán'],
    terms: [
      'Chỉ áp dụng cho tài khoản đăng ký mới chưa từng phát sinh đơn đặt vé thành công.',
      'Đơn hàng có giá trị thanh toán tối thiểu từ 150.000đ trở lên.',
      'Hạn sử dụng trong vòng 30 ngày kể từ ngày kích hoạt tài khoản.',
    ],
  },
  {
    id: 'v-route-1',
    code: 'DALAT50K',
    title: 'Giảm 50.000đ Vé Xe Tuyến TP.HCM ➔ Đà Lạt',
    description: 'Áp dụng cho tất cả chuyến xe giường nằm và phòng nằm Limousine Thành Bưởi, Phương Trang đi Đà Lạt.',
    discountType: 'FIXED',
    discountValue: 50000,
    minSpend: 280000,
    category: 'HOT_ROUTE',
    categoryLabel: 'Tuyến Hot',
    badge: 'ĐÀ LẠT HOT',
    expiryDate: '25/11/2026',
    totalQuantity: 500,
    usedQuantity: 415,
    applicableRoutes: ['TP. Hồ Chí Minh ➔ Đà Lạt', 'Đà Lạt ➔ TP. Hồ Chí Minh'],
    applicablePaymentMethods: ['PayOS VietQR', 'VNPAY', 'MoMo', 'ZaloPay'],
    terms: [
      'Áp dụng cho các chuyến xe xuất bến từ Bến xe Miền Đông, Miền Tây đi Bến xe Liên tỉnh Đà Lạt.',
      'Giá trị vé từ 280.000đ trở lên (phòng nằm 22 chỗ hoặc giường nằm 34 chỗ).',
      'Không áp dụng vào các ngày Lễ, Tết theo quy định nhà xe.',
    ],
    searchParams: { origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt' },
  },
  {
    id: 'v-route-2',
    code: 'SAPA20',
    title: 'Giảm 20% Vé Cabin Sa Pa Hãng Sao Việt & Hải Vân',
    description: 'Thưởng ngoạn mùa vàng Fansipan với mã giảm 20% cho hạng xe Cabin Cung Điện đôi và đơn.',
    discountType: 'PERCENT',
    discountValue: 20,
    maxDiscount: 90000,
    minSpend: 350000,
    category: 'HOT_ROUTE',
    categoryLabel: 'Tuyến Hot',
    badge: 'SA PA DEAL',
    expiryDate: '10/12/2026',
    totalQuantity: 600,
    usedQuantity: 512,
    applicableRoutes: ['Hà Nội ➔ Sa Pa', 'Sa Pa ➔ Hà Nội'],
    applicablePaymentMethods: ['PayOS VietQR', 'VNPAY', 'MoMo'],
    terms: [
      'Áp dụng cho các nhà xe đối tác Sao Việt Express, Hải Vân Express, King Express.',
      'Mức giảm tối đa 90.000đ cho mỗi giao dịch.',
      'Áp dụng cho chuyến khởi hành các ngày trong tuần từ Thứ Hai đến Thứ Năm.',
    ],
    searchParams: { origin: 'Hà Nội', destination: 'Sa Pa' },
  },
  {
    id: 'v-route-3',
    code: 'MIENTRUNG40K',
    title: 'Giảm 40.000đ Tuyến Đà Nẵng ➔ Quy Nhơn & Nha Trang',
    description: 'Ưu đãi dành riêng cho các cung đường biển Miền Trung, xe giường nằm cao cấp máy lạnh êm ái.',
    discountType: 'FIXED',
    discountValue: 40000,
    minSpend: 220000,
    category: 'HOT_ROUTE',
    categoryLabel: 'Tuyến Hot',
    badge: 'MIỀN TRUNG',
    expiryDate: '05/12/2026',
    totalQuantity: 450,
    usedQuantity: 310,
    applicableRoutes: ['Đà Nẵng ➔ Quy Nhơn', 'Đà Nẵng ➔ Nha Trang', 'Quy Nhơn ➔ Đà Nẵng'],
    applicablePaymentMethods: ['Tất cả phương thức thanh toán'],
    terms: [
      'Áp dụng cho vé xe của các nhà xe Phương Trang, Cúc Tùng, Hoàng Long.',
      'Áp dụng cho mỗi vé lẻ hoặc đơn đặt nhiều vé cùng lúc.',
    ],
    searchParams: { origin: 'Đà Nẵng', destination: 'Quy Nhơn' },
  },
  {
    id: 'v-pay-1',
    code: 'PAYOS10',
    title: 'Giảm Thêm 10% Khi Quét Mã VietQR Napas 24/7 (PayOS)',
    description: 'Khuyến khích thanh toán không tiền mặt. Quét mã QR MB Bank duyệt đơn tự động siêu tốc 3 giây.',
    discountType: 'PERCENT',
    discountValue: 10,
    maxDiscount: 50000,
    minSpend: 200000,
    category: 'ONLINE_PAYMENT',
    categoryLabel: 'Thanh Toán Online',
    badge: 'PAYOS MB',
    expiryDate: '31/12/2026',
    totalQuantity: 1500,
    usedQuantity: 1120,
    applicableRoutes: ['Toàn bộ chuyến xe trên TravelEasy'],
    applicablePaymentMethods: ['Cổng PayOS — Quét mã VietQR MB Bank'],
    terms: [
      'Bắt buộc chọn phương thức thanh toán "Cổng PayOS — Quét mã VietQR MB Bank" tại bước Checkout.',
      'Hệ thống tự động trừ tiền giảm giá vào tổng thanh toán khi tạo mã QR.',
      'Mỗi tài khoản được sử dụng tối đa 03 lần trong suốt thời gian diễn ra chương trình.',
    ],
  },
  {
    id: 'v-pay-2',
    code: 'VNPAY50K',
    title: 'Giảm 50.000đ Khi Thanh Toán Qua Cổng VNPAY-QR',
    description: 'Nhập mã trên ứng dụng ngân hàng hoặc ví VNPAY để nhận ưu đãi trực tiếp 50K cho đơn từ 400K.',
    discountType: 'FIXED',
    discountValue: 50000,
    minSpend: 400000,
    category: 'ONLINE_PAYMENT',
    categoryLabel: 'Thanh Toán Online',
    badge: 'VNPAY QR',
    expiryDate: '20/12/2026',
    totalQuantity: 700,
    usedQuantity: 580,
    applicableRoutes: ['Toàn bộ chuyến xe trên TravelEasy'],
    applicablePaymentMethods: ['Cổng thanh toán quốc gia VNPAY'],
    terms: [
      'Áp dụng khi chọn thanh toán bằng cổng VNPAY tại bước Checkout.',
      'Đơn hàng có tối thiểu 2 vé hoặc giá trị thanh toán từ 400.000đ.',
      'Chương trình có thể kết thúc sớm nếu hết ngân sách khuyến mại.',
    ],
  },
  {
    id: 'v-pay-3',
    code: 'MOMO20K',
    title: 'Hoàn Tiền 20.000đ Khi Liên Kết Ví Điện Tử MoMo',
    description: 'Giảm ngay 20.000đ cho mọi đơn đặt vé xe khách liên tỉnh khi thanh toán bằng ví điện tử MoMo.',
    discountType: 'FIXED',
    discountValue: 20000,
    minSpend: 180000,
    category: 'ONLINE_PAYMENT',
    categoryLabel: 'Thanh Toán Online',
    badge: 'VÍ MOMO',
    expiryDate: '15/12/2026',
    totalQuantity: 900,
    usedQuantity: 620,
    applicableRoutes: ['Toàn bộ chuyến xe trên TravelEasy'],
    applicablePaymentMethods: ['Ví điện tử MoMo'],
    terms: [
      'Áp dụng khi chọn thanh toán qua Ví điện tử MoMo.',
      'Mỗi số ví MoMo được áp dụng 02 lần/tháng.',
    ],
  },
];

export const PromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterType>('ALL');
  const [vouchers] = useState<IVoucher[]>(INITIAL_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    if (activeTab === 'ALL') return vouchers;
    return vouchers.filter((v) => v.category === activeTab);
  }, [activeTab, vouchers]);

  // Handle Testing Voucher Code in the search bar
  const handleTestCode = (code: string) => {
    const found = vouchers.find((v) => v.code.toUpperCase() === code.toUpperCase());
    if (found) {
      return {
        valid: true,
        voucher: found,
        message: `Mã ưu đãi [${found.code}] hợp lệ!`,
      };
    }
    return {
      valid: false,
      message: `Mã [${code}] không tồn tại hoặc đã hết lượt áp dụng trên hệ thống.`,
    };
  };

  // Handle Using Voucher from Test Box or Card
  const handleUseVoucher = (voucher: IVoucher) => {
    toast.success(`Đã chọn mã ${voucher.code}. Đang chuyển đến danh sách chuyến xe phù hợp...`, 'Áp Dụng Thành Công');
    
    // Save to session so Checkout can prefill
    try {
      sessionStorage.setItem('traveleasy_selected_voucher', JSON.stringify(voucher));
    } catch (e) {
      console.warn(e);
    }

    if (voucher.searchParams?.origin && voucher.searchParams?.destination) {
      const today = new Date().toISOString().split('T')[0];
      navigate(`/search?origin=${encodeURIComponent(voucher.searchParams.origin)}&destination=${encodeURIComponent(voucher.searchParams.destination)}&date=${today}&voucher=${voucher.code}`);
    } else {
      navigate(`/search?voucher=${voucher.code}`);
    }
  };

  const handleUseSlideCode = (code: string) => {
    const voucher = vouchers.find((v) => v.code === code);
    if (voucher) {
      handleUseVoucher(voucher);
    } else {
      navigate(`/search?voucher=${code}`);
    }
  };

  // FAQs Data
  const faqs = [
    {
      q: 'Làm thế nào để áp dụng mã giảm giá khi đặt vé xe?',
      a: 'Bạn chỉ cần chọn chuyến xe và số ghế mong muốn, tại trang Thanh Toán (Checkout), nhập mã giảm giá vào ô "MÃ GIẢM GIÁ" rồi bấm "Áp dụng". Hệ thống sẽ tự động trừ trực tiếp số tiền ưu đãi vào tổng thanh toán.',
    },
    {
      q: 'Tôi có thể dùng cùng lúc nhiều voucher cho một đơn hàng không?',
      a: 'Theo quy định của TravelEasy, mỗi đơn hàng chỉ được áp dụng 01 mã voucher ưu đãi. Bạn có thể chọn voucher có mức giảm cao nhất phù hợp với giá trị vé của mình để tiết kiệm tối đa.',
    },
    {
      q: 'Nếu tôi hủy vé xe thì mã giảm giá có được hoàn lại không?',
      a: 'Khi hủy vé đã áp dụng voucher, bạn sẽ được hoàn tiền theo chính sách hoàn hủy của từng nhà xe. Tuy nhiên, mã voucher đã dùng sẽ không được hoàn lại trừ trường hợp chuyến xe bị hủy do lỗi từ nhà xe.',
    },
    {
      q: 'Mã giảm giá thanh toán online (PayOS / VNPAY) được kích hoạt ra sao?',
      a: 'Tại bước Thanh Toán, bạn chỉ cần chọn phương thức thanh toán tương ứng (ví dụ: Cổng PayOS quét mã QR Napas 24/7). Khi nhập mã PAYOS10, hệ thống sẽ xác thực và giảm trừ tiền thanh toán ngay lập tức.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 1. HERO SECTION & PROMO CAROUSEL */}
      <section className="bg-slate-900 text-white pt-8 pb-14 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Section Subheading */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">
                <Gift size={13} /> TRUNG TÂM VOUCHER & MÃ GIẢM GIÁ TRAVELEASY
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Ưu Đãi Đặc Quyền Tháng 10/2026
              </h2>
            </div>

            {/* Live Stats Pill */}
            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs text-slate-300">
              <TrendingUp size={15} className="text-emerald-400" />
              <span>Đã có <strong className="text-white font-extrabold">12.450+</strong> lượt áp mã thành công tuần này</span>
            </div>
          </div>

          {/* Carousel Component */}
          <PromoCarousel slides={PROMO_SLIDES} onUseCode={handleUseSlideCode} />
        </div>
      </section>

      {/* 2. MAIN VOUCHER LISTING CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Filter Bar with Search & Code Tester */}
        <VoucherFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          vouchers={vouchers}
          onTestCode={handleTestCode}
          onApplyTestedVoucher={handleUseVoucher}
        />

        {/* 3. VOUCHER GRID (3 Columns Desktop, 1 Column Mobile) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
              <Percent size={18} className="text-orange-500" />
              Danh Sách Mã Giảm Giá Đang Khả Dụng ({filteredVouchers.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Cập nhật lúc: 12:00 hôm nay
            </span>
          </div>

          {filteredVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onSelectDetail={setSelectedVoucher}
                  onUseNow={handleUseVoucher}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Gift size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Chưa có mã giảm giá trong danh mục này
              </h4>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                Vui lòng chuyển sang tab [Tất Cả] để khám phá thêm nhiều mã ưu đãi hấp dẫn khác từ TravelEasy.
              </p>
              <button
                onClick={() => setActiveTab('ALL')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Xem Tất Cả Voucher
              </button>
            </div>
          )}
        </div>

        {/* 4. HOW TO REDEEM & BENEFITS STRIP */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0 font-black text-sm">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Chọn Chuyến & Giữ Ghế</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tra cứu tuyến xe liên tỉnh bạn muốn đi và lựa chọn vị trí giường nằm ưng ý nhất.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 font-black text-sm">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Dán Mã Tại Checkout</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập mã voucher bạn đã sao chép vào ô khuyến mãi để được trừ trực tiếp vào giá vé.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 font-black text-sm">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Thanh Toán An Toàn</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thanh toán tiện lợi qua PayOS VietQR, VNPAY, MoMo hoặc chọn Tiền mặt khi lên xe.
              </p>
            </div>
          </div>
        </div>

        {/* 5. FREQUENTLY ASKED QUESTIONS (FAQS) */}
        <section className="mt-14 bg-white rounded-3xl p-6 md:p-10 border border-slate-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-slate-100 text-slate-700 mb-2">
              <HelpCircle size={13} /> CÂU HỎI THƯỜNG GẶP
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Giải Đáp Thắc Mắc Về Mã Giảm Giá
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mọi thắc mắc trong quá trình áp dụng mã ưu đãi đều được hỗ trợ 24/7 qua hotline 1900 6868
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 md:p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-sm"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-4 md:p-5 pt-0 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 6. VOUCHER DETAIL MODAL / DRAWER */}
      <VoucherDetailModal
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        onUseNow={handleUseVoucher}
      />
    </div>
  );
};

