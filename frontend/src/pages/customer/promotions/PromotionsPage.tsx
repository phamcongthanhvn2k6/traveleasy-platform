import React, { useState, useMemo, useEffect } from 'react';
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
  Percent,
  Loader2
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { CLOUDINARY_IMAGES } from '../../../constants/cloudinaryImages';

// Banners mặc định lấy từ Cloudinary chính thức
const DEFAULT_SLIDES: IBannerSlide[] = [
  {
    id: 1,
    title: 'Mùa Thu Vàng Săn Mây Sa Pa - Giảm 20% Vé Limousine',
    subtitle: 'Đồng hành cùng Sao Việt Express & Hải Vân Interbus Lines khám phá nóc nhà Đông Dương Fansipan và thung lũng Mường Hoa.',
    tag: 'ƯU ĐÃI ĐỘC QUYỀN',
    badge: 'HOT DEAL THÁNG NÀY',
    voucherCode: 'SAPA20',
    discountHighlight: 'GIẢM 20%',
    image: CLOUDINARY_IMAGES.banners.heroSapa,
    gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Đặt Vé Sa Pa Ngay',
  },
  {
    id: 2,
    title: 'Thành Bưởi Cung Điện VIP Đà Lạt - Giảm Ngay 50.000đ',
    subtitle: 'Tận hưởng khoang phòng nằm riêng tư với rèm che kín đáo, màn hình giải trí và cổng sạc nhanh chuẩn chuyên cơ mặt đất.',
    tag: 'TUYẾN HOT SÀI GÒN - ĐÀ LẠT',
    badge: 'TIẾT KIỆM 50K',
    voucherCode: 'DALATVIP',
    discountHighlight: 'GIẢM 50.000Đ',
    image: CLOUDINARY_IMAGES.banners.heroDalat,
    gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Săn Vé Đi Đà Lạt',
  },
  {
    id: 3,
    title: 'Quét Mã PayOS VietQR MB Bank - Giảm Ngay 30.000đ',
    subtitle: 'Thanh toán tự động duyệt vé tức thì trong 3 giây. Áp dụng cho mọi nhà xe trên toàn quốc khi thanh toán chuyển khoản Napas 24/7.',
    tag: 'THANH TOÁN THÔNG MINH',
    badge: 'PAYOS VIETQR',
    voucherCode: 'PAYOS50',
    discountHighlight: 'GIẢM 30K',
    image: CLOUDINARY_IMAGES.banners.payosMbBank,
    gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
    actionText: 'Thanh Toán PayOS Ngay',
  },
];

export const PromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterType>('ALL');
  const [slides, setSlides] = useState<IBannerSlide[]>(DEFAULT_SLIDES);
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Fetch real Banners & Vouchers from Supabase
  useEffect(() => {
    setIsLoading(true);

    // 1. Fetch Banners từ Supabase
    api.get('/banners')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const dynamicSlides: IBannerSlide[] = res.data.data.map((b: any, index: number) => {
            const isEven = index % 2 === 0;
            return {
              id: b.id,
              title: b.title || 'Ưu Đãi Đặc Quyền TravelEasy',
              subtitle: 'Đồng hành cùng hơn 50+ nhà xe uy tín chất lượng cao trên toàn quốc.',
              tag: b.position || 'ƯU ĐÃI NỔI BẬT',
              badge: 'HOT DEAL',
              voucherCode: index === 0 ? 'SAPA20' : index === 1 ? 'DALATVIP' : 'PAYOS50',
              discountHighlight: 'GIẢM ĐẾN 20%',
              image: b.imagePath?.startsWith('http') 
                ? b.imagePath 
                : (isEven ? 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1400&auto=format&fit=crop&q=80'),
              gradient: isEven 
                ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)' 
                : 'linear-gradient(135deg, rgba(37, 99, 235, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
              actionText: 'Săn Vé Ưu Đãi Ngay',
            };
          });

          if (dynamicSlides.length > 0) {
            setSlides(dynamicSlides);
          }
        }
      })
      .catch((err) => {
        console.warn('Không thể tải banner từ Supabase:', err);
      });

    // 2. Fetch toàn bộ Vouchers từ bảng promotions trên Supabase
    api.get('/promotions')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mappedVouchers: IVoucher[] = res.data.data.map((v: any) => {
            const isPercent = v.discountType === 'PERCENT';
            const cat = v.category || 'ALL';
            let catType: FilterType = 'ALL';
            let catLabel = 'Tất Cả';

            if (cat === 'NEW_CUSTOMER' || cat === 'Khách mới') {
              catType = 'NEW_USER';
              catLabel = 'Khách Mới';
            } else if (cat === 'HOT_ROUTE' || cat === 'Tuyến hot') {
              catType = 'HOT_ROUTE';
              catLabel = 'Tuyến Hot';
            } else if (cat === 'ONLINE_PAYMENT' || cat === 'Thanh toán online') {
              catType = 'ONLINE_PAYMENT';
              catLabel = 'Thanh Toán Online';
            }

            const badge = v.badgeText || (isPercent ? `GIẢM ${v.discountValue}%` : `GIẢM ${(Number(v.discountValue) / 1000).toFixed(0)}K`);
            const routes = (v.applicableOrigin && v.applicableDestination)
              ? [`${v.applicableOrigin} ➔ ${v.applicableDestination}`]
              : ['Toàn bộ các tuyến xe trên hệ thống TravelEasy'];

            return {
              id: `v-${v.id}`,
              code: v.code,
              title: v.title,
              description: v.description || 'Ưu đãi đặt vé xe khách độc quyền từ TravelEasy.',
              discountType: isPercent ? 'PERCENT' : 'FIXED',
              discountValue: Number(v.discountValue),
              maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : undefined,
              minSpend: v.minOrderValue ? Number(v.minOrderValue) : 0,
              category: catType,
              categoryLabel: catLabel,
              badge: badge,
              expiryDate: v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '30/11/2026',
              totalQuantity: v.usageLimit || 1000,
              usedQuantity: v.usedCount || 0,
              applicableRoutes: routes,
              applicablePaymentMethods: catType === 'ONLINE_PAYMENT'
                ? ['Cổng PayOS — Quét mã VietQR MB Bank', 'VNPAY', 'MoMo', 'ZaloPay']
                : ['PayOS VietQR', 'VNPAY', 'MoMo', 'Tiền mặt (COD)'],
              terms: v.terms ? [v.terms] : [
                'Áp dụng cho mọi vé xe đặt trực tuyến trên nền tảng TravelEasy.',
                'Mỗi tài khoản được áp dụng 01 mã cho mỗi đơn đặt vé.',
                'Tự động trừ trực tiếp vào tổng tiền khi quét mã QR hoặc thanh toán online.'
              ],
              searchParams: (v.applicableOrigin && v.applicableDestination) ? {
                origin: v.applicableOrigin,
                destination: v.applicableDestination,
              } : undefined,
            };
          });

          setVouchers(mappedVouchers);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải mã giảm giá từ Supabase:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    if (activeTab === 'ALL') return vouchers;
    return vouchers.filter((v) => v.category === activeTab);
  }, [activeTab, vouchers]);

  // Handle Testing Voucher Code in the search bar
  const handleTestCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = vouchers.find((v) => v.code.toUpperCase() === clean);
    if (found) {
      return {
        valid: true,
        voucher: found,
        message: `Mã ưu đãi [${found.code}] hợp lệ! Mức giảm: ${found.badge}. Áp dụng cho: ${found.applicableRoutes.join(', ')}.`,
      };
    }
    return {
      valid: false,
      message: `Mã [${clean}] không tồn tại hoặc đã hết lượt áp dụng trên hệ thống.`,
    };
  };

  // Điều hướng người dùng đi Săn Khuyến Mại
  const handleUseVoucher = (voucher: IVoucher) => {
    toast.success(`Đã chọn mã ưu đãi [${voucher.code}]! Đang chuyển đến danh sách chuyến xe phù hợp...`, 'Săn Khuyến Mại');
    
    // Lưu vào sessionStorage để bước thanh toán tự động prefill
    try {
      sessionStorage.setItem('traveleasy_selected_voucher', JSON.stringify(voucher));
    } catch (e) {
      console.warn(e);
    }

    // Điều hướng thông minh: Nếu voucher có tuyến cụ thể, điền thẳng tuyến đó
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
      toast.success(`Đã kích hoạt ưu đãi mã [${code}]!`, 'Áp Dụng Thành Công');
      navigate(`/search?voucher=${code}`);
    }
  };

  // FAQs Data
  const faqs = [
    {
      q: 'Làm thế nào để săn và áp dụng mã giảm giá khi đặt vé xe?',
      a: 'Bạn chỉ cần chọn mã voucher yêu thích tại trang Khuyến Mại và bấm "Dùng ngay" hoặc "Sao chép mã". Tại bước Thanh Toán (Checkout), hệ thống sẽ tự động trừ trực tiếp số tiền ưu đãi vào tổng thanh toán.',
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
      q: 'Mã giảm giá thanh toán online (PayOS / VietQR) được kích hoạt ra sao?',
      a: 'Tại bước Thanh Toán, bạn chỉ cần chọn phương thức thanh toán "Cổng PayOS — Quét mã VietQR MB Bank" hoặc VNPAY. Hệ thống sẽ tự động xác thực và giảm trừ tiền thanh toán ngay lập tức.',
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
                <Gift size={13} /> TRUNG TÂM VOUCHER & MÃ GIẢM GIÁ SUPABASE
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Ưu Đãi Đặc Quyền Tháng 10/2026
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-normal">
                Săn vé giá sốc, mã giảm giá độc quyền cho hơn 140+ chuyến xe liên tỉnh chất lượng cao trên toàn quốc.
              </p>
            </div>

            {/* Live Count Pill */}
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 text-xs text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Đã có <strong className="text-white font-black text-sm">12.450+</strong> lượt áp mã thành công tuần này</span>
            </div>
          </div>

          {/* Carousel Component */}
          <PromoCarousel slides={slides} onUseCode={handleUseSlideCode} />
        </div>
      </section>

      {/* 2. MAIN VOUCHER DISCOVERY SECTION */}
      <main className="max-w-6xl mx-auto px-4 -mt-6 space-y-8">
        {/* Filter and Search Bar Card */}
        <VoucherFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          vouchers={vouchers}
          onTestCode={handleTestCode}
          onApplyTestedVoucher={handleUseVoucher}
        />

        {/* Voucher Count & Helper Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              {isLoading ? 'Đang tải voucher...' : `Tìm thấy ${filteredVouchers.length} ưu đãi khả dụng:`}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck size={12} /> Cập nhật thời gian thực từ Supabase
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Sparkles size={13} className="text-amber-500" />
            <span>Mẹo: Nhấn "Dùng ngay" để được tự động áp mã vào chuyến đi phù hợp</span>
          </div>
        </div>

        {/* Voucher Cards Grid (3 Cột Desktop, 1 Cột Mobile) */}
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <div className="font-bold text-slate-700">Đang tải mã giảm giá từ database Supabase...</div>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Percent size={28} />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">Không có voucher trong mục này</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Các chương trình ưu đãi mới đang được cập nhật. Bạn vui lòng chọn tab "Tất cả" để khám phá thêm voucher khác.
            </p>
            <button
              onClick={() => setActiveTab('ALL')}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Xem Tất Cả Voucher
            </button>
          </div>
        ) : (
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
        )}

        {/* 3. PROMO GUIDE STEPS BANNER */}
        <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-700/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-black tracking-wider text-orange-400 uppercase">HƯỚNG DẪN 3 BƯỚC ĐƠN GIẢN</span>
              <h3 className="text-xl md:text-2xl font-black text-white">Cách Săn & Áp Dụng Mã Giảm Giá Thành Công 100%</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Chọn Mã Phù Hợp</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lựa chọn ưu đãi theo nhu cầu: Khách mới, Tuyến đường hot hoặc Thanh toán trực tuyến PayOS / VietQR.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Bấm "Dùng Ngay"</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hệ thống tự động chuyển bạn đến danh sách chuyến xe tương ứng và áp sẵn mã voucher vào bộ nhớ tạm.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm mb-3">
                  3
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Giảm Tiền Tại Checkout</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tại bước thanh toán, giá vé sẽ được giảm trực tiếp. Tiến hành quét mã VietQR hoặc nhận vé điện tử SMS/Zalo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FAQS ACCORDION */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-orange-500" />
            <h3 className="text-lg font-black text-slate-900">Câu Hỏi Thường Gặp Về Mã Giảm Giá (FAQ)</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs md:text-sm text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 5. VOUCHER DETAIL MODAL / DRAWER */}
      <VoucherDetailModal
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        onUseNow={handleUseVoucher}
      />
    </div>
  );
};
