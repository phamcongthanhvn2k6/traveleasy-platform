import React from 'react';
import { Star, Clock, Sparkles, UserCheck, ShieldCheck, ThumbsUp } from 'lucide-react';
import { IReviewSummary } from '../types';

interface ReviewScorecardProps {
  summary: IReviewSummary;
}

export const ReviewScorecard: React.FC<ReviewScorecardProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* COL 1 (4/12): BIG AVERAGE SCORE */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-3">
            <ShieldCheck size={14} className="text-amber-600" /> 100% ĐÁNH GIÁ THỰC TẾ TỪ HÀNH KHÁCH
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
              {summary.averageRating.toFixed(1)}
            </span>
            <div className="text-left">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    fill={s <= Math.round(summary.averageRating) ? '#f59e0b' : '#e2e8f0'}
                    className={s <= Math.round(summary.averageRating) ? 'text-amber-500' : 'text-slate-200'}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-bold mt-1 inline-block">
                Thang điểm 5.0 tối đa
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3 font-medium">
            Dựa trên <strong className="text-slate-800 font-extrabold">{summary.totalReviews.toLocaleString('vi-VN')}</strong> lượt đánh giá của khách hàng đã hoàn thành chuyến đi trên hệ thống TravelEasy.
          </p>
        </div>

        {/* COL 2 (5/12): 5-STAR DISTRIBUTION PROGRESS BARS */}
        <div className="lg:col-span-5 space-y-2.5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
          {summary.starDistribution.map((item) => (
            <div key={item.star} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-bold text-slate-700 flex items-center gap-1 shrink-0">
                {item.star} <Star size={12} fill="#f59e0b" className="text-amber-500" />
              </span>

              {/* Progress bar */}
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="w-16 text-right shrink-0">
                <span className="font-extrabold text-slate-800">{item.count}</span>
                <span className="text-[10px] text-slate-400 ml-1 font-medium">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>

        {/* COL 3 (3/12): SUB-CRITERIA PILL BADGES */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tiêu Chí Dịch Vụ
          </div>

          {/* Punctuality */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Độ Đúng Giờ</div>
                <div className="text-[10px] text-slate-400 font-medium">Không bắt khách dọc đường</div>
              </div>
            </div>
            <span className="text-sm font-black text-blue-600">
              {summary.criteriaAverages.punctuality.toFixed(1)}/5
            </span>
          </div>

          {/* Cleanliness */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Vệ Sinh Sạch Sẽ</div>
                <div className="text-[10px] text-slate-400 font-medium">Chăn ga gối khử khuẩn</div>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600">
              {summary.criteriaAverages.cleanliness.toFixed(1)}/5
            </span>
          </div>

          {/* Service */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <UserCheck size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Thái Độ Phục Vụ</div>
                <div className="text-[10px] text-slate-400 font-medium">Tài xế & phụ xe thân thiện</div>
              </div>
            </div>
            <span className="text-sm font-black text-orange-600">
              {summary.criteriaAverages.service.toFixed(1)}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

