import api from './api';

export type PaymentMethod = 'VNPAY' | 'VIETQR' | 'MOMO' | 'ZALOPAY' | 'COD';

export interface PaymentInitRequest {
  bookingCode: string;
  paymentMethod: PaymentMethod;
  bankCode?: string;
}

export interface BankTransferDetails {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  transferContent: string;
  amount: number;
}

export interface PaymentInitResponse {
  bookingCode: string;
  txnRef: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  paymentUrl?: string;
  qrCodeUrl?: string;
  bankDetails?: BankTransferDetails;
}

export interface PaymentStatusResponse {
  bookingCode: string;
  txnRef: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: PaymentMethod;
  amount: number;
  transactionNo?: string;
  payDate?: string;
  isPaid?: boolean;
  paid?: boolean;
  message: string;
}

export const paymentService = {
  /**
   * Khởi tạo giao dịch thanh toán trực tuyến
   */
  async initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    const res = await api.post('/payments/initiate', request);
    return res.data.data;
  },

  /**
   * Tra cứu trạng thái thanh toán thời gian thực theo mã booking
   */
  async getPaymentStatus(bookingCode: string): Promise<PaymentStatusResponse> {
    const res = await api.get(`/payments/status/${bookingCode}`);
    const data = res.data.data;
    if (data) {
      data.isPaid = Boolean(data.paid || data.isPaid || data.paymentStatus === 'SUCCESS' || data.bookingStatus === 'CONFIRMED');
    }
    return data;
  },

  /**
   * Xác nhận chuyển khoản VietQR QuickPay
   */
  async confirmVietQr(bookingCode: string, manualRef?: string): Promise<PaymentStatusResponse> {
    const res = await api.post(`/payments/confirm-transfer/${bookingCode}`, null, {
      params: { manualRef },
    });
    const data = res.data.data;
    if (data) {
      data.isPaid = Boolean(data.paid || data.isPaid || data.paymentStatus === 'SUCCESS' || data.bookingStatus === 'CONFIRMED');
    }
    return data;
  },
};

export default paymentService;
