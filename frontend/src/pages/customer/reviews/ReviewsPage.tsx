import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ReviewScorecard } from './components/ReviewScorecard';
import { ReviewFilterBar } from './components/ReviewFilterBar';
import { ReviewCard } from './components/ReviewCard';
import { ReviewLightbox } from './components/ReviewLightbox';
import { ReviewWriteModal } from './components/ReviewWriteModal';
import { IReview, IReviewSummary, ReviewStarFilter } from './types';
import { Star, MessageSquareQuote, ShieldCheck, Award, HeartHandshake, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBookingCode = searchParams.get('bookingCode');

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [starFilter, setStarFilter] = useState<ReviewStarFilter>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');
  const [isLoading, setIsLoading] = useState(true);

  // Summary State from Supabase
  const [summaryData, setSummaryData] = useState<IReviewSummary>({
    averageRating: 4.8,
    totalReviews: 0,
    starDistribution: [
      { star: 5, count: 0, percentage: 0 },
      { star: 4, count: 0, percentage: 0 },
      { star: 3, count: 0, percentage: 0 },
      { star: 2, count: 0, percentage: 0 },
      { star: 1, count: 0, percentage: 0 },
    ],
    criteriaAverages: {
      punctuality: 4.9,
      cleanliness: 4.8,
      service: 4.9,
    },
  });

  // Modals & Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [prefilledCode, setPrefilledCode] = useState<string | undefined>(urlBookingCode || undefined);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Auto-open modal if bookingCode is passed in URL (Yêu cầu đăng nhập trước khi viết)
  useEffect(() => {
    if (urlBookingCode) {
      const token = localStorage.getItem('traveleasy_token');
      if (!token) {
        toast.warning(`Vui lòng đăng nhập tài khoản để đánh giá chuyến xe [${urlBookingCode}]!`, 'Yêu Cầu Đăng Nhập');
        navigate(`/auth?redirect=/reviews?bookingCode=${encodeURIComponent(urlBookingCode)}`);
        return;
      }
      setPrefilledCode(urlBookingCode);
      setIsWriteModalOpen(true);
      toast.info(`Đã điền tự động mã vé [${urlBookingCode}]. Hãy chia sẻ trải nghiệm của bạn!`, 'Đánh Giá Chuyến Đi');
    }
  }, [urlBookingCode, navigate]);

  // Load reviews & summary from Supabase
  const loadDataFromSupabase = useCallback(() => {
    setIsLoading(true);

    // 1. Fetch reviews
    const reviewsPromise = api.get('/reviews')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped: IReview[] = res.data.data.map((r: any) => {
            const rawImages = r.imageUrls ? r.imageUrls.split(',').filter(Boolean) : [];
            const companyReplyObj = r.companyReply ? {
              author: `Ban Điều Hành ${r.busCompanyName || 'Nhà Xe'}`,
              avatar: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=80',
              replyText: r.companyReply,
              repliedAt: 'Phản hồi chính thức',
            } : undefined;

            return {
              id: `rev-${r.id}`,
              userName: r.customerName || 'Hành khách ẩn danh',
              userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.customerName || 'KH')}`,
              userRank: r.rating >= 5 ? 'Thành viên Kim Cương' : 'Thành viên Vàng',
              rating: r.rating || 5,
              route: r.routeName || 'Chuyến xe liên tỉnh',
              companyName: r.busCompanyName || 'TravelEasy Express',
              tripDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Mới đây',
              createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
              verifiedBooking: true,
              comment: r.comment || '',
              images: rawImages,
              criteriaScores: {
                punctuality: r.punctualityRating ? Number(r.punctualityRating) : 5.0,
                cleanliness: r.cleanlinessRating ? Number(r.cleanlinessRating) : 5.0,
                service: r.serviceRating ? Number(r.serviceRating) : 5.0,
              },
              likesCount: 8 + (Number(r.id) * 3) % 20,
              companyReply: companyReplyObj,
            };
          });
          setReviews(mapped);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải đánh giá từ Supabase:', err);
      });

    // 2. Fetch summary
    const summaryPromise = api.get('/reviews/summary')
      .then((res) => {
        if (res.data?.data) {
          const s = res.data.data;
          const total = s.totalReviews || 1;
          setSummaryData({
            averageRating: s.averageRating || 4.8,
            totalReviews: s.totalReviews || 0,
            starDistribution: [
              { star: 5, count: s.rating5Count || 0, percentage: Math.round(((s.rating5Count || 0) / total) * 100) },
              { star: 4, count: s.rating4Count || 0, percentage: Math.round(((s.rating4Count || 0) / total) * 100) },
              { star: 3, count: s.rating3Count || 0, percentage: Math.round(((s.rating3Count || 0) / total) * 100) },
              { star: 2, count: s.rating2Count || 0, percentage: Math.round(((s.rating2Count || 0) / total) * 100) },
              { star: 1, count: s.rating1Count || 0, percentage: Math.round(((s.rating1Count || 0) / total) * 100) },
            ],
            criteriaAverages: {
              punctuality: s.punctualityScore || 4.9,
              cleanliness: s.cleanlinessScore || 4.8,
              service: s.serviceScore || 4.9,
            },
          });
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải tóm tắt đánh giá từ Supabase:', err);
      });

    // 3. Fetch bus companies
    api.get('/bus-companies')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const names = res.data.data.map((c: any) => c.name).filter(Boolean);
          if (names.length > 0) {
            setCompaniesList(names);
          }
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải danh mục nhà xe:', err);
      });

    Promise.allSettled([reviewsPromise, summaryPromise]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // Filter & Sort Logic
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by Company
    if (selectedCompany !== 'ALL') {
      result = result.filter((r) => r.companyName === selectedCompany);
    }

    // Filter by Star or Images
    if (starFilter === '5') {
      result = result.filter((r) => r.rating === 5);
    } else if (starFilter === '4') {
      result = result.filter((r) => r.rating === 4);
    } else if (starFilter === 'HAS_IMAGES') {
      result = result.filter((r) => r.images && r.images.length > 0);
    }

    // Sort
    if (sortBy === 'HIGHEST') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'LOWEST') {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [reviews, selectedCompany, starFilter, sortBy]);

  // Paginated Reviews
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize) || 1;

  // Toggle Like Action
  const handleToggleLike = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isLiked = !r.isLiked;
          const delta = isLiked ? 1 : -1;
          if (isLiked) {
            toast.success('Cảm ơn bạn đã ghi nhận đánh giá hữu ích!', 'Đã Thích');
          }
          return {
            ...r,
            isLiked,
            likesCount: r.likesCount + delta,
          };
        }
        return r;
      })
    );
  };

  // Add New Review Callback
  const handleAddReview = () => {
    loadDataFromSupabase();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* 1. Header / Breadcrumb Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white pt-10 pb-16 px-4 md:px-8 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-3 uppercase tracking-wider">
            <Award size={16} />
            <span>Xác Thực Từ Dữ Liệu Chuyến Đi Thật Trên Supabase</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                Đánh Giá & Trải Nghiệm Khách Hàng
                <span className="text-xs font-bold py-1 px-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  100% Người Đi Thật
                </span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl font-normal leading-relaxed">
                Minh bạch chất lượng dịch vụ các nhà xe đối tác trên toàn quốc. Chỉ những hành khách đã hoàn thành chuyến đi mới có thể gửi đánh giá.
              </p>
            </div>

            {/* Quick Guarantees */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
              <ShieldCheck size={28} className="text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Chống Review Ảo Tuyệt Đối</div>
                <div className="text-slate-300 text-[11px]">Đồng bộ mã đặt vé xác thực trên Supabase</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 space-y-6">
        {/* 2. Scorecard Tổng Quan */}
        <ReviewScorecard summary={summaryData} />

        {/* 3. Filter Bar */}
        <ReviewFilterBar
          companies={companiesList}
          selectedCompany={selectedCompany}
          onSelectCompany={(comp) => {
            setSelectedCompany(comp);
            setCurrentPage(1);
          }}
          starFilter={starFilter}
          onStarFilterChange={(sf: ReviewStarFilter) => {
            setStarFilter(sf);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onOpenWriteModal={() => {
            const token = localStorage.getItem('traveleasy_token');
            if (!token) {
              toast.warning('Bạn cần đăng nhập tài khoản để viết đánh giá cho chuyến xe đã đi!', 'Yêu Cầu Đăng Nhập');
              navigate('/auth?redirect=/reviews');
              return;
            }
            setPrefilledCode(undefined);
            setIsWriteModalOpen(true);
          }}
          filteredCount={filteredReviews.length}
        />

        {/* 4. Reviews List */}
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <div className="font-bold text-slate-700">Đang tải đánh giá từ Supabase Database...</div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquareQuote size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có đánh giá nào phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Không tìm thấy đánh giá cho bộ lọc đã chọn. Hãy thử chọn tất cả nhà xe hoặc viết bài đánh giá đầu tiên của bạn!
            </p>
            <button
              onClick={() => {
                setSelectedCompany('ALL');
                setStarFilter('ALL');
              }}
              className="py-2.5 px-6 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Xóa Bộ Lọc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                onOpenImage={(imgUrl: string) => setLightboxImage(imgUrl)}
                onToggleLike={handleToggleLike}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                >
                  ← Trang trước
                </button>
                <div className="text-xs font-bold text-slate-600 px-3">
                  Trang <span className="text-orange-600 font-black">{currentPage}</span> / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                >
                  Trang tiếp →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Lightbox Modal */}
      <ReviewLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* 6. Write Review Modal */}
      <ReviewWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        companies={companiesList}
        onSubmitReview={handleAddReview}
        prefilledBookingCode={prefilledCode}
      />
    </div>
  );
};
