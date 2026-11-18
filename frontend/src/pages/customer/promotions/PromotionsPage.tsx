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
  Loader2,
  Wallet,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { CLOUDINARY_IMAGES } from '../../../constants/cloudinaryImages';
import { VoucherWalletService } from '../../../services/voucherWalletService';

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

  // Danh sách các mã voucher người dùng đang sở hữu trong ví
  const [ownedCodes, setOwnedCodes] = useState<string[]>(() => VoucherWalletService.getOwnedVoucherCodes());

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Lắng nghe sự kiện đồng bộ Ví Voucher
  useEffect(() => {
    const handleWalletUpdated = () => {
      setOwnedCodes(VoucherWalletService.getOwnedVoucherCodes());
    };
    window.addEventListener('traveleasy_wallet_updated', handleWalletUpdated);
    return () => window.removeEventListener('traveleasy_wallet_updated', handleWalletUpdated);
  }, []);

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

            const expiryFormatted = v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '31/12/2026';
            const isExpired = VoucherWalletService.isExpired(expiryFormatted);
            const isOutOfStock = v.usageLimit ? (v.usedCount || 0) >= v.usageLimit : false;

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
              expiryDate: expiryFormatted,
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
              isExpired,
              isOutOfStock,
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

  // Filtered Vouchers (Bao gồm cả Tab VÍ VOUCHER CỦA TÔI)
  const filteredVouchers = useMemo(() => {
    if (activeTab === 'MY_WALLET') {
      return vouchers.filter((v) => ownedCodes.includes(v.code.toUpperCase()));
    }
    if (activeTab === 'ALL') return vouchers;
    return vouchers.filter((v) => v.category === activeTab);
  }, [activeTab, vouchers, ownedCodes]);

  // Số lượng voucher đang sở hữu
  const ownedVoucherCount = useMemo(() => {
    return vouchers.filter((v) => ownedCodes.includes(v.code.toUpperCase())).length;
  }, [vouchers, ownedCodes]);

  // Handle Testing Voucher Code in the search bar
  const handleTestCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = vouchers.find((v) => v.code.toUpperCase() === clean);
    if (found) {
      const isExpired = VoucherWalletService.isExpired(found.expiryDate);
      if (isExpired) {
        return {
          valid: false,
          voucher: found,
          message: `Mã ưu đãi [${found.code}] đã hết hạn sử dụng (${found.expiryDate}).`,
        };
      }
      return {
        valid: true,
        voucher: found,
        message: `Mã ưu đãi [${found.code}] hợp lệ! Mức giảm: ${found.badge}. Đơn tối thiểu: ${found.minSpend.toLocaleString('vi-VN')}đ.`,
      };
    }
    return {
      valid: false,
      message: `Mã [${clean}] không tồn tại hoặc đã hết lượt áp dụng trên hệ thống.`,
    };
  };

  // Thêm voucher vào Ví của người dùng (Claim Voucher)
  const handleClaimVoucher = (voucher: IVoucher) => {
    if (VoucherWalletService.isExpired(voucher.expiryDate)) {
      toast.warning(`Mã ưu đãi [${voucher.code}] đã hết hạn sử dụng!`, 'Không Thể Thêm');
      return;
    }
    if (voucher.totalQuantity > 0 && voucher.usedQuantity >= voucher.totalQuantity) {
      toast.warning(`Mã ưu đãi [${voucher.code}] đã hết lượt áp dụng!`, 'Không Thể Thêm');
      return;
    }

    const success = VoucherWalletService.claimVoucher(voucher.code);
    if (success) {
      setOwnedCodes(VoucherWalletService.getOwnedVoucherCodes());
      toast.success(
        `Đã lưu mã [${voucher.code}] vào Ví Voucher của bạn! Bấm "Dùng ngay" khi đặt vé để được giảm giá.`,
        'Thêm Voucher Thành Công'
      );
    } else {
      toast.info(`Mã [${voucher.code}] đã có sẵn trong ví voucher của bạn!`, 'Ví Voucher');
    }
  };

  // Điều hướng người dùng đi Săn Khuyến Mại & Áp Dụng Voucher
  const handleUseVoucher = (voucher: IVoucher) => {
    // 1. Kiểm tra tính hợp lệ & còn hạn
    if (VoucherWalletService.isExpired(voucher.expiryDate)) {
      toast.error(`Mã ưu đãi [${voucher.code}] đã hết hạn sử dụng (${voucher.expiryDate})! Không thể áp dụng.`, 'Voucher Hết Hạn');
      return;
    }

    if (voucher.totalQuantity > 0 && voucher.usedQuantity >= voucher.totalQuantity) {
      toast.error(`Mã ưu đãi [${voucher.code}] đã hết lượt áp dụng trên hệ thống!`, 'Voucher Hết Lượt');
      return;
    }

    // Tự động thêm vào ví nếu chưa có để đồng bộ
    VoucherWalletService.claimVoucher(voucher.code);
    setOwnedCodes(VoucherWalletService.getOwnedVoucherCodes());

    toast.success(`Đã chọn mã ưu đãi [${voucher.code}]! Đang chuyển đến danh sách chuyến xe phù hợp...`, 'Đặt Vé Áp Dụng Ngay');
    
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
      VoucherWalletService.claimVoucher(code);
      setOwnedCodes(VoucherWalletService.getOwnedVoucherCodes());
      toast.success(`Đã kích hoạt ưu đãi mã [${code}]!`, 'Áp Dụng Thành Công');
      navigate(`/search?voucher=${code}`);
    }
  };

  // FAQs Data
  const faqs = [
    {
      q: 'Làm thế nào để thu thập voucher vào Ví Voucher cá nhân?',
      a: 'Bạn chỉ cần tìm voucher mong muốn tại trang Khuyến Mại và bấm nút "Thêm Voucher". Voucher sẽ được lưu ngay vào Ví Voucher của bạn để sử dụng bất cứ lúc nào khi đặt vé.',
    },
    {
      q: 'Làm thế nào để sử dụng mã giảm giá khi đặt vé xe?',
      a: 'Sau khi đã lưu voucher vào ví, bạn chỉ cần bấm nút "Dùng Ngay" để hệ thống tự động lọc các chuyến xe phù hợp. Tại bước Thanh Toán (Checkout), hệ thống sẽ tự động trừ trực tiếp số tiền ưu đãi vào tổng thanh toán.',
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
                <Gift size={13} /> TRUNG TÂM VOUCHER & MÃ GIẢM GIÁ
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Ưu Đãi Đặc Quyền Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-normal">
                Săn vé giá sốc, mã giảm giá độc quyền cho hơn 140+ chuyến xe liên tỉnh chất lượng cao trên toàn quốc.
              </p>
            </div>

            {/* Wallet Quick Access Pill */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('MY_WALLET')}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-2xl shadow-lg border border-emerald-400/40 text-xs font-black transition-all active:scale-95"
              >
                <Wallet size={15} />
                <span>Ví Voucher Của Tôi:</span>
                <span className="bg-white text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-black">
                  {ownedVoucherCount} mã
                </span>
              </button>
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
          ownedCodes={ownedCodes}
          onTestCode={handleTestCode}
          onApplyTestedVoucher={handleUseVoucher}
        />

        {/* Voucher Count & Helper Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              {isLoading
                ? 'Đang tải voucher...'
                : activeTab === 'MY_WALLET'
                ? `Ví của bạn có ${filteredVouchers.length} ưu đãi đã lưu:`
                : `Tìm thấy ${filteredVouchers.length} ưu đãi khả dụng:`}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck size={12} /> Cập nhật trực tiếp từ CSDL hệ thống
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Sparkles size={13} className="text-amber-500" />
            <span>
              {activeTab === 'MY_WALLET'
                ? 'Nhấn "Dùng ngay" trên voucher để áp dụng trực tiếp vào chuyến xe phù hợp'
                : 'Nhấn "Thêm Voucher" để gom mã vào ví hoặc "Dùng ngay" để đi thẳng tới đặt vé'}
            </span>
          </div>
        </div>

        {/* Voucher Cards Grid (3 Cột Desktop, 1 Cột Mobile) */}
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <div className="font-bold text-slate-700">Đang tải mã giảm giá từ database Supabase...</div>
          </div>
        ) : filteredVouchers.length === 0 ? (
          activeTab === 'MY_WALLET' ? (
            /* Empty State chuyên biệt cho Ví Voucher của tôi */
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Wallet size={32} />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1">Ví Voucher Của Bạn Đang Trống</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-5 max-w-md mx-auto">
                Bạn chưa lưu voucher nào vào ví cá nhân. Hãy khám phá các ưu đãi đặc quyền trên hệ thống và nhấn <strong className="text-orange-600">"Thêm Voucher"</strong> để lưu lại dùng dần khi đặt vé xe nhé!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
              >
                Khám Phá Ưu Đãi Ngay <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* Empty State khi danh mục không có voucher */
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Percent size={28} />
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1">Không có voucher trong mục này</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Các chương trình ưu đãi mới đang được cập nhật. Bạn vui lòng chọn tab "Tất cả ưu đãi" để khám phá thêm voucher khác.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Xem Tất Cả Voucher
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVouchers.map((voucher) => {
              const isOwned = ownedCodes.includes(voucher.code.toUpperCase());
              return (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  isOwned={isOwned}
                  onSelectDetail={setSelectedVoucher}
                  onUseNow={handleUseVoucher}
                  onClaimVoucher={handleClaimVoucher}
                />
              );
            })}
          </div>
        )}

        {/* 3. PROMO GUIDE STEPS BANNER */}
        <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-700/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-black tracking-wider text-orange-400 uppercase">HƯỚNG DẪN 3 BƯỚC ĐƠN GIẢN</span>
              <h3 className="text-xl md:text-2xl font-black text-white">Cách Săn, Lưu & Áp Dụng Mã Giảm Giá Thành Công 100%</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Thu Thập Vào Ví</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lựa chọn mã ưu đãi phù hợp và nhấn "Thêm Voucher" để lưu vào Ví Voucher cá nhân của bạn.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-white mb-1">Bấm "Dùng Ngay"</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hệ thống tự động chuyển bạn đến danh sách chuyến xe tương ứng và áp sẵn mã voucher hợp lệ vào bộ nhớ tạm.
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
                    type="button"
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
        isOwned={selectedVoucher ? ownedCodes.includes(selectedVoucher.code.toUpperCase()) : false}
        onClose={() => setSelectedVoucher(null)}
        onUseNow={handleUseVoucher}
        onClaimVoucher={handleClaimVoucher}
      />
    </div>
  );
};
export default PromotionsPage;
