// =========================================================================
// TRAVELEASY REAL-TIME NOTIFICATION EVENT SYSTEM & AUDIO CHIME
// =========================================================================

export interface AppNotification {
  id: string;
  type: 'SECURITY' | 'COMPANY' | 'FINANCE' | 'REVIEW' | 'BOOKING' | 'CHECKIN' | 'TRIP';
  role: 'ALL' | 'OPERATOR' | 'ADMIN' | 'CUSTOMER';
  title: string;
  message: string;
  timestamp: string;
  link: string;
  isRead: boolean;
  priority?: 'HIGH' | 'NORMAL';
  meta?: Record<string, any>;
}

// Default Seed Notifications for OPERATOR (Nhà xe đối tác)
export const OPERATOR_DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'op-notif-1',
    type: 'BOOKING',
    role: 'OPERATOR',
    title: '🎟️ Đơn vé mới vừa đặt thành công',
    message: 'Khách hàng Nguyễn Văn Du Khách vừa đặt vé ghế A03 (Sa Pa - Hà Nội). Đã thanh toán 450.000 đ.',
    timestamp: '2 phút trước',
    link: '/company/bookings',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'op-notif-2',
    type: 'CHECKIN',
    role: 'OPERATOR',
    title: '⚡ Soát vé QR Scanner tại cửa xe',
    message: 'Vé TK-20261101-6BFF-01 (Ghế A03) vừa được quét thành công qua camera kiểm soát vé.',
    timestamp: '8 phút trước',
    link: '/scanner',
    isRead: false,
    priority: 'NORMAL',
  },
  {
    id: 'op-notif-3',
    type: 'TRIP',
    role: 'OPERATOR',
    title: '🚌 Nhắc xuất bến: Tuyến Sa Pa - Hà Nội',
    message: 'Xe 29B-888.77 chuẩn bị xuất bến lúc 10:30 (còn 20 phút). Đã có 33/34 khách check-in.',
    timestamp: '20 phút trước',
    link: '/company/trips',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'op-notif-4',
    type: 'FINANCE',
    role: 'OPERATOR',
    title: '💰 Bảng đối soát kỳ 2 tháng 10/2026',
    message: 'Sàn TravelEasy đã lập bảng quyết toán kỳ 2. Doanh thu tạm tính: 1.668.150 đ.',
    timestamp: '1 giờ trước',
    link: '/company/settlements',
    isRead: true,
    priority: 'NORMAL',
  },
  {
    id: 'op-notif-5',
    type: 'REVIEW',
    role: 'OPERATOR',
    title: '⭐️ Đánh giá 5 sao từ hành khách',
    message: 'Khách hàng Trần Thị Bích Ngọc: "Xe đi rất êm, bác tài lái cẩn thận, phục vụ nước uống tận tình!"',
    timestamp: '3 giờ trước',
    link: '/company/reviews',
    isRead: true,
    priority: 'NORMAL',
  },
];

// Default Seed Notifications for ADMIN (Quản trị viên)
export const ADMIN_DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'adm-notif-1',
    type: 'SECURITY',
    role: 'ADMIN',
    title: '🛡️ Cảnh báo an ninh mạng & Kiểm toán',
    message: 'Hệ thống Audit Log ghi nhận 3 thao tác can thiệp CSDL được mã hóa bất khả biến.',
    timestamp: '5 phút trước',
    link: '/admin/audit-logs',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'adm-notif-2',
    type: 'COMPANY',
    role: 'ADMIN',
    title: '🏢 Hồ sơ nhà xe mới chờ duyệt',
    message: 'Nhà xe Việt Thắng vừa nộp hồ sơ mở tuyến mới trên sàn, đang chờ xét duyệt.',
    timestamp: '25 phút trước',
    link: '/admin/bus-companies',
    isRead: false,
    priority: 'NORMAL',
  },
  {
    id: 'adm-notif-3',
    type: 'FINANCE',
    role: 'ADMIN',
    title: '💵 Yêu cầu đối soát & rút tiền',
    message: 'Phương Trang vừa gửi yêu cầu tất toán doanh thu đợt 2: 45.200.000 đ.',
    timestamp: '1 giờ trước',
    link: '/admin/settlements',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'adm-notif-4',
    type: 'REVIEW',
    role: 'ADMIN',
    title: '⚠️ Báo cáo đánh giá vi phạm',
    message: 'Hành khách khiếu nại bài đánh giá sai sự thật về tuyến Hà Nội - Hải Phòng.',
    timestamp: '2 giờ trước',
    link: '/admin/review-reports',
    isRead: false,
    priority: 'NORMAL',
  },
];

// =========================================================================
// WEBAUDIO SYNTHESIZED SOUND CHIME (100% No External Assets Needed)
// =========================================================================
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.001, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2: 880.00 Hz (A5 - Sweet Harmonic Chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.65);
  } catch (err) {
    // Audio autoplay restrictions might silently prevent playback before first gesture
  }
};

// =========================================================================
// DISPATCH NOTIFICATION EVENT
// =========================================================================
export const sendAppNotification = (item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
  const newNotif: AppNotification = {
    ...item,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: 'Vừa xong',
    isRead: false,
  };

  // Play auditory feedback
  playNotificationChime();

  // Dispatch custom window event
  const event = new CustomEvent('traveleasy_realtime_notification', { detail: newNotif });
  window.dispatchEvent(event);

  return newNotif;
};
