/**
 * @file PosTerminalPage.tsx
 * @description [S304][POS] Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (/company/pos) & In Vé Nhiệt 80mm
 * @author Phạm Thanh Phong
 * @role Core Booking, Concurrency & POS Terminal
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../../../services/api';
import { getStoredCompany } from '../../../utils/companyHelper';
import { toast } from '../../../context/ToastContext';
import {
  Bus,
  Clock,
  MapPin,
  Ticket,
  Printer,
  QrCode,
  Keyboard,
  ShieldCheck,
  Wallet,
  RefreshCw,
  User,
  Phone,
  Banknote,
  FileText,
  Lock,
  Unlock,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  Filter
} from 'lucide-react';

export interface PosTicketItem {
  ticketId?: number;
  ticketCode: string;
  seatNumber: string;
  price: number;
  qrCodeHash: string;
  status: string;
  isPrinted?: boolean;
}

export interface PosReceiptData {
  bookingId?: number;
  bookingCode: string;
  qrCodeHash?: string;
  tripId: number;
  busCompanyId: number;
  busCompanyName: string;
  busCompanyPhone: string;
  routeName: string;
  originCity: string;
  destinationCity: string;
  vehiclePlate: string;
  busType: string;
  departureTime: string;
  pickupPoint: string;
  dropoffPoint: string;
  customerName: string;
  customerPhone: string;
  seatNumbers: string[];
  tickets: PosTicketItem[];
  unitPrice: number;
  insuranceAmount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QR';
  cashReceived: number;
  changeAmount: number;
  shiftId?: number;
  counterName: string;
  terminalName: string;
  cashierName: string;
  printedAt: string;
  receiptWidthMm: number;
}

export interface PosShiftReport {
  shiftId: number;
  shiftCode: string;
  busCompanyId: number;
  staffUserId: number;
  cashierName: string;
  terminalLocationId: number;
  terminalName: string;
  counterName: string;
  openedAt: string;
  closedAt?: string;
  initialCashAmount: number;
  totalCashCollected: number;
  totalQrCollected: number;
  totalRevenue: number;
  expectedCashInDrawer: number;
  countedCashAmount?: number;
  cashDiscrepancy?: number;
  auditStatus: 'OPEN' | 'BALANCED' | 'SURPLUS' | 'DEFICIT';
  totalTicketsSold: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

interface SeatCell {
  seatCode: string;
  floor: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

const TERMINALS = [
  { id: 1, code: 'BXMD', shortLabel: 'BXMĐ', name: 'Bến Xe Miền Đông', counter: 'Quầy POS 01 - Bến Xe Miền Đông' },
  { id: 2, code: 'BXMT', shortLabel: 'BXMT', name: 'Bến Xe Miền Tây', counter: 'Quầy POS 02 - Bến Xe Miền Tây' },
  { id: 3, code: 'BXMYDINH', shortLabel: 'Mỹ Đình', name: 'Bến Xe Mỹ Đình', counter: 'Quầy POS 03 - Bến Xe Mỹ Đình' }
];

const QUICK_CUSTOMERS = [
  { label: 'Khách lẻ', name: 'Khách vãng lai tại quầy', phone: '0900000000' },
  { label: 'Bác Ba', name: 'Bác Ba (Khách bến xe)', phone: '0912345678' },
  { label: 'Cô Tư', name: 'Cô Tư (Khách ưu tiên)', phone: '0988776655' }
];

const formatVnd = (amount: number | undefined | null): string => {
  return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
};

const formatDateTime = (raw: string | undefined | null): string => {
  if (!raw) return new Date().toLocaleString('vi-VN');
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function PosTerminalPage() {
  const currentCompany = getStoredCompany();
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Luồng tuần tự 1 -> 2 -> 3 (1: Chọn chuyến, 2: Pop-up Chọn ghế, 3: Pop-up Thu ngân & In vé)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Terminal & Shift State
  const [selectedTerminal, setSelectedTerminal] = useState(TERMINALS[0]);
  const [currentShift, setCurrentShift] = useState<PosShiftReport | null>(null);
  const [shiftReports, setShiftReports] = useState<PosShiftReport[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<PosReceiptData[]>([]);

  // Trips & Seats State
  const [trips, setTrips] = useState<any[]>([]);
  const [tripSearchQuery, setTripSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [onlyAvailableTrips, setOnlyAvailableTrips] = useState<boolean>(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [seatMap, setSeatMap] = useState<SeatCell[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeFloorTab, setActiveFloorTab] = useState<'ALL' | 1 | 2>('ALL');
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Customer & Payment Form State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR'>('CASH');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [issuingTicket, setIssuingTicket] = useState(false);

  // Modals State
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState<PosReceiptData | null>(null);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [openShiftCashier, setOpenShiftCashier] = useState('Phạm Thanh Phong');
  const [openShiftInitialCash, setOpenShiftInitialCash] = useState<number>(1000000);
  const [openShiftNotes, setOpenShiftNotes] = useState('Ca trực POS bến xe');

  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState<number>(0);
  const [closeShiftNotes, setCloseShiftNotes] = useState('');
  const [activeZReportModal, setActiveZReportModal] = useState<PosShiftReport | null>(null);

  const unitPrice = Number(selectedTrip?.price || 0);
  const seatCount = selectedSeats.length;
  const baseTotal = unitPrice * seatCount;
  const insuranceTotal = hasInsurance ? seatCount * 25000 : 0;
  const finalTotal = baseTotal + insuranceTotal;
  const numericCashReceived = cashReceivedInput.trim() !== '' ? Number(cashReceivedInput) : finalTotal;
  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, numericCashReceived - finalTotal) : 0;

  const buildDefaultSeatMap = (): SeatCell[] => {
    const fallback: SeatCell[] = [];
    for (let i = 1; i <= 17; i++) {
      fallback.push({ seatCode: `A${String(i).padStart(2, '0')}`, floor: 1, status: 'AVAILABLE' });
    }
    for (let i = 1; i <= 17; i++) {
      fallback.push({ seatCode: `B${String(i).padStart(2, '0')}`, floor: 2, status: 'AVAILABLE' });
    }
    return fallback;
  };

  const fetchShiftAndRecentData = useCallback(async () => {
    try {
      const [currentRes, listRes, recentRes] = await Promise.all([
        api.get('/company/pos/shifts/current', { params: { busCompanyId: currentCompany.id } }),
        api.get('/company/pos/shifts', { params: { busCompanyId: currentCompany.id } }),
        api.get('/company/pos/tickets/recent', { params: { busCompanyId: currentCompany.id } })
      ]);

      if (currentRes.data?.data) {
        setCurrentShift(currentRes.data.data);
      }
      if (Array.isArray(listRes.data?.data)) {
        setShiftReports(listRes.data.data);
      }
      if (Array.isArray(recentRes.data?.data)) {
        setRecentReceipts(recentRes.data.data);
      }
    } catch (err) {
      console.warn('Không thể tải dữ liệu ca trực POS:', err);
    }
  }, [currentCompany.id]);

  const loadTripSeats = useCallback(async (trip: any, openStep2Popup = false) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    if (openStep2Popup) {
      setActiveStep(2);
    }
    try {
      const res = await api.get(`/trips/${trip.id}`);
      const rawSeats = res.data?.data?.seats || [];
      if (Array.isArray(rawSeats) && rawSeats.length > 0) {
        const mapped: SeatCell[] = rawSeats.map((s: any) => {
          const code = String(s.seatNumber || s.seatCode || '').toUpperCase();
          const floor = s.floor || (code.startsWith('B') ? 2 : 1);
          const status = (s.status === 'BOOKED' || s.status === 'LOCKED') ? s.status : 'AVAILABLE';
          return { seatCode: code, floor, status };
        });
        setSeatMap(mapped);
      } else {
        setSeatMap(buildDefaultSeatMap());
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tải sơ đồ ghế!', 'Lỗi tải ghế');
      setSeatMap([]);
    }
  }, []);

  const fetchCompanyTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const res = await api.get('/company/trips', {
        params: { companyId: currentCompany.id }
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setTrips(list);
      if (list.length > 0) {
        loadTripSeats(list[0], false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách chuyến xe!', 'Lỗi tải chuyến');
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, [currentCompany.id, loadTripSeats]);

  useEffect(() => {
    fetchCompanyTrips();
    fetchShiftAndRecentData();
  }, [fetchCompanyTrips, fetchShiftAndRecentData]);

  // Kết nối luồng Server-Sent Events (SSE) đồng bộ trạng thái ghế thời gian thực
  useEffect(() => {
    if (!selectedTrip?.id || typeof EventSource === 'undefined') {
      setRealtimeConnected(false);
      return;
    }

    const baseUrl = (api.defaults.baseURL || 'http://localhost:8080/api/v1').replace(/\/$/, '');
    const streamUrl = `${baseUrl}/trips/${selectedTrip.id}/seats/stream`;
    let es: EventSource | null = null;

    try {
      es = new EventSource(streamUrl);
      es.onopen = () => setRealtimeConnected(true);
      es.addEventListener('INIT', () => setRealtimeConnected(true));
      es.addEventListener('SEAT_UPDATE', (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          const code = String(payload.seatNumber || payload.seatCode || '').toUpperCase();
          const newStatus = payload.status as 'AVAILABLE' | 'LOCKED' | 'BOOKED';
          if (!code || !newStatus) return;

          setSeatMap((prev) =>
            prev.map((item) => (item.seatCode === code ? { ...item, status: newStatus } : item))
          );
          if (newStatus !== 'AVAILABLE') {
            setSelectedSeats((prev) => prev.filter((s) => s !== code));
          }
        } catch {
          // ignore malformed event
        }
      });
      es.onerror = () => setRealtimeConnected(false);
    } catch {
      setRealtimeConnected(false);
    }

    return () => {
      if (es) es.close();
    };
  }, [selectedTrip?.id]);

  const toggleSeatSelection = (seat: SeatCell) => {
    if (seat.status === 'BOOKED') {
      toast.warning(`Ghế ${seat.seatCode} đã bán!`, 'Ghế Đã Bán');
      return;
    }
    if (seat.status === 'LOCKED') {
      toast.warning(`Ghế ${seat.seatCode} đang giữ chỗ!`, 'Đang Giữ Chỗ');
      return;
    }
    setSelectedSeats((prev) =>
      prev.includes(seat.seatCode)
        ? prev.filter((c) => c !== seat.seatCode)
        : [...prev, seat.seatCode].sort()
    );
  };

  const handleSelectFirstAvailableSeat = useCallback(() => {
    const firstAvail = seatMap.find((s) => s.status === 'AVAILABLE' && !selectedSeats.includes(s.seatCode));
    if (!firstAvail) {
      toast.warning('Hết ghế trống trên chuyến này!', 'Hết Ghế');
      return;
    }
    setSelectedSeats((prev) => [...prev, firstAvail.seatCode].sort());
    if (activeStep === 1) {
      setActiveStep(2);
    }
    toast.info(`Đã chọn ghế: ${firstAvail.seatCode}`, 'Chọn Nhanh F7');
  }, [seatMap, selectedSeats, activeStep]);

  const handleIssueAndPrintTicket = useCallback(async () => {
    if (issuingTicket) return;
    if (!selectedTrip) {
      toast.warning('Chọn chuyến xe trước!', 'Thiếu Chuyến');
      setActiveStep(1);
      return;
    }
    if (selectedSeats.length === 0) {
      toast.warning('Chọn ít nhất 1 ghế trống!', 'Thiếu Ghế');
      setActiveStep(2);
      return;
    }
    if (currentShift && currentShift.status === 'CLOSED') {
      toast.warning('Ca đã đóng. Mở ca mới (F6) trước khi bán!', 'Ca Đã Đóng');
      setShowOpenShiftModal(true);
      return;
    }

    setIssuingTicket(true);
    try {
      const payload = {
        tripId: selectedTrip.id,
        seatNumbers: selectedSeats,
        customerName: customerName.trim() || 'Khách vãng lai tại quầy',
        customerPhone: customerPhone.trim() || '0900000000',
        paymentMethod,
        terminalName: selectedTerminal.name,
        counterName: currentShift?.counterName || selectedTerminal.counter,
        shiftId: currentShift?.status === 'OPEN' ? currentShift.shiftId : undefined,
        busCompanyId: currentCompany.id,
        cashReceived: numericCashReceived,
        pickupPoint: selectedTerminal.name,
        dropoffPoint: selectedTrip.destinationCity || 'Bến xe đích',
        hasInsurance
      };

      const res = await api.post('/company/pos/issue-ticket', payload);
      const receipt: PosReceiptData = res.data?.data;
      if (!res.data?.success || !receipt) {
        throw new Error(res.data?.message || 'Không thể xuất vé POS!');
      }

      const soldSet = new Set(receipt.seatNumbers || selectedSeats);
      setSeatMap((prev) =>
        prev.map((s) => (soldSet.has(s.seatCode) ? { ...s, status: 'BOOKED' } : s))
      );
      setTrips((prev) =>
        prev.map((t) =>
          t.id === selectedTrip.id
            ? { ...t, availableSeats: Math.max(0, Number(t.availableSeats || 0) - soldSet.size) }
            : t
        )
      );

      setSelectedSeats([]);
      setCustomerName('');
      setCustomerPhone('');
      setCashReceivedInput('');
      setActiveStep(1);
      setActiveReceiptModal(receipt);

      toast.success(`Đã xuất ghế ${receipt.seatNumbers.join(', ')} (${receipt.bookingCode})`, 'Thành Công');
      await fetchShiftAndRecentData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xuất vé!';
      toast.error(msg, 'Lỗi Xuất Vé');
      if (selectedTrip) {
        loadTripSeats(selectedTrip, false);
      }
    } finally {
      setIssuingTicket(false);
    }
  }, [
    issuingTicket,
    selectedTrip,
    selectedSeats,
    currentShift,
    customerName,
    customerPhone,
    paymentMethod,
    selectedTerminal,
    currentCompany.id,
    numericCashReceived,
    hasInsurance,
    fetchShiftAndRecentData,
    loadTripSeats
  ]);

  const handleOpenShiftSubmit = async () => {
    if (openShiftInitialCash < 0) {
      toast.warning('Tiền đầu ca không được âm!', 'Lỗi');
      return;
    }
    try {
      const res = await api.post('/company/pos/shifts/open', {
        busCompanyId: currentCompany.id,
        terminalLocationId: selectedTerminal.id,
        terminalName: selectedTerminal.name,
        counterName: selectedTerminal.counter,
        cashierName: openShiftCashier.trim() || 'Phạm Thanh Phong',
        initialCashAmount: Number(openShiftInitialCash),
        notes: openShiftNotes
      });
      if (res.data?.data) {
        setCurrentShift(res.data.data);
      }
      setShowOpenShiftModal(false);
      toast.success('Đã mở ca POS mới!', 'Mở Ca');
      await fetchShiftAndRecentData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi mở ca!', 'Lỗi');
    }
  };

  const handleCloseShiftSubmit = async () => {
    if (!currentShift || currentShift.status !== 'OPEN') {
      toast.warning('Không có ca đang mở!', 'Thông Báo');
      return;
    }
    try {
      const res = await api.post(`/company/pos/shifts/${currentShift.shiftId}/close`, {
        countedCashAmount: Number(countedCashInput),
        notes: closeShiftNotes
      });
      const zReport: PosShiftReport = res.data?.data;
      setShowCloseShiftModal(false);
      if (zReport) {
        setCurrentShift(zReport);
        setActiveZReportModal(zReport);
      }
      toast.success('Đã kết ca & xuất Z-Report!', 'Kết Ca');
      await fetchShiftAndRecentData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi kết ca!', 'Lỗi');
    }
  };

  // Phím tắt toàn cục F1 - F9 + ESC quay lại bước trước
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeReceiptModal) {
          setActiveReceiptModal(null);
          return;
        }
        if (activeZReportModal) {
          setActiveZReportModal(null);
          return;
        }
        if (showOpenShiftModal || showCloseShiftModal || showShortcutGuide) {
          setShowOpenShiftModal(false);
          setShowCloseShiftModal(false);
          setShowShortcutGuide(false);
          return;
        }
        if (activeStep === 3) {
          setActiveStep(2);
          return;
        }
        if (activeStep === 2) {
          setActiveStep(1);
          return;
        }
        return;
      }

      if (!e.key.startsWith('F') || e.key.length > 3) return;
      const fNum = Number(e.key.slice(1));
      if (isNaN(fNum) || fNum < 1 || fNum > 9) return;

      e.preventDefault();
      switch (e.key) {
        case 'F1':
          setShowShortcutGuide((prev) => !prev);
          break;
        case 'F2':
          setActiveStep(1);
          setTimeout(() => searchInputRef.current?.focus(), 50);
          break;
        case 'F3':
          if (selectedSeats.length > 0) {
            setActiveStep(3);
            setTimeout(() => phoneInputRef.current?.focus(), 80);
          } else if (selectedTrip) {
            setActiveStep(2);
          }
          break;
        case 'F4':
          setPaymentMethod((prev) => (prev === 'CASH' ? 'QR' : 'CASH'));
          break;
        case 'F5':
          if (selectedTrip) {
            loadTripSeats(selectedTrip, activeStep === 2);
            toast.info('Đã làm mới sơ đồ ghế!', 'F5');
          }
          break;
        case 'F6':
          setShowOpenShiftModal(true);
          break;
        case 'F7':
          handleSelectFirstAvailableSeat();
          break;
        case 'F8':
          if (currentShift && currentShift.status === 'OPEN') {
            setCountedCashInput(currentShift.expectedCashInDrawer || 0);
            setShowCloseShiftModal(true);
          } else if (shiftReports.length > 0) {
            setActiveZReportModal(shiftReports[0]);
          } else {
            setShowOpenShiftModal(true);
          }
          break;
        case 'F9':
          if (activeStep === 2 && selectedSeats.length > 0) {
            setActiveStep(3);
          } else {
            handleIssueAndPrintTicket();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeStep,
    activeReceiptModal,
    activeZReportModal,
    showOpenShiftModal,
    showCloseShiftModal,
    showShortcutGuide,
    selectedTrip,
    selectedSeats.length,
    currentShift,
    shiftReports,
    loadTripSeats,
    handleSelectFirstAvailableSeat,
    handleIssueAndPrintTicket
  ]);

  const todayIsoDate = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const tomorrowIsoDate = useMemo(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const y = tom.getFullYear();
    const m = String(tom.getMonth() + 1).padStart(2, '0');
    const d = String(tom.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const getTripRouteTitle = useCallback((t: any): string => {
    return t?.routeName || `${t?.originCity || 'TP.HCM'} - ${t?.destinationCity || 'Đà Lạt'}`;
  }, []);

  const getTripIsoDate = useCallback((t: any): string => {
    if (!t?.departureTime) return '';
    const d = new Date(t.departureTime);
    if (isNaN(d.getTime())) return String(t.departureTime).slice(0, 10);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const getTripTimeSlot = useCallback((t: any): 'MORNING' | 'AFTERNOON' | 'EVENING' => {
    if (!t?.departureTime) return 'MORNING';
    const d = new Date(t.departureTime);
    const hour = isNaN(d.getTime()) ? 8 : d.getHours();
    if (hour < 12) return 'MORNING';
    if (hour < 18) return 'AFTERNOON';
    return 'EVENING';
  }, []);

  const getTripBusType = useCallback((t: any): string => {
    return String(t?.busType || 'LIMOUSINE').toUpperCase();
  }, []);

  // Tự động trích xuất các tùy chọn bộ lọc trực tiếp từ toàn bộ dữ liệu chuyến xe trong Database
  const dbRouteOptions = useMemo(() => {
    const map = new Map<string, number>();
    trips.forEach((t) => {
      const r = getTripRouteTitle(t);
      map.set(r, (map.get(r) || 0) + 1);
    });
    return Array.from(map.entries()).map(([route, count]) => ({ route, count }));
  }, [trips, getTripRouteTitle]);

  const dbBusTypeOptions = useMemo(() => {
    const map = new Map<string, number>();
    trips.forEach((t) => {
      const bt = getTripBusType(t);
      map.set(bt, (map.get(bt) || 0) + 1);
    });
    return Array.from(map.entries()).map(([busType, count]) => ({ busType, count }));
  }, [trips, getTripBusType]);

  const dbTimeSlotCounts = useMemo(() => {
    const counts = { MORNING: 0, AFTERNOON: 0, EVENING: 0 };
    trips.forEach((t) => {
      const slot = getTripTimeSlot(t);
      counts[slot] = (counts[slot] || 0) + 1;
    });
    return counts;
  }, [trips, getTripTimeSlot]);

  const toggleTimeSlotFilter = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot]
    );
  };

  const toggleBusTypeFilter = (busType: string) => {
    setSelectedBusTypes((prev) =>
      prev.includes(busType) ? prev.filter((item) => item !== busType) : [...prev, busType]
    );
  };

  const hasActiveTripFilters =
    tripSearchQuery.trim() !== '' ||
    selectedRouteFilter !== 'ALL' ||
    selectedDateFilter !== 'ALL' ||
    selectedTimeSlots.length > 0 ||
    selectedBusTypes.length > 0 ||
    onlyAvailableTrips;

  const resetTripFilters = () => {
    setTripSearchQuery('');
    setSelectedRouteFilter('ALL');
    setSelectedDateFilter('ALL');
    setSelectedTimeSlots([]);
    setSelectedBusTypes([]);
    setOnlyAvailableTrips(false);
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const routeTitle = getTripRouteTitle(t);
      const isoDate = getTripIsoDate(t);
      const timeSlot = getTripTimeSlot(t);
      const busType = getTripBusType(t);
      const avail = Number(t.availableSeats ?? 0);

      if (selectedRouteFilter !== 'ALL' && routeTitle !== selectedRouteFilter) {
        return false;
      }
      if (selectedDateFilter !== 'ALL' && isoDate !== selectedDateFilter) {
        return false;
      }
      if (selectedTimeSlots.length > 0 && !selectedTimeSlots.includes(timeSlot)) {
        return false;
      }
      if (selectedBusTypes.length > 0 && !selectedBusTypes.includes(busType)) {
        return false;
      }
      if (onlyAvailableTrips && avail <= 0) {
        return false;
      }
      if (tripSearchQuery.trim()) {
        const q = tripSearchQuery.toLowerCase();
        const searchTarget = `${routeTitle} ${isoDate} ${t.licensePlate || ''} ${t.vehiclePlate || ''} #${t.id || ''} ${busType}`.toLowerCase();
        if (!searchTarget.includes(q)) return false;
      }
      return true;
    });
  }, [
    trips,
    selectedRouteFilter,
    selectedDateFilter,
    selectedTimeSlots,
    selectedBusTypes,
    onlyAvailableTrips,
    tripSearchQuery,
    getTripRouteTitle,
    getTripIsoDate,
    getTripTimeSlot,
    getTripBusType
  ]);

  const displayedSeats = seatMap.filter((s) =>
    activeFloorTab === 'ALL' ? true : s.floor === activeFloorTab
  );

  const availableCount = seatMap.filter((s) => s.status === 'AVAILABLE').length;
  const lockedCount = seatMap.filter((s) => s.status === 'LOCKED').length;
  const bookedCount = seatMap.filter((s) => s.status === 'BOOKED').length;

  const selectedRouteTitle = selectedTrip
    ? selectedTrip.routeName || `${selectedTrip.originCity || 'TP.HCM'} - ${selectedTrip.destinationCity || 'Đà Lạt'}`
    : '';

  return (
    <div className="p-3 md:p-5 bg-slate-100 min-h-screen font-sans text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@400;500;600;700&display=swap');
        .font-mono-pos {
          font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-variant-numeric: tabular-nums;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-print-area, #thermal-print-area * {
            visibility: visible !important;
          }
          #thermal-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 4mm !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. POS ENTERPRISE COMMAND HEADER */}
      <div className="bg-slate-900 text-slate-50 rounded-2xl shadow-xl border border-slate-800 p-5 mb-5 no-print">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Xuất vé &lt; 10 giây • In nhiệt 80mm
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                  realtimeConnected
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    realtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {realtimeConnected ? 'Đồng bộ ghế SSE Live' : 'Đồng bộ tức thì'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 pt-1">
              <Printer className="w-6 h-6 text-amber-400 shrink-0" />
              <span>Quầy Bán Vé Bến Xe Liên Tỉnh — POS Terminal 80mm</span>
            </h1>
          </div>

          {/* Bộ chọn nhanh Bến xe & Mở/Kết ca */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              {TERMINALS.map((term) => {
                const active = selectedTerminal.id === term.id;
                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setSelectedTerminal(term)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{term.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowOpenShiftModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Mở Ca / Đổi Quầy (F6)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentShift && currentShift.status === 'OPEN') {
                  setCountedCashInput(currentShift.expectedCashInDrawer || 0);
                  setShowCloseShiftModal(true);
                } else if (shiftReports.length > 0) {
                  setActiveZReportModal(shiftReports[0]);
                } else {
                  setShowOpenShiftModal(true);
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kết Ca &amp; Z-Report (F8)</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Ca trực POS hiện tại */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Trạng Thái Ca Trực</span>
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="font-mono-pos text-sm font-bold text-white mt-1 truncate">
              {currentShift ? currentShift.shiftCode : 'POS-SHIFT-READY'}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5 truncate">
              {currentShift?.status === 'CLOSED'
                ? 'Đã kết ca (CLOSED)'
                : `Đang mở • ${currentShift?.cashierName || 'Phạm Thanh Phong'}`}
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tiền Mặt Đầu Ca</span>
              <Wallet className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <p className="font-mono-pos text-base font-bold text-white mt-1">
              {formatVnd(currentShift?.initialCashAmount ?? 1000000)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {selectedTerminal.counter}
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Doanh Thu Tiền Mặt</span>
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="font-mono-pos text-base font-bold text-emerald-400 mt-1">
              +{formatVnd(currentShift?.totalCashCollected ?? 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Két kỳ vọng: <span className="font-mono-pos text-amber-300">{formatVnd(currentShift?.expectedCashInDrawer ?? 1000000)}</span>
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Doanh Thu VietQR</span>
              <QrCode className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <p className="font-mono-pos text-base font-bold text-violet-300 mt-1">
              +{formatVnd(currentShift?.totalQrCollected ?? 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chuyển khoản tại quầy
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Số Vé Xuất Trong Ca</span>
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="font-mono-pos text-base font-bold text-amber-400 mt-1">
              {currentShift?.totalTicketsSold ?? 0} vé (80mm)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tổng thu ca: <span className="font-mono-pos text-white">{formatVnd(currentShift?.totalRevenue ?? 0)}</span>
            </p>
          </div>
        </div>

        {/* Thanh Phím Tắt Nhanh F1 - F9 */}
        <div className="mt-4 pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-slate-400 font-medium mr-1">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              Phím tắt POS:
            </span>
            {[
              { key: 'F1', label: 'Trợ giúp', action: () => setShowShortcutGuide((v) => !v) },
              { key: 'F2', label: 'Tìm chuyến', action: () => { setActiveStep(1); searchInputRef.current?.focus(); } },
              { key: 'F3', label: 'Nhập khách', action: () => { if (selectedSeats.length > 0) setActiveStep(3); } },
              { key: 'F4', label: 'Tiền mặt/QR', action: () => setPaymentMethod((m) => (m === 'CASH' ? 'QR' : 'CASH')) },
              { key: 'F5', label: 'Tải lại ghế', action: () => selectedTrip && loadTripSeats(selectedTrip, activeStep === 2) },
              { key: 'F6', label: 'Mở ca POS', action: () => setShowOpenShiftModal(true) },
              { key: 'F7', label: 'Chọn nhanh ghế', action: handleSelectFirstAvailableSeat },
              {
                key: 'F8',
                label: 'Phiếu Z-Report',
                action: () => {
                  if (currentShift && currentShift.status === 'OPEN') {
                    setCountedCashInput(currentShift.expectedCashInDrawer || 0);
                    setShowCloseShiftModal(true);
                  } else if (shiftReports.length > 0) {
                    setActiveZReportModal(shiftReports[0]);
                  }
                }
              },
              { key: 'F9', label: 'Xuất vé & In 80mm', action: handleIssueAndPrintTicket }
            ].map((sc) => (
              <button
                key={sc.key}
                type="button"
                onClick={sc.action}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <kbd className="font-mono-pos text-[11px] font-bold text-amber-400">{sc.key}</kbd>
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng phím tắt gọn khi bấm F1 */}
      {showShortcutGuide && (
        <div className="bg-slate-900 text-slate-100 rounded-xl px-4 py-2.5 mb-4 border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
          <div className="flex flex-wrap items-center gap-3">
            <span><strong className="text-amber-400 font-mono-pos">F2:</strong> Tìm chuyến</span>
            <span><strong className="text-amber-400 font-mono-pos">F3:</strong> Nhập SĐT</span>
            <span><strong className="text-amber-400 font-mono-pos">F4:</strong> Tiền mặt/QR</span>
            <span><strong className="text-amber-400 font-mono-pos">F5:</strong> Tải lại ghế</span>
            <span><strong className="text-amber-400 font-mono-pos">F6:</strong> Mở ca</span>
            <span><strong className="text-amber-400 font-mono-pos">F7:</strong> Chọn nhanh ghế</span>
            <span><strong className="text-amber-400 font-mono-pos">F8:</strong> Kết ca Z-Report</span>
            <span><strong className="text-amber-400 font-mono-pos">F9:</strong> Xuất vé &amp; In 80mm</span>
            <span><strong className="text-amber-400 font-mono-pos">ESC:</strong> Quay lại</span>
          </div>
          <button
            type="button"
            onClick={() => setShowShortcutGuide(false)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. THANH TIẾN TRÌNH TUẦN TỰ 1 -> 2 -> 3 */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-4 flex items-center justify-between gap-2 shadow-sm no-print">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeStep === 1
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center font-mono-pos text-[11px] font-bold">
              {activeStep > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span>1. Chọn Chuyến Xe</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            type="button"
            disabled={!selectedTrip}
            onClick={() => selectedTrip && setActiveStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeStep === 2
                ? 'bg-indigo-600 text-white shadow-sm'
                : selectedSeats.length > 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center font-mono-pos text-[11px] font-bold">
              2
            </span>
            <span>
              2. Chọn Ghế {selectedSeats.length > 0 ? `(${selectedSeats.join(', ')})` : ''}
            </span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            type="button"
            disabled={selectedSeats.length === 0}
            onClick={() => selectedSeats.length > 0 && setActiveStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeStep === 3
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center font-mono-pos text-[11px] font-bold">
              3
            </span>
            <span>3. Thu Tiền &amp; In 80mm</span>
          </button>
        </div>

        {selectedTrip && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
            <span>Đang chọn:</span>
            <strong className="text-slate-900">{selectedRouteTitle}</strong>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold cursor-pointer"
            >
              Mở sơ đồ ghế
            </button>
          </div>
        )}
      </div>

      {/* 3. BƯỚC 1: DANH SÁCH CHUYẾN XE KÈM SIDEBAR FILTER DỰA TRÊN DATABASE (CHỌN CHUYẾN -> POP-UP BƯỚC 2) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="font-bold text-slate-900 text-sm md:text-base">
              Chọn Chuyến Xe ({filteredTrips.length}/{trips.length})
            </h2>
            {hasActiveTripFilters && (
              <button
                type="button"
                onClick={resetTripFilters}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={tripSearchQuery}
                onChange={(e) => setTripSearchQuery(e.target.value)}
                placeholder="Tìm tuyến, biển số, mã chuyến (F2)..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={fetchCompanyTrips}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTrips ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* SIDEBAR FILTER BÊN TRÁI (3/12) - DỮ LIỆU ĐỘNG TỪ DATABASE */}
          <aside className="lg:col-span-3 bg-slate-50/90 rounded-xl border border-slate-200 p-3.5 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bộ Lọc Chuyến Xe</span>
              </div>
              {hasActiveTripFilters && (
                <button
                  type="button"
                  onClick={resetTripFilters}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Đặt lại
                </button>
              )}
            </div>

            {/* 1. Lọc Tuyến Đường (Radio từ Database) */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Tuyến đường</p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white cursor-pointer text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    <input
                      type="radio"
                      name="pos-route-filter"
                      checked={selectedRouteFilter === 'ALL'}
                      onChange={() => setSelectedRouteFilter('ALL')}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    <span>Tất cả tuyến</span>
                  </span>
                  <span className="font-mono-pos text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                    {trips.length}
                  </span>
                </label>

                {dbRouteOptions.map((item) => (
                  <label
                    key={item.route}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white cursor-pointer text-xs"
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-800 truncate">
                      <input
                        type="radio"
                        name="pos-route-filter"
                        checked={selectedRouteFilter === item.route}
                        onChange={() => setSelectedRouteFilter(item.route)}
                        className="accent-indigo-600 cursor-pointer shrink-0"
                      />
                      <span className="truncate">{item.route}</span>
                    </span>
                    <span className="font-mono-pos text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold shrink-0">
                      {item.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Lọc Ngày Xuất Bến (Calendar chọn từ hôm nay, không chọn quá khứ) */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">Ngày xuất bến</p>
                {selectedDateFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('ALL')}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Tất cả ngày
                  </button>
                )}
              </div>

              <input
                type="date"
                min={todayIsoDate}
                value={selectedDateFilter === 'ALL' ? '' : selectedDateFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSelectedDateFilter('ALL');
                    return;
                  }
                  if (val < todayIsoDate) {
                    toast.warning('Chỉ được chọn từ ngày hôm nay trở đi!', 'Ngày không hợp lệ');
                    setSelectedDateFilter(todayIsoDate);
                    return;
                  }
                  setSelectedDateFilter(val);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono-pos font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter('ALL')}
                  className={`py-1.5 rounded-lg font-semibold border cursor-pointer transition ${
                    selectedDateFilter === 'ALL'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter(todayIsoDate)}
                  className={`py-1.5 rounded-lg font-semibold border cursor-pointer transition ${
                    selectedDateFilter === todayIsoDate
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter(tomorrowIsoDate)}
                  className={`py-1.5 rounded-lg font-semibold border cursor-pointer transition ${
                    selectedDateFilter === tomorrowIsoDate
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Ngày mai
                </button>
              </div>
            </div>

            {/* 3. Khung Giờ Xuất Bến (Checkbox) */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-2">Khung giờ chạy</p>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'MORNING', label: 'Sáng (00h - 12h)', count: dbTimeSlotCounts.MORNING },
                  { id: 'AFTERNOON', label: 'Chiều (12h - 18h)', count: dbTimeSlotCounts.AFTERNOON },
                  { id: 'EVENING', label: 'Tối (18h - 24h)', count: dbTimeSlotCounts.EVENING }
                ].map((slot) => (
                  <label
                    key={slot.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-slate-800 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedTimeSlots.includes(slot.id)}
                        onChange={() => toggleTimeSlotFilter(slot.id)}
                        className="accent-indigo-600 rounded cursor-pointer"
                      />
                      <span>{slot.label}</span>
                    </span>
                    <span className="font-mono-pos text-[11px] text-slate-500">{slot.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Loại Xe & Trạng Thái Ghế (Checkbox từ Database) */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <p className="text-xs font-bold text-slate-700 mb-2">Loại xe &amp; Ghế trống</p>
              {dbBusTypeOptions.map((bt) => (
                <label
                  key={bt.busType}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-800 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedBusTypes.includes(bt.busType)}
                      onChange={() => toggleBusTypeFilter(bt.busType)}
                      className="accent-indigo-600 rounded cursor-pointer"
                    />
                    <span>{bt.busType}</span>
                  </span>
                  <span className="font-mono-pos text-[11px] text-slate-500">{bt.count}</span>
                </label>
              ))}

              <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white cursor-pointer font-semibold text-emerald-700">
                <input
                  type="checkbox"
                  checked={onlyAvailableTrips}
                  onChange={(e) => setOnlyAvailableTrips(e.target.checked)}
                  className="accent-emerald-600 rounded cursor-pointer"
                />
                <span>Chỉ hiện chuyến còn ghế</span>
              </label>
            </div>
          </aside>

          {/* DANH SÁCH CHUYẾN XE BÊN PHẢI (9/12) */}
          <div className="lg:col-span-9">
            {loadingTrips ? (
              <div className="py-16 text-center text-xs text-slate-400">Đang tải chuyến xe...</div>
            ) : filteredTrips.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <p>Không có chuyến xe phù hợp với bộ lọc.</p>
                {hasActiveTripFilters && (
                  <button
                    type="button"
                    onClick={resetTripFilters}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredTrips.map((t) => {
                  const isSelected = selectedTrip?.id === t.id;
                  const routeTitle = getTripRouteTitle(t);
                  const plate = t.vehiclePlate || t.licensePlate || '51B-299.88';
                  return (
                    <div
                      key={t.id}
                      onClick={() => loadTripSeats(t, true)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-900 text-sm">{routeTitle}</p>
                          <span className="font-mono-pos text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {formatVnd(t.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-mono-pos">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {formatDateTime(t.departureTime)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Bus className="w-3.5 h-3.5 text-slate-400" />
                            {plate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                        <span className="font-semibold text-indigo-700">
                          Trống {t.availableSeats ?? 0}/{t.totalSeats ?? 34}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                          <span>Chọn ghế</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          POP-UP BƯỚC 2: CHỌN GHẾ THỜI GIAN THỰC (CÓ NÚT QUAY LẠI BƯỚC 1 & TIẾP TỤC BƯỚC 3)
         ===================================================================== */}
      {activeStep === 2 && selectedTrip && (
        <div className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 md:p-7 flex flex-col max-h-[92vh]">
            {/* Header Bước 2 */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
                <div>
                  <h3 className="font-bold text-slate-900 text-base md:text-lg">
                    2. Chọn Ghế — {selectedRouteTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono-pos mt-0.5">
                    {formatDateTime(selectedTrip.departureTime)} • {formatVnd(selectedTrip.price)}/ghế
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectFirstAvailableSeat}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                >
                  + Chọn nhanh (F7)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bộ lọc tầng & trạng thái gọn */}
            <div className="flex items-center justify-between gap-3 my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'ALL' as const, label: `Tất cả (${seatMap.length})` },
                  { id: 1 as const, label: 'Tầng 1 (A)' },
                  { id: 2 as const, label: 'Tầng 2 (B)' }
                ].map((tab) => (
                  <button
                    key={String(tab.id)}
                    type="button"
                    onClick={() => setActiveFloorTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeFloorTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs md:text-sm font-semibold">
                <span className="text-emerald-700">Trống: {availableCount}</span>
                <span className="text-amber-700">Giữ: {lockedCount}</span>
                <span className="text-slate-500">Bán: {bookedCount}</span>
              </div>
            </div>

            {/* Lưới ghế */}
            <div className="grid grid-cols-4 gap-3 overflow-y-auto p-1 flex-1">
              {displayedSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatCode);
                const isBooked = seat.status === 'BOOKED';
                const isLocked = seat.status === 'LOCKED';

                let btnClass =
                  'bg-white border-slate-300 text-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer';
                let badgeText = 'Trống';

                if (isBooked) {
                  btnClass = 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed';
                  badgeText = 'Đã bán';
                } else if (isLocked) {
                  btnClass = 'bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed';
                  badgeText = 'Giữ';
                } else if (isSelected) {
                  btnClass =
                    'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-300 shadow-sm cursor-pointer';
                  badgeText = 'Chọn';
                }

                return (
                  <button
                    key={seat.seatCode}
                    type="button"
                    disabled={isBooked || isLocked}
                    onClick={() => toggleSeatSelection(seat)}
                    className={`py-3.5 px-3 rounded-xl border text-center transition ${btnClass}`}
                  >
                    <div className="font-mono-pos font-bold text-base">{seat.seatCode}</div>
                    <div className="text-xs font-medium opacity-85 mt-0.5">{badgeText}</div>
                  </button>
                );
              })}
            </div>

            {/* Footer Bước 2: Tóm tắt & Nút Quay lại / Tiếp tục sang Bước 3 */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-sm">
                {selectedSeats.length > 0 ? (
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-pos font-bold text-indigo-700 text-base">
                      {selectedSeats.join(', ')}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono-pos font-bold text-emerald-700 text-base">
                      {formatVnd(baseTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSeats([])}
                      className="text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400">Chưa chọn ghế nào</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Tiếp tục thu tiền ({selectedSeats.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          POP-UP BƯỚC 3: THU NGÂN & IN VÉ NHIỆT 80MM (CÓ NÚT QUAY LẠI BƯỚC 2)
         ===================================================================== */}
      {activeStep === 3 && selectedTrip && (
        <div className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 md:p-7">
            {/* Header Bước 3 */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
                <h3 className="font-bold text-slate-900 text-base md:text-lg">
                  3. Thu Tiền &amp; In Vé 80mm (F9)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tóm tắt chuyến & ghế */}
            <div className="bg-slate-900 text-white p-4 rounded-xl mb-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-bold text-white text-base">{selectedRouteTitle}</p>
                <p className="text-slate-300 font-mono-pos mt-1">
                  Ghế: <strong className="text-amber-400">{selectedSeats.join(', ')}</strong> ({seatCount} vé)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase">Tổng thu</p>
                <p className="font-mono-pos text-2xl font-bold text-amber-400">
                  {formatVnd(finalTotal)}
                </p>
              </div>
            </div>

            {/* Điền nhanh khách */}
            <div className="flex items-center gap-2 mb-4">
              {QUICK_CUSTOMERS.map((qc) => (
                <button
                  key={qc.label}
                  type="button"
                  onClick={() => {
                    setCustomerName(qc.name);
                    setCustomerPhone(qc.phone);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs md:text-sm font-medium border border-slate-200 cursor-pointer"
                >
                  + {qc.label}
                </button>
              ))}
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pos-customer-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    SĐT khách (F3)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="pos-customer-phone"
                      ref={phoneInputRef}
                      type="text"
                      placeholder="0900000000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-mono-pos focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pos-customer-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tên hành khách
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="pos-customer-name"
                      type="text"
                      placeholder="Khách vãng lai"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Bảo hiểm (+25.000đ/ghế)
                </span>
                <input
                  type="checkbox"
                  checked={hasInsurance}
                  onChange={(e) => setHasInsurance(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>

              {/* Hình thức thu (F4) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2.5 px-4 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tiền mặt (F4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QR')}
                  className={`py-2.5 px-4 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === 'QR'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>VietQR</span>
                </button>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pos-cash-received" className="text-sm font-semibold text-slate-700">
                      Khách đưa
                    </label>
                    <div className="flex gap-1.5">
                      {[finalTotal, 500000, 1000000].map((amt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCashReceivedInput(String(amt))}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono-pos font-semibold text-slate-700 hover:border-indigo-500 cursor-pointer"
                        >
                          {idx === 0 ? 'Đủ' : `${amt / 1000}k`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    id="pos-cash-received"
                    type="number"
                    value={cashReceivedInput}
                    onChange={(e) => setCashReceivedInput(e.target.value)}
                    placeholder={String(finalTotal)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-base font-mono-pos font-bold text-slate-900"
                  />
                  <div className="flex items-center justify-between text-sm pt-1.5 border-t border-slate-200">
                    <span className="text-slate-600">Tiền thối:</span>
                    <span className="font-mono-pos font-bold text-emerald-700 text-base">
                      {formatVnd(changeAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bước 3 */}
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={issuingTicket}
                onClick={handleIssueAndPrintTicket}
                className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="w-5 h-5" />
                <span>{issuingTicket ? 'Đang xuất vé...' : 'Xuất Vé & In 80mm (F9)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          KHU VỰC BÁO CÁO DOANH SỐ THEO CA LÀM VIỆC & DANH SÁCH VÉ VỪA XUẤT (GỌN 1 DÒNG)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 no-print">
        {/* Bảng 1: Báo cáo doanh số theo ca (6/12) — Xem chi tiết qua Phiếu Z */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Doanh Số Ca Trực ({shiftReports.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Bấm Phiếu Z để xem chi tiết</span>
          </div>

          <div className="overflow-x-auto max-h-[280px]">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3.5">Ca</th>
                  <th className="py-2.5 px-3.5">Thu Ngân</th>
                  <th className="py-2.5 px-3.5 text-right">Tổng Thu</th>
                  <th className="py-2.5 px-3.5 text-center">Vé</th>
                  <th className="py-2.5 px-3.5 text-center">TT</th>
                  <th className="py-2.5 px-3.5 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shiftReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Chưa có ca trực.
                    </td>
                  </tr>
                ) : (
                  shiftReports.map((s) => {
                    const shortShift = s.shiftCode?.split('-').pop() || s.shiftId;
                    return (
                      <tr
                        key={s.shiftId}
                        onClick={() => setActiveZReportModal(s)}
                        className="hover:bg-slate-50 transition cursor-pointer"
                      >
                        <td className="py-2.5 px-3.5 font-mono-pos font-bold text-indigo-700">
                          #{shortShift}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-slate-800 max-w-[140px] truncate">
                          {s.cashierName}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono-pos font-bold text-emerald-700">
                          +{formatVnd(s.totalRevenue)}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-mono-pos font-bold text-slate-800">
                          {s.totalTicketsSold}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'OPEN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {s.status === 'OPEN' ? 'Mở' : 'Đóng'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveZReportModal(s);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Phiếu Z</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng 2: Vé Vừa Xuất Tại Quầy (6/12) — Xem chi tiết qua Vé mẫu 80mm */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Vé Vừa Xuất ({recentReceipts.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Bấm Vé mẫu để xem chi tiết &amp; QR</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
            {recentReceipts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có vé vừa xuất.
              </div>
            ) : (
              recentReceipts.map((r) => (
                <div
                  key={r.bookingCode}
                  onClick={() => setActiveReceiptModal(r)}
                  className="px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono-pos font-bold text-xs border border-emerald-200 shrink-0">
                      {Array.isArray(r.seatNumbers) ? r.seatNumbers.join(', ') : ''}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {r.customerName}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline truncate">
                      • {r.routeName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono-pos font-bold text-xs text-slate-900">
                      {formatVnd(r.totalAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReceiptModal(r);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3 h-3 text-amber-400" />
                      <span>Vé mẫu</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL HÓA ĐƠN NHIỆT VÉ XE KHÁCH CHUẨN KHỔ 80MM (THERMAL RECEIPT)
         ===================================================================== */}
      {activeReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 md:p-6 flex flex-col max-h-[86vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0 no-print">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base md:text-lg">
                  Vé Nhiệt 80mm (QR Soát Vé)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-1">
              <div
                id="thermal-print-area"
                className="mx-auto bg-white text-black border border-dashed border-slate-400 p-5 font-mono-pos text-sm leading-snug"
                style={{ width: '440px', maxWidth: '100%' }}
              >
                <div className="text-center border-b border-dashed border-black pb-2.5 mb-2.5">
                  <p className="font-bold text-base uppercase">{activeReceiptModal.busCompanyName}</p>
                  <p className="text-xs mt-0.5">
                    Hotline: {activeReceiptModal.busCompanyPhone} • {activeReceiptModal.counterName}
                  </p>
                  <p className="font-bold text-xs mt-1.5 py-1 bg-black text-white uppercase">
                    VÉ XE KHÁCH 80MM
                  </p>
                </div>

                <div className="space-y-1 border-b border-dashed border-black pb-2.5 mb-2.5 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span>Mã đơn:</span>
                    <span className="font-bold">{activeReceiptModal.bookingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuyến:</span>
                    <span className="font-bold text-right">{activeReceiptModal.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Xuất bến:</span>
                    <span className="font-bold">{formatDateTime(activeReceiptModal.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biển số:</span>
                    <span className="font-bold">{activeReceiptModal.vehiclePlate}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-black pb-2.5 mb-2.5 text-center">
                  <p className="text-[11px] uppercase">Số Ghế</p>
                  <p className="text-3xl font-bold tracking-wider my-0.5">
                    {activeReceiptModal.seatNumbers.join(', ')}
                  </p>
                  <p className="text-xs md:text-sm font-semibold">
                    {activeReceiptModal.customerName} ({activeReceiptModal.customerPhone})
                  </p>
                </div>

                <div className="space-y-1 border-b border-dashed border-black pb-2.5 mb-2.5 text-xs md:text-sm">
                  <div className="flex justify-between font-bold text-sm md:text-base">
                    <span>TỔNG THU ({activeReceiptModal.paymentMethod}):</span>
                    <span>{formatVnd(activeReceiptModal.totalAmount)}</span>
                  </div>
                  {activeReceiptModal.paymentMethod === 'CASH' && (
                    <div className="flex justify-between">
                      <span>Khách đưa / Thối:</span>
                      <span>
                        {formatVnd(activeReceiptModal.cashReceived)} / {formatVnd(activeReceiptModal.changeAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center py-2 border-b border-dashed border-black mb-2">
                  <div className="inline-block p-1.5 bg-white border border-black">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        activeReceiptModal.tickets?.[0]?.ticketCode || activeReceiptModal.bookingCode
                      )}`}
                      alt="QR Soát Vé 80mm"
                      className="w-28 h-28 mx-auto"
                    />
                  </div>
                  <p className="text-xs font-bold mt-1 break-all">
                    {activeReceiptModal.tickets?.[0]?.qrCodeHash ||
                      activeReceiptModal.tickets?.[0]?.ticketCode ||
                      activeReceiptModal.bookingCode}
                  </p>
                </div>

                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Thu ngân: {activeReceiptModal.cashierName}</span>
                  <span>{formatDateTime(activeReceiptModal.printedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-100 shrink-0 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Printer className="w-4 h-4" />
                <span>In Nhiệt 80mm</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveReceiptModal(null);
                  setActiveStep(2);
                }}
                className="py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm cursor-pointer"
              >
                Bán tiếp chuyến này
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptModal(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL MỞ CA TRỰC POS MỚI (F6)
         ===================================================================== */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-7 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg md:text-xl flex items-center gap-2.5">
                <Unlock className="w-6 h-6 text-indigo-600" />
                <span>Mở Ca POS ({selectedTerminal.shortLabel})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-base">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Nhân viên thu ngân</label>
                <input
                  type="text"
                  value={openShiftCashier}
                  onChange={(e) => setOpenShiftCashier(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Tiền mặt đầu ca (VNĐ)</label>
                <input
                  type="number"
                  value={openShiftInitialCash}
                  onChange={(e) => setOpenShiftInitialCash(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-lg font-mono-pos font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Ghi chú</label>
                <input
                  type="text"
                  value={openShiftNotes}
                  onChange={(e) => setOpenShiftNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-7">
              <button
                type="button"
                onClick={handleOpenShiftSubmit}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-base cursor-pointer shadow"
              >
                Mở Ca Ngay
              </button>
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(false)}
                className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-base cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL KẾT CA TRỰC & KIỂM ĐẾM TIỀN NỘP THỦ QUỸ (F8)
         ===================================================================== */}
      {showCloseShiftModal && currentShift && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-7 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg md:text-xl flex items-center gap-2.5">
                <Lock className="w-6 h-6 text-amber-600" />
                <span>Kết Ca &amp; Xuất Z-Report (F8)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2.5 text-base mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Đầu ca:</span>
                <span className="font-mono-pos">{formatVnd(currentShift.initialCashAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thu tiền mặt ({currentShift.totalTicketsSold} vé):</span>
                <span className="font-mono-pos font-bold text-emerald-700">
                  +{formatVnd(currentShift.totalCashCollected)}
                </span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-slate-200 font-bold text-lg">
                <span>Tiền kỳ vọng trong két:</span>
                <span className="font-mono-pos text-indigo-700">
                  {formatVnd(currentShift.expectedCashInDrawer)}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-base">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Tiền thực kiểm nộp thủ quỹ (VNĐ)
                </label>
                <input
                  type="number"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-lg font-mono-pos font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Ghi chú bàn giao</label>
                <input
                  type="text"
                  value={closeShiftNotes}
                  onChange={(e) => setCloseShiftNotes(e.target.value)}
                  placeholder="Khớp đủ, bàn giao thủ quỹ..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-7">
              <button
                type="button"
                onClick={handleCloseShiftSubmit}
                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base cursor-pointer shadow"
              >
                Chốt Ca &amp; In Z-Report
              </button>
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-base cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL PHIẾU Z-REPORT TỔNG KẾT TIỀN NỘP THỦ QUỸ (KHỔ 80MM)
         ===================================================================== */}
      {activeZReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 md:p-6 flex flex-col max-h-[86vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0 no-print">
              <h3 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Phiếu Z-Report 80mm</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveZReportModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-1">
              <div
                id="thermal-print-area"
                className="mx-auto bg-white text-black border border-dashed border-slate-400 p-5 font-mono-pos text-sm leading-snug"
                style={{ width: '440px', maxWidth: '100%' }}
              >
                <div className="text-center border-b border-dashed border-black pb-2.5 mb-2.5">
                  <p className="font-bold text-base uppercase">TRAVELEASY POS</p>
                  <p className="text-xs font-semibold mt-0.5">{activeZReportModal.counterName}</p>
                  <p className="font-bold text-xs mt-1.5 py-1 bg-black text-white uppercase">
                    PHIẾU Z-REPORT (80MM)
                  </p>
                </div>

                <div className="space-y-1.5 border-b border-dashed border-black pb-2.5 mb-2.5 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span>Mã ca:</span>
                    <span className="font-bold">{activeZReportModal.shiftCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thu ngân:</span>
                    <span className="font-bold">{activeZReportModal.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số vé xuất:</span>
                    <span className="font-bold">{activeZReportModal.totalTicketsSold} vé</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-dashed border-black pb-2.5 mb-2.5 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span>1. Đầu ca:</span>
                    <span>{formatVnd(activeZReportModal.initialCashAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. Thu tiền mặt:</span>
                    <span>+{formatVnd(activeZReportModal.totalCashCollected)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Thu VietQR:</span>
                    <span>+{formatVnd(activeZReportModal.totalQrCollected)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1.5 border-t border-dotted border-black text-sm">
                    <span>KÉT KỲ VỌNG (1+2):</span>
                    <span>{formatVnd(activeZReportModal.expectedCashInDrawer)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span>THỰC NỘP THỦ QUỸ:</span>
                    <span>
                      {formatVnd(
                        activeZReportModal.countedCashAmount ?? activeZReportModal.expectedCashInDrawer
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chênh lệch:</span>
                    <span className="font-bold">
                      {formatVnd(activeZReportModal.cashDiscrepancy ?? 0)} ({activeZReportModal.auditStatus})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs pt-2 pb-4">
                  <div>
                    <p className="font-bold uppercase">Thu Ngân</p>
                    <p className="text-[11px] mt-5">({activeZReportModal.cashierName})</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase">Thủ Quỹ</p>
                    <p className="text-[11px] mt-5">(Ký nhận)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-100 shrink-0 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Printer className="w-4 h-4" />
                <span>In Z-Report 80mm</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveZReportModal(null)}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
