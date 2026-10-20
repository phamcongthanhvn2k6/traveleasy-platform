import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchTripBar } from '../components/SearchTripBar';
import { TripCard } from '../components/TripCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { Trip, Booking } from '../types';
import api from '../services/api';
import { 
  CheckCircle, 
  Award, 
  Clock, 
  ShieldCheck, 
  Search, 
  Grid, 
  CreditCard, 
  QrCode, 
  RotateCcw, 
  Bot, 
  ArrowRight,
  Sparkles,
  MapPin
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [bookingPoints, setBookingPoints] = useState<any>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const fetchTrips = async (origin = 'TP. Hồ Chí Minh', destination = 'Đà Lạt') => {
    setLoading(true);
    try {
      const res = await api.get('/trips/search', {
        params: { origin, destination }
      });
      setTrips(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = (origin: string, destination: string, date: string) => {
    fetchTrips(origin, destination);
  };

  const handleOpenBooking = (trip: Trip, seats: string[], points: any) => {
    setBookingTrip(trip);
    setBookingSeats(seats);
    setBookingPoints(points);
  };

  const clientFeatures = [
    {
      title: 'Tìm Kiếm & Bộ Lọc Nâng Cao',
      code: 'UC-1.4 & UC-1.5',
      desc: 'Tìm chuyến theo ngày, lọc theo giá vé min-max, giờ chạy sáng/tối và hãng xe yêu thích.',
      path: '/search',
      icon: Search,
      color: '#2563eb',
      bgColor: '#eff6ff',
      actionText: 'Tìm Chuyến Ngay'
    },
    {
      title: 'Sơ Đồ Chọn Ghế 2 Tầng Trực Quan',
      code: 'UC-1.6 & Concurrency',
      desc: 'Chọn vị trí giường nằm VIP tầng 1 hoặc tầng 2. Khóa giữ chỗ thời gian thực 10 phút chống trùng ghế.',
      path: '/trips/1/seats',
      icon: Grid,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      actionText: 'Xem Sơ Đồ Mẫu'
    },
    {
      title: 'Điểm Đón / Trả & Thông Tin Đặt Vé',
      code: 'UC-1.7 & Booking Flow',
      desc: 'Lựa chọn điểm đón/trả có mốc giờ ETA chính xác, nhập thông tin hành khách an toàn bảo mật.',
      path: '/checkout',
      icon: MapPin,
      color: '#d97706',
      bgColor: '#fffbeb',
      actionText: 'Vào Đặt Vé'
    },
    {
      title: 'Thanh Toán Đa Kênh & Vé QR Code',
      code: 'UC-1.8 & UC-1.9',
      desc: 'Thanh toán trực tuyến VNPay, MoMo hoặc COD khi lên xe. Nhận vé điện tử có mã QR quét tức thì.',
      path: '/tickets/BKG-20261025-001',
      icon: QrCode,
      color: '#9333ea',
      bgColor: '#faf5ff',
      actionText: 'Xem Vé Điện Tử'
    },
    {
      title: 'Tra Cứu Vé & Hủy Vé Hoàn Tiền',
      code: 'UC-1.11 & UC-1.15',
      desc: 'Tra cứu lại đơn vé bất kỳ lúc nào bằng SĐT hoặc mã vé. Hủy vé tự động tính % hoàn tiền theo chính sách.',
      path: '/lookup',
      icon: RotateCcw,
      color: '#0891b2',
      bgColor: '#ecfeff',
      actionText: 'Tra Cứu Vé'
    },
    {
      title: 'Trợ Lý AI Du Lịch Thông Minh',
      code: 'UC-1.10 & AI Assistant',
      desc: 'Tư vấn lộ trình, gợi ý vị trí giường nằm chống say xe và giải đáp chính sách hành lý 24/7.',
      path: '#',
      icon: Bot,
      color: '#e11d48',
      bgColor: '#fff1f2',
      actionText: 'Hỏi Trợ Lý AI'
    }
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '64px 0 80px',
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={16} /> TRANG CHỦ HÀNH KHÁCH — MÔ HÌNH VEXERE CHUẨN MỰC
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Đặt Vé Xe Khách Trực Tuyến - Nhanh Chóng & Giá Rẻ
          </h1>
          <p style={{ fontSize: '17px', color: '#bfdbfe', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Cam kết 100% giữ chỗ ngồi. Chọn ghế trực quan trên sơ đồ 2 tầng. Hỗ trợ thanh toán linh hoạt và vé điện tử mã QR lên xe!
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search Trip Bar */}
        <SearchTripBar onSearch={handleSearch} />

        {/* Value Proposition */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          margin: '36px 0'
        }}>
          <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Award size={32} color="#2563eb" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Nhà xe uy tín hàng đầu</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Phương Trang, Thành Bưởi Limousine</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldCheck size={32} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Cam kết 100% giữ chỗ</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Khóa ghế thời gian thực chống trùng chỗ</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Clock size={32} color="#f97316" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Hỗ trợ 24/7 & Hủy vé linh hoạt</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Tự động hoàn tiền theo chính sách</div>
            </div>
          </div>
        </div>

        {/* THỐNG KÊ & BẢN ĐỒ CÁC TRANG CHỨC NĂNG CỦA KHÁCH HÀNG (USERS FUNCTIONAL DIRECTORY) */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
              Danh Mục Các Tính Năng Hành Khách (User Services & Pages)
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Trải nghiệm toàn diện hành trình từ tra cứu, giữ chỗ, thanh toán đến kiểm tra vé điện tử QR Code
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {clientFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ backgroundColor: feat.bgColor, color: feat.color, padding: '10px', borderRadius: '10px' }}>
                        <Icon size={24} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                        {feat.code}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                      {feat.desc}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      to={feat.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: feat.color,
                        textDecoration: 'none'
                      }}
                    >
                      {feat.actionText} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip Results */}
        <div style={{ marginTop: '32px', marginBottom: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
                Chuyến Xe Đang Mở Bán ({trips.length} chuyến)
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Tuyến TP. Hồ Chí Minh ➔ Đà Lạt • Xe Limousine 34 Phòng VIP</p>
            </div>
            <Link to="/search" style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Xem thêm bộ lọc <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
              Đang tải danh sách chuyến xe...
            </div>
          ) : trips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '16px' }}>Không tìm thấy chuyến xe phù hợp. Vui lòng thử lại tuyến đường khác!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onBook={(t, seats, points) => handleOpenBooking(t, seats, points)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {bookingTrip && (
        <CheckoutModal
          trip={bookingTrip}
          selectedSeats={bookingSeats}
          points={bookingPoints}
          onClose={() => setBookingTrip(null)}
          onSuccess={(booking) => {
            setBookingTrip(null);
            setConfirmedBooking(booking);
            fetchTrips();
          }}
        />
      )}

      {/* Success Booking Alert Modal */}
      {confirmedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle size={64} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a8a', marginBottom: '8px' }}>
              Đặt Vé Thành Công!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Mã đơn đặt vé của bạn là: <strong style={{ color: '#2563eb', fontSize: '16px' }}>{confirmedBooking.bookingCode}</strong>
            </p>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px', fontSize: '14px' }}>
              <div><strong>Hành khách:</strong> {confirmedBooking.customerName || (confirmedBooking as any).passengerName} ({confirmedBooking.customerPhone || (confirmedBooking as any).passengerPhone})</div>
              <div><strong>Ghế đã chọn:</strong> {(confirmedBooking as any).seatNumbers || confirmedBooking.tickets?.map(t => t.seatNumber).join(', ')}</div>
              <div><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(confirmedBooking.totalAmount || (confirmedBooking as any).totalPrice || 0)}</div>
              <div><strong>Thanh toán:</strong> {confirmedBooking.paymentMethod}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                to={`/tickets/${confirmedBooking.bookingCode}`}
                style={{
                  flex: 1,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Xem Vé Điện Tử QR
              </Link>
              <button
                onClick={() => setConfirmedBooking(null)}
                style={{
                  flex: 1,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
