/**
 * @file voucherWalletService.ts
 * @description Quản lý Ví Voucher của Khách Hàng (Voucher Wallet Storage & Validation)
 * @author TravelEasy Frontend Engineering Team
 */

import { IVoucher } from '../pages/customer/promotions/types';

// Danh sách mã voucher tân thủ được tặng mặc định khi tạo ví mới
const DEFAULT_WELCOME_VOUCHERS = ['TRAVELEASY', 'PAYOS50'];

export class VoucherWalletService {
  /**
   * Lấy User ID của tài khoản đang đăng nhập hiện tại
   */
  private static getCurrentUserId(): string | null {
    try {
      const userStr = localStorage.getItem('traveleasy_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) return String(user.id);
      }
    } catch (e) {
      console.warn('Lỗi đọc traveleasy_user:', e);
    }
    return null;
  }

  /**
   * Khóa lưu trữ cục bộ phân tách theo tài khoản
   */
  private static getStorageKey(): string {
    const uid = this.getCurrentUserId();
    return uid ? `traveleasy_wallet_vouchers_${uid}` : 'traveleasy_wallet_vouchers_guest';
  }

  /**
   * Lấy danh sách toàn bộ mã voucher người dùng đang sở hữu trong ví
   */
  public static getOwnedVoucherCodes(): string[] {
    const key = this.getStorageKey();
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Khởi tạo ví mới với 2 mã voucher chào mừng tân thủ
        localStorage.setItem(key, JSON.stringify(DEFAULT_WELCOME_VOUCHERS));
        return [...DEFAULT_WELCOME_VOUCHERS];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((c: string) => String(c).trim().toUpperCase());
      }
    } catch (e) {
      console.warn('Lỗi đọc ví voucher:', e);
    }
    return [...DEFAULT_WELCOME_VOUCHERS];
  }

  /**
   * Kiểm tra người dùng đã sở hữu voucher này chưa
   */
  public static isVoucherOwned(code: string): boolean {
    if (!code) return false;
    const clean = code.trim().toUpperCase();
    return this.getOwnedVoucherCodes().includes(clean);
  }

  /**
   * Thêm voucher vào ví người dùng (Thu thập / Thêm voucher)
   * @returns true nếu thêm mới thành công, false nếu đã sở hữu trước đó
   */
  public static claimVoucher(code: string): boolean {
    if (!code) return false;
    const clean = code.trim().toUpperCase();
    const current = this.getOwnedVoucherCodes();

    if (current.includes(clean)) {
      return false; // Đã sở hữu
    }

    const updated = [clean, ...current];
    const key = this.getStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('traveleasy_wallet_updated', { detail: { code: clean, codes: updated } }));
      return true;
    } catch (e) {
      console.error('Lỗi lưu voucher vào ví:', e);
      return false;
    }
  }

  /**
   * Xóa hoặc gỡ voucher khỏi ví
   */
  public static removeVoucher(code: string): boolean {
    if (!code) return false;
    const clean = code.trim().toUpperCase();
    const current = this.getOwnedVoucherCodes();
    const filtered = current.filter((c) => c !== clean);

    const key = this.getStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('traveleasy_wallet_updated', { detail: { code: clean, codes: filtered } }));
      return true;
    } catch (e) {
      console.error('Lỗi gỡ voucher khỏi ví:', e);
      return false;
    }
  }

  /**
   * Kiểm tra xem ngày hết hạn của voucher đã qua chưa
   */
  public static isExpired(expiryDateStr?: string): boolean {
    if (!expiryDateStr) return false;
    try {
      let expiryTime: number | null = null;

      // Xử lý định dạng ngày VN "DD/MM/YYYY"
      if (expiryDateStr.includes('/')) {
        const parts = expiryDateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          expiryTime = new Date(year, month, day, 23, 59, 59).getTime();
        }
      } else {
        expiryTime = new Date(expiryDateStr).getTime();
      }

      if (expiryTime && !isNaN(expiryTime)) {
        return Date.now() > expiryTime;
      }
    } catch (e) {
      console.warn('Lỗi parse ngày hết hạn:', e);
    }
    return false;
  }

  /**
   * Kiểm tra tính hợp lệ đầy đủ của Voucher đối với đơn hàng
   */
  public static validateVoucherEligibility(
    voucher: IVoucher,
    orderAmount?: number,
    origin?: string,
    destination?: string
  ): { eligible: boolean; reason?: string } {
    // 1. Kiểm tra hạn sử dụng
    if (this.isExpired(voucher.expiryDate)) {
      return { eligible: false, reason: `Mã [${voucher.code}] đã hết hạn sử dụng (${voucher.expiryDate})` };
    }

    // 2. Kiểm tra số lượt còn lại
    if (voucher.totalQuantity > 0 && voucher.usedQuantity >= voucher.totalQuantity) {
      return { eligible: false, reason: `Mã [${voucher.code}] đã hết lượt áp dụng trên hệ thống` };
    }

    // 3. Kiểm tra giá trị đơn hàng tối thiểu
    if (orderAmount !== undefined && orderAmount > 0 && voucher.minSpend > 0) {
      if (orderAmount < voucher.minSpend) {
        const missing = voucher.minSpend - orderAmount;
        return {
          eligible: false,
          reason: `Đơn hàng tối thiểu ${voucher.minSpend.toLocaleString('vi-VN')}đ (Bạn cần thêm ${missing.toLocaleString('vi-VN')}đ)`
        };
      }
    }

    // 4. Kiểm tra tuyến áp dụng (nếu có quy định điểm đi / đến)
    if (voucher.searchParams?.origin && origin) {
      if (!origin.toLowerCase().includes(voucher.searchParams.origin.toLowerCase())) {
        return {
          eligible: false,
          reason: `Mã chỉ áp dụng cho chuyến xuất phát từ: ${voucher.searchParams.origin}`
        };
      }
    }

    if (voucher.searchParams?.destination && destination) {
      if (!destination.toLowerCase().includes(voucher.searchParams.destination.toLowerCase())) {
        return {
          eligible: false,
          reason: `Mã chỉ áp dụng cho chuyến đi đến: ${voucher.searchParams.destination}`
        };
      }
    }

    return { eligible: true };
  }
}
export default VoucherWalletService;
