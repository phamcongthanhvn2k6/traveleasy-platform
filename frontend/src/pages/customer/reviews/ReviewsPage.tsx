import React, { useState, useMemo } from 'react';
import { ReviewScorecard } from './components/ReviewScorecard';
import { ReviewFilterBar } from './components/ReviewFilterBar';
import { ReviewCard } from './components/ReviewCard';
import { ReviewLightbox } from './components/ReviewLightbox';
import { ReviewWriteModal } from './components/ReviewWriteModal';
import { IReview, IReviewSummary, ReviewStarFilter } from './types';
import { Star, MessageSquareQuote, ShieldCheck, Award, HeartHandshake, HelpCircle } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

// 1. REALISTIC VIETNAMESE BUS REVIEWS MOCK DATA
const INITIAL_REVIEWS: IReview[] = [
  {
    id: 'rev-01',
    userName: 'Trần *** An',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    userRank: 'Thành viên Kim Cương',
    rating: 5,
    route: 'Hà Nội ➔ Sa Pa',
    companyName: 'Sao Việt Express',
    tripDate: '26/10/2026',
    createdAt: 'Hôm qua',
    verifiedBooking: true,
    comment: 'Xe Cabin đôi Hoàng Gia quá xịn sò! Xe xuất bến đúng 22:30 tại Bến xe Mỹ Đình, chạy êm ru ngủ một mạch tới Sa Pa lúc 4h sáng. Nhà xe còn cho ngủ lại trên xe tới 6h sáng mới cần xuống nhận phòng khách sạn. Cổng sạc Type-C, massage lưng hoạt động tốt.',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
    ],
    criteriaScores: { punctuality: 5, cleanliness: 5, service: 5 },
    likesCount: 24,
    companyReply: {
      author: 'Ban Điều Hành Sao Việt Express',
      avatar: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=80',
      replyText: 'Dạ Sao Việt Express xin chân thành cảm ơn anh An đã tin tưởng lựa chọn dịch vụ xe Cabin Cung Điện! Chúc anh có chuyến du lịch Sa Pa thật nhiều niềm vui và nhiều bức ảnh đẹp ạ.',
      repliedAt: 'Hôm qua',
    },
  },
  {
    id: 'rev-02',
    userName: 'Nguyễn *** Thành',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    userRank: 'Thành viên Vàng',
    rating: 5,
    route: 'TP. Hồ Chí Minh ➔ Đà Lạt',
    companyName: 'Thành Bưởi',
    tripDate: '24/10/2026',
    createdAt: '3 ngày trước',
    verifiedBooking: true,
    comment: 'Đi Đà Lạt bao năm nay vẫn trung thành với Thành Bưởi Cung Điện 22 phòng. Bác tài chạy rất đằm, qua đèo Bảo Lộc không bị xóc hay say xe. Chăn gối thơm mùi sả khử khuẩn, rèm che riêng tư tuyệt đối cho gia đình có con nhỏ.',
    images: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    ],
    criteriaScores: { punctuality: 5, cleanliness: 5, service: 4 },
    likesCount: 18,
    companyReply: {
      author: 'Chăm Sóc Khách Hàng Thành Bưởi',
      avatar: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=80',
      replyText: 'Cảm ơn anh Thành đã luôn đồng hành cùng nhà xe Thành Bưởi trên cung đường Sài Gòn - Đà Lạt. Sự hài lòng của anh là động lực to lớn cho toàn thể đội ngũ tài xế!',
      repliedAt: '3 ngày trước',
    },
  },
  {
    id: 'rev-03',
    userName: 'Lê *** Mai',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    userRank: 'Thành viên Bạc',
    rating: 4,
    route: 'TP. Hồ Chí Minh ➔ Nha Trang',
    companyName: 'Phương Trang (FUTA Bus Lines)',
    tripDate: '23/10/2026',
    createdAt: '4 ngày trước',
    verifiedBooking: true,
    comment: 'Xe FUTA xuất bến đúng giờ, đón khách tại trạm Bến xe Miền Đông sạch sẽ. Điểm dừng chân ăn khuya đồ ăn tương đối ngon và vệ sinh. Chỉ có điều máy lạnh tầng 2 hơi phả thẳng vào mặt, cần chỉnh lại hướng gió một chút là hoàn hảo.',
    criteriaScores: { punctuality: 5, cleanliness: 4, service: 4 },
    likesCount: 12,
  },
  {
    id: 'rev-04',
    userName: 'Phạm *** Dũng',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    userRank: 'Thành viên mới',
    rating: 5,
    route: 'TP. Hồ Chí Minh ➔ Vũng Tàu',
    companyName: 'Xe Khách Hoa Mai',
    tripDate: '22/10/2026',
    createdAt: '5 ngày trước',
    verifiedBooking: true,
    comment: 'Limousine Hoa Mai đưa đón tận nhà ở Vũng Tàu quá tiện lợi. Xe chạy cao tốc Long Thành rất nhanh chỉ hơn 1 tiếng rưỡi là đến nơi. Ghế ngả massage thư giãn, bác tài mở nhạc nhẹ nhàng rất lịch sự.',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    ],
    criteriaScores: { punctuality: 5, cleanliness: 5, service: 5 },
    likesCount: 9,
  },
  {
    id: 'rev-05',
    userName: 'Vũ *** Hoàng',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    userRank: 'Thành viên Vàng',
    rating: 4,
    route: 'Hà Nội ➔ Lào Cai',
    companyName: 'Hải Vân Express',
    tripDate: '20/10/2026',
    createdAt: '1 tuần trước',
    verifiedBooking: true,
    comment: 'Đặt vé trên ứng dụng TravelEasy quét mã PayOS duyệt nhanh trong 3 giây. Vé điện tử có mã QR lên xe không cần in giấy. Xe Hải Vân Interbus Lines phục vụ nước suối khăn lạnh đầy đủ, giường êm.',
    criteriaScores: { punctuality: 4, cleanliness: 5, service: 4 },
    likesCount: 15,
  },
  {
    id: 'rev-06',
    userName: 'Đỗ *** Linh',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    userRank: 'Thành viên Bạc',
    rating: 5,
    route: 'Đà Nẵng ➔ Quy Nhơn',
    companyName: 'Chín Nghĩa',
    tripDate: '19/10/2026',
    createdAt: '1 tuần trước',
    verifiedBooking: true,
    comment: 'Lần đầu đi Chín Nghĩa tuyến Miền Trung thấy rất ưng ý. Xe chạy êm, phụ xe khuân vác hành lý vali cẩn thận. Giá vé hợp lý cho sinh viên và người đi công tác.',
    criteriaScores: { punctuality: 5, cleanliness: 4, service: 5 },
    likesCount: 7,
  },
];

// List of major bus companies for the filter
const BUS_COMPANIES = [
  'Phương Trang (FUTA Bus Lines)',
  'Thành Bưởi',
  'Sao Việt Express',
  'Xe Khách Hoa Mai',
  'Hải Vân Express',
  'Chín Nghĩa',
  'Kumho Samco Buslines',
  'Hoàng Long Asia',
  'Nhà Xe Văn Minh',
  'Cúc Tùng Limousine',
];

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>(INITIAL_REVIEWS);
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [starFilter, setStarFilter] = useState<ReviewStarFilter>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');

  // Modals & Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Review Summary Statistics
  const summary: IReviewSummary = useMemo(() => {
    const totalReviews = 1420; // Realistic platform baseline
    const averageRating = 4.8;
    return {
      averageRating,
      totalReviews,
      starDistribution: [
        { star: 5, count: 1164, percentage: 82 },
        { star: 4, count: 170, percentage: 12 },
        { star: 3, count: 57, percentage: 4 },
        { star: 2, count: 15, percentage: 1 },
        { star: 1, count: 14, percentage: 1 },
      ],
      criteriaAverages: {
        punctuality: 4.9,
        cleanliness: 4.7,
        service: 4.8,
      },
    };
  }, []);

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

  // Add New Review from Modal
  const handleAddReview = (newRev: Partial<IReview>) => {
    setReviews([newRev as IReview, ...reviews]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* 1. HERO HEADER */}
      <section className="bg-slate-900 text-white pt-8 pb-14 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <MessageSquareQuote size={14} /> TIẾNG NÓI HÀNH KHÁCH TRAVELEASY
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Đánh Giá & Trải Nghiệm Khách Hàng Thực Tế
          </h1>

          <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
            Hơn 1.400 phản hồi minh bạch từ những hành khách đã đặt vé và hoàn thành chuyến đi. 
            Mọi đánh giá đều được xác thực bằng mã vé và hệ thống bảo mật hai chiều.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 -mt-8 space-y-6">
        {/* SCORECARD TỔNG QUAN */}
        <ReviewScorecard summary={summary} />

        {/* BỘ LỌC ĐÁNH GIÁ (FILTER BAR) */}
        <ReviewFilterBar
          companies={BUS_COMPANIES}
          selectedCompany={selectedCompany}
          onSelectCompany={(c) => {
            setSelectedCompany(c);
            setCurrentPage(1);
          }}
          starFilter={starFilter}
          onStarFilterChange={(f) => {
            setStarFilter(f);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onOpenWriteModal={() => setIsWriteModalOpen(true)}
          filteredCount={filteredReviews.length}
        />

        {/* 3. REVIEWS LIST */}
        <div className="space-y-4">
          {paginatedReviews.length > 0 ? (
            paginatedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onOpenImage={setLightboxImage}
                onToggleLike={handleToggleLike}
              />
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Star size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Không tìm thấy đánh giá phù hợp
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Thử chọn "Tất Cả Nhà Xe" hoặc bộ lọc sao khác để xem thêm nhận xét.
              </p>
              <button
                onClick={() => {
                  setSelectedCompany('ALL');
                  setStarFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Đặt Lại Bộ Lọc
              </button>
            </div>
          )}
        </div>

        {/* 4. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Sau →
            </button>
          </div>
        )}

        {/* 5. QUALITY COMMITMENT GUARANTEE BANNER */}
        <div className="mt-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 shrink-0 border border-white/20">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white mb-1">
                Cam Kết Minh Bạch & Hoàn Tiền 150% Nếu Nhà Xe Bỏ Bến
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                TravelEasy bảo vệ quyền lợi tối đa của hành khách: Bồi hoàn 150% giá vé nếu nhà xe không cung cấp dịch vụ hoặc đón trễ quá 60 phút không lý do chính đáng.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-black whitespace-nowrap shadow-md hover:shadow-orange-500/30 transition-all shrink-0 active:scale-95"
          >
            Đóng Góp Ý Kiến Của Bạn
          </button>
        </div>
      </main>

      {/* 6. LIGHTBOX MODAL */}
      <ReviewLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* 7. WRITE REVIEW MODAL */}
      <ReviewWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        companies={BUS_COMPANIES}
        onSubmitReview={handleAddReview}
      />
    </div>
  );
};
