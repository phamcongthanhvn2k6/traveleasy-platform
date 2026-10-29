import React from 'react';
import { Star, Camera, Filter, PenLine, Building2 } from 'lucide-react';
import { ReviewStarFilter } from '../types';

interface ReviewFilterBarProps {
  companies: string[];
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  starFilter: ReviewStarFilter;
  onStarFilterChange: (filter: ReviewStarFilter) => void;
  sortBy: 'NEWEST' | 'HIGHEST' | 'LOWEST';
  onSortByChange: (sort: 'NEWEST' | 'HIGHEST' | 'LOWEST') => void;
  onOpenWriteModal: () => void;
  filteredCount: number;
}

export const ReviewFilterBar: React.FC<ReviewFilterBarProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  starFilter,
  onStarFilterChange,
  sortBy,
  onSortByChange,
  onOpenWriteModal,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* LEFT: COMPANY DROPDOWN & STAR PILLS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Company Dropdown */}
          <div className="relative inline-flex items-center">
            <Building2 size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedCompany}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="pl-9 pr-8 py-2 text-xs md:text-sm font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none transition-all"
            >
              <option value="ALL">Tất Cả Nhà Xe Đối Tác</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-[10px] text-slate-400">
              ▼
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onStarFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Tất Cả
            </button>

            <button
              onClick={() => onStarFilterChange('5')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === '5'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              5 <Star size={12} fill="currentColor" />
            </button>

            <button
              onClick={() => onStarFilterChange('4')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === '4'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              4 <Star size={12} fill="currentColor" />
            </button>

            <button
              onClick={() => onStarFilterChange('HAS_IMAGES')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === 'HAS_IMAGES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Camera size={13} /> Có hình ảnh
            </button>
          </div>
        </div>

        {/* RIGHT: SORT DROPDOWN & WRITE REVIEW BUTTON */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="py-2 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="HIGHEST">Đánh giá cao nhất</option>
              <option value="LOWEST">Đánh giá thấp nhất</option>
            </select>
          </div>

          {/* Write Review CTA */}
          <button
            onClick={onOpenWriteModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm hover:shadow-orange-500/25 transition-all shrink-0 active:scale-95"
          >
            <PenLine size={15} />
            <span>Viết Đánh Giá</span>
          </button>
        </div>
      </div>
    </div>
  );
};

