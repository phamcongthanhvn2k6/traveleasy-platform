/**
 * @file ShiftService.ts
 * @description Service layer Quản lý ca trực & bàn giao tiền mặt quầy bến xe [S305][SHIFTS]
 * @author Đoàn Nhật Cường
 *
 * Kết nối trực tiếp vào Backend REST API (/api/v1/company/shifts).
 * Khi Backend phản hồi lỗi mạng hoặc máy chủ tắt, tự động fallback an toàn
 * sang bộ nhớ cục bộ (localStorage) để thu ngân không bị gián đoạn bán vé.
 */

import api from '../../../services/api';

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
  cashRefunds?: CashSale[];
  // Chỉ có khi đã chốt ca (Z-Report)
  closedAt?: string;
  cashSalesTotal?: number;
  cashRefundsTotal?: number;
  expectedCash?: number;
  countedCash?: number;
  variance?: number; // thực đếm - kỳ vọng (âm = thiếu, dương = thừa)
  closeNote?: string;
}

const storageKey = (companyId: number) => `traveleasy_company_shifts_${companyId}`;
const POS_TICKETS_KEY = 'traveleasy_pos_tickets';

// --- LocalStorage Fallback Helpers ---
const readLocal = (companyId: number): Shift[] => {
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    return raw ? (JSON.parse(raw) as Shift[]) : [];
  } catch {
    return [];
  }
};

const writeLocal = (companyId: number, shifts: Shift[]) => {
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(shifts));
  } catch (e) {
    console.error('Không thể lưu ca trực local:', e);
  }
};

const genId = () => `sh_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const genCode = (existing: Shift[]) => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const todayCount = existing.filter((s) => s.code.includes(ymd)).length + 1;
  return `CA-${ymd}-${String(todayCount).padStart(2, '0')}`;
};

/** Convert backend DTO (PosShiftResponse) sang Frontend Shift interface */
const mapDtoToShift = (dto: any, companyId: number): Shift => {
  const manualSales: CashSale[] = (dto.cashSales || []).map((s: any) => ({
    id: s.id || `sale_${Math.random()}`,
    ticketCode: s.ticketCode || 'VÉ_QUẦY',
    amount: Number(s.amount) || 0,
    createdAt: s.createdAt || new Date().toISOString(),
    note: s.note || undefined,
    source: (s.source as 'POS' | 'MANUAL') || 'MANUAL',
  }));

  const cashRefunds: CashSale[] = (dto.cashRefunds || []).map((s: any) => ({
    id: s.id || `refund_${Math.random()}`,
    ticketCode: s.ticketCode || 'HOÀN_VÉ',
    amount: Number(s.amount) || 0,
    createdAt: s.createdAt || new Date().toISOString(),
    note: s.note || undefined,
    source: 'MANUAL',
  }));

  return {
    id: String(dto.id),
    code: dto.code || `CA-${dto.id}`,
    companyId: Number(dto.companyId || companyId),
    cashierName: dto.cashierName || 'Thu ngân',
    counter: dto.counter || 'Quầy số 1',
    openingFloat: Number(dto.openingFloat) || 0,
    openedAt: dto.openedAt || new Date().toISOString(),
    status: (dto.status as ShiftStatus) || 'OPEN',
    manualSales,
    cashRefunds,
    closedAt: dto.closedAt || undefined,
    cashSalesTotal: dto.cashSalesTotal != null ? Number(dto.cashSalesTotal) : undefined,
    cashRefundsTotal: dto.cashRefundsTotal != null ? Number(dto.cashRefundsTotal) : undefined,
    expectedCash: dto.expectedCash != null ? Number(dto.expectedCash) : undefined,
    countedCash: dto.countedCash != null ? Number(dto.countedCash) : undefined,
    variance: dto.variance != null ? Number(dto.variance) : undefined,
    closeNote: dto.closeNote || undefined,
  };
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
  if (shift.manualSales && shift.manualSales.length > 0) {
    const pos = shift.manualSales.filter(s => s.source === 'POS');
    if (pos.length > 0) {
      return [...shift.manualSales].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
  }
  const to = shift.closedAt || new Date().toISOString();
  const pos = getPosCashSales(shift.companyId, shift.openedAt, to);
  const posIds = new Set(pos.map((p) => p.id));
  const manual = (shift.manualSales || []).filter((m) => !posIds.has(m.id));
  return [...pos, ...manual].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getCashSalesTotal = (shift: Shift): number => {
  if (shift.status === 'CLOSED' && shift.cashSalesTotal != null) return shift.cashSalesTotal;
  return getShiftCashSales(shift).reduce((sum, s) => sum + s.amount, 0);
};

export const getExpectedCash = (shift: Shift): number => {
  if (shift.status === 'CLOSED' && shift.expectedCash != null) return shift.expectedCash;
  const refunds = (shift.cashRefunds || []).reduce((sum, r) => sum + r.amount, 0) || (shift.cashRefundsTotal || 0);
  return shift.openingFloat + getCashSalesTotal(shift) - refunds;
};

// --- REST API CALLS WITH FALLBACK ---

export const listShifts = async (companyId: number): Promise<Shift[]> => {
  try {
    const res = await api.get('/company/shifts');
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      const list = res.data.data.map((d: any) => mapDtoToShift(d, companyId));
      writeLocal(companyId, list);
      return list;
    }
  } catch (err) {
    console.warn('API /company/shifts không phản hồi, dùng dữ liệu cache local:', err);
  }
  return readLocal(companyId).sort((a, b) => b.openedAt.localeCompare(a.openedAt));
};

export interface OpenShiftInput {
  companyId: number;
  cashierName: string;
  counter: string;
  openingFloat: number;
}

export const openShift = async (input: OpenShiftInput): Promise<Shift> => {
  try {
    const res = await api.post('/company/shifts/open', {
      cashierName: input.cashierName.trim(),
      counter: input.counter.trim(),
      initialCash: input.openingFloat,
    });
    if (res.data && res.data.data) {
      const shift = mapDtoToShift(res.data.data, input.companyId);
      const existing = readLocal(input.companyId);
      writeLocal(input.companyId, [shift, ...existing]);
      return shift;
    }
  } catch (err: any) {
    const apiMsg = err.response?.data?.message;
    if (apiMsg && !apiMsg.includes('Network') && !apiMsg.includes('timeout')) {
      throw new Error(apiMsg);
    }
    console.warn('API /company/shifts/open fallback sang local:', err);
  }

  // Fallback Local
  const shifts = readLocal(input.companyId);
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
  writeLocal(input.companyId, [shift, ...shifts]);
  return shift;
};

export const addManualCashSale = async (
  companyId: number,
  shiftId: string,
  sale: { ticketCode: string; amount: number; note?: string }
): Promise<Shift> => {
  const numericShiftId = Number(shiftId);
  if (!isNaN(numericShiftId) && numericShiftId > 0) {
    try {
      const res = await api.post(`/company/shifts/${numericShiftId}/sales`, {
        ticketCode: sale.ticketCode.trim() || undefined,
        amount: sale.amount,
        note: sale.note?.trim() || undefined,
      });
      if (res.data && res.data.data) {
        const updated = mapDtoToShift(res.data.data, companyId);
        const existing = readLocal(companyId);
        const idx = existing.findIndex(s => s.id === shiftId);
        if (idx >= 0) {
          existing[idx] = updated;
          writeLocal(companyId, existing);
        }
        return updated;
      }
    } catch (err: any) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg && !apiMsg.includes('Network') && !apiMsg.includes('timeout')) {
        throw new Error(apiMsg);
      }
      console.warn('API /company/shifts/{id}/sales fallback local:', err);
    }
  }

  // Fallback Local
  const shifts = readLocal(companyId);
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
  writeLocal(companyId, shifts);
  return shifts[idx];
};

export const closeShift = async (
  companyId: number,
  shiftId: string,
  input: { countedCash: number; closeNote?: string }
): Promise<Shift> => {
  const numericShiftId = Number(shiftId);
  if (!isNaN(numericShiftId) && numericShiftId > 0) {
    try {
      const res = await api.post('/company/shifts/close', {
        shiftId: numericShiftId,
        countedCash: input.countedCash,
        closeNote: input.closeNote?.trim() || undefined,
      });
      if (res.data && res.data.data) {
        const updated = mapDtoToShift(res.data.data, companyId);
        const existing = readLocal(companyId);
        const idx = existing.findIndex(s => s.id === shiftId);
        if (idx >= 0) {
          existing[idx] = updated;
        } else {
          existing.unshift(updated);
        }
        writeLocal(companyId, existing);
        return updated;
      }
    } catch (err: any) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg && !apiMsg.includes('Network') && !apiMsg.includes('timeout')) {
        throw new Error(apiMsg);
      }
      console.warn('API /company/shifts/close fallback local:', err);
    }
  }

  // Fallback Local
  const shifts = readLocal(companyId);
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
  writeLocal(companyId, shifts);
  return shifts[idx];
};
