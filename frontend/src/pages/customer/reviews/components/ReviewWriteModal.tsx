import React, { useState } from 'react';
import { X, Star, Upload, CheckCircle2, Building2, MapPin, Sparkles, Clock, UserCheck } from 'lucide-react';
import { IReview } from '../types';
import { toast } from '../../../../context/ToastContext';

interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: string[];
  onSubmitReview: (review: Partial<IReview>) => void;
}

export const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({
  isOpen,
  onClose,
  companies,
  onSubmitReview,
}) => {
  const [company, setCompany] = useState(companies[0] || 'Phương Trang (FUTA Bus Lines)');
  const [route, setRoute] = useState('TP. Hồ Chí Minh ➔ Đà Lạt');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Criteria ratings
  const [punctuality, setPunctuality] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [service, setService] = useState(5);

  const [userName, setUserName] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Vui lòng chia sẻ cảm nhận của bạn về chuyến đi!', 'Thiếu Nhận Xét');
      return;
    }

    // Mask name for privacy if provided
    const nameToUse = userName.trim() || 'Hành Khách Ẩn Danh';
    const parts = nameToUse.split(' ');
    let maskedName = nameToUse;
    if (parts.length >= 2) {
      maskedName = `${parts[0]} *** ${parts[parts.length - 1]}`;
    }

    const newReview: Partial<IReview> = {
      id: `rev-${Date.now()}`,
      userName: maskedName,
      rating,
      route,
      companyName: company,
      tripDate: new Date().toLocaleDateString('vi-VN'),
      createdAt: 'Vừa xong',
      verifiedBooking: !!bookingCode.trim(),
      comment: comment.trim(),
      images: images.length > 0 ? images : undefined,
      criteriaScores: {
        punctuality,
        cleanliness,
        service,
      },
      likesCount: 0,
      userRank: 'Thành viên mới',
    };

    onSubmitReview(newReview);
    toast.success('Cảm ơn bạn! Đánh giá đã được ghi nhận và đăng thành công.', 'Đánh Giá Thành Công');
    onClose();
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
              Viết Đánh Giá Chuyến Đi
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Ý kiến của bạn giúp các nhà xe nâng cao chất lượng dịch vụ vận tải
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
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 text-xs md:text-sm">
          {/* 1. Trip & Company Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhà xe phục vụ *
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tuyến đường đã đi *
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="VD: Sài Gòn ➔ Đà Lạt"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          {/* 2. Star Rating (Interactive 1 to 5) */}
          <div className="text-center p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
            <div className="text-xs font-bold text-amber-900 mb-2">
              Bạn đánh giá chất lượng tổng thể như thế nào?
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

          {/* 3. Sub-Criteria (1-5 Star dropdown/buttons) */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            {/* Punctuality */}
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

            {/* Cleanliness */}
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

            {/* Service */}
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

          {/* 4. Detailed Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nhận xét chi tiết của bạn *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn: thái độ tài xế, độ êm của xe, tiện nghi cổng sạc wifi, điểm dừng chân nghỉ ngơi..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          {/* 5. Optional Photos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đính kèm hình ảnh thực tế (Tùy chọn)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Dán link ảnh (VD: https://images.unsplash.com/...)"
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

            {/* Quick preset photo buttons for convenience */}
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Gợi ý ảnh mẫu:</span>
              <button
                type="button"
                onClick={() => setImages([...images, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'])}
                className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 hover:bg-orange-100"
              >
                + Ảnh giường nằm
              </button>
              <button
                type="button"
                onClick={() => setImages([...images, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600'])}
                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100"
              >
                + Ảnh cảnh đèo núi
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

          {/* 6. Name and Booking Code (Optional verification) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên hiển thị (Tự động che bảo mật)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="VD: Trần Hoàng An"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã đơn vé (Để nhận badge tích xanh)
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="VD: BKG-20261025-001"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold shadow-md hover:shadow-orange-500/25 transition-all"
            >
              Gửi Đánh Giá Ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

