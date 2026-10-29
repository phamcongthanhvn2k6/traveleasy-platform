export type FilterType = 'ALL' | 'NEW_USER' | 'HOT_ROUTE' | 'ONLINE_PAYMENT';

export type DiscountType = 'FIXED' | 'PERCENT';

export interface IVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 50000 (VND) or 15 (%)
  maxDiscount?: number;  // Max discount for percent type
  minSpend: number;      // Minimum ticket purchase amount
  category: FilterType;
  categoryLabel: string;
  badge?: string;
  expiryDate: string;    // ISO string or formatted date
  totalQuantity: number;
  usedQuantity: number;
  applicableRoutes: string[];
  applicablePaymentMethods: string[];
  terms: string[];
  searchParams?: {
    origin?: string;
    destination?: string;
  };
}

export interface IBannerSlide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  badge: string;
  voucherCode: string;
  discountHighlight: string;
  image: string;
  gradient: string;
  actionText: string;
}

