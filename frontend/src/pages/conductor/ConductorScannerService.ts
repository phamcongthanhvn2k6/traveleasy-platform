import api from '../../services/api';

export interface ConductorSeatItem {
  seatCode: string;
  floor: number;
  seatType: string;
  occupied: boolean;
  checkedIn: boolean;
  ticketCode?: string | null;
  passengerName?: string | null;
  passengerPhone?: string | null;
}

export interface ConductorSeatManifestResponse {
  tripId: number;
  route: string;
  licensePlate: string;
  totalSeats: number;
  checkedInCount: number;
  pendingCount: number;
  seats: ConductorSeatItem[];
}

export interface ValidateTicketResponse {
  valid: boolean;
  checkInStatus: 'CHECKED_IN' | 'ALREADY_CHECKED_IN' | 'INVALID_TRIP' | 'CANCELLED' | 'EXCHANGED' | 'NOT_FOUND';
  validationColor: 'GREEN' | 'RED' | 'YELLOW';
  ticketCode: string;
  seatNumber: string;
  passengerName?: string | null;
  passengerPhone?: string | null;
  tripId?: number | null;
  tripRoute?: string | null;
  departureTime?: string | null;
  ticketPrice?: number | null;
  message: string;
}

const OFFLINE_MANIFEST_PREFIX = 'traveleasy_conductor_manifest_';

export const ConductorScannerService = {
  getTripManifest: async (tripId: number): Promise<ConductorSeatManifestResponse> => {
    try {
      const res = await api.get(`/conductor/scanner/trips/${tripId}/manifest`);
      const data = res.data?.data;
      if (data) {
        localStorage.setItem(OFFLINE_MANIFEST_PREFIX + tripId, JSON.stringify(data));
      }
      return data;
    } catch (err) {
      // Fallback offline cache từ LocalStorage
      const cached = localStorage.getItem(OFFLINE_MANIFEST_PREFIX + tripId);
      if (cached) {
        return JSON.parse(cached);
      }
      throw err;
    }
  },

  validateTicket: async (qrCodeOrTicketCode: string, currentTripId?: number): Promise<ValidateTicketResponse> => {
    try {
      const params: any = { qrCodeOrTicketCode };
      if (currentTripId) params.currentTripId = currentTripId;
      const res = await api.post('/conductor/scanner/validate', null, { params });
      const data: ValidateTicketResponse = res.data?.data;

      // Cập nhật trạng thái cục bộ vào cache offline nếu có
      if (data && data.valid && currentTripId) {
        ConductorScannerService.updateOfflineCache(currentTripId, data.seatNumber, data.ticketCode);
      }

      return data;
    } catch (err: any) {
      // Quét Offline khi mất sóng 4G
      if (currentTripId) {
        return ConductorScannerService.validateOffline(qrCodeOrTicketCode, currentTripId);
      }
      throw err;
    }
  },

  validateOffline: (code: string, currentTripId: number): ValidateTicketResponse => {
    const raw = localStorage.getItem(OFFLINE_MANIFEST_PREFIX + currentTripId);
    if (!raw) {
      return {
        valid: false,
        checkInStatus: 'NOT_FOUND',
        validationColor: 'RED',
        ticketCode: code,
        seatNumber: '--',
        message: 'Mất sóng 4G và không có bản lưu Offline của chuyến xe này!'
      };
    }

    const manifest: ConductorSeatManifestResponse = JSON.parse(raw);
    const clean = code.trim().toUpperCase();

    const seat = manifest.seats.find(
      (s) =>
        (s.ticketCode && s.ticketCode.toUpperCase() === clean) ||
        s.seatCode.toUpperCase() === clean ||
        (clean.length <= 4 && s.seatCode.toUpperCase().endsWith(clean))
    );

    if (!seat) {
      return {
        valid: false,
        checkInStatus: 'NOT_FOUND',
        validationColor: 'RED',
        ticketCode: code,
        seatNumber: '--',
        message: 'Vé không tồn tại trong danh sách chuyến xe (Chế độ Offline)!'
      };
    }

    if (seat.checkedIn) {
      return {
        valid: false,
        checkInStatus: 'ALREADY_CHECKED_IN',
        validationColor: 'RED',
        ticketCode: seat.ticketCode || code,
        seatNumber: seat.seatCode,
        passengerName: seat.passengerName,
        passengerPhone: seat.passengerPhone,
        message: `CẢNH BÁO ĐỎ: Vé ${seat.ticketCode || code} (Ghế ${seat.seatCode}) ĐÃ LÊN XE TRƯỚC ĐÓ!`
      };
    }

    // Đánh dấu đã lên xe trong bộ nhớ Offline
    seat.checkedIn = true;
    manifest.checkedInCount = (manifest.checkedInCount || 0) + 1;
    manifest.pendingCount = Math.max(0, (manifest.pendingCount || 1) - 1);
    localStorage.setItem(OFFLINE_MANIFEST_PREFIX + currentTripId, JSON.stringify(manifest));

    return {
      valid: true,
      checkInStatus: 'CHECKED_IN',
      validationColor: 'GREEN',
      ticketCode: seat.ticketCode || code,
      seatNumber: seat.seatCode,
      passengerName: seat.passengerName || 'Hành khách',
      passengerPhone: seat.passengerPhone,
      tripId: currentTripId,
      tripRoute: manifest.route,
      message: `VÉ HỢP LỆ (OFFLINE)! Đã xác nhận khách ${seat.passengerName || ''} lên ghế ${seat.seatCode}.`
    };
  },

  updateOfflineCache: (tripId: number, seatCode: string, ticketCode: string) => {
    try {
      const raw = localStorage.getItem(OFFLINE_MANIFEST_PREFIX + tripId);
      if (!raw) return;
      const manifest: ConductorSeatManifestResponse = JSON.parse(raw);
      const s = manifest.seats.find((item) => item.seatCode === seatCode);
      if (s && !s.checkedIn) {
        s.checkedIn = true;
        s.ticketCode = ticketCode;
        manifest.checkedInCount = (manifest.checkedInCount || 0) + 1;
        manifest.pendingCount = Math.max(0, (manifest.pendingCount || 1) - 1);
        localStorage.setItem(OFFLINE_MANIFEST_PREFIX + tripId, JSON.stringify(manifest));
      }
    } catch (e) {
      console.warn('Lỗi update offline cache', e);
    }
  }
};
