import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { RouteScheduleResponse, ScheduleTripItem, Point } from '../../../types';
import { Pagination } from '../../../components/Pagination';
import { 
  Bus, 
  MapPin, 
  ArrowRight, 
  ArrowLeftRight, 
  Clock, 
  Calendar, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  CheckCircle2, 
  Info,
  Sparkles,
  Compass,
  Search,
  Navigation,
  ShieldCheck,
  Utensils,
  Camera,
  Landmark,
  Layers,
  DollarSign,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  MessageSquare,
  Send,
  X,
  Share2,
  Sun,
  Sunrise,
  Moon,
  Coffee,
  Ticket
} from 'lucide-react';

type PageViewMode = 'PLANNER' | 'TIMETABLE';
type DirectionTab = 'OUTBOUND' | 'INBOUND';
type TimeSlot = 'ALL' | 'EARLY' | 'MORNING' | 'AFTERNOON' | 'EVENING';
type TravelVibe = 'CHILL' | 'CHECKIN' | 'FOOD' | 'ADVENTURE';
type BudgetTier = 'BUDGET' | 'STANDARD' | 'VIP';

interface ItineraryStop {
  id: string;
  time: string;
  period: 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';
  title: string;
  category: 'FOOD' | 'CHECKIN' | 'CULTURE' | 'EXPERIENCE';
  duration: string;
  price: string;
  imageUrl: string;
  localTip: string;
  coords: { x: number; y: number }; // Relative map % coordinates (0 to 100)
}

interface DestinationData {
  city: string;
  tagline: string;
  weather: string;
  season: string;
  transportInfo: string;
  distanceFromMajor: string;
  recommendedDepartureTime: string;
  recommendedDepartureReason: string;
  checklist: string[];
  budget: {
    standard: { bus: number; stay: number; bike: number; food: number; total: number };
    budget: { bus: number; stay: number; bike: number; food: number; total: number };
    vip: { bus: number; stay: number; bike: number; food: number; total: number };
  };
  days: {
    dayNumber: number;
    title: string;
    stops: ItineraryStop[];
  }[];
}

const DESTINATION_TEMPLATES: Record<string, DestinationData> = {
  'Đà Lạt': {
    city: 'Đà Lạt',
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
    ]
  },
  'Sa Pa': {
    city: 'Sa Pa',
    tagline: 'Xứ sở trong mây, nóc nhà Đông Dương Fansipan và sắc màu thổ cẩm Tây Bắc',
    weather: '13°C - Lạnh vùng núi cao, mây mù giăng lối, không khí trong lành',
    season: 'Mùa lúa chín vàng óng ruộng bậc thang & mùa mây luồn Fansipan',
    transportInfo: 'Thuê xe máy khám phá bản làng hoặc Xe điện trung tâm thị trấn',
    distanceFromMajor: '315 km từ Hà Nội • ~5.5h xe Limousine cao tốc Nội Bài - Lào Cai',
    recommendedDepartureTime: '23:00 tối hôm trước',
    recommendedDepartureReason: 'Đi chuyến xe Limousine Cabin đôi của Sao Việt Express lúc 23:00 từ Hà Nội, ngủ một giấc êm ái trên cao tốc, 05:30 sáng tới bến Sa Pa chuẩn bị đón sương mù và leo Fansipan sớm!',
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
          },
          {
            id: 'sp-1-5',
            time: '18:30',
            period: 'EVENING',
            title: 'Phố nướng Cầu Mây & Tắm lá thuốc người Dao Đỏ',
            category: 'CULTURE',
            duration: '120 phút',
            price: '150.000đ - 250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ngâm bồn gỗ pơ-mu với thảo mộc người Dao đỏ xua tan mệt mỏi sau ngày dài leo núi.',
            coords: { x: 55, y: 56 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Bản Cát Cát Xinh Đẹp & Cổng Trời Đèo Ô Quy Hồ',
        stops: [
          {
            id: 'sp-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Khám phá Bản Cát Cát & Thuê trang phục H’Mông',
            category: 'CULTURE',
            duration: '150 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thuê bộ đồ dân tộc giá 50k - 100k chụp bên guồng nước khổng lồ và thác Tiên Sa bọt tung trắng xóa.',
            coords: { x: 35, y: 68 }
          },
          {
            id: 'sp-2-2',
            time: '12:00',
            period: 'NOON',
            title: 'Ăn trưa Cơm lam thịt lợn cắp nách nướng than',
            category: 'FOOD',
            duration: '60 phút',
            price: '180.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt lợn bản thơm ngọt nướng giòn rụm chấm chẩm chéo hạt dổi chuẩn vị Tây Bắc.',
            coords: { x: 42, y: 62 }
          },
          {
            id: 'sp-2-3',
            time: '15:00',
            period: 'AFTERNOON',
            title: 'Chinh phục Đèo Ô Quy Hồ & Săn hoàng hôn Cổng Trời',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
            localTip: 'Một trong tứ đại đỉnh đèo Việt Nam, nơi ngắm mây luồn và biển hoàng hôn rực rỡ ngoạn mục nhất.',
            coords: { x: 15, y: 25 }
          }
        ]
      }
    ]
  },
  'Nha Trang': {
    city: 'Nha Trang',
    tagline: 'Vịnh biển thiên đường, lặn ngắm san hô Hòn Mun và ẩm thực hải sản phong phú',
    weather: '28°C - Nắng vàng rực rỡ, gió biển mát rượi, sóng biển êm',
    season: 'Mùa biển đẹp nhất trong năm, làn nước trong vắt nhìn thấy đáy',
    transportInfo: 'Thuê xe máy dạo đường Trần Phú hoặc Cano cao tốc ra các đảo',
    distanceFromMajor: '435 km từ Sài Gòn • ~7.5h xe Limousine cao tốc mới',
    recommendedDepartureTime: '22:30 tối hôm trước',
    recommendedDepartureReason: 'Khuyên chọn chuyến xe đêm 22:30 của Liên Hưng / Cúc Tùng chạy cao tốc Phan Thiết - Cam Lâm cực êm, 05:30 sáng tới biển đón bình minh và đi tour cano đảo sớm!',
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
            price: '250.000đ - 350.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tự tay chọn tôm hùm, cá bớp, mực lá tươi nhảy tanh tách bên các bè hải sản bình dân.',
            coords: { x: 58, y: 40 }
          }
        ]
      }
    ]
  },
  'Vũng Tàu': {
    city: 'Vũng Tàu',
    tagline: 'Phố biển cuối tuần gần Sài Gòn, cung đường ven biển lộng gió và ẩm thực hải sản',
    weather: '29°C - Nắng đẹp, gió biển lộng quanh năm, biển ấm áp',
    season: 'Thích hợp nghỉ dưỡng ngắn ngày 2N1Đ hoặc đi về trong ngày',
    transportInfo: 'Thuê xe máy vi vu đường ven biển Hạ Long - Trần Phú',
    distanceFromMajor: '105 km từ Sài Gòn • ~2.0h xe Limousine cao tốc',
    recommendedDepartureTime: '07:30 sáng',
    recommendedDepartureReason: 'Chỉ mất đúng 2 giờ chạy cao tốc Long Thành, lên xe lúc 07:30 sáng là 09:30 có mặt thưởng thức bánh khọt nóng hổi và nhận phòng khách sạn.',
    checklist: [
      'Đồ bơi & kính râm chống nắng',
      'CCCD để nhận phòng khách sạn',
      'Dép xỏ ngón & váy maxi đi biển'
    ],
    budget: {
      standard: { bus: 380000, stay: 400000, bike: 180000, food: 550000, total: 1510000 },
      budget: { bus: 320000, stay: 250000, bike: 150000, food: 350000, total: 1070000 },
      vip: { bus: 500000, stay: 1200000, bike: 400000, food: 1200000, total: 3300000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bánh Khọt Gốc Vú Sữa, Hải Đăng & Hoàng Hôn Bãi Trước',
        stops: [
          {
            id: 'vt-1-1',
            time: '09:30',
            period: 'MORNING',
            title: 'Bánh khọt Gốc Vú Sữa giòn rụm (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '70.000đ / đĩa',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tôm tươi nguyên con ngọt lịm chiên trên chảo gang vàng giòn, cuốn xà lách cải xanh.',
            coords: { x: 50, y: 55 }
          },
          {
            id: 'vt-1-2',
            time: '11:00',
            period: 'MORNING',
            title: 'Hải Đăng Vũng Tàu & Yaourt Cô Tiên',
            category: 'CHECKIN',
            duration: '60 phút',
            price: '15.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cung đường uốn lượn rợp bóng cây hoa giấy, thưởng thức yaourt dẻo quánh và trứng gà lòng đào.',
            coords: { x: 42, y: 65 }
          },
          {
            id: 'vt-1-3',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Tắm biển Bãi Sau cát phẳng sóng êm',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Khung giờ nắng dịu, tắm biển sảng khoái và dạo bãi cát dài thoai thoải.',
            coords: { x: 65, y: 60 }
          },
          {
            id: 'vt-1-4',
            time: '18:30',
            period: 'EVENING',
            title: 'Lẩu Cá Đuối Út Mười & Cafe Sunset Bãi Trước',
            category: 'FOOD',
            duration: '90 phút',
            price: '200.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cá đuối tươi thịt săn ngọt nấu măng chua cay nồng, ăn cùng bún tươi lá é.',
            coords: { x: 40, y: 50 }
          }
        ]
      }
    ]
  },
  'Đà Nẵng': {
    city: 'Đà Nẵng',
    tagline: 'Thành phố đáng sống bên bờ sông Hàn, những cây cầu huyền thoại và bãi biển Mỹ Khê tuyệt đẹp',
    weather: '26°C - Nắng ấm chan hòa, gió biển thổi nhẹ sảng khoái',
    season: 'Mùa hè rực rỡ & Lễ hội pháo hoa quốc tế DIFF bên sông Hàn',
    transportInfo: 'Thuê xe máy 100k - 130k/ngày hoặc Taxi công nghệ',
    distanceFromMajor: '850 km từ Sài Gòn / 760 km từ Hà Nội • ~14h xe Limousine giường nằm',
    recommendedDepartureTime: '18:00 chiều hôm trước',
    recommendedDepartureReason: 'Chọn xe limousine giường phòng xuất bến 18:00, ngủ êm ái trên xe, 07:00 sáng tới Đà Nẵng sẵn sàng ăn tô mì Quảng ếch nóng hổi!',
    checklist: [
      'Kem chống nắng & kính râm chống chói',
      'Đồ bơi & khăn tắm biển Mỹ Khê',
      'CCCD / Giấy tờ thuê xe máy',
      'Giày thể thao êm chân đi Bà Nà Hills'
    ],
    budget: {
      standard: { bus: 800000, stay: 700000, bike: 250000, food: 800000, total: 2550000 },
      budget: { bus: 650000, stay: 400000, bike: 200000, food: 500000, total: 1750000 },
      vip: { bus: 1200000, stay: 1800000, bike: 500000, food: 1500000, total: 5000000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Mì Quảng Ếch, Bán Đảo Sơn Trà & Cầu Rồng Phun Lửa',
        stops: [
          {
            id: 'dn-1-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Mì Quảng Ếch Bếp Trang (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '55.000đ - 75.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt ếch om thố đất nghi ngút khói, ăn kèm rau sống bắp chuối và bánh tráng mè nướng.',
            coords: { x: 45, y: 40 }
          },
          {
            id: 'dn-1-2',
            time: '09:30',
            period: 'MORNING',
            title: 'Bán Đảo Sơn Trà & Chùa Linh Ứng ngắm tượng Phật Bà 67m',
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Góc nhìn ôm trọn đường bờ biển hình cánh cung của vịnh Đà Nẵng tuyệt đẹp.',
            coords: { x: 75, y: 25 }
          },
          {
            id: 'dn-1-3',
            time: '12:00',
            period: 'NOON',
            title: 'Bánh tráng cuốn thịt heo hai đầu da Quán Mậu',
            category: 'FOOD',
            duration: '60 phút',
            price: '90.000đ / phần',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Mắm nêm pha tỏi ớt thơm nồng chua cay đúng điệu miền Trung.',
            coords: { x: 50, y: 55 }
          },
          {
            id: 'dn-1-4',
            time: '16:00',
            period: 'AFTERNOON',
            title: 'Tắm biển Mỹ Khê - Top bãi biển quyến rũ nhất hành tinh',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bãi cát thoai thoải, nước biển trong vắt và các trò chơi lướt ván, mô tô nước sôi động.',
            coords: { x: 65, y: 60 }
          },
          {
            id: 'dn-1-5',
            time: '20:30',
            period: 'EVENING',
            title: 'Chiêm ngưỡng Cầu Rồng Phun Lửa, Phun Nước & Cầu Tình Yêu',
            category: 'CHECKIN',
            duration: '90 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cầu Rồng phun lửa vào 21:00 tối thứ Bảy và Chủ Nhật. Nên đứng đầu gió để tránh bị ướt.',
            coords: { x: 55, y: 48 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Sun World Bà Nà Hills & Check-in Cầu Vàng Kỳ Vĩ',
        stops: [
          {
            id: 'dn-2-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Cáp treo Bà Nà & Đón mây trên Cầu Vàng Bàn Tay Khổng Lồ',
            category: 'CHECKIN',
            duration: '180 phút',
            price: '900.000đ (Đã gồm cáp treo)',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Có mặt tại Cầu Vàng trước 08:30 sáng lúc chưa đông khách để có những bức ảnh triệu view.',
            coords: { x: 25, y: 45 }
          },
          {
            id: 'dn-2-2',
            time: '12:30',
            period: 'NOON',
            title: 'Buffet ẩm thực quốc tế 4 mùa Làng Pháp Bà Nà',
            category: 'FOOD',
            duration: '90 phút',
            price: '350.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hơn 100 món Á - Âu phong phú giữa không gian kiến trúc Gothic cổ điển lãng mạn.',
            coords: { x: 22, y: 42 }
          },
          {
            id: 'dn-2-3',
            time: '18:30',
            period: 'EVENING',
            title: 'Chợ Đêm Helio & Thưởng thức Hải Sản Đà Nẵng nướng bơ tỏi',
            category: 'FOOD',
            duration: '120 phút',
            price: '150.000đ - 250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thiên đường ăn vặt lớn nhất Đà thành với âm nhạc acoustic sống động ngoài trời.',
            coords: { x: 52, y: 58 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Bún Chả Cá Bà Lữ & Mua Sắm Đặc Sản Chợ Hàn',
        stops: [
          {
            id: 'dn-3-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Bún chả cá Bà Lữ gia truyền hơn 30 năm',
            category: 'FOOD',
            duration: '45 phút',
            price: '40.000đ - 50.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước lèo nấu từ bí đỏ, bắp cải và xương cá thu ngọt thanh dịu mát.',
            coords: { x: 48, y: 46 }
          },
          {
            id: 'dn-3-2',
            time: '09:30',
            period: 'MORNING',
            title: 'Chợ Hàn Đà Nẵng mua chả bò, tré Bà Đệ & mực rim me',
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nên mua chả bò loại 1 gói lá chuối thơm nức về làm quà biếu gia đình.',
            coords: { x: 50, y: 50 }
          }
        ]
      }
    ]
  },
  'Huế': {
    city: 'Huế',
    tagline: 'Cố đô trầm mặc, di sản cung đình vàng son và nét ẩm thực xứ thần kinh thanh tao',
    weather: '24°C - Dịu mát, thỉnh thoảng có mưa bụi thơ mộng đặc trưng xứ Huế',
    season: 'Mùa lễ hội Festival Huế & Sen hồ Tịnh Tâm nở ngát hương thơm',
    transportInfo: 'Thuê xe máy 100k/ngày hoặc Xích lô dạo quanh bờ sông Hương',
    distanceFromMajor: '100 km từ Đà Nẵng • ~2h xe limousine qua đèo Hải Vân',
    recommendedDepartureTime: '07:00 sáng từ Đà Nẵng',
    recommendedDepartureReason: 'Đi xe limousine qua hầm hoặc đèo Hải Vân ngắm vịnh Lăng Cô tuyệt đẹp, 09:00 có mặt tại Cố Đô ghé thăm Đại Nội!',
    checklist: [
      'Áo dài hoặc trang phục lịch sự chụp ảnh Đại Nội',
      'Nón lá bài thơ xứ Huế',
      'Ô dù che nắng mưa cổ kính',
      'Giày bệt êm chân đi bộ tham quan lăng tẩm'
    ],
    budget: {
      standard: { bus: 400000, stay: 550000, bike: 200000, food: 650000, total: 1800000 },
      budget: { bus: 300000, stay: 350000, bike: 150000, food: 450000, total: 1250000 },
      vip: { bus: 700000, stay: 1600000, bike: 400000, food: 1400000, total: 4100000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bún Bò Mụ Rơi, Đại Nội Hoàng Cung & Nghe Ca Huế Sông Hương',
        stops: [
          {
            id: 'h-1-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Bún bò Huế Mụ Rơi nguyên bản nước dùng thơm mùi sả ruốc',
            category: 'FOOD',
            duration: '45 phút',
            price: '45.000đ - 60.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tô bún đầy đặn giò gân, chả cua, huyết mềm và ớt chưng cay xé lưỡi.',
            coords: { x: 48, y: 52 }
          },
          {
            id: 'h-1-2',
            time: '09:00',
            period: 'MORNING',
            title: 'Đại Nội Huế: Ngọ Môn, Điện Thái Hòa & Tử Cấm Thành',
            category: 'CULTURE',
            duration: '150 phút',
            price: '200.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nên thuê áo Nhật Bình hoặc Cổ phục ngay cửa Ngọ Môn chụp ảnh cung đình cực kỳ uy nghiêm.',
            coords: { x: 50, y: 40 }
          },
          {
            id: 'h-1-3',
            time: '12:30',
            period: 'NOON',
            title: 'Bánh bèo - nậm - lọc bà Đỏ & Bánh khoái giòn rụm',
            category: 'FOOD',
            duration: '60 phút',
            price: '70.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước mắm ngọt chấm bánh nậm bùi béo tôm thịt gói lá dong xanh.',
            coords: { x: 42, y: 60 }
          },
          {
            id: 'h-1-4',
            time: '19:30',
            period: 'EVENING',
            title: 'Thuyền rồng nghe Ca Huế trên sông Hương & Thả hoa đăng',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ngắm cầu Tràng Tiền đổi màu huyền ảo giữa làn điệu Nam ai, Nam bình da diết.',
            coords: { x: 55, y: 55 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Lăng Khải Định, Làng Hương Thủy Xuân & Cà Phê Muối',
        stops: [
          {
            id: 'h-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Làng Hương Thủy Xuân rực rỡ sắc màu ngũ hành',
            category: 'CHECKIN',
            duration: '60 phút',
            price: 'Miễn phí (Ủng hộ mua quà)',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Những bó chông hương xòe hoa ngũ sắc là background sống ảo nổi tiếng bậc nhất cố đô.',
            coords: { x: 35, y: 65 }
          },
          {
            id: 'h-2-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Lăng Khải Định - Đỉnh cao nghệ thuật ghép gốm sứ tinh xảo',
            category: 'CULTURE',
            duration: '90 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Kiến trúc giao thoa Đông - Tây độc nhất vô nhị với bức bích họa Cửu Long Ẩn Vân trên trần.',
            coords: { x: 30, y: 75 }
          },
          {
            id: 'h-2-3',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Thưởng thức Cà phê Muối chính gốc đường Nguyễn Lương Bằng',
            category: 'FOOD',
            duration: '60 phút',
            price: '25.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lớp kem muối béo ngậy mặn mòi hòa cùng vị đắng cà phê phin đậm đặc khó quên.',
            coords: { x: 52, y: 58 }
          }
        ]
      }
    ]
  },
  'Quy Nhơn': {
    city: 'Quy Nhơn',
    tagline: 'Thành phố thi ca, biển xanh màu ngọc bích, Eo Gió hùng vĩ và hải sản tươi rói',
    weather: '27°C - Nắng vàng rực rỡ, biển lặng và nước trong vắt',
    season: 'Mùa biển đẹp nhất tháng 3 đến tháng 9, nước trong vắt tận đáy',
    transportInfo: 'Thuê xe máy 120k/ngày chạy cung đường biển Nhơn Lý',
    distanceFromMajor: '650 km từ Sài Gòn / 320 km từ Đà Nẵng • ~10h xe Limousine',
    recommendedDepartureTime: '19:30 tối hôm trước',
    recommendedDepartureReason: 'Khuyên đi chuyến xe đêm xuất bến 19:30, 06:30 sáng tới Quy Nhơn vừa kịp ăn bún rạm Phù Mỹ và đón bình minh Eo Gió!',
    checklist: [
      'Kem chống nắng SPF 50+ & mũ rộng vành',
      'Váy maxi màu nổi bật chụp ảnh biển',
      'Kính lặn ống thở cá nhân',
      'Túi chống nước cho điện thoại'
    ],
    budget: {
      standard: { bus: 650000, stay: 600000, bike: 240000, food: 750000, total: 2240000 },
      budget: { bus: 550000, stay: 350000, bike: 180000, food: 450000, total: 1530000 },
      vip: { bus: 950000, stay: 1600000, bike: 450000, food: 1400000, total: 4400000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bún Rạm Phù Mỹ, Đón Bình Minh Eo Gió & Cano Ra Kỳ Co',
        stops: [
          {
            id: 'qn-1-1',
            time: '07:00',
            period: 'MORNING',
            title: 'Bún Rạm & Bún Tôm Phù Mỹ (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ - 45.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt rạm đồng xào béo ngậy trộn cùng bún gạo tươi và bánh tráng nướng giòn rụm.',
            coords: { x: 50, y: 55 }
          },
          {
            id: 'qn-1-2',
            time: '08:30',
            period: 'MORNING',
            title: 'Eo Gió Nhơn Lý - Nơi ngắm hoàng hôn & bình minh đẹp nhất Việt Nam',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '25.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cung đường đi bộ ven vách núi đá với hàng rào đỏ trắng hướng thẳng ra biển bao la.',
            coords: { x: 75, y: 30 }
          },
          {
            id: 'qn-1-3',
            time: '10:30',
            period: 'MORNING',
            title: 'Kỳ Co: Lặn ngắm rạn san hô Bãi Dứa & Cầu Tàu gỗ',
            category: 'EXPERIENCE',
            duration: '150 phút',
            price: '150.000đ (Đã gồm cano)',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước biển 2 màu ngọc bích rõ rệt, bãi cát trắng mịn ôm lấy những hang đá tự nhiên.',
            coords: { x: 80, y: 25 }
          },
          {
            id: 'qn-1-4',
            time: '18:30',
            period: 'EVENING',
            title: 'Bánh xèo tôm nhảy rau mầm Gia Vỹ & Ốc đường Ngọc Hân',
            category: 'FOOD',
            duration: '90 phút',
            price: '120.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tôm đất nhảy tanh tách đúc trên khuôn gang giòn rụm, cuốn bánh tráng rau sống.',
            coords: { x: 48, y: 60 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tháp Đôi Chăm Pa, Ghềnh Ráng Tiên Sa & Mộ Hàn Mặc Tử',
        stops: [
          {
            id: 'qn-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Ghềnh Ráng Tiên Sa & Bãi Trứng chim đá cuội Hoàng Hậu',
            category: 'CULTURE',
            duration: '90 phút',
            price: '10.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hàng ngàn viên đá cuội tròn nhẵn như quả trứng khổng lồ dưới chân vách đá thi sĩ.',
            coords: { x: 45, y: 70 }
          },
          {
            id: 'qn-2-2',
            time: '15:00',
            period: 'AFTERNOON',
            title: 'Khu dã ngoại Trung Lương - Jeju phiên bản Việt Nam',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thung lũng lộng gió lọt thỏm giữa núi đá nhìn xuống bãi biển cát trắng tinh khôi.',
            coords: { x: 68, y: 35 }
          }
        ]
      }
    ]
  },
  'Ninh Bình': {
    city: 'Ninh Bình',
    tagline: 'Vịnh Hạ Long trên cạn, non nước hữu tình giữa núi đá vôi kỳ vĩ và di sản Tràng An',
    weather: '22°C - Khí hậu mát mẻ trong lành, sương sớm bao phủ sông nước',
    season: 'Mùa lúa chín vàng Tam Cốc rực rỡ & mùa sen nở rộ đầm Tràng An',
    transportInfo: 'Thuê xe máy 100k - 120k/ngày hoặc xe đạp ngắm đồng quê',
    distanceFromMajor: '95 km từ Hà Nội • ~1.5h xe Limousine cao tốc',
    recommendedDepartureTime: '06:30 sáng từ Hà Nội',
    recommendedDepartureReason: 'Chỉ mất 1.5 tiếng đi cao tốc Pháp Vân, xuất bến 06:30 là 08:00 tới Tràng An chèo đò sớm khi trời còn mát mẻ, tránh chen chúc!',
    checklist: [
      'Giày thể thao êm chân leo gần 500 bậc Hang Múa',
      'Nón lá che nắng khi ngồi thuyền đò',
      'Trang phục vintage / cổ trang chụp ảnh',
      'Tiền mặt mua vé thắng cảnh'
    ],
    budget: {
      standard: { bus: 350000, stay: 500000, bike: 180000, food: 600000, total: 1630000 },
      budget: { bus: 280000, stay: 300000, bike: 120000, food: 400000, total: 1100000 },
      vip: { bus: 550000, stay: 1500000, bike: 350000, food: 1200000, total: 3600000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Chèo Đò Tràng An Di Sản, Đỉnh Hang Múa & Dê Núi Nướng',
        stops: [
          {
            id: 'nb-1-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Chèo đò khám phá Quần thể danh thắng Tràng An',
            category: 'EXPERIENCE',
            duration: '180 phút',
            price: '250.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nên chọn tuyến 2 hoặc 3 để đi qua các hang động nhũ đá lung linh và phim trường Kong Skull Island.',
            coords: { x: 50, y: 45 }
          },
          {
            id: 'nb-1-2',
            time: '12:30',
            period: 'NOON',
            title: 'Cơm cháy sốt tim cật & Dê núi nướng tảng Chính Thư',
            category: 'FOOD',
            duration: '60 phút',
            price: '180.000đ / người',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thịt dê núi thả rông săn chắc chấm tương gừng đậm đà và cơm cháy vàng ruộm.',
            coords: { x: 45, y: 55 }
          },
          {
            id: 'nb-1-3',
            time: '16:00',
            period: 'AFTERNOON',
            title: 'Chinh phục Đỉnh Hang Múa ngắm trọn thung lũng Tam Cốc',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Leo gần 500 bậc thang đá đón ánh hoàng hôn vàng rực buông xuống dòng sông Ngô Đồng uốn lượn.',
            coords: { x: 55, y: 65 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Chùa Bái Đính Nguy Nga & Cố Đô Hoa Lư',
        stops: [
          {
            id: 'nb-2-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Quần thể Chùa Bái Đính giữ nhiều kỷ lục châu Á',
            category: 'CULTURE',
            duration: '150 phút',
            price: '60.000đ (Xe điện)',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chiêm bái hành lang 500 vị La Hán bằng đá xanh và Bảo tháp cao nhất Đông Nam Á.',
            coords: { x: 30, y: 35 }
          },
          {
            id: 'nb-2-2',
            time: '14:00',
            period: 'AFTERNOON',
            title: 'Cố đô Hoa Lư đền vua Đinh Tiên Hoàng & vua Lê Đại Hành',
            category: 'CULTURE',
            duration: '90 phút',
            price: '20.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lắng nghe những điển tích lịch sử hào hùng dựng nước Đại Cồ Việt thời lập đô.',
            coords: { x: 40, y: 38 }
          }
        ]
      }
    ]
  },
  'Hà Giang': {
    city: 'Hà Giang',
    tagline: 'Miền đá nở hoa, đỉnh đèo Mã Pí Lèng huyền thoại và dòng sông Nho Quế ngọc bích',
    weather: '16°C - Se lạnh vùng cao, đêm lạnh cần áo khoác ấm dày dặn',
    season: 'Mùa hoa tam giác mạch hồng tím & mùa lúa bậc thang Hoàng Su Phì',
    transportInfo: 'Thuê xe máy cào cào / xe số bán tự động 150k - 180k/ngày',
    distanceFromMajor: '300 km từ Hà Nội • ~6h xe Limousine giường nằm',
    recommendedDepartureTime: '21:00 tối hôm trước từ Hà Nội',
    recommendedDepartureReason: 'Lên xe lúc 21:00 tại Mỹ Đình, ngủ một giấc sâu trên xe giường nằm cao cấp, 04:30 sáng tới TP Hà Giang nhận xe máy chinh phục đèo dốc!',
    checklist: [
      'Áo khoác gió dày chống rét & găng tay ấm',
      'Giáp bảo hộ tay chân khi lái xe máy đèo',
      'Bằng lái xe máy & CCCD hợp lệ',
      'Sạc dự phòng dung lượng lớn & thuốc chống say'
    ],
    budget: {
      standard: { bus: 600000, stay: 600000, bike: 350000, food: 750000, total: 2300000 },
      budget: { bus: 500000, stay: 400000, bike: 300000, food: 500000, total: 1700000 },
      vip: { bus: 900000, stay: 1600000, bike: 600000, food: 1400000, total: 4500000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Cổng Trời Quản Bạ, Dốc Thẩm Mã & Phố Cổ Đồng Văn',
        stops: [
          {
            id: 'hg-1-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Bánh cuốn chan nước xương nóng hổi tại TP. Hà Giang',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ - 45.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bánh cuốn tráng mỏng trứng lòng đào ăn kèm bát nước súp hầm xương đậm đà rau mùi.',
            coords: { x: 30, y: 70 }
          },
          {
            id: 'hg-1-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Cổng Trời Quản Bạ & Núi Đôi Cô Tiên tuyệt tác thiên nhiên',
            category: 'CHECKIN',
            duration: '60 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Điểm chạm đầu tiên của cao nguyên đá Đồng Văn mây mù bao phủ quanh năm.',
            coords: { x: 40, y: 60 }
          },
          {
            id: 'hg-1-3',
            time: '14:30',
            period: 'AFTERNOON',
            title: 'Check-in Dốc Thẩm Mã huyền thoại uốn lượn 9 khúc',
            category: 'CHECKIN',
            duration: '45 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Các em bé H’Mông gùi hoa tam giác mạch đứng bên vệ dốc chụp ảnh rất dễ thương.',
            coords: { x: 55, y: 45 }
          },
          {
            id: 'hg-1-4',
            time: '19:00',
            period: 'EVENING',
            title: 'Phố Cổ Đồng Văn: Lẩu gà đen H’Mông & Thắng dền ngọt bùi',
            category: 'FOOD',
            duration: '90 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ngồi trong ngôi nhà trình tường cổ kính thưởng thức lẩu gà đen nghi ngút khói giữa đêm rét.',
            coords: { x: 70, y: 35 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Cột Cờ Lũng Cú, Đèo Mã Pí Lèng & Thuyền Sông Nho Quế',
        stops: [
          {
            id: 'hg-2-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Cột Cờ Lũng Cú - Điểm cực Bắc thiêng liêng của Tổ quốc',
            category: 'CULTURE',
            duration: '90 phút',
            price: '25.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Lá cờ Tổ quốc 54m² tượng trưng cho 54 dân tộc anh em bay phấp phới trong gió đại ngàn.',
            coords: { x: 75, y: 15 }
          },
          {
            id: 'hg-2-2',
            time: '11:00',
            period: 'MORNING',
            title: 'Chinh phục Đèo Mã Pí Lèng - Vua của tứ đại đỉnh đèo',
            category: 'EXPERIENCE',
            duration: '60 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cung đèo hiểm trở bậc nhất nhìn xuống hẻm vực sâu thăm thẳm và dòng sông Nho Quế như sợi chỉ xanh.',
            coords: { x: 82, y: 38 }
          },
          {
            id: 'hg-2-3',
            time: '14:00',
            period: 'AFTERNOON',
            title: 'Du thuyền Hẻm Tu Sản ngắm sông Nho Quế màu xanh ngọc bích',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: '120.000đ (Vé thuyền)',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hẻm vực sâu nhất Đông Nam Á với vách đá dựng đứng cao gần 1.000m kỳ vĩ đến nghẹt thở.',
            coords: { x: 85, y: 45 }
          }
        ]
      }
    ]
  },
  'Măng Đen': {
    city: 'Măng Đen',
    tagline: 'Thiên đường sinh thái đại ngàn Kon Tum, không khí mát lạnh quanh năm và rừng thông hoang sơ',
    weather: '18°C - Mát mẻ quanh năm, sương giăng lối mộng mơ ví như Đà Lạt thứ hai',
    season: 'Mùa hoa mai anh đào nở rộ tháng 12 - tháng 2 & mùa sim tím ngút ngàn',
    transportInfo: 'Thuê xe máy 120k/ngày chạy xuyên rừng thông',
    distanceFromMajor: '50 km từ TP. Kon Tum • ~10h xe Limousine từ Sài Gòn',
    recommendedDepartureTime: '19:00 tối hôm trước từ Sài Gòn',
    recommendedDepartureReason: 'Chọn xe limousine phòng riêng xuất bến 19:00 từ Bến xe Miền Đông, sáng sớm 06:00 đến Măng Đen thức dậy giữa rừng thông bạt ngàn mát lạnh!',
    checklist: [
      'Áo ấm & khăn choàng nhẹ chống sương lạnh',
      'Giày đi bộ suối thác chống trơn trượt',
      'Xịt chống côn trùng rừng tự nhiên',
      'Máy ảnh bắt khoảnh khắc sương sớm đại ngàn'
    ],
    budget: {
      standard: { bus: 700000, stay: 550000, bike: 240000, food: 650000, total: 2140000 },
      budget: { bus: 550000, stay: 350000, bike: 180000, food: 450000, total: 1530000 },
      vip: { bus: 1000000, stay: 1500000, bike: 400000, food: 1300000, total: 4200000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bánh Canh A Kay, Thác Pa Sỹ & Gà Nướng Cơm Lam',
        stops: [
          {
            id: 'md-1-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Bánh canh cá lóc A Kay sôi sùng sục trong thố đất',
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ - 45.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nước dùng ngọt lịm từ xương cá, sợi bánh canh dai dẻo ăn cùng đĩa rau đắng tươi mát.',
            coords: { x: 45, y: 50 }
          },
          {
            id: 'md-1-2',
            time: '09:30',
            period: 'MORNING',
            title: 'Khu du lịch sinh thái Thác Pa Sỹ bọt tung trắng xóa',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '20.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Dòng thác đổ từ độ cao 45m giữa rừng nguyên sinh đại ngàn hùng vĩ.',
            coords: { x: 35, y: 40 }
          },
          {
            id: 'md-1-3',
            time: '12:30',
            period: 'NOON',
            title: 'Gà nướng than hoa cơm lam cô Sinh trứ danh',
            category: 'FOOD',
            duration: '60 phút',
            price: '240.000đ / con',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Gà đồi ướp lá tiêu rừng nướng than hồng da giòn rụm chấm muối ớt é cay nồng.',
            coords: { x: 50, y: 55 }
          },
          {
            id: 'md-1-4',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Hồ Đăk Ke chèo thuyền đạp vịt ngắm hoa mai anh đào',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '30.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hồ nước phẳng lặng trong xanh như gương soi bóng rặng thông cổ thụ yên bình.',
            coords: { x: 60, y: 60 }
          }
        ]
      }
    ]
  },
  'Phan Thiết': {
    city: 'Phan Thiết',
    tagline: 'Thủ phủ resort biển xanh cát trắng, đồi cát bay kỳ vĩ và hải sản làng chài tươi rói',
    weather: '28°C - Nắng ấm biển xanh, gió lộng quanh năm',
    season: 'Mùa nắng đẹp từ tháng 11 đến tháng 5, biển trong xanh êm ả',
    transportInfo: 'Thuê xe Jeep vượt đồi cát hoặc xe máy 120k/ngày',
    distanceFromMajor: '200 km từ Sài Gòn • ~2.5h xe Limousine cao tốc',
    recommendedDepartureTime: '06:00 sáng từ Sài Gòn',
    recommendedDepartureReason: 'Nhờ cao tốc Dầu Giây - Phan Thiết chỉ mất 2.5 tiếng, đi xe 06:00 sáng là 08:30 có mặt thưởng thức bánh căn xíu mại!',
    checklist: [
      'Kính mát & kem chống nắng',
      'Khăn trùm chống cát khi đi đồi cát bay',
      'Đồ bơi & dép lào đi biển',
      'Trang phục màu nổi chụp đồi cát'
    ],
    budget: {
      standard: { bus: 400000, stay: 650000, bike: 240000, food: 750000, total: 2040000 },
      budget: { bus: 320000, stay: 350000, bike: 180000, food: 450000, total: 1300000 },
      vip: { bus: 650000, stay: 1800000, bike: 450000, food: 1500000, total: 4400000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bánh Căn Xíu Mại, Suối Tiên & Chạy Xe Jeep Đồi Cát Bay',
        stops: [
          {
            id: 'pt-1-1',
            time: '08:30',
            period: 'MORNING',
            title: 'Bánh căn xíu mại trứng cút nóng giòn (Ăn sáng)',
            category: 'FOOD',
            duration: '45 phút',
            price: '40.000đ / đĩa',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bánh đúc khuôn đất giòn xốp ngập trong chén xíu mại da heo và mỡ hành thơm nức.',
            coords: { x: 45, y: 55 }
          },
          {
            id: 'pt-1-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Lội dòng Suối Tiên ngắm tháp nhũ cát đỏ cam kỳ vĩ',
            category: 'CHECKIN',
            duration: '75 phút',
            price: '15.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Đi chân trần cảm nhận làn nước mát lành và vách đất sét tự nhiên như chốn bồng lai.',
            coords: { x: 60, y: 50 }
          },
          {
            id: 'pt-1-3',
            time: '15:30',
            period: 'AFTERNOON',
            title: 'Đồi Cát Bay Mũi Né: Chạy xe Jeep vượt đồi cát & Trượt ván',
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '150.000đ (Xe Jeep)',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Khung giờ chiều gió dịu và đồi cát chuyển màu vàng cam rực rỡ dưới ánh hoàng hôn.',
            coords: { x: 75, y: 40 }
          },
          {
            id: 'pt-1-4',
            time: '18:30',
            period: 'EVENING',
            title: 'Lẩu Thả Phan Thiết & Bữa tiệc hải sản Bờ Kè Mũi Né',
            category: 'FOOD',
            duration: '90 phút',
            price: '200.000đ / người',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Cá mai tươi rói xếp cánh hoa hoa chuối ăn cùng nước lẩu nước dùng chua cay đặc sản.',
            coords: { x: 65, y: 60 }
          }
        ]
      }
    ]
  },
  'Phú Quốc': {
    city: 'Phú Quốc',
    tagline: 'Đảo Ngọc thiên đường nhiệt đới, bãi cát mịn như kem, hoàng hôn rực lửa và hải sản đảo trù phú',
    weather: '28°C - Nắng vàng biển ngọc, gió đại dương trong lành',
    season: 'Mùa khô tháng 11 đến tháng 4, biển êm như gương và hoàng hôn đẹp mê hồn',
    transportInfo: 'Thuê xe máy 120k - 150k/ngày hoặc Taxi đảo',
    distanceFromMajor: 'Xe khách giường nằm kết nối bến tàu Rạch Giá / Hà Tiên đi Đảo Ngọc',
    recommendedDepartureTime: '22:00 đêm hôm trước',
    recommendedDepartureReason: 'Đi xe giường nằm đêm từ Sài Gòn tới bến Rạch Giá/Hà Tiên lúc 05:30 sáng, ăn sáng bún cá rồi lên tàu cao tốc 07:00 lướt sóng ra đảo ngọc.',
    checklist: [
      'Kem chống nắng sinh học an toàn rạn san hô',
      'Đồ bơi & kính bơi lặn ngắm san hô',
      'Váy maxi & áo hoa lá sặc sỡ chụp ảnh',
      'Túi chống nước điện thoại khi đi cano'
    ],
    budget: {
      standard: { bus: 900000, stay: 900000, bike: 300000, food: 1100000, total: 3200000 },
      budget: { bus: 750000, stay: 500000, bike: 240000, food: 700000, total: 2190000 },
      vip: { bus: 1500000, stay: 2800000, bike: 600000, food: 2200000, total: 7100000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Bún Quậy Kiến Xây, Bãi Sao Cát Trắng & Hoàng Hôn Sunset Sanato',
        stops: [
          {
            id: 'pq-1-1',
            time: '08:00',
            period: 'MORNING',
            title: 'Bún Quậy Kiến Xây tự pha chén nước chấm gia truyền',
            category: 'FOOD',
            duration: '45 phút',
            price: '55.000đ - 70.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Chả tôm, chả cá xay tươi quết thẳng vào đáy tô, chan nước luộc bún sôi sùng sục thơm nức.',
            coords: { x: 45, y: 45 }
          },
          {
            id: 'pq-1-2',
            time: '10:00',
            period: 'MORNING',
            title: 'Tắm biển Bãi Sao - Bãi cát trắng mịn như kem và hàng dừa nghiêng',
            category: 'EXPERIENCE',
            duration: '120 phút',
            price: 'Miễn phí',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bãi biển đẹp nhất Phú Quốc với làn nước xanh ngọc bích phẳng lặng không một gợn sóng.',
            coords: { x: 70, y: 75 }
          },
          {
            id: 'pq-1-3',
            time: '16:30',
            period: 'AFTERNOON',
            title: 'Sunset Sanato: Ngắm hoàng hôn rực lửa & Voi chân dài trên biển',
            category: 'CHECKIN',
            duration: '90 phút',
            price: '100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Điểm ngắm hoàng hôn buông xuống biển Tây đẹp mê hồn với các tác phẩm điêu khắc nghệ thuật.',
            coords: { x: 40, y: 60 }
          },
          {
            id: 'pq-1-4',
            time: '19:30',
            period: 'EVENING',
            title: 'Chợ Đêm Phú Quốc: Thưởng thức Nhum nướng mỡ hành & Gỏi cá trích',
            category: 'FOOD',
            duration: '120 phút',
            price: '180.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nhum biển nướng thơm lừng béo ngậy, rắc thêm đậu phộng rang giòn ăn kèm muối tiêu chanh.',
            coords: { x: 48, y: 48 }
          }
        ]
      }
    ]
  }
};

/**
 * Động cơ tự động sinh lịch trình linh hoạt (Dynamic Fallback Engine)
 * Đảm bảo 100% các địa phương trên toàn quốc khi người dùng nhập đều có lịch trình chân thực,
 * không bao giờ bị rơi về Đà Lạt khi người dùng tra cứu địa danh khác.
 */
const generateDynamicDestinationTemplate = (city: string): DestinationData => {
  return {
    city,
    tagline: `Khám phá vẻ đẹp kỳ thú, đặc sản trứ danh và những trải nghiệm bản địa đặc sắc tại ${city}`,
    weather: '25°C - Thời tiết thuận lợi, nắng ấm ban ngày và mát mẻ ban đêm',
    season: 'Thời điểm lý tưởng nhất trong năm để du lịch và trải nghiệm',
    transportInfo: 'Thuê xe máy 120k - 150k/ngày hoặc Taxi công nghệ nội thành',
    distanceFromMajor: `Tuyến xe khách kết nối liên tỉnh trực tiếp tới ${city}`,
    recommendedDepartureTime: 'Chuyến xe đêm hoặc sáng sớm',
    recommendedDepartureReason: `Bạn nên chọn chuyến xe đêm hoặc xuất bến lúc 06:30 sáng để kịp có mặt tại ${city} vào đầu ngày, tiết kiệm tối đa thời gian di chuyển.`,
    checklist: [
      'CCCD / Giấy tờ tùy thân để nhận phòng và thuê xe',
      'Trang phục phù hợp thời tiết & đồ bơi / áo khoác ấm',
      'Giày thể thao êm chân & dép sandal',
      'Sạc dự phòng, máy ảnh & thuốc cá nhân cơ bản'
    ],
    budget: {
      standard: { bus: 600000, stay: 600000, bike: 250000, food: 750000, total: 2200000 },
      budget: { bus: 500000, stay: 350000, bike: 200000, food: 450000, total: 1500000 },
      vip: { bus: 850000, stay: 1400000, bike: 500000, food: 1400000, total: 4150000 }
    },
    days: [
      {
        dayNumber: 1,
        title: `Chào Đón ${city} - Điểm Đến Check-in & Đặc Sản Bản Địa`,
        stops: [
          {
            id: 'dyn-1-1',
            time: '07:30',
            period: 'MORNING',
            title: `Thưởng thức bữa sáng đặc sản nổi tiếng tại ${city}`,
            category: 'FOOD',
            duration: '45 phút',
            price: '35.000đ - 55.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Quán bản địa lâu năm được người dân địa phương ưa chuộng.',
            coords: { x: 45, y: 40 }
          },
          {
            id: 'dyn-1-2',
            time: '09:30',
            period: 'MORNING',
            title: `Khu thắng cảnh & Danh lam tiêu biểu trung tâm ${city}`,
            category: 'CHECKIN',
            duration: '90 phút',
            price: 'Miễn phí / 30.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thời điểm ánh sáng trong trẻo nhất để chụp toàn cảnh.',
            coords: { x: 55, y: 35 }
          },
          {
            id: 'dyn-1-3',
            time: '12:00',
            period: 'NOON',
            title: `Bữa trưa ẩm thực truyền thống địa phương`,
            category: 'FOOD',
            duration: '60 phút',
            price: '120.000đ - 180.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Thưởng thức các món đặc sản vùng miền nấu theo công thức bản xứ.',
            coords: { x: 50, y: 55 }
          },
          {
            id: 'dyn-1-4',
            time: '15:30',
            period: 'AFTERNOON',
            title: `Trải nghiệm văn hóa & Điểm ngắm hoàng hôn đẹp nhất`,
            category: 'EXPERIENCE',
            duration: '90 phút',
            price: '50.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nên có mặt trước 17:00 để bắt trọn khoảnh khắc hoàng hôn lãng mạn.',
            coords: { x: 65, y: 65 }
          },
          {
            id: 'dyn-1-5',
            time: '19:00',
            period: 'EVENING',
            title: `Chợ đêm & Khám phá ẩm thực đường phố ${city}`,
            category: 'CULTURE',
            duration: '120 phút',
            price: '50.000đ - 100.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80',
            localTip: 'Dạo bộ thảnh thơi, thử các món ăn vặt đường phố và mua quà lưu niệm.',
            coords: { x: 40, y: 50 }
          }
        ]
      },
      {
        dayNumber: 2,
        title: `Hành Trình Khám Phá Ngoại Thành & Trải Nghiệm Chuyên Sâu`,
        stops: [
          {
            id: 'dyn-2-1',
            time: '08:00',
            period: 'MORNING',
            title: `Cung đường thiên nhiên ngoạn mục & Làng nghề truyền thống`,
            category: 'CULTURE',
            duration: '120 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tìm hiểu nghề truyền thống và đời sống sinh hoạt của bà con địa phương.',
            coords: { x: 30, y: 30 }
          },
          {
            id: 'dyn-2-2',
            time: '12:00',
            period: 'NOON',
            title: `Cơm quê / Hải sản / Đặc sản núi rừng bản địa`,
            category: 'FOOD',
            duration: '60 phút',
            price: '150.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
            localTip: 'Nguyên liệu tươi mới trong ngày mang đậm hương vị địa phương.',
            coords: { x: 35, y: 60 }
          },
          {
            id: 'dyn-2-3',
            time: '15:30',
            period: 'AFTERNOON',
            title: `Quán Cafe phong cảnh đẹp / Điểm nghỉ ngơi thư giãn`,
            category: 'CHECKIN',
            duration: '90 phút',
            price: '45.000đ - 65.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
            localTip: 'Không gian mở thoáng đãng, ngắm nhìn phong cảnh thiên nhiên êm đềm.',
            coords: { x: 60, y: 70 }
          },
          {
            id: 'dyn-2-4',
            time: '19:00',
            period: 'EVENING',
            title: `Tiệc nướng BBQ hoặc Lẩu ấm cúng buổi tối`,
            category: 'FOOD',
            duration: '90 phút',
            price: '200.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            localTip: 'Bữa tối sum vầy bên bạn bè, trò chuyện và tận hưởng không khí trong lành.',
            coords: { x: 50, y: 45 }
          }
        ]
      },
      {
        dayNumber: 3,
        title: `Mua Sắm Đặc Sản Làm Quà & Tạm Biệt ${city}`,
        stops: [
          {
            id: 'dyn-3-1',
            time: '08:00',
            period: 'MORNING',
            title: `Bữa sáng nhẹ nhàng & Cà phê sáng ngắm phố phường`,
            category: 'FOOD',
            duration: '60 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Tận hưởng nhịp sống chậm rãi trước khi trở về.',
            coords: { x: 45, y: 45 }
          },
          {
            id: 'dyn-3-2',
            time: '09:30',
            period: 'MORNING',
            title: `Chợ trung tâm hoặc Cửa hàng đặc sản uy tín`,
            category: 'CULTURE',
            duration: '90 phút',
            price: 'Tùy chọn',
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
            localTip: 'Hỏi giá trước và chọn các sản phẩm có nhãn mác xuất xứ rõ ràng.',
            coords: { x: 50, y: 50 }
          }
        ]
      }
    ]
  };
};

/**
 * Gợi ý điểm xuất phát tối ưu theo điểm đến để khớp nối tuyến xe trong Database
 */
const getSmartOriginForDestination = (dest: string): string => {
  const northDestinations = ['Sa Pa', 'Ninh Bình', 'Hà Giang', 'Hạ Long', 'Hải Phòng', 'Cao Bằng', 'Mộc Châu'];
  if (northDestinations.includes(dest)) return 'Hà Nội';
  if (dest === 'Huế' || dest === 'Quy Nhơn') return 'Đà Nẵng';
  return 'TP. Hồ Chí Minh';
};

export const SchedulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: PLANNER (Cẩm Nang & Lịch Trình) vs TIMETABLE (Bảng Giờ Chạy Xe Định Kỳ)
  const [viewMode, setViewMode] = useState<PageViewMode>('PLANNER');

  // Query Parameters
  const paramDestination = searchParams.get('destination') || 'Đà Lạt';
  const paramOrigin = searchParams.get('origin') || getSmartOriginForDestination(paramDestination);

  const [destinationInput, setDestinationInput] = useState(paramDestination);
  const [originInput, setOriginInput] = useState(paramOrigin);
  const [durationOption, setDurationOption] = useState('3N2Đ');
  const [travelVibe, setTravelVibe] = useState<TravelVibe>('CHILL');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('STANDARD');

  // Active Destination Template (Tìm trong 12 template chuyên sâu hoặc tự động sinh theo địa phương bất kỳ)
  const activeTemplate: DestinationData = useMemo(() => {
    return DESTINATION_TEMPLATES[destinationInput] || generateDynamicDestinationTemplate(destinationInput);
  }, [destinationInput]);

  // Active Day in Planner
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // User Customizable Stops for active destination
  const [customDays, setCustomDays] = useState(activeTemplate.days);
  useEffect(() => {
    setCustomDays(activeTemplate.days);
    setActiveDayIndex(0);
  }, [activeTemplate]);

  // Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // Add Stop Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStopTitle, setNewStopTitle] = useState('');
  const [newStopTime, setNewStopTime] = useState('14:00');
  const [newStopCategory, setNewStopCategory] = useState<'FOOD' | 'CHECKIN' | 'CULTURE' | 'EXPERIENCE'>('CHECKIN');
  const [newStopTip, setNewStopTip] = useState('');
  const [newStopPrice, setNewStopPrice] = useState('50.000đ');

  // AI Assistant Drawer State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string; route?: string }>>([
    {
      sender: 'AI',
      text: `Xin chào! Tôi là Trợ Lý Cố Vấn Du Lịch TravelEasy. Tôi có thể hỗ trợ bạn lên lịch trình khám phá ${destinationInput}, tư vấn quán ăn bản địa, hoặc gợi ý chuyến xe khách giường nằm phù hợp nhất!`
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Backend Timetable Data (for Smart Transport Bridge & Timetable Mode)
  const [timetableData, setTimetableData] = useState<RouteScheduleResponse | null>(null);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // Timetable Mode Specific States
  const [directionTab, setDirectionTab] = useState<DirectionTab>('OUTBOUND');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('ALL');
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  // Fetch timetable on mount and when origin/destination change
  useEffect(() => {
    fetchTimetable(originInput, destinationInput);
  }, [originInput, destinationInput]);

  const fetchTimetable = async (fromCity: string, toCity: string) => {
    try {
      setTimetableLoading(true);
      const res = await api.get('/trips/schedule', {
        params: { origin: fromCity, destination: toCity }
      });
      if (res.data?.data) {
        setTimetableData(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng lịch trình:', err);
    } finally {
      setTimetableLoading(false);
    }
  };

  const handleSearchExplore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationInput) return;
    const resolvedOrigin = getSmartOriginForDestination(destinationInput);
    setOriginInput(resolvedOrigin);
    setSearchParams({ origin: resolvedOrigin, destination: destinationInput });
  };

  const handleSwapCities = () => {
    const temp = originInput;
    setOriginInput(destinationInput);
    setDestinationInput(temp);
    setSearchParams({ origin: destinationInput, destination: temp });
  };

  // Add stop to current day
  const handleAddStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopTitle.trim()) return;

    const newStop: ItineraryStop = {
      id: `custom-${Date.now()}`,
      time: newStopTime,
      period: parseInt(newStopTime.split(':')[0]) < 12 ? 'MORNING' : 'AFTERNOON',
      title: newStopTitle.trim(),
      category: newStopCategory,
      duration: '60 phút',
      price: newStopPrice.trim() || 'Miễn phí',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
      localTip: newStopTip.trim() || 'Địa điểm do bạn thêm vào hành trình khám phá.',
      coords: { x: 50, y: 50 }
    };

    setCustomDays(prev => {
      const copy = [...prev];
      if (copy[activeDayIndex]) {
        copy[activeDayIndex].stops = [...copy[activeDayIndex].stops, newStop].sort((a, b) => a.time.localeCompare(b.time));
      }
      return copy;
    });

    setNewStopTitle('');
    setNewStopTip('');
    setIsAddModalOpen(false);
  };

  // Remove a stop
  const handleDeleteStop = (stopId: string) => {
    setCustomDays(prev => {
      const copy = [...prev];
      if (copy[activeDayIndex]) {
        copy[activeDayIndex].stops = copy[activeDayIndex].stops.filter(s => s.id !== stopId);
      }
      return copy;
    });
  };

  // Google Calendar Sync Link Generator
  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Du lịch ${destinationInput} cùng TravelEasy (${durationOption})`);
    const details = encodeURIComponent(`Lịch trình chi tiết khám phá ${destinationInput} được lập tự động từ TravelEasy Platform. Chúc bạn có một chuyến đi tuyệt vời!`);
    const location = encodeURIComponent(`${destinationInput}, Việt Nam`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  // AI Chat Submission
  const handleSendAiMessage = async (textToSend?: string) => {
    const query = (textToSend || aiInput).trim();
    if (!query) return;

    setAiMessages(prev => [...prev, { sender: 'USER', text: query }]);
    if (!textToSend) setAiInput('');

    try {
      setAiLoading(true);
      const res = await api.post('/ai/chat', {
        message: query,
        contextCity: destinationInput
      });

      if (res.data?.data) {
        setAiMessages(prev => [
          ...prev,
          {
            sender: 'AI',
            text: res.data.data.reply,
            route: res.data.data.suggestedRoute
          }
        ]);
      }
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text: 'Xin lỗi bạn, kết nối đến Trợ lý AI đang bận. Vui lòng thử lại sau giây lát!'
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Best recommended trip for the smart bridge
  const recommendedTrip: ScheduleTripItem | null = useMemo(() => {
    if (!timetableData?.outboundTrips || timetableData.outboundTrips.length === 0) return null;
    // Prefer evening sleeper bus or earliest morning bus
    const nightTrip = timetableData.outboundTrips.find(t => {
      const h = new Date(t.departureTime).getHours();
      return h >= 21 || h <= 5;
    });
    return nightTrip || timetableData.outboundTrips[0];
  }, [timetableData]);

  // Timetable Filter Logic
  const filteredTimetableTrips = useMemo(() => {
    if (!timetableData) return [];
    const trips = directionTab === 'OUTBOUND' ? timetableData.outboundTrips : timetableData.inboundTrips;
    if (!trips) return [];

    return trips.filter(trip => {
      if (timeSlot === 'ALL') return true;
      const hour = new Date(trip.departureTime).getHours();
      if (timeSlot === 'EARLY') return hour >= 0 && hour < 6;
      if (timeSlot === 'MORNING') return hour >= 6 && hour < 12;
      if (timeSlot === 'AFTERNOON') return hour >= 12 && hour < 18;
      if (timeSlot === 'EVENING') return hour >= 18 && hour < 24;
      return true;
    });
  }, [timetableData, directionTab, timeSlot]);

  // Timetable Pagination Logic (20 chuyến / trang, chia theo tổng số)
  const [timetablePage, setTimetablePage] = useState(1);
  const TIMETABLE_PAGE_SIZE = 20;

  useEffect(() => {
    setTimetablePage(1);
  }, [directionTab, timeSlot, timetableData]);

  const totalTimetablePages = Math.ceil(filteredTimetableTrips.length / TIMETABLE_PAGE_SIZE) || 1;
  const paginatedTimetableTrips = useMemo(() => {
    const start = (timetablePage - 1) * TIMETABLE_PAGE_SIZE;
    return filteredTimetableTrips.slice(start, start + TIMETABLE_PAGE_SIZE);
  }, [filteredTimetableTrips, timetablePage]);

  // Active Day Stops
  const currentDayStops = customDays[activeDayIndex]?.stops || [];

  return (
    <div className="schedule-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '70px', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print, header, footer, .navbar-container, .floating-ai-btn { display: none !important; }
          .schedule-page { background: #fff !important; padding: 0 !important; }
          .page-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .timeline-card { break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; border: 1px solid #cbd5e1 !important; margin-bottom: 12px !important; }
          body { font-size: 11pt; color: #000; }
        }
      `}</style>

      {/* Top Bar: View Mode Switcher */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: '#fff', borderBottom: '1px solid #1e293b', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Chế độ hiển thị:</span>
            <div style={{ display: 'inline-flex', backgroundColor: '#1e293b', borderRadius: '8px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setViewMode('PLANNER')}
                style={{
                  backgroundColor: viewMode === 'PLANNER' ? '#2563eb' : 'transparent',
                  color: viewMode === 'PLANNER' ? '#fff' : '#94a3b8',
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Compass size={14} /> Cẩm Nang & Lịch Trình Du Lịch
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TIMETABLE')}
                style={{
                  backgroundColor: viewMode === 'TIMETABLE' ? '#2563eb' : 'transparent',
                  color: viewMode === 'TIMETABLE' ? '#fff' : '#94a3b8',
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Clock size={14} /> Bảng Giờ Xe Chạy Định Kỳ
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Printer size={14} /> In / Xuất PDF
            </button>
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                color: '#93c5fd',
                border: '1px solid rgba(37, 99, 235, 0.4)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <Calendar size={14} /> Đồng Bộ Google Calendar
            </a>
          </div>
        </div>
      </div>

      {/* HERO EXPLORE BAR */}
      <div style={{ background: 'linear-gradient(135deg, #091c3e 0%, #173873 50%, #1e3a8a 100%)', color: '#fff', padding: '36px 20px 48px', position: 'relative' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 14px', borderRadius: '20px', width: 'fit-content', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
            <Sparkles size={15} style={{ color: '#fbbf24' }} /> CÔNG CỤ LẬP KẾ HOẠCH DU LỊCH & ĐỀ XUẤT XE KHÁCH THÔNG MINH
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Cẩm Nang Du Lịch & Lịch Trình Khám Phá: {destinationInput}
          </h1>
          <p style={{ margin: '0 0 24px 0', opacity: 0.9, fontSize: '15px', maxWidth: '780px', lineHeight: 1.5 }}>
            {activeTemplate.tagline}
          </p>

          {/* Explore Search Controls Card */}
          <div className="no-print" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '18px 24px', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <form onSubmit={handleSearchExplore} style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Destination Input with Datalist */}
              <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  📍 Điểm Đến Du Lịch
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    list="destinations-explore"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="Chọn hoặc nhập: Đà Lạt, Sa Pa, Nha Trang..."
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <datalist id="destinations-explore">
                    <option value="Đà Lạt" />
                    <option value="Sa Pa" />
                    <option value="Đà Nẵng" />
                    <option value="Nha Trang" />
                    <option value="Quy Nhơn" />
                    <option value="Ninh Bình" />
                    <option value="Hà Giang" />
                    <option value="Vũng Tàu" />
                    <option value="Măng Đen" />
                    <option value="Huế" />
                    <option value="Phan Thiết" />
                    <option value="Phú Quốc" />
                    <option value="Hạ Long" />
                    <option value="Cần Thơ" />
                    <option value="Hải Phòng" />
                  </datalist>
                  <MapPin size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
                </div>
              </div>

              {/* Duration Select */}
              <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  ⏱ Thời Lượng Chuyến Đi
                </label>
                <select
                  value={durationOption}
                  onChange={(e) => setDurationOption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="2N1Đ">2 Ngày 1 Đêm (Cuối tuần)</option>
                  <option value="3N2Đ">3 Ngày 2 Đêm (Tiêu chuẩn)</option>
                  <option value="4N3Đ">4 Ngày 3 Đêm (Trọn vẹn)</option>
                  <option value="Trong ngày">Trong ngày (Quick Trip)</option>
                </select>
              </div>

              {/* Vibe / Persona Select */}
              <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  🎒 Gu Du Lịch (Vibe)
                </label>
                <select
                  value={travelVibe}
                  onChange={(e) => setTravelVibe(e.target.value as TravelVibe)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="CHILL">🍃 Chill & Nghỉ dưỡng thư giãn</option>
                  <option value="CHECKIN">📸 Check-in sống ảo & Hot Trend</option>
                  <option value="FOOD">🍜 Foodtour & Trải nghiệm ẩm thực</option>
                  <option value="ADVENTURE">🏍️ Phượt, leo núi & Khám phá đèo</option>
                </select>
              </div>

              {/* Submit Explore Button */}
              <div style={{ alignSelf: 'flex-end', marginBottom: '1px' }}>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                    height: '45px'
                  }}
                >
                  <Search size={17} /> Khám Phá Lịch Trình
                </button>
              </div>
            </form>

            {/* Quick destination chips */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Gợi ý điểm đến toàn quốc:</span>
              {[
                'Đà Lạt',
                'Sa Pa',
                'Đà Nẵng',
                'Nha Trang',
                'Quy Nhơn',
                'Ninh Bình',
                'Hà Giang',
                'Vũng Tàu',
                'Măng Đen',
                'Huế',
                'Phan Thiết',
                'Phú Quốc',
              ].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setDestinationInput(city);
                    const from = getSmartOriginForDestination(city);
                    setOriginInput(from);
                    setSearchParams({ origin: from, destination: city });
                  }}
                  style={{
                    background: destinationInput === city ? '#eff6ff' : '#f8fafc',
                    color: destinationInput === city ? '#2563eb' : '#475569',
                    border: destinationInput === city ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Container */}
      <div className="page-container" style={{ maxWidth: '1240px', margin: '-18px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* DESTINATION HIGHLIGHT STRIP */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '14px',
          padding: '16px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sun size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Thời Tiết Hiện Tại</div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{activeTemplate.weather}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sunrise size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Mùa Đặc Trưng</div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{activeTemplate.season}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Navigation size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Di Chuyển Nội Thành</div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{activeTemplate.transportInfo}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bus size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Di Chuyển Xe Khách</div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{activeTemplate.distanceFromMajor}</div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CHẾ ĐỘ 1: CẨM NANG & LỊCH TRÌNH DU LỊCH (65% CỘT TRÁI - 35% CỘT PHẢI)
            ========================================================================= */}
        {viewMode === 'PLANNER' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
            
            {/* CỘT TRÁI (65%): TIMELINE & CẨM NANG CHI TIẾT */}
            <div>
              {/* Day Tab Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {customDays.map((d, idx) => (
                    <button
                      key={d.dayNumber}
                      type="button"
                      onClick={() => setActiveDayIndex(idx)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: activeDayIndex === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: activeDayIndex === idx ? '#eff6ff' : '#fff',
                        color: activeDayIndex === idx ? '#1d4ed8' : '#475569',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Ngày {d.dayNumber}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="no-print"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Plus size={16} /> Thêm Địa Điểm Vào Ngày Này
                </button>
              </div>

              {/* Day Title Banner */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 20px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                  🗓️ Ngày {customDays[activeDayIndex]?.dayNumber}: {customDays[activeDayIndex]?.title}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px' }}>
                  {currentDayStops.length} điểm dừng chân
                </span>
              </div>

              {/* Timeline Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                {currentDayStops.map((stop, idx) => {
                  const getCategoryBadge = () => {
                    switch (stop.category) {
                      case 'FOOD':
                        return { label: 'Ẩm Thực', bg: '#fff7ed', text: '#c2410c', border: '#ffedd5', icon: <Utensils size={13} /> };
                      case 'CHECKIN':
                        return { label: 'Check-in Sống Ảo', bg: '#faf5ff', text: '#7e22ce', border: '#f3e8ff', icon: <Camera size={13} /> };
                      case 'CULTURE':
                        return { label: 'Văn Hóa / Di Tích', bg: '#ecfdf5', text: '#047857', border: '#d1fae5', icon: <Landmark size={13} /> };
                      default:
                        return { label: 'Trải Nghiệm', bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe', icon: <Compass size={13} /> };
                    }
                  };
                  const badge = getCategoryBadge();

                  return (
                    <div
                      key={stop.id}
                      className="timeline-card"
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div style={{ position: 'relative', height: '100%', minHeight: '140px' }}>
                        <img
                          src={stop.imageUrl}
                          alt={stop.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#fff', fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Content Box */}
                      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px', fontWeight: 900, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={16} /> {stop.time}
                              </span>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`,
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}>
                                {badge.icon} {badge.label}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteStop(stop.id)}
                              className="no-print"
                              title="Xóa địa điểm này"
                              style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                            {stop.title}
                          </h3>

                          {/* Local Tip Box */}
                          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', color: '#92400e', marginBottom: '10px', lineHeight: 1.45 }}>
                            <strong>💡 Mẹo bản địa:</strong> {stop.localTip}
                          </div>
                        </div>

                        {/* Card Footer: Duration & Price */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #f1f5f9', paddingTop: '10px', fontSize: '12px', color: '#64748b' }}>
                          <span>⏱ Dừng chân: <strong>{stop.duration}</strong></span>
                          <span>Chi phí: <strong style={{ color: '#059669' }}>{stop.price}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🎒 INTERACTIVE CHECKLIST CHUẨN BỊ ĐỒ HÀNH TRÌNH */}
              <div style={{ marginTop: '28px', backgroundColor: '#fff', borderRadius: '14px', padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Checklist Chuẩn Bị Đồ Hành Trình ({destinationInput})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Tick chọn các vật dụng bạn đã chuẩn bị trước khi lên xe</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {activeTemplate.checklist.map((item, idx) => {
                    const isChecked = !!checkedItems[item];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheckItem(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: isChecked ? '#f0fdf4' : '#f8fafc',
                          border: isChecked ? '1px solid #86efac' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                        ) : (
                          <Square size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontSize: '13px',
                          color: isChecked ? '#15803d' : '#334155',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          fontWeight: isChecked ? 600 : 500
                        }}>
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (35%): MAP, VÉ XE & NGÂN SÁCH */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. 🗺️ BẢN ĐỒ LỘ TRÌNH ĐIỂM ĐẾN (INTERACTIVE VISUAL MAP) */}
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                    <Compass size={17} style={{ color: '#2563eb' }} /> Bản Đồ Lộ Trình (Ngày {customDays[activeDayIndex]?.dayNumber})
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    Tuyến thuận chiều
                  </span>
                </div>

                {/* Simulated Interactive SVG Topo Map */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: '12px',
                  backgroundColor: '#0f172a',
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #090d16 100%)',
                  overflow: 'hidden',
                  border: '1px solid #334155'
                }}>
                  {/* Decorative Grid Lines */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                  {/* SVG Route Connector Path */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {currentDayStops.length > 1 && (
                      <polyline
                        points={currentDayStops.map(s => `${(s.coords.x / 100) * 320},${(s.coords.y / 100) * 240}`).join(' ')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                      />
                    )}
                  </svg>

                  {/* Render Numbered Pins */}
                  {currentDayStops.map((stop, i) => (
                    <div
                      key={stop.id}
                      title={`${stop.time}: ${stop.title}`}
                      style={{
                        position: 'absolute',
                        left: `${stop.coords.x}%`,
                        top: `${stop.coords.y}%`,
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: i === 0 ? '#10b981' : i === currentDayStops.length - 1 ? '#ef4444' : '#2563eb',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 900,
                        boxShadow: '0 0 10px rgba(0,0,0,0.5), 0 0 0 2px #ffffff',
                        transition: 'transform 0.15s'
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: '10px', color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', whiteSpace: 'nowrap', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stop.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📍 Các điểm ghim nối tiếp nhau theo thứ tự sáng ➔ tối</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>~18.5 km</span>
                </div>
              </div>

              {/* 2. 🚌 GỢI Ý CHUYẾN XE KHÁCH PHÙ HỢP NHẤT (SMART TRANSPORT BRIDGE) */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '14px',
                padding: '20px',
                border: '1.5px solid #bfdbfe',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
                position: 'relative'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', marginBottom: '10px' }}>
                  <Sparkles size={12} /> CẦU NỐI DI CHUYỂN THÔNG MINH
                </div>

                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Chuyến Xe Tối Ưu Cho Lịch Trình Này
                </h3>

                <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0 0 14px 0' }}>
                  {activeTemplate.recommendedDepartureReason}
                </p>

                {/* Ticket Recommendation Card */}
                {recommendedTrip ? (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#14532d' }}>{recommendedTrip.busCompanyName}</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#15803d' }}>{recommendedTrip.price.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>
                      ⏰ Giờ chạy: <strong>{recommendedTrip.departureTimeFormatted || '22:30'}</strong> ➔ Đến nơi: <strong>{recommendedTrip.arrivalTimeFormatted || '05:00'}</strong>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#15803d' }}>
                      💺 {recommendedTrip.busTypeName || 'Limousine 34 Phòng VIP'} • Còn <strong>{recommendedTrip.availableSeats} chỗ</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '14px' }}>
                    Đang tìm kiếm chuyến xe đêm phù hợp nhất trong hệ thống...
                  </div>
                )}

                {/* Big Booking CTA Button */}
                <button
                  type="button"
                  onClick={() => {
                    const depDateStr = (recommendedTrip?.departureTime && !recommendedTrip.departureTime.startsWith('2026-10-21'))
                      ? recommendedTrip.departureTime.split('T')[0]
                      : new Date().toISOString().split('T')[0];
                    navigate(`/search?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destinationInput)}&date=${depDateStr}`);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Ticket size={16} /> Xem Chuyến & Đặt Vé Tuyến Này <ArrowRight size={16} />
                </button>
              </div>

              {/* 3. 💰 DỰ TOÁN NGÂN SÁCH CHUYẾN ĐI (TRIP BUDGET ESTIMATOR) */}
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    <DollarSign size={17} style={{ color: '#059669' }} /> Dự Toán Ngân Sách ({durationOption})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>/ 1 người</span>
                </div>

                {/* Budget Tier Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px' }}>
                  {[
                    { key: 'BUDGET', label: 'Tiết kiệm' },
                    { key: 'STANDARD', label: 'Tiêu chuẩn' },
                    { key: 'VIP', label: 'Nghỉ dưỡng' }
                  ].map(tier => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setBudgetTier(tier.key as BudgetTier)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: budgetTier === tier.key ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: budgetTier === tier.key ? '#eff6ff' : '#f8fafc',
                        color: budgetTier === tier.key ? '#2563eb' : '#64748b',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>

                {/* Cost Breakdown */}
                {(() => {
                  const b = budgetTier === 'BUDGET' ? activeTemplate.budget.budget : budgetTier === 'VIP' ? activeTemplate.budget.vip : activeTemplate.budget.standard;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>🎟️ Vé xe khách (Khứ hồi 2 chiều)</span>
                        <strong>{b.bus.toLocaleString('vi-VN')} đ</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>🏨 Khách sạn / Homestay</span>
                        <strong>{b.stay.toLocaleString('vi-VN')} đ</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>🛵 Thuê xe máy & xăng xe</span>
                        <strong>{b.bike.toLocaleString('vi-VN')} đ</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>🍜 Ăn uống & vé tham quan</span>
                        <strong>{b.food.toLocaleString('vi-VN')} đ</strong>
                      </div>

                      <div style={{ borderTop: '1.5px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>TỔNG KINH PHÍ:</span>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                          ~{b.total.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CHẾ ĐỘ 2: BẢNG GIỜ XE CHẠY ĐỊNH KỲ (TIMETABLE MATRIX MODE)
            ========================================================================= */}
        {viewMode === 'TIMETABLE' && (
          <div>
            {/* Route Overview Metric Banner */}
            {timetableData && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '18px 24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Thông Tin Tuyến Đường</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{timetableData.originCity}</span>
                    <ArrowLeftRight size={18} style={{ color: '#2563eb' }} />
                    <span>{timetableData.destinationCity}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cự Ly</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{timetableData.distanceKm} km</div>
                  </div>

                  <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Thời Gian Chạy</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>~{timetableData.durationHours} giờ</div>
                  </div>

                  <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tần Suất Chạy</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>{timetableData.frequency}</div>
                  </div>

                  <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Giá Vé Dao Động</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#d97706' }}>
                      {timetableData.minPrice.toLocaleString('vi-VN')}đ - {timetableData.maxPrice.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Direction Tabs (Round-Trip Switcher) */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => setDirectionTab('OUTBOUND')}
                style={{
                  padding: '10px 18px',
                  fontSize: '14.5px',
                  fontWeight: directionTab === 'OUTBOUND' ? 700 : 600,
                  color: directionTab === 'OUTBOUND' ? '#2563eb' : '#64748b',
                  backgroundColor: directionTab === 'OUTBOUND' ? '#fff' : 'transparent',
                  border: 'none',
                  borderBottom: directionTab === 'OUTBOUND' ? '3px solid #2563eb' : '3px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Bus size={17} />
                <span>Chiều Đi: {timetableData?.originCity || originInput} ➔ {timetableData?.destinationCity || destinationInput}</span>
                <span style={{ backgroundColor: directionTab === 'OUTBOUND' ? '#dbeafe' : '#f1f5f9', color: directionTab === 'OUTBOUND' ? '#1d4ed8' : '#64748b', fontSize: '11.5px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {timetableData?.outboundTrips?.length || 0} chuyến
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDirectionTab('INBOUND')}
                style={{
                  padding: '10px 18px',
                  fontSize: '14.5px',
                  fontWeight: directionTab === 'INBOUND' ? 700 : 600,
                  color: directionTab === 'INBOUND' ? '#2563eb' : '#64748b',
                  backgroundColor: directionTab === 'INBOUND' ? '#fff' : 'transparent',
                  border: 'none',
                  borderBottom: directionTab === 'INBOUND' ? '3px solid #2563eb' : '3px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Bus size={17} style={{ transform: 'scaleX(-1)' }} />
                <span>Chiều Về: {timetableData?.destinationCity || destinationInput} ➔ {timetableData?.originCity || originInput}</span>
                <span style={{ backgroundColor: directionTab === 'INBOUND' ? '#dbeafe' : '#f1f5f9', color: directionTab === 'INBOUND' ? '#1d4ed8' : '#64748b', fontSize: '11.5px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {timetableData?.inboundTrips?.length || 0} chuyến
                </span>
              </button>
            </div>

            {/* Time-Slot Filter Chips */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>Lọc giờ khởi hành:</span>
              {[
                { key: 'ALL', label: 'Tất cả các giờ' },
                { key: 'EARLY', label: '🌅 Sáng sớm (00h - 06h)' },
                { key: 'MORNING', label: '☀️ Buổi sáng (06h - 12h)' },
                { key: 'AFTERNOON', label: '🌤️ Buổi chiều (12h - 18h)' },
                { key: 'EVENING', label: '🌙 Buổi tối (18h - 24h)' },
              ].map(slot => (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setTimeSlot(slot.key as TimeSlot)}
                  style={{
                    backgroundColor: timeSlot === slot.key ? '#1e293b' : '#fff',
                    color: timeSlot === slot.key ? '#fff' : '#475569',
                    border: timeSlot === slot.key ? '1px solid #1e293b' : '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            {/* Timetable Trips List */}
            {timetableLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: '12px' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#64748b' }}>Đang tải bảng giờ xe xuất bến...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : filteredTimetableTrips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Info size={36} style={{ color: '#94a3b8', margin: '0 auto 10px' }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>Không tìm thấy chuyến xe trong khung giờ này</h4>
                <button onClick={() => setTimeSlot('ALL')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Xem tất cả các giờ
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {paginatedTimetableTrips.map(trip => (
                    <div
                      key={trip.id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                          {trip.departureTimeFormatted}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{trip.durationFormatted}</span>
                          <ArrowRight size={14} style={{ color: '#2563eb' }} />
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                          {trip.arrivalTimeFormatted}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{trip.busCompanyName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{trip.busTypeName} • Còn {trip.availableSeats} chỗ</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                          {trip.price.toLocaleString('vi-VN')} đ
                        </div>
                        <button
                          onClick={() => {
                            const tripDate = trip.departureTime ? trip.departureTime.split('T')[0] : '';
                            const dStr = (tripDate && tripDate >= new Date().toISOString().split('T')[0])
                              ? tripDate
                              : new Date().toISOString().split('T')[0];
                            navigate(`/search?origin=${encodeURIComponent(trip.originCity)}&destination=${encodeURIComponent(trip.destinationCity)}&date=${dStr}`);
                          }}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Đặt Chuyến ➔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timetable Pagination (20 chuyến / trang, chia theo tổng số) */}
                <Pagination
                  currentPage={timetablePage}
                  totalPages={totalTimetablePages}
                  totalItems={filteredTimetableTrips.length}
                  pageSize={TIMETABLE_PAGE_SIZE}
                  onPageChange={(page) => setTimetablePage(page)}
                  itemLabel="chuyến xe"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: THÊM ĐỊA ĐIỂM TỰ CHỌN VÀO LỊCH TRÌNH
          ========================================================================= */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ➕ Thêm Địa Điểm (Ngày {customDays[activeDayIndex]?.dayNumber})
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Tên địa điểm / Quán ăn *
                </label>
                <input
                  type="text"
                  required
                  value={newStopTitle}
                  onChange={(e) => setNewStopTitle(e.target.value)}
                  placeholder="Ví dụ: Tiệm cafe Mê Linh, Lẩu bò Ba Toa..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Khung giờ ghé
                  </label>
                  <input
                    type="time"
                    value={newStopTime}
                    onChange={(e) => setNewStopTime(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Phân loại
                  </label>
                  <select
                    value={newStopCategory}
                    onChange={(e) => setNewStopCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="CHECKIN">📸 Check-in Sống Ảo</option>
                    <option value="FOOD">🍜 Quán Ăn / Ẩm Thực</option>
                    <option value="EXPERIENCE">🍃 Trải Nghiệm / Khám Phá</option>
                    <option value="CULTURE">🏛️ Văn Hóa / Di Tích</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Chi phí dự kiến (vé/món ăn)
                </label>
                <input
                  type="text"
                  value={newStopPrice}
                  onChange={(e) => setNewStopPrice(e.target.value)}
                  placeholder="Ví dụ: 50.000đ hoặc Miễn phí"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Mẹo nhỏ khi ghé (Local Tip)
                </label>
                <textarea
                  value={newStopTip}
                  onChange={(e) => setNewStopTip(e.target.value)}
                  placeholder="Ví dụ: Đi buổi sáng nắng đẹp, nên gọi trước để giữ bàn..."
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Thêm Vào Lịch Trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          🤖 TRỢ LÝ AI LỊCH TRÌNH 24/7 (FLOATING BUTTON & DRAWER / MODAL)
          ========================================================================= */}
      <div className="no-print floating-ai-btn" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
        {!isAiOpen ? (
          <button
            type="button"
            onClick={() => setIsAiOpen(true)}
            style={{
              backgroundColor: '#1e3a8a',
              backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              padding: '13px 20px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
              transition: 'transform 0.2s'
            }}
          >
            <Sparkles size={17} style={{ color: '#fbbf24' }} />
            <span>Hỏi Trợ Lý AI Lịch Trình (24/7)</span>
          </button>
        ) : (
          <div style={{
            width: '380px',
            height: '520px',
            backgroundColor: '#fff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #091c3e 0%, #1e3a8a 100%)', color: '#fff', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#fbbf24' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>TravelEasy AI Cố Vấn</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>Chuyên gia bản địa & Lịch trình thông minh</div>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Message Area */}
            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc', fontSize: '13px' }}>
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    backgroundColor: msg.sender === 'USER' ? '#2563eb' : '#fff',
                    color: msg.sender === 'USER' ? '#fff' : '#0f172a',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'USER' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    border: msg.sender === 'USER' ? 'none' : '1px solid #e2e8f0',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}
                  {msg.route && (
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                      <Link
                        to={`/search?destination=${encodeURIComponent(destinationInput)}`}
                        style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        🚌 Xem chuyến xe {msg.route} ➔
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: 'flex-start', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', color: '#64748b' }}>
                  AI đang phân tích và lên lịch trình...
                </div>
              )}
            </div>

            {/* Quick Prompt Pills */}
            <div style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {[
                `Lịch trình 3N2Đ ${destinationInput}`,
                `Quán ăn ngon rẻ ở ${destinationInput}`,
                `Chuyến xe đêm đến ${destinationInput}`
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendAiMessage(p)}
                  style={{
                    whiteSpace: 'nowrap',
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '10px 12px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendAiMessage();
                }}
                placeholder="Nhập câu hỏi hoặc điểm muốn đi..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => handleSendAiMessage()}
                disabled={aiLoading}
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
