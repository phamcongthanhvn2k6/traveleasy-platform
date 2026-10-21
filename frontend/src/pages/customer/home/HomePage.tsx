import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchTripBar } from '../../../components/SearchTripBar';
import { TripCard } from '../../../components/TripCard';
import { CheckoutModal } from '../../../components/CheckoutModal';
import { Trip, Booking } from '../../../types';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import { 
  ShieldCheck, 
  Headphones, 
  Percent, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  MapPin, 
  Tag, 
  Sparkles, 
  Compass, 
  Award, 
  Gift, 
  ArrowRight,
  Bus,
  Check
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({ origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt' });

  // Booking state
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [bookingPoints, setBookingPoints] = useState<any>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Ref to scroll to results smoothly
  const resultsRef = useRef<HTMLDivElement>(null);

  const fetchTrips = async (origin = 'TP. Hồ Chí Minh', destination = 'Đà Lạt') => {
    setLoading(true);
    try {
      const res = await api.get('/trips/search', {
        params: { origin, destination }
      });
      const data = res.data.data || [];
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (origin: string, destination: string, date: string) => {
    navigate(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
  };

  const handleQuickRouteClick = (origin: string, destination: string) => {
    const today = new Date().toISOString().split('T')[0];
    navigate(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${today}`);
  };

  const handleOpenBooking = (trip: Trip, seats: string[], points: any) => {
    setBookingTrip(trip);
    setBookingSeats(seats);
    setBookingPoints(points);
  };

  // 1. Tuyến đường phổ biến (Screenshot 2)
  const popularRoutes = [
    {
      id: 1,
      title: 'Hà Nội - Sa Pa',
      origin: 'Hà Nội',
      destination: 'Sa Pa',
      price: '219.000đ',
      oldPrice: '250.000đ',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
      bgColor: 'linear-gradient(180deg, transparent 40%, rgba(30, 58, 138, 0.85) 100%)'
    },
    {
      id: 2,
      title: 'Hà Nội - Hải Phòng',
      origin: 'Hà Nội',
      destination: 'Hải Phòng',
      price: '130.000đ',
      oldPrice: null,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      bgColor: 'linear-gradient(180deg, transparent 40%, rgba(55, 48, 163, 0.85) 100%)'
    },
    {
      id: 3,
      title: 'Sài Gòn - Đà Lạt',
      origin: 'TP. Hồ Chí Minh',
      destination: 'Đà Lạt',
      price: '199.000đ',
      oldPrice: '249.000đ',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80',
      bgColor: 'linear-gradient(180deg, transparent 40%, rgba(194, 65, 12, 0.85) 100%)'
    },
    {
      id: 4,
      title: 'Sài Gòn - Nha Trang',
      origin: 'TP. Hồ Chí Minh',
      destination: 'Nha Trang',
      price: '200.000đ',
      oldPrice: null,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      bgColor: 'linear-gradient(180deg, transparent 40%, rgba(120, 53, 15, 0.85) 100%)'
    }
  ];

  // 2. Ưu đãi nổi bật (Screenshot 2)
  const featuredPromos = [
    {
      id: 1,
      tag: 'HOT DEAL 25/10',
      title: 'Lương về chốt deal - Giảm đến 50% vào ngày 25 hàng tháng',
      badge: 'GIẢM 50%',
      gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      accent: '#d97706',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      tag: 'FLASH SALE',
      title: '12h - 14h Thứ 3 - Flash Sale vé rẻ đến 50%',
      badge: 'THỨ 3 HÀNG TUẦN',
      gradient: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
      accent: '#0284c7',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      tag: 'NHÀ XE MỚI',
      title: 'Giảm đến 20% khi đặt vé các nhà xe mới mở bán tại TravelEasy',
      badge: 'TIẾT KIỆM 20%',
      gradient: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
      accent: '#16a34a',
      image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      tag: 'BẠN BÈ',
      title: 'Giới thiệu bạn mới - Nhận quà khủng từ TravelEasy',
      badge: 'THƯỞNG 80K',
      gradient: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)',
      accent: '#db2777',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80'
    }
  ];

  // 3. Du lịch Sapa (Screenshot 3)
  const sapaGuides = [
    {
      id: 1,
      category: 'Ưu đãi',
      badgeText: '3 ưu đãi',
      title: 'Mệt mỏi tới Sa Pa... Giảm đến 100K khi đặt vé xe phòng VIP cabin đôi',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      category: 'Phương tiện',
      badgeText: '4 bài viết',
      title: 'Hành trình đưa bạn đến Phố Sương Sa Pa: Top 5 xe Limousine cabin phòng riêng',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      category: 'Kinh nghiệm du lịch',
      badgeText: '8 bài viết',
      title: 'Kinh nghiệm khám phá Sa Pa mùa lúa chín, săn mây nóc nhà Đông Dương Fansipan',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
    }
  ];

  // 4. Cuộc thi sáng tạo Go with TravelEasy (Screenshot 3)
  const contestCards = [
    {
      id: 1,
      title: 'Nhận thưởng hàng chục triệu đồng khi tham gia "Go with TravelEasy"',
      tag: 'CUỘC THI HOT',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Gia hạn thời gian nộp bài dự thi Go with TravelEasy đến hết quý 4',
      tag: 'THÔNG BÁO',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Thể lệ cuộc thi sáng tạo nội dung du lịch Go with TravelEasy 2026',
      tag: 'HƯỚNG DẪN',
      image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Cơ cấu giải thưởng & Tiêu chí chấm điểm các tác phẩm xuất sắc',
      tag: 'GIẢI THƯỞNG',
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&auto=format&fit=crop&q=80'
    }
  ];

  // 5. Ưu đãi thanh toán online (Screenshot 4)
  const paymentPromos = [
    {
      id: 1,
      brand: 'ShopeePay',
      title: 'Giảm đến 50K khi thanh toán bằng ví ShopeePay',
      badge: 'GIẢM 50K',
      bgGradient: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
      color: '#c2410c'
    },
    {
      id: 2,
      brand: 'VNPAY-QR',
      title: 'Giảm đến 50K khi thanh toán dịch vụ TravelEasy bằng VNPAY-QR',
      badge: 'VNPAY 50K',
      bgGradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      color: '#1d4ed8'
    },
    {
      id: 3,
      brand: 'ZaloPay',
      title: 'Giảm đến 50K khi thanh toán TravelEasy bằng ví Zalopay',
      badge: 'ZALOPAY 50K',
      bgGradient: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
      color: '#0369a1'
    },
    {
      id: 4,
      brand: 'MoMo',
      title: 'Giảm 20K khi thanh toán vé xe nhanh chóng bằng ví MoMo',
      badge: 'MOMO 20K',
      bgGradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
      color: '#be185d'
    }
  ];

  // 6. Ưu đãi từ đối tác khác (Screenshot 4 & 5)
  const partnerPromos = [
    {
      id: 1,
      partner: 'MOOVTEK',
      title: 'Giảm đến 30% khi đặt xe công nghệ MOOVTEK dành cho khách hàng TravelEasy',
      desc: 'Tiễn thẳng bến xe - Đặt ngay khởi trễ',
      badge: 'GIẢM 30%',
      color: '#6366f1'
    },
    {
      id: 2,
      partner: 'Grab',
      title: 'Giảm 20% khi đặt dịch vụ GrabBike/GrabCar di chuyển ra bến xe',
      desc: 'Có Grab đón đưa mọi nẻo đường',
      badge: 'GIẢM 20%',
      color: '#059669'
    },
    {
      id: 3,
      partner: 'Green SM',
      title: 'Giảm đến 20% khi sử dụng dịch vụ taxi điện Green SM cho khách TravelEasy',
      desc: 'Trọn vẹn một hành trình xanh',
      badge: 'ƯU ĐÃI 20%',
      color: '#0d9488'
    },
    {
      id: 4,
      partner: 'Radisson Resort',
      title: 'Giảm 15% dịch vụ Spa tại Radisson Resort Mũi Né dành cho khách hàng',
      desc: 'Thư giãn tuyệt đỉnh sau chuyến xe đường dài',
      badge: 'GIẢM 15%',
      color: '#0284c7'
    }
  ];

  // 7. TravelEasy có gì mới? (Screenshot 5)
  const newsCards = [
    {
      id: 1,
      title: 'TravelEasy chính thức hỗ trợ phương thức thanh toán tiện lợi Apple Pay',
      category: 'TÍNH NĂNG MỚI',
      date: 'Tháng 10/2026'
    },
    {
      id: 2,
      title: 'Quỹ "Chuyến Xe Yêu Thương" - Trao hàng nghìn vé xe Tết đoàn viên cho người khó khăn',
      category: 'CỘNG ĐỒNG',
      date: 'Xuân 2027'
    },
    {
      id: 3,
      title: 'Chủ động và an tâm hơn trong mọi hành trình với tính năng định vị theo dõi xe trực tiếp',
      category: 'CÔNG NGHỆ',
      date: 'Tháng 10/2026'
    },
    {
      id: 4,
      title: '"Bảo hiểm chuyến đi" chính thức ra mắt - An tâm di chuyển với mức bảo hiểm tới 400 triệu',
      category: 'DỊCH VỤ MỚI',
      date: 'Tháng 10/2026'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* =========================================================================
          HERO BANNER & SEARCH SECTION (Chuẩn Vexere Prototype Screenshot 1)
          ========================================================================= */}
      <section style={{
        background: 'linear-gradient(180deg, #1d4ed8 0%, #2563eb 50%, #38bdf8 100%)',
        position: 'relative',
        paddingTop: '36px',
        paddingBottom: '80px',
        overflow: 'hidden'
      }}>
        {/* Decorative Travel Pattern Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.12,
          backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Hero Promotional Banner Headline (Screenshot 1) */}
          <div style={{ textAlign: 'center', color: '#ffffff', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: 800,
              marginBottom: '14px',
              color: '#fef08a'
            }}>
              <Sparkles size={16} /> THỨ 3 HÀNG TUẦN | 12H - 14H
            </div>

            <h1 style={{
              fontSize: '44px',
              fontWeight: 900,
              letterSpacing: '-1px',
              lineHeight: 1.15,
              textTransform: 'uppercase',
              marginBottom: '8px',
              textShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              ĐẠI TIỆC FLASH SALE — VÉ RẺ ĐẾN 50%
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#e0f2fe',
              maxWidth: '680px',
              margin: '0 auto',
              fontWeight: 500
            }}>
              *Áp dụng cho mọi tuyến đường nhà xe tham gia chương trình. Cam kết 100% giữ chỗ, chọn vị trí trực tiếp trên sơ đồ xe!
            </p>
          </div>

          {/* Overlaid Search Trip Bar */}
          <SearchTripBar 
            onSearch={handleSearch}
            defaultOrigin={searchParams.origin}
            defaultDestination={searchParams.destination}
          />
        </div>
      </section>

      {/* =========================================================================
          VALUE PROPOSITION (NAVY STRIP BAR - Screenshot 1 & 2)
          ========================================================================= */}
      <section style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '16px 0', borderBottom: '1px solid #1e293b' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Cam kết 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#f59e0b', padding: '6px', borderRadius: '50%', color: '#0f172a', display: 'flex' }}>
              <Check size={16} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Chắc chắn có chỗ</span>
          </div>

          {/* Cam kết 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ color: '#38bdf8', display: 'flex' }}>
              <Headphones size={22} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Hỗ trợ 24/7</span>
          </div>

          {/* Cam kết 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ color: '#fbbf24', display: 'flex' }}>
              <Percent size={22} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Nhiều ưu đãi</span>
          </div>

          {/* Cam kết 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ color: '#4ade80', display: 'flex' }}>
              <CreditCard size={22} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Thanh toán đa dạng</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE SEARCH RESULTS (NẾU ĐÃ TÌM KIẾM HOẶC CLICK VÀO TUYẾN ĐƯỜNG)
          ========================================================================= */}
      <div ref={resultsRef} className="container" style={{ paddingTop: hasSearched ? '36px' : '0' }}>
        {hasSearched && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bus size={22} color="#2563eb" />
                  Kết Quả Chuyến Xe: <span style={{ color: '#2563eb' }}>{searchParams.origin}</span> ➔ <span style={{ color: '#ef4444' }}>{searchParams.destination}</span>
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  Tìm thấy <strong>{trips.length}</strong> chuyến xe chất lượng cao từ các nhà xe đối tác uy tín
                </p>
              </div>

              <button
                onClick={() => setHasSearched(false)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Ẩn kết quả
              </button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '12px', fontWeight: 600 }}>Đang cập nhật lịch trình chuyến xe...</div>
              </div>
            )}

            {!loading && trips.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <Compass size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>Chưa tìm thấy chuyến xe phù hợp cho lộ trình này</h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px' }}>
                  Vui lòng thử tìm các tuyến liên tỉnh phổ biến: TP. Hồ Chí Minh - Đà Lạt, Hà Nội - Sa Pa, hoặc Sài Gòn - Nha Trang!
                </p>
              </div>
            )}

            {!loading && trips.map(t => (
              <TripCard key={t.id} trip={t} onBook={handleOpenBooking} />
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 1: TUYẾN ĐƯỜNG PHỔ BIẾN (POPULAR ROUTES - Screenshot 2)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Tuyến đường phổ biến</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Chọn ngay điểm đến mơ ước với mức giá ưu đãi nhất hôm nay</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={18} color="#64748b" />
            </button>
            <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={18} color="#64748b" />
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {popularRoutes.map(r => (
            <div
              key={r.id}
              onClick={() => handleQuickRouteClick(r.origin, r.destination)}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                height: '240px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
              }}
            >
              <img 
                src={r.image} 
                alt={r.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: r.bgColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px',
                color: '#ffffff'
              }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '6px' }}>{r.title}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#f1f5f9' }}>Từ</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#fef08a' }}>{r.price}</span>
                  {r.oldPrice && (
                    <span style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'line-through' }}>{r.oldPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ƯU ĐÃI NỔI BẬT (FEATURED PROMOTIONS - Screenshot 2)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Ưu đãi nổi bật</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Các chương trình khuyến mãi và mã giảm giá vé xe hot nhất</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {featuredPromos.map(p => (
            <div
              key={p.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ position: 'relative', height: '170px' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: p.accent,
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  letterSpacing: '0.3px'
                }}>
                  {p.badge}
                </span>
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', lineHeight: 1.45, marginBottom: '12px' }}>
                  {p.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: p.accent, fontSize: '13px', fontWeight: 700 }}>
                  Xem chi tiết ưu đãi <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: DU LỊCH SAPA (FEATURED DESTINATION - Screenshot 3)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Du lịch Sapa</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Cẩm nang khám phá xứ sở sương mù, săn mây Fansipan và trải nghiệm văn hóa Tây Bắc</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {sapaGuides.map(g => (
            <div
              key={g.id}
              onClick={() => handleQuickRouteClick('Hà Nội', 'Sa Pa')}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                height: '220px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src={g.image} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(180deg, transparent 30%, rgba(15, 23, 42, 0.85) 100%)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                color: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{g.category}</span>
                  <span style={{
                    backgroundColor: 'rgba(37, 99, 235, 0.9)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {g.badgeText}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.4 }}>{g.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CUỘC THI SÁNG TẠO GO WITH TRAVELEASY (Screenshot 3)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Cuộc thi sáng tạo Go with TravelEasy</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Chia sẻ khoảnh khắc du lịch vi vu cùng TravelEasy và rinh giải thưởng hấp dẫn</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {contestCards.map(c => (
            <div
              key={c.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <span style={{ color: '#2563eb', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>{c.tag}</span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '6px', lineHeight: 1.4 }}>
                  {c.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ƯU ĐÃI THANH TOÁN ONLINE (Screenshot 4)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Ưu đãi thanh toán online</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Tiết kiệm hơn khi thanh toán vé trực tuyến qua ví điện tử và ngân hàng</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {paymentPromos.map(pm => (
            <div
              key={pm.id}
              style={{
                background: pm.bgGradient,
                borderRadius: '16px',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div>
                <span style={{
                  backgroundColor: '#ffffff',
                  color: pm.color,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                }}>
                  {pm.brand}
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '14px', lineHeight: 1.4 }}>
                  {pm.title}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Áp dụng ngay khi thanh toán</span>
                <span style={{ backgroundColor: pm.color, color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                  {pm.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ƯU ĐÃI TỪ ĐỐI TÁC KHÁC (Screenshot 4 & 5)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Ưu đãi từ đối tác khác</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Đặc quyền từ mạng lưới đối tác Grab, Green SM, MOOVTEK và các khu nghỉ dưỡng</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {partnerPromos.map(pt => (
            <div
              key={pt.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: pt.color }}>{pt.partner}</span>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                    {pt.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', lineHeight: 1.45, marginBottom: '6px' }}>
                  {pt.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: '#64748b' }}>{pt.desc}</p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '12px', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Nhận mã ngay <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TRAVELEASY CÓ GÌ MỚI? (Screenshot 5)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>TravelEasy có gì mới?</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Cập nhật các tính năng và dự án ý nghĩa mới nhất từ nền tảng</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {newsCards.map(n => (
            <div
              key={n.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px 20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                    {n.category}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{n.date}</span>
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', lineHeight: 1.5 }}>
                  {n.title}
                </h4>
              </div>
              <div style={{ marginTop: '16px', fontSize: '12.5px', color: '#2563eb', fontWeight: 700 }}>
                Tìm hiểu thêm →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: BẾN XE VÀ NHÀ XE HÀNG ĐẦU VIỆT NAM (SEO Directory)
          ========================================================================= */}
      <section className="container" style={{ marginTop: '56px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '36px 32px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
          Mạng lưới bến xe và nhà xe đối tác hàng đầu
        </h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
          TravelEasy kết nối trực tiếp với các bến xe trung tâm tại các thành phố lớn cùng hơn 100+ nhà xe uy tín trên khắp mọi miền Tổ quốc.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Bến xe phía Nam</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 2 }}>
              <li>• Bến xe Miền Đông (Bình Thạnh)</li>
              <li>• Bến xe Miền Tây (Bình Tân)</li>
              <li>• Bến xe An Sương (Hóc Môn)</li>
              <li>• Bến xe Vũng Tàu</li>
              <li>• Bến xe Trung tâm Cần Thơ</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Bến xe phía Bắc</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 2 }}>
              <li>• Bến xe Mỹ Đình (Hà Nội)</li>
              <li>• Bến xe Giáp Bát (Hà Nội)</li>
              <li>• Bến xe Nước Ngầm (Hà Nội)</li>
              <li>• Bến xe Cầu Rào (Hải Phòng)</li>
              <li>• Bến xe Sa Pa (Lào Cai)</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Bến xe miền Trung & Tây Nguyên</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 2 }}>
              <li>• Bến xe Liên tỉnh Đà Lạt</li>
              <li>• Bến xe Trung tâm Đà Nẵng</li>
              <li>• Bến xe Phía Nam Nha Trang</li>
              <li>• Bến xe Quy Nhơn</li>
              <li>• Bến xe Phía Bắc TP. Huế</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Nhà xe tiêu biểu</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 2 }}>
              <li>• TravelEasy Express Bus</li>
              <li>• Phương Trang (FUTA Bus Lines)</li>
              <li>• Thành Bưởi Limousine</li>
              <li>• Sao Việt Express</li>
              <li>• Xe Khách Hoa Mai Vũng Tàu</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHECKOUT MODAL (KHI KHÁCH HÀNG BẤM CHỌN CHUYẾN ĐỂ ĐẶT VÉ)
          ========================================================================= */}
      {bookingTrip && (
        <CheckoutModal 
          trip={bookingTrip}
          selectedSeats={bookingSeats}
          points={bookingPoints}
          onClose={() => setBookingTrip(null)}
          onSuccess={(b) => {
            setBookingTrip(null);
            setConfirmedBooking(b);
          }}
        />
      )}

      {/* =========================================================================
          BOOKING SUCCESS POPUP MODAL
          ========================================================================= */}
      {confirmedBooking && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 110, padding: '16px'
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '36px 32px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={40} color="#16a34a" />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#14532d', marginBottom: '8px' }}>
              Đặt Vé Thành Công!
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Cảm ơn quý khách đã tin tưởng đồng hành cùng nền tảng TravelEasy.
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'left', fontSize: '14px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '8px' }}>Mã đặt vé: <strong style={{ color: '#2563eb', fontSize: '16px' }}>{confirmedBooking.bookingCode}</strong></div>
              <div style={{ marginBottom: '8px' }}>Hành khách: <strong>{confirmedBooking.customerName}</strong> ({confirmedBooking.customerPhone})</div>
              <div style={{ marginBottom: '8px' }}>Tuyến xe: <strong>{confirmedBooking.trip?.originCity} ➔ {confirmedBooking.trip?.destinationCity}</strong></div>
              <div style={{ marginBottom: '8px' }}>Ghế ngồi: <strong style={{ color: '#0d9488' }}>{confirmedBooking.tickets?.map(t => t.seatNumber).join(', ')}</strong></div>
              <div style={{ marginBottom: '8px' }}>Tổng tiền: <strong style={{ color: '#d97706', fontSize: '16px' }}>{(confirmedBooking.totalAmount || 0).toLocaleString('vi-VN')} đ</strong></div>
              <div>Hình thức thanh toán: <strong>{confirmedBooking.paymentMethod}</strong></div>
            </div>

            <button
              onClick={() => setConfirmedBooking(null)}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '15px',
                width: '100%',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              Hoàn Tất & Xem Vé
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
