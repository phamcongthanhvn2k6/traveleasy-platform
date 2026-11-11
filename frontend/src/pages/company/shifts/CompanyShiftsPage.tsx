/**
 * @file CompanyShiftsPage.tsx
 * @description [S305][SHIFTS] Quản lý ca trực & bàn giao tiền mặt quầy bến xe (/company/shifts)
 * @author Đoàn Nhật Cường
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Plus,
  Search,
  X,
  Wallet,
  Banknote,
  Scale,
  CheckCircle,
  Printer,
  Eye,
  Lock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { getStoredCompany } from '../../../utils/companyHelper';
import {
  Shift,
  listShifts,
  openShift,
  closeShift,
  addManualCashSale,
  getShiftCashSales,
  getCashSalesTotal,
  getExpectedCash,
} from './ShiftService';

// ---------------------------------------------------------------- helpers
const money = (n: number) => `${(n || 0).toLocaleString('vi-VN')} đ`;

const signedMoney = (n: number) => (n > 0 ? `+${money(n)}` : n < 0 ? `-${money(Math.abs(n))}` : money(0));

const fmtTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const parseMoney = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0;

const formatMoneyInput = (v: string) => {
  const n = parseMoney(v);
  return n ? n.toLocaleString('vi-VN') : '';
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const varianceInfo = (v: number) => {
  if (v === 0) return { label: 'Khớp tiền', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
  if (v > 0) return { label: 'Thừa tiền', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Thiếu tiền', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
};

/** In Z-Report bằng cửa sổ riêng (khổ 80mm) để không dính layout của Cổng Nhà xe. */
const printZReport = (shift: Shift, companyName: string) => {
  const sales = getShiftCashSales(shift);
  const expected = getExpectedCash(shift);
  const total = getCashSalesTotal(shift);
  const counted = shift.countedCash ?? 0;
  const variance = shift.variance ?? 0;
  const vi = varianceInfo(variance);

  const rows = sales
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.ticketCode)}</td><td>${fmtTime(s.createdAt).split(' ')[0]}</td><td class="r">${money(
          s.amount
        )}</td></tr>`
    )
    .join('');

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8" />
<title>Z-Report ${escapeHtml(shift.code)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; width: 72mm; margin: 0 auto; }
  h1 { font-size: 15px; text-align: center; margin: 4px 0 0; }
  .c { text-align: center; } .r { text-align: right; }
  .muted { color: #444; font-size: 11px; }
  hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; vertical-align: top; }
  .row { display: flex; justify-content: space-between; padding: 2px 0; }
  .big { font-weight: bold; font-size: 13px; }
  .sign { display: flex; justify-content: space-between; margin-top: 28px; text-align: center; }
  .sign div { width: 48%; } .sign .line { height: 50px; }
</style></head><body>
  <h1>BIÊN BẢN BÀN GIAO CA (Z-REPORT)</h1>
  <div class="c muted">${escapeHtml(companyName)}</div>
  <hr />
  <div class="row"><span>Mã ca</span><span>${escapeHtml(shift.code)}</span></div>
  <div class="row"><span>Quầy vé</span><span>${escapeHtml(shift.counter)}</span></div>
  <div class="row"><span>Thu ngân</span><span>${escapeHtml(shift.cashierName)}</span></div>
  <div class="row"><span>Mở ca</span><span>${fmtTime(shift.openedAt)}</span></div>
  <div class="row"><span>Chốt ca</span><span>${fmtTime(shift.closedAt)}</span></div>
  <hr />
  <div class="row"><span>Tiền lẻ đầu ca</span><span>${money(shift.openingFloat)}</span></div>
  <div class="row"><span>Thu tiền mặt (${sales.length} vé)</span><span>${money(total)}</span></div>
  <div class="row big"><span>Tiền kỳ vọng trong két</span><span>${money(expected)}</span></div>
  <div class="row big"><span>Tiền thực đếm</span><span>${money(counted)}</span></div>
  <div class="row big"><span>Chênh lệch (${vi.label})</span><span>${signedMoney(variance)}</span></div>
  ${shift.closeNote ? `<div class="muted">Ghi chú: ${escapeHtml(shift.closeNote)}</div>` : ''}
  <hr />
  <div class="muted">Chi tiết vé thu tiền mặt</div>
  <table>${rows || '<tr><td class="c muted">Không có giao dịch</td></tr>'}</table>
  <div class="sign">
    <div>Thu ngân<div class="line"></div>${escapeHtml(shift.cashierName)}</div>
    <div>Thủ quỹ nhà xe<div class="line"></div>(Ký, ghi rõ họ tên)</div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body></html>`;

  const w = window.open('', '_blank', 'width=420,height=700');
  if (!w) {
    toast.warning('Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup rồi thử lại.', 'Không Mở Được Cửa Sổ In');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
};

// ---------------------------------------------------------------- styles
const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '20px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '6px',
};

const btnGhost: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnPrimary = (bg: string, disabled = false): React.CSSProperties => ({
  padding: '9px 20px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: bg,
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

const thStyle: React.CSSProperties = {
  padding: '12px 18px',
  color: '#64748b',
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.5px',
};

const ModalShell: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  maxWidth?: number;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, iconBg, iconColor, maxWidth = 520, onClose, children }) => (
  <div style={overlay}>
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: `${maxWidth}px`,
        maxHeight: '90vh',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
            {subtitle && <div style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</div>}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Đóng"
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: React.ReactNode; strong?: boolean }> = ({ label, value, strong }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '13px',
    }}
  >
    <span style={{ color: '#64748b' }}>{label}</span>
    <span style={{ fontWeight: strong ? 800 : 600, color: '#0f172a' }}>{value}</span>
  </div>
);

// ---------------------------------------------------------------- page
type TabKey = 'ALL' | 'OPEN' | 'CLOSED';

const STORAGE_KEY = 'traveleasy_company_shifts';

export const CompanyShiftsPage: React.FC = () => {
<<<<<<< HEAD
  const company = getStoredCompany();
=======
  const [shifts, setShifts] = useState<ShiftRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveShifts = (newShifts: ShiftRecord[]) => {
    setShifts(newShifts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newShifts));
  };
>>>>>>> ddcaba26b33a98305c8bd994b5ed4c0ccd1e16c5

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [tab, setTab] = useState<TabKey>('ALL');
  const [search, setSearch] = useState('');

  // modal state
  const [showOpen, setShowOpen] = useState(false);
  const [closing, setClosing] = useState<Shift | null>(null);
  const [viewing, setViewing] = useState<Shift | null>(null);
  const [report, setReport] = useState<Shift | null>(null);

  // open form
  const [cashier, setCashier] = useState('');
  const [counter, setCounter] = useState('');
  const [floatInput, setFloatInput] = useState('');

  // close form
  const [countedInput, setCountedInput] = useState('');
  const [closeNote, setCloseNote] = useState('');

  // manual sale form
  const [saleCode, setSaleCode] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleNote, setSaleNote] = useState('');

<<<<<<< HEAD
  const reload = () => {
    const list = listShifts(company.id);
    setShifts(list);
    // đồng bộ lại ca đang xem (nếu có)
    setViewing((cur) => (cur ? list.find((s) => s.id === cur.id) || null : cur));
=======
    saveShifts([newShift, ...shifts]);
    setIsOpeningModalOpen(false);
    toast.success('Mở ca trực thành công! Sẵn sàng bán vé quầy POS.');
>>>>>>> ddcaba26b33a98305c8bd994b5ed4c0ccd1e16c5
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id]);

  const openShifts = useMemo(() => shifts.filter((s) => s.status === 'OPEN'), [shifts]);
  const closedShifts = useMemo(() => shifts.filter((s) => s.status === 'CLOSED'), [shifts]);

  const kpi = useMemo(() => {
    const openCash = openShifts.reduce((sum, s) => sum + getCashSalesTotal(s), 0);
    const openExpected = openShifts.reduce((sum, s) => sum + getExpectedCash(s), 0);
    const totalVariance = closedShifts.reduce((sum, s) => sum + (s.variance || 0), 0);
    return { openCount: openShifts.length, openCash, openExpected, closedCount: closedShifts.length, totalVariance };
  }, [openShifts, closedShifts]);

  const filtered = shifts.filter((s) => {
    if (tab !== 'ALL' && s.status !== tab) return false;
    const q = search.trim().toLowerCase();
    if (q && !s.code.toLowerCase().includes(q) && !s.cashierName.toLowerCase().includes(q) && !s.counter.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  // ---- handlers
  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashier.trim() || !counter.trim()) {
      toast.warning('Vui lòng nhập tên thu ngân và quầy vé!', 'Thiếu Thông Tin');
      return;
    }
    try {
      const s = openShift({
        companyId: company.id,
        cashierName: cashier,
        counter,
        openingFloat: parseMoney(floatInput),
      });
      toast.success(`Đã mở ca ${s.code} tại ${s.counter}`, 'Mở Ca Thành Công');
      setShowOpen(false);
      setCashier('');
      setCounter('');
      setFloatInput('');
      reload();
    } catch (err: any) {
      toast.error(err.message || 'Không thể mở ca trực', 'Lỗi Mở Ca');
    }
  };

  const openCloseModal = (s: Shift) => {
    setClosing(s);
    setCountedInput('');
    setCloseNote('');
  };

  const closingExpected = closing ? getExpectedCash(closing) : 0;
  const closingCounted = parseMoney(countedInput);
  const closingVariance = closingCounted - closingExpected;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closing) return;
    if (countedInput.trim() === '') {
      toast.warning('Vui lòng nhập số tiền thực đếm trong két!', 'Thiếu Thông Tin');
      return;
    }
    if (closingVariance !== 0 && !closeNote.trim()) {
      toast.warning('Có chênh lệch tiền mặt, vui lòng ghi rõ lý do vào ô ghi chú.', 'Cần Giải Trình');
      return;
    }
    try {
      const closed = closeShift(company.id, closing.id, { countedCash: closingCounted, closeNote });
      if ((closed.variance || 0) === 0) {
        toast.success(`Ca ${closed.code} đã chốt, tiền khớp tuyệt đối.`, 'Chốt Ca Thành Công');
      } else {
        toast.warning(
          `Ca ${closed.code} đã chốt với chênh lệch ${signedMoney(closed.variance || 0)}.`,
          'Chốt Ca Có Chênh Lệch'
        );
      }
<<<<<<< HEAD
      setClosing(null);
      reload();
      setReport(closed); // mở ngay Z-Report để in
    } catch (err: any) {
      toast.error(err.message || 'Không thể chốt ca', 'Lỗi Chốt Ca');
    }
=======
      return s;
    });

    saveShifts(updated);
    setSelectedShiftToClose(null);
    toast.success('Đã kết ca trực và xuất biên bản bàn giao Z-Report thành công!');
>>>>>>> ddcaba26b33a98305c8bd994b5ed4c0ccd1e16c5
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewing) return;
    const amount = parseMoney(saleAmount);
    if (amount <= 0) {
      toast.warning('Số tiền thu phải lớn hơn 0.', 'Số Tiền Không Hợp Lệ');
      return;
    }
    try {
      addManualCashSale(company.id, viewing.id, { ticketCode: saleCode, amount, note: saleNote });
      toast.success(`Đã ghi nhận thu ${money(amount)} tiền mặt.`, 'Ghi Nhận Thành Công');
      setSaleCode('');
      setSaleAmount('');
      setSaleNote('');
      reload();
    } catch (err: any) {
      toast.error(err.message || 'Không thể ghi nhận giao dịch', 'Lỗi');
    }
  };

  // ---- render
  const kpiCards = [
    {
      label: 'Ca đang mở',
      value: String(kpi.openCount),
      hint: kpi.openCount ? 'Quầy đang trực' : 'Chưa có quầy nào mở ca',
      icon: <Clock size={18} />,
      color: '#0284c7',
      bg: '#f0f9ff',
    },
    {
      label: 'Thu tiền mặt (ca đang mở)',
      value: money(kpi.openCash),
      hint: 'Từ vé bán lẻ tại quầy',
      icon: <Banknote size={18} />,
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      label: 'Tiền két lý thuyết',
      value: money(kpi.openExpected),
      hint: 'Tiền lẻ đầu ca + thu tiền mặt',
      icon: <Wallet size={18} />,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      label: 'Chênh lệch các ca đã chốt',
      value: signedMoney(kpi.totalVariance),
      hint: `${kpi.closedCount} ca đã chốt`,
      icon: <Scale size={18} />,
      color: kpi.totalVariance === 0 ? '#059669' : kpi.totalVariance > 0 ? '#d97706' : '#dc2626',
      bg: kpi.totalVariance === 0 ? '#ecfdf5' : kpi.totalVariance > 0 ? '#fffbeb' : '#fef2f2',
    },
  ];

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'ALL', label: 'Tất cả', count: shifts.length },
    { key: 'OPEN', label: 'Đang mở', count: openShifts.length },
    { key: 'CLOSED', label: 'Đã chốt', count: closedShifts.length },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Bán vé <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Ca trực
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Ca Trực & Bàn Giao Tiền Mặt
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Quầy vé bến xe — <strong>{company.name}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={reload} style={{ ...btnGhost, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Làm mới
          </button>
          <button
            onClick={() => setShowOpen(true)}
            style={{ ...btnPrimary('#4f46e5'), padding: '9px 18px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)' }}
          >
            <Plus size={16} /> Mở Ca Mới
          </button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {kpiCards.map((c) => (
          <div key={c.label} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{c.value}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${active ? '#4f46e5' : '#e2e8f0'}`,
                  backgroundColor: active ? '#4f46e5' : '#ffffff',
                  color: active ? '#ffffff' : '#475569',
                }}
              >
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', minWidth: '260px', gap: '8px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo mã ca, thu ngân, quầy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a', flex: 1 }}
          />
        </div>
      </div>

<<<<<<< HEAD
      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '980px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={thStyle}>MÃ CA</th>
              <th style={thStyle}>THU NGÂN / QUẦY</th>
              <th style={thStyle}>THỜI GIAN</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>TIỀN LẺ ĐẦU CA</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>THU TIỀN MẶT</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>KỲ VỌNG</th>
              <th style={thStyle}>TRẠNG THÁI</th>
              <th style={{ ...thStyle, textAlign: 'right', width: '150px' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  {shifts.length === 0
                    ? 'Chưa có ca trực nào. Bấm "Mở Ca Mới" để bắt đầu ca đầu tiên.'
                    : 'Không có ca trực phù hợp bộ lọc.'}
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isOpen = s.status === 'OPEN';
                const vi = varianceInfo(s.variance || 0);
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>{s.code}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.cashierName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.counter}</div>
=======
        {/* Thẻ trạng thái ca hiện tại */}
        {currentActiveShift && (
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-indigo-700/60 gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ĐANG TRONG CA TRỰC
                </span>
                <h2 className="text-xl font-bold mt-2">{currentActiveShift.shiftCode}</h2>
                <p className="text-sm text-indigo-200 mt-0.5">
                  Thu ngân: <span className="font-semibold text-white">{currentActiveShift.cashierName}</span> • {currentActiveShift.counterName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-indigo-300">Giờ mở ca</p>
                <p className="text-sm font-semibold">{currentActiveShift.openedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Tiền Lẻ Ban Đầu</p>
                <p className="text-xl font-bold mt-1">{currentActiveShift.initialCash.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Doanh Thu Vé Tiền Mặt</p>
                <p className="text-xl font-bold text-emerald-300 mt-1">+{currentActiveShift.cashRevenue.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Tổng Tiền Két Kỳ Vọng</p>
                <p className="text-xl font-bold text-amber-300 mt-1">{currentActiveShift.expectedEndingCash.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Số Vé Đã Xuất</p>
                <p className="text-xl font-bold mt-1">{currentActiveShift.ticketCount} vé</p>
              </div>
            </div>
          </div>
        )}

        {/* Bảng lịch sử các ca trực */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Lịch Sử & Báo Cáo Đối Soát Ca Trực
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Tổng {shifts.length} ca trực
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Mã Ca</th>
                  <th className="py-3.5 px-4">Thu Ngân / Quầy</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4 text-right">Tiền Đầu Ca</th>
                  <th className="py-3.5 px-4 text-right">Tiền Thu Được</th>
                  <th className="py-3.5 px-4 text-right">Thực Nộp Két</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-700">Chưa có ca trực nào được mở</p>
                      <p className="text-xs text-slate-400 mt-1">Bấm "Mở Ca Trực Mới" ở góc trên để bắt đầu ca làm việc của quầy vé.</p>
                    </td>
                  </tr>
                ) : (
                  shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">{s.shiftCode}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{s.cashierName}</p>
                      <p className="text-xs text-slate-400">{s.counterName}</p>
>>>>>>> ddcaba26b33a98305c8bd994b5ed4c0ccd1e16c5
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontSize: '12px' }}>
                      <div>Mở: {fmtTime(s.openedAt)}</div>
                      <div style={{ color: '#64748b' }}>Chốt: {fmtTime(s.closedAt)}</div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', color: '#334155' }}>{money(s.openingFloat)}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{money(getCashSalesTotal(s))}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{money(getExpectedCash(s))}</td>
                    <td style={{ padding: '14px 18px' }}>
                      {isOpen ? (
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0ea5e9' }} />
                          OPEN
                        </span>
                      ) : (
                        <div>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                            CLOSED
                          </span>
                          <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: 700, color: vi.color }}>
                            {vi.label}
                            {(s.variance || 0) !== 0 ? `: ${signedMoney(s.variance || 0)}` : ''}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setViewing(s)}
                          title="Xem chi tiết ca"
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '5px 7px', color: '#475569', display: 'flex', borderRadius: '6px' }}
                        >
                          <Eye size={14} />
                        </button>
                        {isOpen ? (
                          <button
                            onClick={() => openCloseModal(s)}
                            title="Chốt ca & đối soát"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', padding: '5px 10px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
                          >
                            <Lock size={13} /> Chốt ca
                          </button>
                        ) : (
                          <button
                            onClick={() => setReport(s)}
                            title="Xem & in Z-Report"
                            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer', padding: '5px 10px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
                          >
                            <Printer size={13} /> Z-Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
<<<<<<< HEAD
                );
              })
            )}
          </tbody>
        </table>
=======
                )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal mở ca mới */}
        {isOpeningModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Khởi Tạo Ca Trực Bán Vé Mới
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Thu Ngân Đảm Nhiệm</label>
                  <input
                    type="text"
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quầy Bến Xe</label>
                  <input
                    type="text"
                    value={newCounterName}
                    onChange={(e) => setNewCounterName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Tiền Lẻ Ban Đầu Trong Két (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={newInitialCash}
                    onChange={(e) => setNewInitialCash(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">Dùng để thối tiền lẻ cho khách mua vé tại quầy.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleOpenShift}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Xác Nhận Mở Ca
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal đóng ca trực & Z-Report */}
        {selectedShiftToClose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-amber-600" />
                Chốt Ca Trực & Xuất Báo Cáo Z-Report
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Ca: <span className="font-semibold text-slate-800">{selectedShiftToClose.shiftCode}</span> • Thu ngân:{' '}
                {selectedShiftToClose.cashierName}
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiền lẻ ban đầu:</span>
                  <span className="font-semibold">{selectedShiftToClose.initialCash.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doanh thu bán vé tiền mặt:</span>
                  <span className="font-semibold text-emerald-600">+{selectedShiftToClose.cashRevenue.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                  <span>Tổng tiền két lý thuyết:</span>
                  <span className="text-indigo-600">{selectedShiftToClose.expectedEndingCash.toLocaleString()} đ</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Tiền Mặt Đếm Thực Tế Trong Két (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={actualEndingCashInput}
                    onChange={(e) => setActualEndingCashInput(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {Number(actualEndingCashInput) !== selectedShiftToClose.expectedEndingCash && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      ⚠️ Lệch so với hệ thống:{' '}
                      {(Number(actualEndingCashInput) - selectedShiftToClose.expectedEndingCash).toLocaleString()} đ
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú Bàn Giao</label>
                  <textarea
                    rows={2}
                    value={closingNote}
                    onChange={(e) => setClosingNote(e.target.value)}
                    placeholder="Ghi chú về tiền rách, tiền giả (nếu có)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedShiftToClose(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg"
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleCloseShift}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Xác Nhận Đóng Ca & Xuất Z-Report
                </button>
              </div>
            </div>
          </div>
        )}
>>>>>>> ddcaba26b33a98305c8bd994b5ed4c0ccd1e16c5
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
        💡 <strong>Lưu ý:</strong> Doanh thu tiền mặt được lấy từ vé bán tại quầy (POS) trong khoảng thời gian của ca. Mỗi quầy chỉ có một ca đang mở tại một thời điểm.
      </div>

      {/* ============ Modal: Mở ca ============ */}
      {showOpen && (
        <ModalShell
          title="Mở Ca Trực Mới"
          subtitle={`Nhà xe: ${company.name}`}
          icon={<Clock size={20} />}
          iconBg="#eef2ff"
          iconColor="#4f46e5"
          onClose={() => setShowOpen(false)}
        >
          <form onSubmit={handleOpenShift} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  Tên thu ngân <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" required placeholder="VD: Nguyễn Văn An" value={cashier} onChange={(e) => setCashier(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>
                  Quầy vé bến xe <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" required placeholder="VD: Quầy 03 - Bến xe Miền Đông" value={counter} onChange={(e) => setCounter(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tiền lẻ ban đầu trong két (VNĐ)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 2.000.000"
                  value={floatInput}
                  onChange={(e) => setFloatInput(formatMoneyInput(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowOpen(false)} style={btnGhost}>
                Hủy Bỏ
              </button>
              <button type="submit" style={btnPrimary('#4f46e5')}>
                Bắt Đầu Ca Trực
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ============ Modal: Chốt ca ============ */}
      {closing && (
        <ModalShell
          title={`Chốt Ca ${closing.code}`}
          subtitle={`${closing.cashierName} • ${closing.counter}`}
          icon={<Lock size={18} />}
          iconBg="#fef2f2"
          iconColor="#dc2626"
          onClose={() => setClosing(null)}
        >
          <form onSubmit={handleCloseShift} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <SummaryRow label="Tiền lẻ đầu ca" value={money(closing.openingFloat)} />
              <SummaryRow label={`Thu tiền mặt (${getShiftCashSales(closing).length} vé)`} value={money(getCashSalesTotal(closing))} />
              <SummaryRow label="Tiền kỳ vọng trong két" value={money(closingExpected)} strong />
            </div>

            <label style={labelStyle}>
              Tiền thực đếm trong két (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="Nhập số tiền sau khi đếm"
              value={countedInput}
              onChange={(e) => setCountedInput(formatMoneyInput(e.target.value))}
              style={{ ...inputStyle, fontSize: '16px', fontWeight: 700 }}
            />

            {countedInput.trim() !== '' && (() => {
              const vi = varianceInfo(closingVariance);
              return (
                <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '8px', backgroundColor: vi.bg, border: `1px solid ${vi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: vi.color, fontWeight: 700, fontSize: '13px' }}>
                    {closingVariance === 0 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {vi.label}
                  </div>
                  <div style={{ color: vi.color, fontWeight: 800, fontSize: '15px' }}>{signedMoney(closingVariance)}</div>
                </div>
              );
            })()}

            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>
                Ghi chú {closingVariance !== 0 && countedInput.trim() !== '' && <span style={{ color: '#ef4444' }}>* (bắt buộc khi có chênh lệch)</span>}
              </label>
              <textarea
                rows={3}
                placeholder="Lý do chênh lệch, bàn giao cho ai, vấn đề phát sinh..."
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setClosing(null)} style={btnGhost}>
                Hủy Bỏ
              </button>
              <button type="submit" style={btnPrimary('#dc2626')}>
                <Lock size={14} /> Chốt Ca & Lập Z-Report
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ============ Modal: Chi tiết ca ============ */}
      {viewing && (
        <ModalShell
          title={`Chi Tiết Ca ${viewing.code}`}
          subtitle={`${viewing.cashierName} • ${viewing.counter}`}
          icon={<Eye size={18} />}
          iconBg="#ecfdf5"
          iconColor="#059669"
          maxWidth={600}
          onClose={() => setViewing(null)}
        >
          <div style={{ padding: '24px' }}>
            <SummaryRow label="Mở ca lúc" value={fmtTime(viewing.openedAt)} />
            <SummaryRow label="Tiền lẻ đầu ca" value={money(viewing.openingFloat)} />
            <SummaryRow label="Thu tiền mặt" value={money(getCashSalesTotal(viewing))} />
            <SummaryRow label="Tiền kỳ vọng trong két" value={money(getExpectedCash(viewing))} strong />
            {viewing.status === 'CLOSED' && (
              <>
                <SummaryRow label="Tiền thực đếm" value={money(viewing.countedCash || 0)} strong />
                <SummaryRow
                  label="Chênh lệch"
                  value={<span style={{ color: varianceInfo(viewing.variance || 0).color }}>{signedMoney(viewing.variance || 0)}</span>}
                  strong
                />
                {viewing.closeNote && <SummaryRow label="Ghi chú" value={viewing.closeNote} />}
              </>
            )}

            <h4 style={{ margin: '20px 0 8px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Giao dịch tiền mặt trong ca ({getShiftCashSales(viewing).length})
            </h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto' }}>
              {getShiftCashSales(viewing).length === 0 ? (
                <div style={{ padding: '18px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>Chưa có giao dịch tiền mặt nào trong ca này.</div>
              ) : (
                getShiftCashSales(viewing).map((x) => (
                  <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {x.ticketCode}{' '}
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: x.source === 'POS' ? '#eef2ff' : '#f1f5f9', color: x.source === 'POS' ? '#4f46e5' : '#64748b' }}>
                          {x.source === 'POS' ? 'POS' : 'Ghi tay'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {fmtTime(x.createdAt)}
                        {x.note ? ` • ${x.note}` : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#059669', whiteSpace: 'nowrap' }}>{money(x.amount)}</div>
                  </div>
                ))
              )}
            </div>

            {viewing.status === 'OPEN' && (
              <form onSubmit={handleAddSale} style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Ghi nhận thu tiền mặt thủ công</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                  Dùng khi vé quầy chưa được POS ghi nhận tự động (ví dụ: sự cố mạng).
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" placeholder="Mã vé (tùy chọn)" value={saleCode} onChange={(e) => setSaleCode(e.target.value)} style={inputStyle} />
                  <input type="text" inputMode="numeric" placeholder="Số tiền thu" value={saleAmount} onChange={(e) => setSaleAmount(formatMoneyInput(e.target.value))} style={inputStyle} />
                </div>
                <input type="text" placeholder="Ghi chú (tùy chọn)" value={saleNote} onChange={(e) => setSaleNote(e.target.value)} style={{ ...inputStyle, marginTop: '10px' }} />
                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                  <button type="submit" style={btnPrimary('#059669')}>
                    <Plus size={14} /> Ghi nhận
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {viewing.status === 'OPEN' ? (
                <button
                  type="button"
                  onClick={() => {
                    const s = viewing;
                    setViewing(null);
                    openCloseModal(s);
                  }}
                  style={btnPrimary('#dc2626')}
                >
                  <Lock size={14} /> Chốt ca này
                </button>
              ) : (
                <button type="button" onClick={() => setReport(viewing)} style={btnPrimary('#2563eb')}>
                  <Printer size={14} /> Xem Z-Report
                </button>
              )}
              <button type="button" onClick={() => setViewing(null)} style={btnPrimary('#0f172a')}>
                Đóng
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ============ Modal: Z-Report ============ */}
      {report && (
        <ModalShell
          title="Z-Report — Biên Bản Bàn Giao Ca"
          subtitle={`${report.code} • ${company.name}`}
          icon={<Printer size={18} />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          maxWidth={460}
          onClose={() => setReport(null)}
        >
          <div style={{ padding: '24px' }}>
            <SummaryRow label="Quầy vé" value={report.counter} />
            <SummaryRow label="Thu ngân" value={report.cashierName} />
            <SummaryRow label="Mở ca" value={fmtTime(report.openedAt)} />
            <SummaryRow label="Chốt ca" value={fmtTime(report.closedAt)} />
            <SummaryRow label="Tiền lẻ đầu ca" value={money(report.openingFloat)} />
            <SummaryRow label={`Thu tiền mặt (${getShiftCashSales(report).length} vé)`} value={money(getCashSalesTotal(report))} />
            <SummaryRow label="Tiền kỳ vọng" value={money(getExpectedCash(report))} strong />
            <SummaryRow label="Tiền thực đếm" value={money(report.countedCash || 0)} strong />

            {(() => {
              const vi = varianceInfo(report.variance || 0);
              return (
                <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '8px', backgroundColor: vi.bg, border: `1px solid ${vi.border}`, display: 'flex', justifyContent: 'space-between', color: vi.color, fontWeight: 800 }}>
                  <span>{vi.label}</span>
                  <span>{signedMoney(report.variance || 0)}</span>
                </div>
              );
            })()}
            {report.closeNote && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#475569' }}>
                <strong>Ghi chú:</strong> {report.closeNote}
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setReport(null)} style={btnGhost}>
                Đóng
              </button>
              <button type="button" onClick={() => printZReport(report, company.name)} style={btnPrimary('#2563eb')}>
                <Printer size={14} /> In Z-Report
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default CompanyShiftsPage;
