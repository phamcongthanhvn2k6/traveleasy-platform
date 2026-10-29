import React, { useState, useEffect } from 'react';
import { X, Star, Upload, CheckCircle2, Building2, MapPin, Sparkles, Clock, UserCheck, AlertCircle, Ticket } from 'lucide-react';
import { IReview } from '../types';
import { toast } from '../../../../context/ToastContext';
import api from '../../../../services/api';

interface EligibleBooking {
  bookingId: number;
  bookingCode: string;
  passengerName: string;
  busCompanyId?: number;
  busCompanyName: string;
  routeName: string;
  departureTime?: string;
  arrivalTime?: string;
  seatNumbers?: string;
}

interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: string[];
  onSubmitReview: (review: Partial<IReview>) => void;
  prefilledBookingCode?: string;
}

export const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({
  isOpen,
  onClose,
  companies,
  onSubmitReview,
  prefilledBookingCode,
}) => {
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>(prefilledBookingCode || '');
  const [manualCode, setManualCode] = useState<string>(prefilledBookingCode || '');
  
  const [company, setCompany] = useState(companies[0] || 'Phương Trang (FUTA Bus Lines)');
  const [route, setRoute] = useState('TP. Hồ Chí Minh ➔ Đà Lạt');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Criteria ratings
  const [punctuality, setPunctuality] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [service, setService] = useState(5);

  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch eligible completed bookings from Supabase
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      api.get('/reviews/eligible-bookings')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setEligibleBookings(res.data.data);
            if (prefilledBookingCode) {
              const matched = res.data.data.find((b: EligibleBooking) => b.bookingCode === prefilledBookingCode);
              if (matched) {
                applyBookingSelection(matched);
              }
            } else if (res.data.data.length > 0) {
              applyBookingSelection(res.data.data[0]);
            }
          }
        })
        .catch((err) => {
          console.warn('Lỗi lấy danh sách chuyến xe đủ điều kiện:', err);
        });
    }
  }, [isOpen, prefilledBookingCode]);

  const applyBookingSelection = (b: EligibleBooking) => {
    setSelectedBookingCode(b.bookingCode);
    setManualCode(b.bookingCode);
    setCompany(b.busCompanyName);
    setRoute(b.routeName);
    if (b.passengerName) {
      setUserName(b.passengerName);
    }
  };

  const handleBookingChange = (code: string) => {
    setSelectedBookingCode(code);
    setManualCode(code);
    const found = eligibleBookings.find((b) => b.bookingCode === code);
    if (found) {
      applyBookingSelection(found);
    }
  };

  if (!isOpen) return null;

  const starLabels: Record<number, string> = {
    1: 'Rất không hài lòng (1/5)',
    2: 'Cần cải thiện (2/5)',
    3: 'Bình thường / Tạm ổn (3/5)',
    4: 'Hài lòng & chất lượng (4/5)',
    5: 'Xuất sắc / Rất hài lòng (5/5)',
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 4) {
      toast.warning('Tối đa 4 ảnh cho mỗi bài đánh giá!', 'Giới Hạn Ảnh');
      return;
    }
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const activeCode = (selectedBookingCode || manualCode).trim();
    if (!activeCode) {
      setErrorMessage('Vui lòng chọn hoặc nhập mã vé chuyến xe bạn đã hoàn thành để viết đánh giá.');
      toast.warning('Vui lòng cung cấp mã đặt vé!', 'Thiếu Mã Vé');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage('Vui lòng chia sẻ cảm nhận chân thực của bạn về chuyến đi!');
      toast.warning('Vui lòng nhập nhận xét chi tiết!', 'Thiếu Nhận Xét');
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi trực tiếp lên backend Supabase
      const payload = {
        bookingCode: activeCode,
        passengerName: userName.trim() || undefined,
        rating,
        punctualityRating: punctuality,
        cleanlinessRating: cleanliness,
        serviceRating: service,
        comment: comment.trim(),
        imageUrls: images.length > 0 ? images.join(',') : undefined,
      };

      const res = await api.post('/reviews', payload);

      if (res.data?.success) {
        toast.success('Cảm ơn bạn! Đánh giá đã được lưu vào Supabase thành công.', 'Đánh Giá Thành Công');
        
        // Cập nhật UI
        const savedData = res.data.data;
        onSubmitReview({
          id: `rev-${savedData?.id || Date.now()}`,
          userName: savedData?.customerName || userName,
          rating,
          route,
          companyName: company,
          tripDate: new Date().toLocaleDateString('vi-VN'),
          createdAt: 'Vừa xong',
          verifiedBooking: true,
          comment: comment.trim(),
          images: images.length > 0 ? images : undefined,
          criteriaScores: { punctuality, cleanliness, service },
          likesCount: 0,
          userRank: 'Thành viên Vàng',
        });

        onClose();
      } else {
        const msg = res.data?.message || 'Không thể gửi đánh giá';
        setErrorMessage(msg);
        toast.error(msg, 'Không Thể Gửi');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi gửi đánh giá';
      setErrorMessage(msg);
      toast.error(msg, 'Đánh Giá Thất Bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Star size={18} className="text-amber-400" fill="#f59e0b" />
              Đánh Giá Chuyến Xe Đã Hoàn Thành
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Hệ thống chỉ chấp nhận đánh giá từ hành khách đã hoàn tất hành trình
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Chưa thể gửi đánh giá:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* 1. Chọn chuyến xe đã hoàn thành từ Supabase */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Ticket size={14} className="text-emerald-600" />
              Chọn chuyến xe bạn đã đi (Hoàn thành hành trình) *
            </label>
            
            {eligibleBookings.length > 0 ? (
              <select
                value={selectedBookingCode}
                onChange={(e) => handleBookingChange(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {eligibleBookings.map((b) => (
                  <option key={b.bookingCode} value={b.bookingCode}>
                    [{b.bookingCode}] {b.busCompanyName} • {b.routeName} (Ghế {b.seatNumbers})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-slate-500 mb-2">
                Nhập mã vé chuyến xe đã hoàn thành (VD: BKG-20261025-001):
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setSelectedBookingCode(e.target.value);
                }}
                placeholder="Mã đặt vé (VD: BKG-20261025-001)"
                className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-xs uppercase"
                required
              />
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ✓ Đã hoàn thành
              </span>
            </div>
          </div>

          {/* 2. Thông tin nhà xe & Tuyến */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhà xe vận hành
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hành trình tuyến đường
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs"
                readOnly
              />
            </div>
          </div>

          {/* 3. Star Rating (Interactive 1 to 5) */}
          <div className="text-center p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
            <div className="text-xs font-bold text-amber-900 mb-2">
              Bạn đánh giá chất lượng chuyến đi như thế nào?
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={32}
                      fill={isLit ? '#f59e0b' : '#e2e8f0'}
                      className={isLit ? 'text-amber-500' : 'text-slate-300'}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-extrabold text-amber-800">
              {starLabels[hoverRating || rating]}
            </div>
          </div>

          {/* 4. Sub-Criteria (Đúng giờ, Sạch sẽ, Phục vụ) */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div>
              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 mb-1">
                <Clock size={12} className="text-blue-500" /> Đúng Giờ
              </div>
              <select
                value={punctuality}
                onChange={(e) => setPunctuality(Number(e.target.value))}
                className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mx-auto"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 mb-1">
                <Sparkles size={12} className="text-emerald-500" /> Sạch Sẽ
              </div>
              <select
                value={cleanliness}
                onChange={(e) => setCleanliness(Number(e.target.value))}
                className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mx-auto"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 mb-1">
                <UserCheck size={12} className="text-orange-500" /> Phục Vụ
              </div>
              <select
                value={service}
                onChange={(e) => setService(Number(e.target.value))}
                className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mx-auto"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Detailed Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nhận xét chi tiết chuyến đi *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn: bác tài lái êm không, máy lạnh, wifi sạc pin, điểm dừng chân ăn uống..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* 6. Photos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đính kèm hình ảnh thực tế (Tùy chọn)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Dán URL ảnh chụp trên xe (https://...)"
                className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                + Thêm Ảnh
              </button>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Gợi ý ảnh chụp:</span>
              <button
                type="button"
                onClick={() => setImages([...images, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'])}
                className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 hover:bg-orange-100"
              >
                + Giường nằm xe
              </button>
              <button
                type="button"
                onClick={() => setImages([...images, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600'])}
                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100"
              >
                + Điểm đến du lịch
              </button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Tên hành khách */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ tên hành khách (Hệ thống tự động che ẩn danh ví dụ: Nguyễn *** Khách)
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="VD: Nguyễn Văn Du Khách"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang ghi vào Supabase...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Gửi Đánh Giá Ngay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
