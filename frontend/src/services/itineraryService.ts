/**
 * =========================================================================
 * ITINERARY SERVICE (Dịch vụ Quản lý Cẩm nang & Lịch trình du lịch)
 * Dùng chung cho:
 * 1. Phân hệ Khách hàng: /schedule (Hiển thị kịch bản, đề xuất xe khách)
 * 2. Phân hệ Quản trị: /admin/itineraries (Thêm, Sửa, Xóa, Bật/Tắt kịch bản)
 * Lưu trữ đồng bộ: localStorage + Custom Event để cập nhật tức thì Real-time
 * =========================================================================
 */

import api from './api';

export interface ItineraryStop {
  id: string;
  time: string;
  period: 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';
  title: string;
  category: 'FOOD' | 'CHECKIN' | 'CULTURE' | 'EXPERIENCE';
  duration: string;
  price: string;
  imageUrl: string;
  localTip: string;
  coords?: { x: number; y: number };
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  stops: ItineraryStop[];
}

export interface ItineraryBudget {
  standard: { bus: number; stay: number; bike: number; food: number; total: number };
  budget: { bus: number; stay: number; bike: number; food: number; total: number };
  vip: { bus: number; stay: number; bike: number; food: number; total: number };
}

export interface ItineraryTemplate {
  id: string;
  city: string;
  duration: string; // 'Trong ngày' | '2N1Đ' | '3N2Đ' | '4N3Đ'
  vibe: 'CHILL' | 'DISCOVERY' | 'FOOD' | 'CULTURE';
  title: string;
  tagline: string;
  weather: string;
  season: string;
  transportInfo: string;
  distanceFromMajor: string;
  recommendedDepartureTime: string;
  recommendedDepartureReason: string;
  checklist: string[];
  budget: ItineraryBudget;
  days: ItineraryDay[];
  isActive: boolean;
  updatedAt?: string;
}

const STORAGE_KEY = 'traveleasy_itinerary_templates_v2';
const EVENT_NAME = 'traveleasy_itineraries_updated';

/**
 * 20+ KỊCH BẢN MẪU CHUẨN THỰC TẾ VIỆT NAM (Realistic Travel Presets)
 */
export const DEFAULT_ITINERARY_TEMPLATES: ItineraryTemplate[] = [
  // 1. ĐÀ LẠT - 3N2Đ (Tiêu chuẩn)
  {
    id: 'dalat-3n2d',
    city: 'Đà Lạt',
    duration: '3N2Đ',
    vibe: 'CHILL',
    title: 'Đà Lạt 3N2Đ: Săn Mây Cầu Đất, Rừng Thông & Cafe Chill Thung Lũng',
    tagline: 'Thành phố sương mù, đồi thông bạt ngàn và những quán cafe thung lũng lãng mạn',
    weather: '17°C - Se lạnh có sương mù sáng sớm, nắng ấm ban ngày',
    season: 'Mùa hoa dã quỳ nở rộ & biển mây Cầu Đất bồng bềnh',
    transportInfo: 'Thuê xe máy 120k - 150k/ngày hoặc Taxi công nghệ',
    distanceFromMajor: '305 km từ Sài Gòn • ~6.5h xe Limousine cao tốc',
    recommendedDepartureTime: '22:30 tối hôm trước',
    recommendedDepartureReason: 'Vì Ngày 1 bắt đầu bằng điểm săn mây lúc 05:00 sáng tại Cầu Đất, bạn nên chọn chuyến xe đêm xuất bến lúc 22:30 để ngủ trọn giấc trên xe, 05:00 sáng tới nơi vừa tiết kiệm 1 đêm khách sạn vừa kịp đón bình minh!',
    checklist: [
      'Áo khoác ấm, áo len & khăn choàng cổ',
      'Giày thể thao êm chân (đi bộ đồi dốc)',
      'Sạc dự phòng dung lượng lớn & gậy selfie',
      'CCCD / Bằng lái xe để thuê xe máy',
      'Thuốc say xe & kem dưỡng ẩm da',
      'Dù gấp nhỏ (đề phòng mưa chiều Tây Nguyên)'
    ],
    budget: {
      standard: { bus: 700000, stay: 600000, bike: 300000, food: 850000, total: 2450000 },
      budget: { bus: 640000, stay: 350000, bike: 240000, food: 550000, total: 1780000 },
      vip: { bus: 900000, stay: 1600000, bike: 600000, food: 1500000, total: 4600000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Săn Mây Cầu Đất, Bánh Mì Xíu Mại & View Thung Lũng',
        stops: [
          {
            id: 'dl-1-1',
            time: '05:00',
            period: 'MORNING',
            title: 'Đón bình minh săn mây Đồi Chè Cầu Đất Panorama',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '35.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Có mặt trước 05:30 để bắt trọn khoảnh khắc biển mây cuồn cuộn dưới ánh bình minh vàng ươm.',
            coords: { x: 78, y: 35 }
          },
          {
            id: 'dl-1-2',
            time: '07:30',
            period: 'MORNING',
            title: 'Thưởng thức Bánh mì xíu mại Hoàng Diệu (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ - 50.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Quán rất đông sau 8h. Gọi thêm chén xíu mại da heo và ly sữa đậu nành nóng hổi.',
            coords: { x: 42, y: 48 }
          },
          {
            id: 'dl-1-3',
            time: '09:30',
            period: 'MORNING',
            title: 'Ga Xe Lửa Cổ Đà Lạt & Dinh 1 Bảo Đại',
            category: 'CHECKIN',
            duration: '60 phút',
            price: '20.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đầu máy hơi nước cổ điển và đường ray răng cưa chụp phong cách retro siêu cuốn.',
            coords: { x: 55, y: 52 }
          },
          {
            id: 'dl-1-4',
            time: '12:30',
            period: 'NOON',
            title: 'Lẩu Gà Lá É Tao Ngộ (Ăn trưa ấm bụng)',
            category: 'FOOD',
            duration: '60 phút',
            price: '250.000đ / nồi 2 người',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chi nhánh chính gốc tại số 5 đường 3/4. Nước lẩu the the cay nồng mùi lá é cực ấm người.',
            coords: { x: 48, y: 62 }
          },
          {
            id: 'dl-1-5',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Vườn Cẩm Tú Cầu Trại Mát & Cafe Túi Mơ To',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '65.000đ - 85.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Khung giờ vàng 15:30 - 17:00 đón ánh nắng xiên chiếu qua nhà lồng kính chụp ảnh đẹp nhất.',
            coords: { x: 72, y: 68 }
          },
          {
            id: 'dl-1-6',
            time: '19:30',
            period: 'EVENING',
            title: 'Chợ Đêm Đà Lạt & Quảng Trường Lâm Viên',
            category: 'CULTURE',
            duration: '120 phút',
            price: '50.000đ - 100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thử bánh tráng nướng trứng phô mai, dâu lắc và sữa đậu nành nóng ngay bậc thang dốc chợ.',
            coords: { x: 50, y: 50 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Hồ Tuyền Lâm, Rừng Thông Đa Phú & BBQ Thung Lũng',
        stops: [
          {
            id: 'dl-2-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Thiền Viện Trúc Lâm & Cáp Treo Ngắm Hồ Tuyền Lâm',
            category: 'CULTURE',
            duration: '90 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cảnh quan hồ Tuyền Lâm nhìn từ cáp treo đồi Robin như bức tranh thủy mặc xanh mát.',
            coords: { x: 35, y: 75 }
          },
          {
            id: 'dl-2-2',
            time: '12:00',
            period: 'NOON',
            title: 'Cơm lam gà nướng than hoa Thung Lũng Xanh',
            category: 'FOOD',
            duration: '60 phút',
            price: '180.000đ / người',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Gà đồi nướng than giòn bì chấm muối é dầm ớt xiêm rừng thơm nức mũi.',
            coords: { x: 28, y: 65 }
          },
          {
            id: 'dl-2-3',
            time: '15:00',
            period: 'AFTERNOON',
            title: 'Đồi Thông Đa Phú & Cafe Lưng Chừng',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '60.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ngồi bên hiên gỗ ngắm thung lũng thông reo rì rào, cực kỳ tĩnh lặng và chill.',
            coords: { x: 25, y: 30 }
          },
          {
            id: 'dl-2-4',
            time: '18:30',
            period: 'EVENING',
            title: 'Tiệc Nướng BBQ Hoàng Hôn View Thung Lũng Đèn',
            category: 'FOOD',
            duration: '120 phút',
            price: '250.000đ / người',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nên đặt bàn trước rìa thung lũng lúc 18h để ngắm hoàng hôn tắt và nhà lồng đồng loạt thắp sáng.',
            coords: { x: 75, y: 55 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Bánh Ướt Lòng Gà & Mua Sắm Đặc Sản L’angfarm',
        stops: [
          {
            id: 'dl-3-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Bánh ướt lòng gà Long & Cà phê Tùng cổ kính',
            category: 'FOOD',
            duration: '60 phút',
            price: '45.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Quán cafe Tùng cổ kính hơn 60 năm nơi cố nhạc sĩ Trịnh Công Sơn từng ngồi nghe nhạc cổ điển.',
            coords: { x: 48, y: 46 }
          },
          {
            id: 'dl-3-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Mua quà lưu niệm: Mứt dâu tây & Trà Atiso L’angfarm',
            category: 'CULTURE',
            duration: '60 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lựa chọn hồng treo gió, dâu sấy dẻo và trà atiso túi lọc đóng gói chuẩn tem xuất xứ.',
            coords: { x: 52, y: 48 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 2. ĐÀ LẠT - 2N1Đ (Cuối tuần)
  {
    id: 'dalat-2n1d',
    city: 'Đà Lạt',
    duration: '2N1Đ',
    vibe: 'CHILL',
    title: 'Đà Lạt 2N1Đ: Trốn Khói Bụi Cuối Tuần - Săn Mây & BBQ Đồi Thông',
    tagline: 'Kỳ nghỉ 48h nạp năng lượng trọn vẹn, thưởng thức lẩu gà lá é và cà phê view thung lũng',
    weather: '17°C - Se lạnh, chiều tối có gió nhẹ dễ chịu',
    season: 'Thích hợp cho cặp đôi & nhóm bạn trẻ đi trốn cuối tuần',
    transportInfo: 'Thuê xe máy 130k/ngày, nhận xe ngay tại bến',
    distanceFromMajor: '305 km từ Sài Gòn • 6.5h xe Limousine giường nằm',
    recommendedDepartureTime: '23:00 tối Thứ Sáu',
    recommendedDepartureReason: 'Lên xe lúc 23:00 tối thứ 6, ngủ một giấc đến sáng thứ 7 là có trọn vẹn 2 ngày cuối tuần trải nghiệm Đà Lạt mà không cần xin nghỉ phép!',
    checklist: ['Áo khoác ấm', 'CCCD thuê xe', 'Giày đi bộ', 'Thuốc đau đầu / cảm cúm'],
    budget: {
      standard: { bus: 700000, stay: 400000, bike: 200000, food: 600000, total: 1900000 },
      budget: { bus: 640000, stay: 250000, bike: 150000, food: 400000, total: 1440000 },
      vip: { bus: 900000, stay: 1000000, bike: 400000, food: 1000000, total: 3300000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Săn mây Cầu Đất, Lẩu Gà Lá É & Cafe Hoàng Hôn',
        stops: [
          {
            id: 'dl21-1',
            time: '05:30',
            period: 'MORNING',
            title: 'Săn mây Đồi Chè Cầu Đất & Tuabin Gió',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '30.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tranh thủ lúc trời vừa ửng hồng chụp qua cánh đồng chè xanh ngát.',
            coords: { x: 78, y: 35 }
          },
          {
            id: 'dl21-2',
            time: '08:00',
            period: 'MORNING',
            title: 'Bánh mì xíu mại chén Hoàng Diệu & Sữa đậu nành',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chấm bánh mì ngập trong bát xíu mại nóng hổi vừa thổi vừa ăn.',
            coords: { x: 42, y: 48 }
          },
          {
            id: 'dl21-3',
            time: '12:30',
            period: 'NOON',
            title: 'Lẩu gà lá é Tao Ngộ số 5 đường 3/4',
            category: 'FOOD',
            duration: '60 phút',
            price: '250.000đ / nồi',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lá é tươi dập nhẹ thả vào nồi lẩu sôi ùng ục thơm nức mũi.',
            coords: { x: 48, y: 62 }
          },
          {
            id: 'dl21-4',
            time: '18:30',
            period: 'EVENING',
            title: 'BBQ Đồi Gió Hú & Dạo Chợ Đêm Đà Lạt',
            category: 'FOOD',
            duration: '120 phút',
            price: '200.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ăn xiên nướng nóng hổi và uống sữa hạt béo ngậy giữa trời đêm 15 độ C.',
            coords: { x: 50, y: 50 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Hồ Tuyền Lâm, Dinh Bảo Đại & Mua Quà Chiều Về',
        stops: [
          {
            id: 'dl21-5',
            time: '08:00',
            period: 'MORNING',
            title: 'Thiền Viện Trúc Lâm ngắm cảnh Hồ Tuyền Lâm',
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Không gian tôn nghiêm, rừng thông bao bọc tạo cảm giác cực kỳ thanh thản.',
            coords: { x: 35, y: 75 }
          },
          {
            id: 'dl21-6',
            time: '11:30',
            period: 'NOON',
            title: 'Bánh ướt lòng gà Long & Trà Cà Phê Tùng',
            category: 'FOOD',
            duration: '60 phút',
            price: '50.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bánh ướt mềm dai, lòng gà bóp gỏi hành tây chua ngọt đậm vị.',
            coords: { x: 48, y: 46 }
          },
          {
            id: 'dl21-7',
            time: '14:30',
            period: 'AFTERNOON',
            title: 'Mua mứt dâu tây L’angfarm & Chuẩn bị ra bến xe',
            category: 'CULTURE',
            duration: '60 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đón xe trung chuyển của hãng xe đến bến lúc 16:30 để về lại thành phố.',
            coords: { x: 52, y: 48 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 3. ĐÀ LẠT - Trong ngày
  {
    id: 'dalat-1d',
    city: 'Đà Lạt',
    duration: 'Trong ngày',
    vibe: 'DISCOVERY',
    title: 'Đà Lạt Trong Ngày: Săn Mây Chớp Nhoáng & Check-in Các Điểm Hot Nhất',
    tagline: 'Kế hoạch 24h trọn vẹn dành cho du khách đi xe đêm tới sáng và về đêm cùng ngày',
    weather: '18°C - Mát mẻ quanh năm',
    season: 'Chuyến đi tiết kiệm chi phí phòng khách sạn tối đa',
    transportInfo: 'Thuê xe máy 1 ngày lấy tại bến xe liên tỉnh',
    distanceFromMajor: '305 km từ Sài Gòn • 6.5h xe Limousine đêm',
    recommendedDepartureTime: '22:30 đêm trước & Về lúc 22:30 tối nay',
    recommendedDepartureReason: 'Tận dụng 2 đêm ngủ trên xe Limousine giường nằm để có trọn vẹn 1 ngày vui chơi ăn uống thả ga mà không tốn 1 đồng tiền khách sạn!',
    checklist: ['Balo nhỏ gọn', 'Áo ấm nhẹ', 'Sạc dự phòng', 'Khăn mặt ướt'],
    budget: {
      standard: { bus: 700000, stay: 0, bike: 150000, food: 350000, total: 1200000 },
      budget: { bus: 640000, stay: 0, bike: 120000, food: 250000, total: 1010000 },
      vip: { bus: 900000, stay: 0, bike: 300000, food: 600000, total: 1800000 }
    },
    days: [
      {
        dayNumber: 1,
        title: '24h Trải Nghiệm Trọn Vẹn Đà Lạt',
        stops: [
          {
            id: 'dl1d-1',
            time: '05:30',
            period: 'MORNING',
            title: 'Săn mây bình minh Cầu Đất Panorama',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '35.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chụp ảnh mây sớm tinh khôi rồi quay về trung tâm ăn sáng.',
            coords: { x: 78, y: 35 }
          },
          {
            id: 'dl1d-2',
            time: '08:00',
            period: 'MORNING',
            title: 'Bánh mì xíu mại Hoàng Diệu',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nạp năng lượng khởi đầu ngày mới.',
            coords: { x: 42, y: 48 }
          },
          {
            id: 'dl1d-3',
            time: '12:00',
            period: 'NOON',
            title: 'Lẩu gà lá é Tao Ngộ',
            category: 'FOOD',
            duration: '60 phút',
            price: '150.000đ / người',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ấm bụng nghỉ trưa nhẹ nhàng.',
            coords: { x: 48, y: 62 }
          },
          {
            id: 'dl1d-4',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Cafe Túi Mơ To ngắm thung lũng',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '70.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Uống ly cacao nóng ngắm hoàng hôn buông xuống đồi.',
            coords: { x: 72, y: 68 }
          },
          {
            id: 'dl1d-5',
            time: '19:30',
            period: 'EVENING',
            title: 'Chợ Đêm Đà Lạt & Lên xe đêm về lại',
            category: 'CULTURE',
            duration: '90 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Gửi hành lý tại văn phòng nhà xe từ chiều để tự do dạo chợ đêm trước giờ xe chạy.',
            coords: { x: 50, y: 50 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 4. SA PA - 3N2Đ
  {
    id: 'sapa-3n2d',
    city: 'Sa Pa',
    duration: '3N2Đ',
    vibe: 'DISCOVERY',
    title: 'Sa Pa 3N2Đ: Chinh Phục Nóc Nhà Đông Dương & Bản Sắc Tây Bắc',
    tagline: 'Xứ sở trong mây, nóc nhà Đông Dương Fansipan và sắc màu thổ cẩm Tây Bắc',
    weather: '13°C - Lạnh vùng núi cao, mây mù giăng lối, không khí trong lành',
    season: 'Mùa lúa chín vàng óng ruộng bậc thang & mùa mây luồn Fansipan',
    transportInfo: 'Thuê xe máy khám phá bản làng hoặc Xe điện trung tâm thị trấn',
    distanceFromMajor: '315 km từ Hà Nội • ~5.5h xe Limousine cao tốc Nội Bài - Lào Cai',
    recommendedDepartureTime: '23:00 tối hôm trước',
    recommendedDepartureReason: 'Đi chuyến xe Limousine Cabin đôi lúc 23:00 từ Hà Nội, ngủ một giấc êm ái trên cao tốc, 05:30 sáng tới bến Sa Pa chuẩn bị đón sương mù và leo Fansipan sớm!',
    checklist: [
      'Áo phao dày, áo giữ nhiệt & găng tay len',
      'Giày leo núi bám đất chống trơn trượt',
      'Thuốc cảm sốt, xịt mũi & sạc dự phòng',
      'Tiền mặt nhỏ để thuê trang phục dân tộc',
      'CCCD để nhận phòng và mua vé cáp treo'
    ],
    budget: {
      standard: { bus: 850000, stay: 700000, bike: 350000, food: 1200000, total: 3100000 },
      budget: { bus: 700000, stay: 400000, bike: 250000, food: 800000, total: 2150000 },
      vip: { bus: 1200000, stay: 2200000, bike: 700000, food: 2200000, total: 6300000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Chinh Phục Nóc Nhà Đông Dương & Sun Plaza Check-in',
        stops: [
          {
            id: 'sp-1-1',
            time: '06:30',
            period: 'MORNING',
            title: 'Ăn sáng Phở cốn sủi Quán Ông Há & Cất hành lý',
            category: 'FOOD',
            duration: '45 phút',
            price: '50.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước sốt thơm ngậy bí truyền rưới lên sợi phở dai mềm, ăn kèm khoai lang giòn tan.',
            coords: { x: 45, y: 50 }
          },
          {
            id: 'sp-1-2',
            time: '08:30',
            period: 'MORNING',
            title: 'Tàu hỏa leo núi Mường Hoa & Cáp treo Fansipan 3.143m',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '950.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đặt vé cáp treo kèm vé tàu hỏa đỉnh Fansipan để tránh phải leo 600 bậc đá trong thời tiết lạnh.',
            coords: { x: 25, y: 35 }
          },
          {
            id: 'sp-1-3',
            time: '12:30',
            period: 'NOON',
            title: 'Lẩu cá tầm Tây Bắc & Thắng cố A Quỳnh',
            category: 'FOOD',
            duration: '60 phút',
            price: '250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cá tầm nuôi suối nước lạnh thịt trắng ngần ngọt thanh, nhúng cùng rau cải mèo giòn rụm.',
            coords: { x: 50, y: 52 }
          },
          {
            id: 'sp-1-4',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Nhà Thờ Đá Sa Pa & Check-in Sun Plaza',
            category: 'CHECKIN',
            duration: '60 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Góc chụp tòa nhà Sun Plaza mái vòm màu vàng xanh phong cách Pháp đẹp như trời Âu.',
            coords: { x: 48, y: 48 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Bản Cát Cát, Tắm Lá Dao Đỏ & Nướng Đêm Phố Cầu Mây',
        stops: [
          {
            id: 'sp-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Bản Cát Cát: Thác Tiên Sa & Guồng nước gỗ khổng lồ',
            category: 'CULTURE',
            duration: '150 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thuê một bộ trang phục H’Mông rực rỡ để chụp ảnh bên dòng suối Hoa và cối xay nước.',
            coords: { x: 38, y: 65 }
          },
          {
            id: 'sp-2-2',
            time: '14:30',
            period: 'AFTERNOON',
            title: 'Ngâm bồn gỗ Tắm lá thuốc người Dao Đỏ Tả Van',
            category: 'EXPERIENCE',
            duration: '60 phút',
            price: '120.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước lá thuốc ấm nóng với hơn 30 vị thảo mộc rừng giúp giãn gân cốt sau khi đi bộ leo đồi.',
            coords: { x: 62, y: 70 }
          },
          {
            id: 'sp-2-3',
            time: '18:30',
            period: 'EVENING',
            title: 'Thịt xiên nướng than hoa Sa Pa & Hạt dẻ rừng nướng',
            category: 'FOOD',
            duration: '90 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bò cuốn cải mèo nướng chấm tương ớt Mường Khương ăn kèm cơm lam nướng ống tre dẻo quánh.',
            coords: { x: 50, y: 45 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Đèo Ô Quy Hồ Săn Mây & Mua Đặc Sản Thịt Trâu Gác Bếp',
        stops: [
          {
            id: 'sp-3-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Cổng Trời Đèo Ô Quy Hồ - Tứ đại đỉnh đèo',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ngắm nhìn biển mây cuồn cuộn tràn qua khe núi Hoàng Liên Sơn hùng vĩ bậc nhất miền Bắc.',
            coords: { x: 20, y: 20 }
          },
          {
            id: 'sp-3-2',
            time: '11:00',
            period: 'NOON',
            title: 'Chợ Sa Pa mua Thịt trâu gác bếp & Nấm hương rừng',
            category: 'FOOD',
            duration: '60 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chọn thớ thịt thăn hun khói củi nhãn đỏ tự nhiên, xé sợi chấm chẩm chéo cay nồng.',
            coords: { x: 55, y: 48 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 5. SA PA - 2N1Đ
  {
    id: 'sapa-2n1d',
    city: 'Sa Pa',
    duration: '2N1Đ',
    vibe: 'DISCOVERY',
    title: 'Sa Pa 2N1Đ: Fansipan Express & Khám Phá Bản Cát Cát Cuối Tuần',
    tagline: 'Chuyến đi 2 ngày 1 đêm gọn gàng, trọn vẹn đỉnh Fansipan và ẩm thực cá tầm trứ danh',
    weather: '14°C - Se lạnh sương mù bao phủ',
    season: 'Lựa chọn hàng đầu cho dân văn phòng Hà Nội đi cuối tuần',
    transportInfo: 'Xe giường nằm Cabin đôi cao tốc Nội Bài - Lào Cai',
    distanceFromMajor: '315 km từ Hà Nội • 5.5h di chuyển',
    recommendedDepartureTime: '22:30 tối Thứ 6',
    recommendedDepartureReason: 'Lên xe lúc đêm thứ 6, ngủ trên xe cabin riêng tư, sáng thứ 7 lên cáp treo sớm nhất ngắm biển mây!',
    checklist: ['Áo khoác gió ấm', 'Giày đi bộ', 'CCCD', 'Thuốc cảm'],
    budget: {
      standard: { bus: 800000, stay: 500000, bike: 200000, food: 700000, total: 2200000 },
      budget: { bus: 650000, stay: 300000, bike: 150000, food: 500000, total: 1600000 },
      vip: { bus: 1100000, stay: 1500000, bike: 400000, food: 1500000, total: 4500000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Chinh phục Fansipan & Thưởng thức Lẩu cá tầm',
        stops: [
          {
            id: 'sp21-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Ăn sáng Cốn Sủi Ông Há & Cafe Nhà Thờ Đá',
            category: 'FOOD',
            duration: '45 phút',
            price: '50.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bát phở cốn sủi nóng hổi thơm nức mũi giữa trời sương sớm.',
            coords: { x: 45, y: 50 }
          },
          {
            id: 'sp21-2',
            time: '09:00',
            period: 'MORNING',
            title: 'Cáp treo Fansipan Legend & Chạm mốc 3.143m',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '950.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Check-in cột mốc nóc nhà Đông Dương trong biển mây bồng bềnh.',
            coords: { x: 25, y: 35 }
          },
          {
            id: 'sp21-3',
            time: '18:30',
            period: 'EVENING',
            title: 'Nồi lẩu cá tầm Tây Bắc & Dạo chợ đêm Cầu Mây',
            category: 'FOOD',
            duration: '90 phút',
            price: '250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt cá tầm dai ngọt nhúng lẩu chua cay đậm vị vùng cao.',
            coords: { x: 50, y: 52 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Bản Cát Cát, Tắm Lá Thuốc & Khởi Hành Về',
        stops: [
          {
            id: 'sp21-4',
            time: '08:30',
            period: 'MORNING',
            title: 'Bản Cát Cát - Thác Tiên Sa & Chụp Ảnh Thổ Cẩm',
            category: 'CULTURE',
            duration: '120 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bản làng bình yên với những guồng nước gỗ xoay tròn bên suối.',
            coords: { x: 38, y: 65 }
          },
          {
            id: 'sp21-5',
            time: '14:00',
            period: 'AFTERNOON',
            title: 'Tắm lá thuốc người Dao Đỏ & Mua thịt trâu gác bếp',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '120.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thư giãn toàn thân trước khi lên xe Limousine về Hà Nội lúc 16:30.',
            coords: { x: 62, y: 70 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 6. NHA TRANG - 3N2Đ
  {
    id: 'nhatrang-3n2d',
    city: 'Nha Trang',
    duration: '3N2Đ',
    vibe: 'CHILL',
    title: 'Nha Trang 3N2Đ: Vịnh Biển Thiên Đường, Lặn Ngắm San Hô & Hải Sản',
    tagline: 'Vịnh biển thiên đường, lặn ngắm san hô Hòn Mun và ẩm thực hải sản phong phú',
    weather: '28°C - Nắng vàng rực rỡ, gió biển mát rượi, sóng biển êm',
    season: 'Mùa biển đẹp nhất trong năm, làn nước trong vắt nhìn thấy đáy',
    transportInfo: 'Thuê xe máy dạo đường Trần Phú hoặc Cano cao tốc ra các đảo',
    distanceFromMajor: '435 km từ Sài Gòn • ~7.5h xe Limousine cao tốc mới',
    recommendedDepartureTime: '22:30 tối hôm trước',
    recommendedDepartureReason: 'Khuyên chọn chuyến xe đêm 22:30 chạy cao tốc Phan Thiết - Cam Lâm cực êm, 05:30 sáng tới biển đón bình minh và đi tour cano đảo sớm!',
    checklist: [
      'Đồ bơi, kính bơi & túi chống nước điện thoại',
      'Kem chống nắng SPF50+ & nón rộng vành',
      'Kính râm thời trang & dép xỏ ngón đi biển',
      'CCCD để làm thủ tục bến tàu cano ra đảo'
    ],
    budget: {
      standard: { bus: 650000, stay: 600000, bike: 250000, food: 1000000, total: 2500000 },
      budget: { bus: 560000, stay: 350000, bike: 200000, food: 600000, total: 1710000 },
      vip: { bus: 900000, stay: 1800000, bike: 500000, food: 2000000, total: 5200000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Tắm Biển Bãi Dài, Tháp Bà Ponagar & Nem Nướng Ninh Hòa',
        stops: [
          {
            id: 'nt-1-1',
            time: '06:30',
            period: 'MORNING',
            title: 'Bún sứa chả cá Cô Ba đường Yersin (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước lèo nấu từ cá liệt thanh ngọt tự nhiên, sứa giòn sần sật kèm chả cá thu hấp.',
            coords: { x: 52, y: 48 }
          },
          {
            id: 'nt-1-2',
            time: '08:30',
            period: 'MORNING',
            title: 'Tắm biển Bãi Dài với bãi cát trắng mịn như nhung',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bãi cát nông, nước biển trong vắt thoai thoải an toàn cho mọi lứa tuổi.',
            coords: { x: 65, y: 80 }
          },
          {
            id: 'nt-1-3',
            time: '12:00',
            period: 'NOON',
            title: 'Nem nướng Đặng Văn Quyên chuẩn vị Ninh Hòa',
            category: 'FOOD',
            duration: '60 phút',
            price: '65.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước chấm tương đậu nành nóng hổi màu vàng óng béo ngậy cuộn cùng bánh tráng chiên giòn.',
            coords: { x: 50, y: 45 }
          },
          {
            id: 'nt-1-4',
            time: '15:00',
            period: 'AFTERNOON',
            title: 'Tháp Bà Ponagar & Tắm bùn khoáng nóng I-Resort',
            category: 'CULTURE',
            duration: '120 phút',
            price: '200.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Kiến trúc Chăm Pa cổ kính trên đồi Cù Lao nhìn ra cửa biển sông Cái tuyệt đẹp.',
            coords: { x: 45, y: 30 }
          },
          {
            id: 'nt-1-5',
            time: '18:30',
            period: 'EVENING',
            title: 'Hải sản tươi sống Bờ Kè Tháp Bà & Dạo Chợ Đêm',
            category: 'FOOD',
            duration: '120 phút',
            price: '300.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tự tay chọn tôm hùm, cá bớp, mực lá tươi nhảy tanh tách bên các bè hải sản bình dân.',
            coords: { x: 58, y: 40 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tour 3 Đảo Vịnh Nha Trang: Hòn Mun, Hòn Tằm Lặn San Hô',
        stops: [
          {
            id: 'nt-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Cano cao tốc ra Đảo Hòn Mun lặn ngắm rạn san hô',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '450.000đ (Tour bao gồm cano)',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Được trang bị kính lặn ống thở nhìn ngắm hàng trăm loài san hô và cá biển sặc sỡ.',
            coords: { x: 80, y: 60 }
          },
          {
            id: 'nt-2-2',
            time: '12:30',
            period: 'NOON',
            title: 'Ăn trưa hải sản trên Bè Nổi Làng Chài',
            category: 'FOOD',
            duration: '90 phút',
            price: '200.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cá mú hấp xì dầu và mực nướng muối ớt thưởng thức ngay trên sóng nước dập dềnh.',
            coords: { x: 75, y: 55 }
          },
          {
            id: 'nt-2-3',
            time: '15:00',
            period: 'AFTERNOON',
            title: 'Nghỉ dưỡng tắm bùn khoáng đảo Hòn Tằm',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: '300.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hồ bơi vô cực view trọn vịnh Nha Trang xanh ngắt như ngọc bích.',
            coords: { x: 70, y: 65 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Viện Hải Dương Học & Mua Mực Một Nắng Chợ Đầm',
        stops: [
          {
            id: 'nt-3-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Viện Hải Dương Học Nha Trang & Thủy cung cổ kính',
            category: 'CULTURE',
            duration: '90 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chiêm ngưỡng bộ xương cá voi khổng lồ dài 26m và hàng ngàn sinh vật biển sống động.',
            coords: { x: 55, y: 60 }
          },
          {
            id: 'nt-3-2',
            time: '10:30',
            period: 'MORNING',
            title: 'Chợ Đầm: Mua Mực một nắng, Rong nho & Chả cá Nha Trang',
            category: 'FOOD',
            duration: '60 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Mực một nắng dày cơm nướng thơm lừng và chả cá chiên đóng gói hút chân không mang về.',
            coords: { x: 48, y: 42 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 7. ĐÀ NẴNG - 3N2Đ
  {
    id: 'danang-3n2d',
    city: 'Đà Nẵng',
    duration: '3N2Đ',
    vibe: 'CULTURE',
    title: 'Đà Nẵng - Hội An 3N2Đ: Cầu Rồng Phun Lửa, Bà Nà Hills & Phố Cổ Đèn Lồng',
    tagline: 'Thành phố đáng sống nhất Việt Nam, bãi biển Mỹ Khê quyến rũ và di sản cổ kính',
    weather: '27°C - Nắng ấm, gió biển chan hòa mát mẻ',
    season: 'Mùa lễ hội pháo hoa quốc tế & phố cổ lung linh ánh đèn hoa đăng',
    transportInfo: 'Thuê xe máy 120k/ngày hoặc Taxi/Xe bus di chuyển giữa Đà Nẵng - Hội An',
    distanceFromMajor: '960 km từ Sài Gòn / 760 km từ Hà Nội • Xe Limousine hoặc Tàu hỏa',
    recommendedDepartureTime: '19:00 tối hôm trước',
    recommendedDepartureReason: 'Hành trình xe khách Limousine giường nằm cao cấp êm ái, sáng sớm tới Đà Nẵng kịp tắm biển Mỹ Khê và thưởng thức Mỳ Quảng ếch trứ danh!',
    checklist: [
      'Trang phục lịch sự khi ghé thăm chùa Linh Ứng',
      'Đồ bơi & kính mát tắm biển Mỹ Khê',
      'Áo khoác nhẹ khi lên đỉnh Bà Nà Hills se lạnh',
      'Máy ảnh / Điện thoại pin khỏe chụp đèn lồng Hội An'
    ],
    budget: {
      standard: { bus: 900000, stay: 700000, bike: 300000, food: 1100000, total: 3000000 },
      budget: { bus: 750000, stay: 400000, bike: 240000, food: 700000, total: 2090000 },
      vip: { bus: 1300000, stay: 2000000, bike: 600000, food: 2200000, total: 6100000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bán đảo Sơn Trà, Bãi Biển Mỹ Khê & Cầu Rồng Phun Lửa',
        stops: [
          {
            id: 'dn-1-1',
            time: '07:00',
            period: 'MORNING',
            title: 'Mỳ Quảng Ếch Bếp Trang đường Pasteur (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '55.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thố ếch om nóng hổi rưới lên đĩa mỳ vàng ươm ăn cùng bánh tráng mè nướng giòn rụm.',
            coords: { x: 50, y: 50 }
          },
          {
            id: 'dn-1-2',
            time: '08:30',
            period: 'MORNING',
            title: 'Chùa Linh Ứng Bãi Bụt & Tượng Phật Bà Quan Âm 67m',
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tầm nhìn bao quát toàn bộ vịnh Đà Nẵng cong vút hình lưỡi liềm tuyệt mỹ.',
            coords: { x: 65, y: 35 }
          },
          {
            id: 'dn-1-3',
            time: '16:00',
            period: 'AFTERNOON',
            title: 'Tắm biển Mỹ Khê - Top bãi biển quyến rũ nhất hành tinh',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cát mịn, sóng nhẹ thoai thoải, dừa nghiêng bóng mát rượi.',
            coords: { x: 60, y: 65 }
          },
          {
            id: 'dn-1-4',
            time: '20:30',
            period: 'EVENING',
            title: 'Cầu Rồng Phun Lửa Phun Nước (21:00 cuối tuần)',
            category: 'CHECKIN',
            duration: '60 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đứng phía đầu Rồng đường Trần Hưng Đạo để ngắm rồng phun lửa 2 đợt và phun nước mát mẻ.',
            coords: { x: 52, y: 55 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Bà Nà Hills - Check-in Cầu Vàng Bàn Tay Khổng Lồ',
        stops: [
          {
            id: 'dn-2-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Cáp treo Sun World Ba Na Hills & Check-in Cầu Vàng',
            category: 'EXPERIENCE',
            duration: '240 phút',
            price: '900.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cây Cầu Vàng được nâng đỡ bởi hai bàn tay khổng lồ phủ rêu phong giữa lưng chừng mây.',
            coords: { x: 25, y: 50 }
          },
          {
            id: 'dn-2-2',
            time: '18:30',
            period: 'EVENING',
            title: 'Phố cổ Hội An: Thả hoa đăng sông Hoài & Cơm gà Bà Buội',
            category: 'CULTURE',
            duration: '150 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đi thuyền gỗ thả ngọn đèn hoa đăng giấy cầu bình an và may mắn trên dòng sông Hoài thơ mộng.',
            coords: { x: 70, y: 85 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Chợ Cồn Ăn Vặt & Mua Chả Bò Đà Nẵng Làm Quà',
        stops: [
          {
            id: 'dn-3-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Thiên đường ẩm thực Chợ Cồn: Bánh bèo nậm lọc, Ốc hút',
            category: 'FOOD',
            duration: '90 phút',
            price: '70.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Khu ẩm thực trong nhà với hơn 50 gánh hàng rong đặc sản miền Trung thơm nức mũi.',
            coords: { x: 45, y: 48 }
          },
          {
            id: 'dn-3-2',
            time: '10:30',
            period: 'MORNING',
            title: 'Mua Chả Bò Đà Nẵng Bà Hường & Mực rim me',
            category: 'FOOD',
            duration: '45 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chả bò nguyên chất thơm mùi tiêu sọ giòn dai tự nhiên không pha bột.',
            coords: { x: 48, y: 46 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 8. VŨNG TÀU - 2N1Đ
  {
    id: 'vungtau-2n1d',
    city: 'Vũng Tàu',
    duration: '2N1Đ',
    vibe: 'CHILL',
    title: 'Vũng Tàu 2N1Đ: Đổi Gió Phố Biển Cuối Tuần - Hải Sản & Cafe Hoàng Hôn',
    tagline: 'Phố biển cuối tuần gần Sài Gòn, cung đường ven biển lộng gió và ẩm thực hải sản',
    weather: '29°C - Nắng đẹp, gió biển lộng quanh năm, biển ấm áp',
    season: 'Thích hợp nghỉ dưỡng ngắn ngày 2N1Đ hoặc đi về trong ngày',
    transportInfo: 'Xe Limousine đón trả tận nhà từ Sài Gòn chỉ 2.5h cao tốc',
    distanceFromMajor: '95 km từ Sài Gòn • ~2h xe Limousine cao tốc Long Thành',
    recommendedDepartureTime: '06:30 sáng Thứ Bảy',
    recommendedDepartureReason: 'Khởi hành sớm lúc 06:30 từ Sài Gòn để tránh kẹt xe phà Cát Lái/cao tốc, 08:30 tới Vũng Tàu kịp ăn bánh khọt giòn rụm và tắm biển sớm!',
    checklist: ['Kính bơi & đồ tắm', 'Kem chống nắng', 'Dép xỏ ngón', 'CCCD'],
    budget: {
      standard: { bus: 360000, stay: 450000, bike: 150000, food: 700000, total: 1660000 },
      budget: { bus: 300000, stay: 250000, bike: 120000, food: 450000, total: 1120000 },
      vip: { bus: 500000, stay: 1200000, bike: 300000, food: 1500000, total: 3500000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bánh Khọt Gốc Vú Sữa, Tắm Biển Bãi Sau & Hải Sản Gành Hào',
        stops: [
          {
            id: 'vt-1-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Bánh khọt Cô Ba Vũng Tàu hoặc Gốc Vú Sữa (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '60.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Vỏ bánh chiên vàng rụm ôm trọn con tôm tươi roi rói cuộn với rau sống và đu đủ bào.',
            coords: { x: 45, y: 50 }
          },
          {
            id: 'vt-1-2',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Tắm biển Bãi Sau sóng êm & Thể thao bãi cát',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bãi biển dài hơn 8km, nước trong sạch và gió biển lộng mát lành.',
            coords: { x: 60, y: 70 }
          },
          {
            id: 'vt-1-3',
            time: '18:00',
            period: 'EVENING',
            title: 'Ngắm hoàng hôn & Ăn tối hải sản Gành Hào ven biển',
            category: 'FOOD',
            duration: '120 phút',
            price: '300.000đ - 450.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bàn ngoài trời sát mép biển nghe tiếng sóng vỗ rì rào và ngắm tàu thuyền đèn hoa rực rỡ.',
            coords: { x: 30, y: 40 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Mũi Nghinh Phong, Tượng Chúa Kito & Bánh Bông Lan Trứng Muối',
        stops: [
          {
            id: 'vt-2-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Check-in Cổng Trời Mũi Nghinh Phong đón gió biển',
            category: 'CHECKIN',
            duration: '60 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đứng trước cổng trời nhìn xuống biển Bãi Vọng và Bãi Dứa bao la hút mắt.',
            coords: { x: 50, y: 85 }
          },
          {
            id: 'vt-2-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Mua Bánh bông lan trứng muối Gốc Cột Điện & Lên xe về',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ / hộp',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bánh nướng lò than truyền thống xốp mềm, nhân phô mai béo ngậy và chà bông mặn mà.',
            coords: { x: 42, y: 55 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 9. QUY NHƠN - 3N2Đ
  {
    id: 'quynhon-3n2d',
    city: 'Quy Nhơn',
    duration: '3N2Đ',
    vibe: 'DISCOVERY',
    title: 'Quy Nhơn 3N2Đ: Kỳ Co - Eo Gió & Xứ Nẫu Bình Yên',
    tagline: 'Jeju của Việt Nam với những con đường ven biển ngoạn mục, biển ngọc trong vắt và hải sản tươi ngon',
    weather: '28°C - Nắng vàng, gió biển mát mẻ',
    season: 'Mùa khô từ tháng 3 đến tháng 9 sóng êm biển lặng lý tưởng lặn san hô',
    transportInfo: 'Thuê xe máy 130k/ngày hoặc xe du lịch đi Kỳ Co - Eo Gió',
    distanceFromMajor: '650 km từ Sài Gòn • ~10h xe Limousine giường nằm cao cấp',
    recommendedDepartureTime: '20:30 tối hôm trước',
    recommendedDepartureReason: 'Chọn chuyến xe Limousine giường phòng xuất bến 20:30 từ Bến xe Miền Đông, sáng 06:30 tới Quy Nhơn ăn bánh hỏi cháo lòng trứ danh!',
    checklist: ['Kem chống nắng', 'Đồ bơi', 'Mũ cói rộng vành', 'Máy ảnh'],
    budget: {
      standard: { bus: 800000, stay: 600000, bike: 260000, food: 900000, total: 2560000 },
      budget: { bus: 650000, stay: 350000, bike: 200000, food: 600000, total: 1800000 },
      vip: { bus: 1200000, stay: 1800000, bike: 500000, food: 1800000, total: 5300000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bánh Hỏi Cháo Lòng, Eo Gió & Lặn San Hô Kỳ Co',
        stops: [
          {
            id: 'qn-1-1',
            time: '07:00',
            period: 'MORNING',
            title: 'Bánh hỏi cháo lòng Diên Hồng (Ăn sáng chuẩn Xứ Nẫu)',
            category: 'FOOD',
            duration: '45 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bánh hỏi rưới mỡ hẹ ăn cùng lòng heo luộc giòn sần sật và chén cháo huyết nóng hổi.',
            coords: { x: 45, y: 50 }
          },
          {
            id: 'qn-1-2',
            time: '08:30',
            period: 'MORNING',
            title: 'Eo Gió Nhơn Lý - Con đường đi bộ ven biển đẹp nhất Việt Nam',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '25.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lan can màu đỏ trắng uốn lượn lưng chừng vách đá nhìn xuống sóng biển tung bọt trắng xóa.',
            coords: { x: 75, y: 35 }
          },
          {
            id: 'qn-1-3',
            time: '11:00',
            period: 'MORNING',
            title: 'Cano sang Bãi Tắm Kỳ Co & Lặn ngắm rạn san hô Bãi Dứa',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '350.000đ (Tour cano + ăn trưa)',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước biển 2 màu xanh ngọc bích rõ rệt, bãi cát thoai thoải và cây cầu gỗ chụp hình siêu đỉnh.',
            coords: { x: 80, y: 30 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Ghềnh Ráng Tiên Sa, Mộ Hàn Mặc Tử & Tháp Đôi Chăm Pa',
        stops: [
          {
            id: 'qn-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Khu du lịch Ghềnh Ráng Tiên Sa & Bãi Trứng Hoàng Hậu',
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hàng ngàn viên đá tròn nhẵn nhụi như quả trứng chim khổng lồ nằm chồng chất bên bờ sóng.',
            coords: { x: 50, y: 65 }
          },
          {
            id: 'qn-2-2',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Tháp Đôi Chăm Pa cổ kính giữa lòng thành phố',
            category: 'CULTURE',
            duration: '60 phút',
            price: '20.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Kiến trúc gạch nung Chăm Pa tinh xảo niên đại thế kỷ 12 được bảo tồn nguyên vẹn.',
            coords: { x: 45, y: 45 }
          },
          {
            id: 'qn-2-3',
            time: '18:30',
            period: 'EVENING',
            title: 'Phố ẩm thực Ốc Thúy Kiều & Bánh xèo tôm nhảy Gia Vỹ',
            category: 'FOOD',
            duration: '90 phút',
            price: '120.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Những con tôm đất đỏ au còn bật tanh tách trên khuôn bánh xèo giòn rụm.',
            coords: { x: 48, y: 55 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Cù Lao Xanh Hoặc Mua Chả Ram Tôm Đất Về Làm Quà',
        stops: [
          {
            id: 'qn-3-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Chợ Đầm Quy Nhơn: Mua chả ram tôm đất & Rượu Bầu Đá',
            category: 'FOOD',
            duration: '60 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chả ram cuốn bánh tráng phơi sương giòn rụm kể cả khi để nguội.',
            coords: { x: 46, y: 48 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 10. NINH BÌNH - 2N1Đ
  {
    id: 'ninhbinh-2n1d',
    city: 'Ninh Bình',
    duration: '2N1Đ',
    vibe: 'CULTURE',
    title: 'Ninh Bình 2N1Đ: Non Nước Tràng An, Đỉnh Hang Múa & Cơm Cháy Dê Núi',
    tagline: 'Vịnh Hạ Long trên cạn với hệ thống hang động kỳ vĩ, non nước hữu tình và bề dày lịch sử',
    weather: '24°C - Dịu mát, sương sớm lãng đãng quanh các rặng núi đá vôi',
    season: 'Mùa lúa chín vàng Tam Cốc & mùa hoa sen đầm Vân Long tỏa ngát',
    transportInfo: 'Xe Limousine đón trả tận nơi từ Hà Nội chỉ 1.5h cao tốc',
    distanceFromMajor: '95 km từ Hà Nội • ~1.5h xe Limousine cao tốc Pháp Vân - Cầu Giẽ',
    recommendedDepartureTime: '07:00 sáng Thứ Bảy',
    recommendedDepartureReason: 'Hành trình xe Limousine cao tốc rất nhanh và thuận tiện, 08:30 sáng tới Tràng An là thời điểm mát nhất trong ngày để lên thuyền nan xuôi dòng!',
    checklist: ['Mũ nón rộng vành che nắng', 'Giày thể thao leo 500 bậc Hang Múa', 'Trang phục chụp ảnh rực rỡ'],
    budget: {
      standard: { bus: 350000, stay: 500000, bike: 150000, food: 700000, total: 1700000 },
      budget: { bus: 280000, stay: 300000, bike: 120000, food: 450000, total: 1150000 },
      vip: { bus: 550000, stay: 1400000, bike: 300000, food: 1400000, total: 3650000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Chèo Thuyền Tràng An, Đỉnh Hang Múa & Thưởng Thức Dê Núi',
        stops: [
          {
            id: 'nb-1-1',
            time: '09:00',
            period: 'MORNING',
            title: 'Quần thể danh thắng Tràng An: Đi thuyền nan ngắm hang động',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nên chọn tuyến thuyền số 2 hoặc số 3 đi qua Đền Suối Tiên và phim trường Đảo Đầu Lâu.',
            coords: { x: 45, y: 40 }
          },
          {
            id: 'nb-1-2',
            time: '12:30',
            period: 'NOON',
            title: 'Ăn trưa Dê núi tái chanh & Cơm cháy Ninh Bình giòn rụm',
            category: 'FOOD',
            duration: '60 phút',
            price: '180.000đ / người',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt dê nuôi thả núi đá săn chắc, chấm nước tương bần gừng thơm lừng ấm bụng.',
            coords: { x: 50, y: 50 }
          },
          {
            id: 'nb-1-3',
            time: '16:00',
            period: 'AFTERNOON',
            title: 'Chinh phục Đỉnh Hang Múa ngắm toàn cảnh Tam Cốc mùa lúa',
            category: 'CHECKIN',
            duration: '120 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thử thách leo gần 500 bậc đá chữ V quanh co để chạm đỉnh rồng đá ngắm hoàng hôn đỏ ối.',
            coords: { x: 48, y: 60 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Chùa Bái Đính Cổ Kính, Cố Đô Hoa Lư & Về Lại Hà Nội',
        stops: [
          {
            id: 'nb-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Chùa Bái Đính: Chiêm bái ngôi chùa có nhiều kỷ lục Châu Á',
            category: 'CULTURE',
            duration: '120 phút',
            price: '60.000đ (Xe điện)',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hành lang 500 vị La Hán bằng đá xanh nguyên khối và bảo tháp xá lợi 13 tầng cao vút.',
            coords: { x: 30, y: 35 }
          },
          {
            id: 'nb-2-2',
            time: '14:00',
            period: 'AFTERNOON',
            title: 'Mua Cơm Cháy chà bông ruốc & Lên xe Limousine về',
            category: 'FOOD',
            duration: '45 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cơm cháy đóng gói ép chân không ăn kèm ruốc thịt thơm nức mũi.',
            coords: { x: 55, y: 55 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 11. HÀ GIANG - 3N2Đ
  {
    id: 'hagiang-3n2d',
    city: 'Hà Giang',
    duration: '3N2Đ',
    vibe: 'DISCOVERY',
    title: 'Hà Giang 3N2Đ: Cung Đường Hạnh Phúc, Đèo Mã Pí Lèng & Sông Nho Quế',
    tagline: 'Vùng đất địa đầu Tổ quốc với những cung đèo ngoạn mục, hẻm vực sâu nhất Đông Nam Á',
    weather: '16°C - Se lạnh vùng cao nguyên đá, nắng hanh vàng',
    season: 'Mùa hoa tam giác mạch hồng phớt & mùa cúc cam khoe sắc ven sườn núi',
    transportInfo: 'Thuê xe máy cào cào/xe số hoặc Tour xe khách giường nằm kết hợp xe máy có tài xế xế cứng',
    distanceFromMajor: '300 km từ Hà Nội • ~6.5h xe Limousine giường nằm cao tốc',
    recommendedDepartureTime: '21:00 tối hôm trước',
    recommendedDepartureReason: 'Lên xe Limousine Cabin đôi tại Hà Nội lúc 21:00, ngủ một giấc thật sâu, 04:30 sáng tới thành phố Hà Giang nhận xe máy và bắt đầu cung đèo trong sớm mai!',
    checklist: [
      'Bằng lái xe A1/A2 hợp lệ & CMND/CCCD',
      'Giáp bảo hộ chân tay & mũ bảo hiểm đạt chuẩn',
      'Áo khoác gió chống nước & găng tay ấm',
      'Tiền mặt nhỏ (trên cao nguyên đá ít cây ATM)'
    ],
    budget: {
      standard: { bus: 700000, stay: 600000, bike: 450000, food: 950000, total: 2700000 },
      budget: { bus: 600000, stay: 350000, bike: 360000, food: 650000, total: 1960000 },
      vip: { bus: 1000000, stay: 1600000, bike: 750000, food: 1800000, total: 5150000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Dốc Bắc Sum, Cổng Trời Quản Bạ & Rừng Thông Yên Minh',
        stops: [
          {
            id: 'hg-1-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Ăn sáng Bánh cuốn trứng nóng chấm nước xương hầm',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bánh tráng mỏng ướt cuốn lòng đỏ trứng lòng đào chấm bát nước dùng hầm xương ngọt lịm.',
            coords: { x: 30, y: 70 }
          },
          {
            id: 'hg-1-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Cổng Trời Quản Bạ & Núi Đôi Cô Tiên tròn trịa',
            category: 'CHECKIN',
            duration: '45 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tuyệt tác của mẹ thiên nhiên giữa thung lũng Tam Sơn trù phú.',
            coords: { x: 40, y: 60 }
          },
          {
            id: 'hg-1-3',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Dốc Thẩm Mã - Con dốc thử thách sức ngựa nổi tiếng',
            category: 'EXPERIENCE',
            duration: '45 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Những khúc cua tay áo uốn lượn liên tiếp chụp từ trên cao cực kỳ ngoạn mục.',
            coords: { x: 55, y: 45 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Cột Cờ Lũng Cú, Đèo Mã Pí Lèng & Đi Thuyền Sông Nho Quế',
        stops: [
          {
            id: 'hg-2-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Cột cờ Quốc gia Lũng Cú - Điểm cực Bắc thiêng liêng',
            category: 'CULTURE',
            duration: '90 phút',
            price: '25.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lá cờ đỏ sao vàng rộng 54m² đại diện cho 54 dân tộc anh em bay phấp phới trên đỉnh núi Rồng.',
            coords: { x: 60, y: 20 }
          },
          {
            id: 'hg-2-2',
            time: '13:30',
            period: 'AFTERNOON',
            title: 'Đèo Mã Pí Lèng - Vua của những con đèo hiểm trở',
            category: 'EXPERIENCE',
            duration: '60 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Một bên là vách núi đá dựng đứng, một bên là vực sâu hun hút nhìn xuống dòng Nho Quế.',
            coords: { x: 75, y: 35 }
          },
          {
            id: 'hg-2-3',
            time: '15:00',
            period: 'AFTERNOON',
            title: 'Đi thuyền hẻm Tu Sản lướt trên làn nước xanh ngọc bích',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: '120.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hẻm vực sâu nhất Đông Nam Á với hai vách đá cao sừng sững gần 1.000m.',
            coords: { x: 80, y: 40 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Dinh Thự Vua Mèo & Chợ Phiên Đồng Văn',
        stops: [
          {
            id: 'hg-3-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Dinh thự họ Vương (Nhà Vua Mèo) kiến trúc độc bản',
            category: 'CULTURE',
            duration: '90 phút',
            price: '25.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
            localTip: 'Kiến trúc kết hợp giữa người Mông, người Hoa và phong cách Pháp tinh xảo từ gỗ sa mộc.',
            coords: { x: 50, y: 35 }
          },
          {
            id: 'hg-3-2',
            time: '11:00',
            period: 'NOON',
            title: 'Thưởng thức Thắng dền ngọt bùi & Bánh tam giác mạch',
            category: 'FOOD',
            duration: '45 phút',
            price: '20.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bát thắng dền dẻo ấm nồng vị gừng cay xua tan cái lạnh vùng cao nguyên đá.',
            coords: { x: 65, y: 30 }
          }
        ]
      }
    ],
    isActive: true
  },

  // 12. PHÚ QUỐC - 3N2Đ
  {
    id: 'phuquoc-3n2d',
    city: 'Phú Quốc',
    duration: '3N2Đ',
    vibe: 'CHILL',
    title: 'Phú Quốc 3N2Đ: Đảo Ngọc Thiên Đường, Sunset Sanato & Làng Chài Rạch Vẹm',
    tagline: 'Hòn đảo ngọc phía Nam Tổ quốc với làn nước biển xanh biếc và hoàng hôn rực rỡ nhất Việt Nam',
    weather: '30°C - Nắng vàng biển xanh, sóng êm',
    season: 'Mùa khô từ tháng 11 đến tháng 4 trời trong không mưa',
    transportInfo: 'Thuê xe máy 150k/ngày hoặc xe ô tô tự lái',
    distanceFromMajor: '300 km từ Sài Gòn • Xe khách cao tốc đến Rạch Giá/Hà Tiên rồi đi tàu cao tốc ra đảo',
    recommendedDepartureTime: '21:00 tối hôm trước',
    recommendedDepartureReason: 'Đi xe giường nằm từ Sài Gòn lúc 21:00 đến Bến tàu Rạch Giá lúc 05:00 sáng, đón chuyến tàu cao tốc sớm 07:00 lướt sóng ra đảo!',
    checklist: ['Đồ bơi & kính râm', 'Váy maxi chụp hoàng hôn', 'Kem chống nắng', 'Giấy tờ tùy thân'],
    budget: {
      standard: { bus: 850000, stay: 800000, bike: 300000, food: 1200000, total: 3150000 },
      budget: { bus: 680000, stay: 450000, bike: 240000, food: 750000, total: 2120000 },
      vip: { bus: 1200000, stay: 2500000, bike: 600000, food: 2500000, total: 6800000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bãi Sao Cát Trắng, Nhà Tù Phú Quốc & Ngắm Hoàng Hôn Sunset Sanato',
        stops: [
          {
            id: 'pq-1-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Ăn sáng Bún quậy Kiến Xây chuẩn vị Phú Quốc',
            category: 'FOOD',
            duration: '45 phút',
            price: '55.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tự tay pha bát nước chấm tắc muối tiêu đường theo khẩu vị rồi chan nước dùng tôm tươi ngọt lịm.',
            coords: { x: 45, y: 50 }
          },
          {
            id: 'pq-1-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Tắm biển Bãi Sao - Bãi cát trắng mịn như kem',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cây dừa đổ huyền thoại và bãi cát thoai thoải phẳng lì xanh màu ngọc lam.',
            coords: { x: 60, y: 75 }
          },
          {
            id: 'pq-1-3',
            time: '17:00',
            period: 'AFTERNOON',
            title: 'Sunset Sanato Beach Club ngắm hoàng hôn ngũ sắc',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bức tượng đàn voi chân dài và tượng đầu người chia đôi in bóng lên nền trời hoàng hôn rực lửa.',
            coords: { x: 40, y: 65 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tour Cano 4 Đảo Lặn San Hô & Cáp Treo Hòn Thơm Vượt Biển',
        stops: [
          {
            id: 'pq-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Cano lướt sóng ra Hòn Móng Tay & Hòn Gầm Ghì lặn san hô',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '500.000đ (Tour cano)',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Rạn san hô tự nhiên tuyệt đẹp với hàng trăm đàn cá bơi lội quanh chân bạn.',
            coords: { x: 30, y: 85 }
          },
          {
            id: 'pq-2-2',
            time: '18:30',
            period: 'EVENING',
            title: 'Chợ Đêm Phú Quốc & Thưởng thức Gỏi cá trích cuốn bánh tráng',
            category: 'FOOD',
            duration: '120 phút',
            price: '250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt cá trích tươi sống bóp dừa nạo và đậu phộng rang cuốn bánh tráng chấm nước mắm ớt Phú Quốc.',
            coords: { x: 45, y: 45 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Mua Nước Mắm Truyền Thống, Hồ Tiêu & Ngọc Trai Phú Quốc',
        stops: [
          {
            id: 'pq-3-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Nhà thùng nước mắm Khải Hoàn & Vườn tiêu Khu Tượng',
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thùng gỗ bời lời ủ cá cơm than hơn 12 tháng cho ra giọt nước mắm 40-43 độ đạm cánh gián thơm lừng.',
            coords: { x: 48, y: 42 }
          }
        ]
      }
    ],
    isActive: true
  }
];

export function templateToEntity(t: ItineraryTemplate) {
  return {
    id: t.id,
    city: t.city,
    duration: t.duration,
    vibe: t.vibe,
    title: t.title,
    tagline: t.tagline,
    weather: t.weather,
    season: t.season,
    transportInfo: t.transportInfo,
    distanceFromMajor: t.distanceFromMajor,
    recommendedDepartureTime: t.recommendedDepartureTime,
    recommendedDepartureReason: t.recommendedDepartureReason,
    checklist: JSON.stringify(t.checklist || []),
    budget: JSON.stringify(t.budget || {}),
    days: JSON.stringify(t.days || []),
    isActive: t.isActive !== false,
    updatedAt: t.updatedAt || new Date().toISOString(),
  };
}

export function entityToTemplate(e: any): ItineraryTemplate {
  let checklist: string[] = [];
  try {
    checklist = typeof e.checklist === 'string' ? JSON.parse(e.checklist || '[]') : (e.checklist || []);
  } catch (err) {
    checklist = [];
  }

  let budget: any = { standard: { bus: 0, stay: 0, bike: 0, food: 0, total: 0 }, budget: { bus: 0, stay: 0, bike: 0, food: 0, total: 0 }, vip: { bus: 0, stay: 0, bike: 0, food: 0, total: 0 } };
  try {
    budget = typeof e.budget === 'string' ? JSON.parse(e.budget || '{}') : (e.budget || budget);
  } catch (err) {
    // fallback
  }

  let days: any[] = [];
  try {
    days = typeof e.days === 'string' ? JSON.parse(e.days || '[]') : (e.days || []);
  } catch (err) {
    days = [];
  }

  return {
    id: e.id,
    city: e.city,
    duration: e.duration,
    vibe: e.vibe,
    title: e.title,
    tagline: e.tagline || '',
    weather: e.weather || '',
    season: e.season || '',
    transportInfo: e.transportInfo || '',
    distanceFromMajor: e.distanceFromMajor || '',
    recommendedDepartureTime: e.recommendedDepartureTime || '',
    recommendedDepartureReason: e.recommendedDepartureReason || '',
    checklist,
    budget,
    days,
    isActive: e.isActive !== false,
    updatedAt: e.updatedAt,
  };
}

/**
 * Đồng bộ dữ liệu kịch bản với CSDL Supabase PostgreSQL qua Backend API
 */
export async function syncItinerariesWithApi(): Promise<ItineraryTemplate[]> {
  try {
    const res = await api.get('/itineraries');
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const parsed = res.data.data.map(entityToTemplate);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new Event(EVENT_NAME));
      return parsed;
    } else {
      // CSDL chưa có dữ liệu -> Tự động Bulk Sync 12 kịch bản chuẩn lên Supabase
      const entities = DEFAULT_ITINERARY_TEMPLATES.map(templateToEntity);
      await api.post('/itineraries/bulk-sync', entities);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITINERARY_TEMPLATES));
      window.dispatchEvent(new Event(EVENT_NAME));
      return DEFAULT_ITINERARY_TEMPLATES;
    }
  } catch (err) {
    console.warn('Không thể đồng bộ CSDL itineraries, sử dụng bộ nhớ cache cục bộ:', err);
    return getAllItineraryTemplates();
  }
}

/**
 * Tải toàn bộ danh sách kịch bản (kết hợp LocalStorage và mặc định)
 */
export function getAllItineraryTemplates(): ItineraryTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITINERARY_TEMPLATES));
      return DEFAULT_ITINERARY_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Lỗi đọc itinerary templates từ localStorage:', err);
  }
  return DEFAULT_ITINERARY_TEMPLATES;
}

/**
 * Tìm kịch bản theo Điểm đến & Thời lượng (Nếu không khớp thời lượng, trả về kịch bản cùng điểm đến)
 */
export function getItineraryTemplate(city: string, duration?: string): ItineraryTemplate | null {
  const all = getAllItineraryTemplates().filter(t => t.isActive);
  const normalizedCity = city.trim().toLowerCase();

  // 1. Tìm chính xác Thành phố + Thời lượng
  if (duration) {
    const exactMatch = all.find(
      t => t.city.toLowerCase() === normalizedCity && t.duration === duration
    );
    if (exactMatch) return exactMatch;
  }

  // 2. Tìm theo Thành phố (Ưu tiên bản có nhiều ngày nhất hoặc 3N2Đ)
  const cityMatches = all.filter(t => t.city.toLowerCase() === normalizedCity);
  if (cityMatches.length > 0) {
    const pref = cityMatches.find(t => t.duration === '3N2Đ');
    return pref || cityMatches[0];
  }

  // 3. Fallback tìm tương đối
  const partial = all.find(t => normalizedCity.includes(t.city.toLowerCase()) || t.city.toLowerCase().includes(normalizedCity));
  return partial || null;
}

/**
 * Lưu hoặc cập nhật một kịch bản lịch trình (Đồng bộ Optimistic UI + CSDL Supabase)
 */
export function saveItineraryTemplate(template: ItineraryTemplate): void {
  const all = getAllItineraryTemplates();
  const index = all.findIndex(t => t.id === template.id);

  const updatedItem: ItineraryTemplate = {
    ...template,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    all[index] = updatedItem;
  } else {
    all.unshift(updatedItem);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT_NAME));

  // Ghi nhận trực tiếp vào CSDL backend
  api.post('/itineraries', templateToEntity(updatedItem)).catch(err => {
    console.warn('Lỗi ghi CSDL itinerary:', err);
  });
}

/**
 * Xóa một kịch bản lịch trình theo ID (Đồng bộ Optimistic UI + CSDL Supabase)
 */
export function deleteItineraryTemplate(id: string): void {
  const all = getAllItineraryTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT_NAME));

  api.delete(`/itineraries/${id}`).catch(err => {
    console.warn('Lỗi xóa CSDL itinerary:', err);
  });
}

/**
 * Bật / Tắt trạng thái kích hoạt của kịch bản (Đồng bộ Optimistic UI + CSDL Supabase)
 */
export function toggleItineraryTemplateStatus(id: string): void {
  const all = getAllItineraryTemplates();
  const item = all.find(t => t.id === id);
  if (item) {
    item.isActive = !item.isActive;
    item.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVENT_NAME));

    api.patch(`/itineraries/${id}/status`).catch(err => {
      console.warn('Lỗi đổi trạng thái CSDL itinerary:', err);
    });
  }
}

/**
 * Khôi phục về danh sách kịch bản mẫu chuẩn ban đầu (Đồng bộ CSDL Supabase)
 */
export function resetToDefaultItineraryTemplates(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITINERARY_TEMPLATES));
  window.dispatchEvent(new Event(EVENT_NAME));

  api.post('/itineraries/bulk-sync', DEFAULT_ITINERARY_TEMPLATES.map(templateToEntity)).catch(err => {
    console.warn('Lỗi bulk-sync reset itinerary:', err);
  });
}

/**
 * Đăng ký lắng nghe sự kiện thay đổi dữ liệu kịch bản
 */
export function subscribeToItineraryChanges(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

// Tự động đồng bộ CSDL Supabase khi khởi chạy ứng dụng
if (typeof window !== 'undefined') {
  syncItinerariesWithApi().catch(() => {});
}

