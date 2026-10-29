import React from 'react';
import { Star, CheckCircle, ThumbsUp, Building2, MessageSquare, Clock, Sparkles, UserCheck } from 'lucide-react';
import { IReview } from '../types';

interface ReviewCardProps {
  review: IReview;
  onOpenImage: (imageUrl: string) => void;
  onToggleLike: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onOpenImage,
  onToggleLike,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
      {/* 1. TOP BAR: USER AVATAR, NAME, RATING & VERIFIED BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                {review.userName.charAt(0)}
              </div>
            )}
            {review.verifiedBooking && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                <CheckCircle size={12} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base text-slate-900">
                {review.userName}
              </span>
              {review.userRank && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {review.userRank}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= review.rating ? '#f59e0b' : '#e2e8f0'}
                    className={s <= review.rating ? 'text-amber-500' : 'text-slate-200'}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">• {review.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Verified Trip Badge */}
        {review.verifiedBooking && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 self-start sm:self-center">
            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
            <span>Đã đi tuyến {review.route} ({review.companyName})</span>
          </div>
        )}
      </div>

      {/* 2. CRITERIA SCORES BREAKDOWN PILLS */}
      <div className="flex flex-wrap items-center gap-2 mb-3.5 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
          <Clock size={12} className="text-blue-500" /> Đúng giờ: <strong>{review.criteriaScores.punctuality}/5</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
          <Sparkles size={12} className="text-emerald-500" /> Sạch sẽ: <strong>{review.criteriaScores.cleanliness}/5</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
          <UserCheck size={12} className="text-orange-500" /> Phục vụ: <strong>{review.criteriaScores.service}/5</strong>
        </span>
      </div>

      {/* 3. REVIEW COMMENT TEXT */}
      <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">
        {review.comment}
      </p>

      {/* 4. REAL PHOTOS GRID (CLICKABLE TO OPEN LIGHTBOX) */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-4">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onOpenImage(img)}
              className="relative group w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-slate-200 focus:outline-none hover:ring-2 hover:ring-orange-500 transition-all shrink-0"
              title="Nhấp để xem ảnh phóng to"
            >
              <img
                src={img}
                alt={`Review ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* 5. OFFICIAL BUS COMPANY REPLY BOX */}
      {review.companyReply && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-orange-600" />
              <span className="text-xs font-black text-slate-900">
                Phản hồi từ {review.companyReply.author}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {review.companyReply.repliedAt}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pl-5 border-l-2 border-orange-400">
            {review.companyReply.replyText}
          </p>
        </div>
      )}

      {/* 6. BOTTOM ACTION BAR: LIKE / HELPFUL BUTTON */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">
          Khởi hành ngày: <strong className="text-slate-700">{review.tripDate}</strong>
        </span>

        <button
          onClick={() => onToggleLike(review.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            review.isLiked
              ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <ThumbsUp size={13} fill={review.isLiked ? 'currentColor' : 'none'} />
          <span>Hữu ích ({review.likesCount})</span>
        </button>
      </div>
    </div>
  );
};

