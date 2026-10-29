export interface ICompanyReply {
  author: string;
  avatar: string;
  replyText: string;
  repliedAt: string;
}

export interface ICriteriaScores {
  punctuality: number; // 1-5
  cleanliness: number;  // 1-5
  service: number;      // 1-5
}

export interface IReview {
  id: string;
  userName: string;     // Che bảo mật ví dụ: "Trần *** An"
  userAvatar?: string;
  userRank?: 'Thành viên mới' | 'Thành viên Bạc' | 'Thành viên Vàng' | 'Thành viên Kim Cương';
  rating: number;        // 1-5
  route: string;         // Tuyến đường e.g. "Hà Nội ➔ Sa Pa"
  companyName: string;   // Hãng xe e.g. "Sao Việt Express"
  tripDate: string;      // Ngày khởi hành e.g. "25/10/2026"
  createdAt: string;     // Thời gian đăng đánh giá e.g. "2 ngày trước"
  verifiedBooking: boolean; // Đã đi tuyến thực tế
  comment: string;
  images?: string[];     // Link ảnh thực tế
  criteriaScores: ICriteriaScores;
  likesCount: number;
  isLiked?: boolean;
  companyReply?: ICompanyReply;
}

export interface IStarDistribution {
  star: number;
  count: number;
  percentage: number;
}

export interface IReviewSummary {
  averageRating: number;
  totalReviews: number;
  starDistribution: IStarDistribution[];
  criteriaAverages: {
    punctuality: number;
    cleanliness: number;
    service: number;
  };
}

export type ReviewStarFilter = 'ALL' | '5' | '4' | 'HAS_IMAGES';
