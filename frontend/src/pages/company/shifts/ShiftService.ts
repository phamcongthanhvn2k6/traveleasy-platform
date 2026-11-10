/**
 * @file shiftService.ts
 * @description Service layer Quản lý ca trực & bàn giao tiền mặt quầy bến xe [S305][SHIFTS]
 * @author Đoàn Nhật Cường
 *
 * Hiện lưu bằng localStorage (theo từng nhà xe - tenant isolation).
 * Khi Backend có API, chỉ cần thay thân các hàm export bên dưới
 * bằng lời gọi `api.get/post/patch(...)`, giao diện không phải sửa.
 */

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CashSale {
  id: string;
  ticketCode: string;
  amount: number;
  createdAt: string; // ISO
  note?: string;
  source: 'POS' | 'MANUAL';
}

export interface Shift {
  id: string;
  code: string;
  companyId: number;
  cashierName: string;
  counter: string;
  openingFloat: number;
  openedAt: string; // ISO
  status: ShiftStatus;
  manualSales: CashSale[];
  // Chỉ có khi đã chốt ca (Z-Report)
  closedAt?: string;
  cashSalesTotal?: number;
  expectedCash?: number;
  countedCash?: number;
  variance?: number; // thực đếm - kỳ vọng (âm = thiếu, dương = thừa)
  closeNote?: string;
}

const storageKey = (companyId: number) => `traveleasy_company_shifts_${companyId}`;

/**
 * Hợp đồng dữ liệu với POS của Phong (khi POS xong chỉ cần ghi vào key này):
 * localStorage['traveleasy_pos_tickets'] = [{
 *   ticketCode, companyId, paymentMethod: 'CASH' | 'QR', totalAmount, createdAt (ISO), cashierName?
 * }]
 * Sau này đổi thành API: thay thân hàm getPosCashSales.
 */
const POS_TICKETS_KEY = 'traveleasy_pos_tickets';

const read = (companyId: number): Shift[] => {
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    return raw ? (JSON.parse(raw) as Shift[]) : [];
  } catch {
    return [];
  }
};

const write = (companyId: number, shifts: Shift[]) => {
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(shifts));
  } catch (e) {
    console.error('Không thể lưu ca trực:', e);
  }
};

const genId = () => `sh_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const genCode = (existing: Shift[]) => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const todayCount = existing.filter((s) => s.code.includes(ymd)).length + 1;
  return `CA-${ymd}-${String(todayCount).padStart(2, '0')}`;
};

/** Vé tiền mặt do POS ghi nhận trong khoảng thời gian của ca. */
export const getPosCashSales = (companyId: number, fromIso: string, toIso: string): CashSale[] => {
  try {
    const raw = localStorage.getItem(POS_TICKETS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as any[];
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    return list
      .filter((t) => {
        if (t.paymentMethod !== 'CASH') return false;
        if (t.companyId != null && Number(t.companyId) !== companyId) return false;
        const at = new Date(t.createdAt).getTime();
        return at >= from && at <= to;
      })
      .map((t, i) => ({
        id: `pos_${t.ticketCode || i}`,
        ticketCode: t.ticketCode || `POS-${i + 1}`,
        amount: Number(t.totalAmount) || 0,
        createdAt: t.createdAt,
        source: 'POS' as const,
      }));
  } catch {
    return [];
  }
};

/** Toàn bộ giao dịch tiền mặt của một ca (POS + ghi nhận thủ công). */
export const getShiftCashSales = (shift: Shift): CashSale[] => {
  const to = shift.closedAt || new Date().toISOString();
  const pos = getPosCashSales(shift.companyId, shift.openedAt, to);
  const posIds = new Set(pos.map((p) => p.id));
  const manual = shift.manualSales.filter((m) => !posIds.has(m.id));
  return [...pos, ...manual].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getCashSalesTotal = (shift: Shift): number => {
  // Ca đã chốt thì dùng số liệu đã đóng băng trong Z-Report
  if (shift.status === 'CLOSED' && shift.cashSalesTotal != null) return shift.cashSalesTotal;
  return getShiftCashSales(shift).reduce((sum, s) => sum + s.amount, 0);
};

export const getExpectedCash = (shift: Shift): number => {
  if (shift.status === 'CLOSED' && shift.expectedCash != null) return shift.expectedCash;
  return shift.openingFloat + getCashSalesTotal(shift);
};

export const listShifts = (companyId: number): Shift[] =>
  read(companyId).sort((a, b) => b.openedAt.localeCompare(a.openedAt));

export interface OpenShiftInput {
  companyId: number;
  cashierName: string;
  counter: string;
  openingFloat: number;
}

export const openShift = (input: OpenShiftInput): Shift => {
  const shifts = read(input.companyId);
  const duplicated = shifts.find(
    (s) => s.status === 'OPEN' && s.counter.trim().toLowerCase() === input.counter.trim().toLowerCase()
  );
  if (duplicated) {
    throw new Error(`Quầy "${input.counter}" đang có ca ${duplicated.code} chưa chốt. Hãy chốt ca đó trước.`);
  }
  const shift: Shift = {
    id: genId(),
    code: genCode(shifts),
    companyId: input.companyId,
    cashierName: input.cashierName.trim(),
    counter: input.counter.trim(),
    openingFloat: input.openingFloat,
    openedAt: new Date().toISOString(),
    status: 'OPEN',
    manualSales: [],
  };
  write(input.companyId, [shift, ...shifts]);
  return shift;
};

export const addManualCashSale = (
  companyId: number,
  shiftId: string,
  sale: { ticketCode: string; amount: number; note?: string }
): Shift => {
  const shifts = read(companyId);
  const idx = shifts.findIndex((s) => s.id === shiftId);
  if (idx < 0) throw new Error('Không tìm thấy ca trực.');
  if (shifts[idx].status !== 'OPEN') throw new Error('Ca trực đã chốt, không thể ghi thêm giao dịch.');
  shifts[idx].manualSales.push({
    id: `man_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ticketCode: sale.ticketCode.trim() || `QUAY-${shifts[idx].manualSales.length + 1}`,
    amount: sale.amount,
    createdAt: new Date().toISOString(),
    note: sale.note?.trim() || undefined,
    source: 'MANUAL',
  });
  write(companyId, shifts);
  return shifts[idx];
};

export const closeShift = (
  companyId: number,
  shiftId: string,
  input: { countedCash: number; closeNote?: string }
): Shift => {
  const shifts = read(companyId);
  const idx = shifts.findIndex((s) => s.id === shiftId);
  if (idx < 0) throw new Error('Không tìm thấy ca trực.');
  const shift = shifts[idx];
  if (shift.status !== 'OPEN') throw new Error('Ca trực này đã được chốt trước đó.');

  const closedAt = new Date().toISOString();
  const closing: Shift = { ...shift, closedAt };
  const cashSalesTotal = getShiftCashSales(closing).reduce((s, x) => s + x.amount, 0);
  const expectedCash = shift.openingFloat + cashSalesTotal;

  shifts[idx] = {
    ...shift,
    status: 'CLOSED',
    closedAt,
    cashSalesTotal,
    expectedCash,
    countedCash: input.countedCash,
    variance: input.countedCash - expectedCash,
    closeNote: input.closeNote?.trim() || undefined,
  };
  write(companyId, shifts);
  return shifts[idx];
};