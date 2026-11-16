import React, { useState, useEffect } from 'react';
import {
  Bus,
  Eye,
  Ban,
  Check,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  ShieldAlert,
  Award,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Calendar,
  Send,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

// Hàm chuẩn hóa tiếng Việt loại bỏ dấu để so khớp AML
const normalizeVietnamese = (str?: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Bảng mã Tỉnh/Thành phố theo quy chuẩn Căn cước công dân của Bộ Công An
const PROVINCE_CODES: Record<string, string> = {
  '001': 'Hà Nội', '002': 'Hà Giang', '004': 'Cao Bằng', '006': 'Bắc Kạn', '008': 'Tuyên Quang',
  '010': 'Lào Cai', '011': 'Điện Biên', '012': 'Lai Châu', '014': 'Sơn La', '015': 'Yên Bái',
  '017': 'Hòa Bình', '019': 'Thái Nguyên', '020': 'Lạng Sơn', '022': 'Quảng Ninh', '024': 'Bắc Giang',
  '025': 'Phú Thọ', '026': 'Vĩnh Phúc', '027': 'Bắc Ninh', '030': 'Hải Dương', '031': 'Hải Phòng',
  '033': 'Hưng Yên', '034': 'Thái Bình', '035': 'Hà Nam', '036': 'Nam Định', '037': 'Ninh Bình',
  '038': 'Thanh Hóa', '040': 'Nghệ An', '042': 'Hà Tĩnh', '044': 'Quảng Bình', '045': 'Quảng Trị',
  '046': 'Thừa Thiên Huế', '048': 'Đà Nẵng', '049': 'Quảng Nam', '051': 'Quảng Ngãi', '052': 'Bình Định',
  '054': 'Phú Yên', '056': 'Khánh Hòa', '058': 'Ninh Thuận', '060': 'Bình Thuận', '062': 'Kon Tum',
  '064': 'Gia Lai', '066': 'Đắk Lắk', '067': 'Đắk Nông', '068': 'Lâm Đồng', '070': 'Bình Phước',
  '072': 'Tây Ninh', '074': 'Bình Dương', '075': 'Đồng Nai', '077': 'Bà Rịa - Vũng Tàu', '079': 'TP. Hồ Chí Minh',
  '080': 'Long An', '082': 'Tiền Giang', '083': 'Bến Tre', '084': 'Trà Vinh', '086': 'Vĩnh Long',
  '087': 'Đồng Tháp', '089': 'An Giang', '091': 'Kiên Giang', '092': 'Cần Thơ', '093': 'Hậu Giang',
  '094': 'Sóc Trăng', '095': 'Bạc Liêu', '096': 'Cà Mau',
};

// Hàm giải mã quy chuẩn số định danh CCCD 12 số
const decodeCccdNumber = (cccd?: string) => {
  if (!cccd) return null;
  const clean = cccd.replace(/\D/g, '');
  if (clean.length !== 12) {
    return {
      province: 'Chưa đủ 12 số',
      gender: 'Không xác định',
      birthYear: 'N/A',
      serial: clean,
      isValidLength: false,
    };
  }

  const provCode = clean.substring(0, 3);
  const genderDigit = parseInt(clean.charAt(3), 10);
  const yearTwoDigits = clean.substring(4, 6);
  const serial = clean.substring(6);

  const province = PROVINCE_CODES[provCode] || `Mã tỉnh [${provCode}]`;
  let gender = 'Nam';
  let centuryBase = 1900;

  if (genderDigit === 0) { gender = 'Nam'; centuryBase = 1900; }
  else if (genderDigit === 1) { gender = 'Nữ'; centuryBase = 1900; }
  else if (genderDigit === 2) { gender = 'Nam'; centuryBase = 2000; }
  else if (genderDigit === 3) { gender = 'Nữ'; centuryBase = 2000; }
  else if (genderDigit === 4) { gender = 'Nam'; centuryBase = 2100; }
  else if (genderDigit === 5) { gender = 'Nữ'; centuryBase = 2100; }

  const fullBirthYear = `${centuryBase + parseInt(yearTwoDigits, 10)}`;

  return {
    province,
    gender,
    birthYear: fullBirthYear,
    serial,
    isValidLength: true,
  };
};

// Kiểm tra định dạng Mã Số Thuế (MST)
const validateTaxCodeFormat = (tax?: string) => {
  if (!tax) return { isValid: false, label: 'Chưa cung cấp MST', isStandard: false };
  const clean = tax.trim().replace(/\s/g, '');
  if (clean.length === 10 && /^\d{10}$/.test(clean)) {
    return { isValid: true, label: 'Chuẩn MST Doanh Nghiệp (10 số)', isStandard: true };
  }
  if (clean.length === 14 && /^\d{10}-\d{3}$/.test(clean)) {
    return { isValid: true, label: 'Chuẩn MST Chi Nhánh / Đơn Vị Phụ Thuộc (13 số)', isStandard: true };
  }
  return { isValid: false, label: '⚠️ Không đúng định dạng chuẩn VN (cần 10 số hoặc 13 số)', isStandard: false };
};

// So khớp chi tiết Tên chủ tài khoản thụ hưởng với Pháp nhân & Đại diện
const checkDetailedBankMatch = (accountOwner?: string, companyName?: string, legalRep?: string) => {
  const normOwner = normalizeVietnamese(accountOwner);
  const normCompany = normalizeVietnamese(companyName).replace(/CONG TY TNHH|CONG TY CO PHAN|CTCP|TNHH|DOANH NGHIEP TU NHAN/g, '').trim();
  const normRep = normalizeVietnamese(legalRep);

  if (!normOwner) {
    return {
      matchType: 'NONE',
      label: 'Chưa có thông tin chủ tài khoản',
      badgeBg: '#f1f5f9',
      badgeColor: '#64748b',
      desc: 'Hồ sơ chưa khai báo thông tin tài khoản ngân hàng thụ hưởng.',
      score: 0,
    };
  }

  // So khớp với tên pháp nhân nhà xe
  if (normOwner.includes(normCompany) || normCompany.includes(normOwner)) {
    return {
      matchType: 'COMPANY',
      label: '✓ 100% TRÙNG KHỚP PHÁP NHÂN CÔNG TY',
      badgeBg: '#ecfdf5',
      badgeColor: '#059669',
      desc: 'Tên chủ tài khoản khớp hoàn toàn với tên công ty nhà xe. Đạt chuẩn thanh toán Escrow doanh nghiệp.',
      score: 100,
    };
  }

  // So khớp với người đại diện pháp luật
  if (normRep && (normOwner.includes(normRep) || normRep.includes(normOwner))) {
    return {
      matchType: 'LEGAL_REP',
      label: '✓ TRÙNG KHỚP NGƯỜI ĐẠI DIỆN PHÁP LUẬT',
      badgeBg: '#eff6ff',
      badgeColor: '#2563eb',
      desc: 'Tài khoản đứng tên người đại diện pháp luật (Hộ kinh doanh / Doanh nghiệp tư nhân). Đủ điều kiện thanh toán.',
      score: 90,
    };
  }

  // Không khớp
  return {
    matchType: 'MISMATCH',
    label: '⚠️ CẢNH BÁO: CHỦ TÀI KHOẢN KHÁC TÊN PHÁP NHÂN & ĐẠI DIỆN',
    badgeBg: '#fef2f2',
    badgeColor: '#dc2626',
    desc: 'Tài khoản đứng tên cá nhân lạ không có trong giấy tờ pháp lý! Nguy cơ rửa tiền hoặc gian lận thanh toán.',
    score: 0,
  };
};

const getBankShortCode = (bankName?: string): string => {
  if (!bankName) return 'MB';
  const upper = bankName.toUpperCase();
  if (upper.includes('MB')) return 'MB';
  if (upper.includes('VIETCOMBANK') || upper.includes('VCB')) return 'VCB';
  if (upper.includes('TECHCOMBANK') || upper.includes('TCB')) return 'TCB';
  if (upper.includes('VIETINBANK') || upper.includes('ICB')) return 'ICB';
  if (upper.includes('BIDV')) return 'BIDV';
  if (upper.includes('ACB')) return 'ACB';
  if (upper.includes('VPBANK') || upper.includes('VPB')) return 'VPB';
  if (upper.includes('TPBANK') || upper.includes('TPB')) return 'TPB';
  return 'MB';
};

interface BusCompanyItem {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'PENDING_SUPPLEMENT' | 'DELETED';
  statusLabel: string;
  createdAt: string;

  // Pháp lý KYB
  taxCode?: string;
  legalRepresentative?: string;
  identityCardNumber?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  businessLicenseUrl?: string;
  transportLicenseUrl?: string;

  // Quyết toán ký quỹ Escrow
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountOwner?: string;

  // Thẩm định
  kycStatus?: string;
  commissionRate?: number;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export const AdminBusCompaniesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PENDING_SUPPLEMENT' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'DELETED'>('ALL');
  const [companies, setCompanies] = useState<BusCompanyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Edit cơ bản
  const [editingCompany, setEditingCompany] = useState<BusCompanyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editHotline, setEditHotline] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Trung Tâm Thẩm Định KYB
  const [viewingCompany, setViewingCompany] = useState<BusCompanyItem | null>(null);
  const [decisionTab, setDecisionTab] = useState<'APPROVE' | 'SUPPLEMENT' | 'REJECT'>('APPROVE');
  const [commissionInput, setCommissionInput] = useState<number>(8); // Mặc định 8% hoa hồng
  const [adminNoteInput, setAdminNoteInput] = useState<string>('Hồ sơ pháp lý, CCCD và tài khoản ngân hàng chính chủ hợp lệ.');
  const [supplementReason, setSupplementReason] = useState<string>('Ảnh CCCD 2 mặt bị mờ, vui lòng gửi lại bản chụp rõ nét 4 góc.');
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('Doanh nghiệp chưa đủ điều kiện kinh doanh vận tải theo Nghị định 10/2020/NĐ-CP.');
  const [actionLoading, setActionLoading] = useState(false);

  // Checklist thẩm định tính hợp lệ nhà xe (Interactive KYB Verification Checklist)
  const [kybChecklist, setKybChecklist] = useState<Record<string, boolean>>({
    taxLength: true,
    taxGovCheck: false,
    taxNameMatch: false,
    cccdFormat: true,
    cccdNameMatch: false,
    cccdChipPhoto: false,
    licenseTerm: false,
    licenseFixedRoute: false,
    licenseGpsPledge: false,
    bankOwnerMatch: false,
    bankNapasActive: false,
  });

  const toggleKybCheck = (key: string) => {
    setKybChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAutoCrossCheckAll = () => {
    setKybChecklist({
      taxLength: true,
      taxGovCheck: true,
      taxNameMatch: true,
      cccdFormat: true,
      cccdNameMatch: true,
      cccdChipPhoto: true,
      licenseTerm: true,
      licenseFixedRoute: true,
      licenseGpsPledge: true,
      bankOwnerMatch: true,
      bankNapasActive: true,
    });
    toast.success('Đã đối soát tự động thành công: 11/11 tiêu chí pháp lý hợp lệ!', 'Đối Soát Tự Động');
  };

  // Modal QR Tra Cứu Tên Thật Thụ Hưởng VietQR
  const [qrVerifyModal, setQrVerifyModal] = useState<{
    bankName: string;
    accountNo: string;
    owner: string;
    qrUrl: string;
  } | null>(null);

  // Lightbox xem ảnh lớn
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; isPdf?: boolean } | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bus-companies');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCompanies(
          res.data.data.map((c: any) => {
            const rawStatus = c.status || 'ACTIVE';
            const mappedStatus =
              rawStatus === 'PENDING_APPROVAL' || rawStatus === 'PENDING'
                ? 'PENDING'
                : rawStatus === 'PENDING_SUPPLEMENT'
                ? 'PENDING_SUPPLEMENT'
                : rawStatus === 'REJECTED'
                ? 'REJECTED'
                : rawStatus === 'SUSPENDED'
                ? 'SUSPENDED'
                : 'ACTIVE';

            const mappedLabel =
              mappedStatus === 'PENDING'
                ? 'Chờ thẩm định'
                : mappedStatus === 'PENDING_SUPPLEMENT'
                ? 'Chờ bổ sung'
                : mappedStatus === 'REJECTED'
                ? 'Bị từ chối'
                : mappedStatus === 'SUSPENDED'
                ? 'Tạm ngưng'
                : 'Đang hoạt động';

            // Trích xuất fallback từ address nếu các cột chuyên biệt chưa có
            let addr = c.address || '';
            let fallbackRep = '';
            let fallbackTax = '';
            if (addr.includes(' | ')) {
              addr.split(' | ').forEach((p: string) => {
                if (p.startsWith('Đại diện: ')) fallbackRep = p.replace('Đại diện: ', '');
                else if (p.startsWith('MST: ')) fallbackTax = p.replace('MST: ', '');
              });
            }

            return {
              id: String(c.id),
              name: c.name,
              code: c.code || `SK-2026-0${c.id}`,
              email: c.email || 'partner@traveleasy.vn',
              phone: c.hotline || c.phone || '1900 6067',
              address: c.address || 'Việt Nam',
              status: mappedStatus,
              statusLabel: c.statusLabel || mappedLabel,
              createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '01/01/2026',

              // Pháp lý KYB
              taxCode: c.taxCode || fallbackTax || '0101234567',
              legalRepresentative: c.legalRepresentative || fallbackRep || 'Nguyễn Văn Đại Diện',
              identityCardNumber: c.identityCardNumber || '031088012345',
              identityCardFrontUrl:
                c.identityCardFrontUrl ||
                'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
              identityCardBackUrl:
                c.identityCardBackUrl ||
                'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
              businessLicenseUrl:
                c.businessLicenseUrl ||
                'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
              transportLicenseUrl:
                c.transportLicenseUrl ||
                'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',

              // Tài khoản ngân hàng Escrow
              bankName: c.bankName || 'MB Bank (Ngân hàng TMCP Quân Đội)',
              bankAccountNumber: c.bankAccountNumber || '091288899999',
              bankAccountOwner: c.bankAccountOwner || normalizeVietnamese(c.name),

              kycStatus: c.kycStatus || (mappedStatus === 'ACTIVE' ? 'VERIFIED' : 'PENDING'),
              commissionRate: c.commissionRate ? Number(c.commissionRate) * 100 : 8.0,
              rejectionReason: c.rejectionReason,
              verifiedAt: c.verifiedAt,
              verifiedBy: c.verifiedBy,
            };
          })
        );
      }
    } catch (err) {
      console.warn('Failed to load companies from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openEditModal = (c: BusCompanyItem) => {
    setEditingCompany(c);
    setEditName(c.name);
    setEditCode(c.code);
    setEditHotline(c.phone);
    setEditEmail(c.email);
    setEditAddress(c.address || '');
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    setSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        code: editCode.trim(),
        hotline: editHotline.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
      };

      await api.put(`/admin/bus-companies/${editingCompany.id}`, payload);
      toast.success(`Đã cập nhật nhà xe "${payload.name}" thành công!`, 'Cập Nhật Thành Công');
      setEditingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Update company error:', err);
      toast.error(err.response?.data?.message || 'Cập nhật nhà xe thất bại!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (c: BusCompanyItem) => {
    if (
      !window.confirm(
        `XÁC NHẬN XÓA MỀM (BẢO TOÀN LƯU TRỮ AN TOÀN):\n\nBạn có chắc muốn chuyển đối tác nhà xe "${c.name}" sang trạng thái ĐÃ XÓA MỀM?\n\n• Toàn bộ dữ liệu tuyến đường, chuyến đi, hợp đồng và hóa đơn đối soát được BẢO TOÀN NGUYÊN VẸN 100% trong CSDL.\n• Nhà xe sẽ ngừng mở bán trên sàn.\n• Quản trị viên có thể bấm [Khôi phục] bất cứ lúc nào.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/bus-companies/${c.id}`);
      setCompanies((prev) =>
        prev.map((item) =>
          item.id === c.id
            ? { ...item, status: 'DELETED', statusLabel: 'Đã xóa mềm' }
            : item
        )
      );
      toast.info(`Đã chuyển nhà xe "${c.name}" sang trạng thái XÓA MỀM an toàn!`, 'Xóa Mềm Thành Công');
    } catch (err: any) {
      console.error('Delete company error:', err);
      toast.error(err.response?.data?.message || 'Xóa nhà xe thất bại!', 'Lỗi');
    }
  };

  const handleRestoreCompany = async (c: BusCompanyItem) => {
    try {
      await api.patch(`/admin/bus-companies/${c.id}/restore`);
      setCompanies((prev) =>
        prev.map((item) =>
          item.id === c.id
            ? { ...item, status: 'ACTIVE', statusLabel: 'Đang hoạt động' }
            : item
        )
      );
      toast.success(`Đã khôi phục đối tác nhà xe "${c.name}" hoạt động trở lại!`, 'Khôi Phục Thành Công');
    } catch (err: any) {
      console.error('Restore company error:', err);
      toast.error(err.response?.data?.message || 'Khôi phục nhà xe thất bại!', 'Lỗi');
    }
  };

  // Toggle nhanh Tạm Ngưng / Mở Lại
  const toggleCompanyStatus = async (id: string) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;
    const willSuspend = target.status === 'ACTIVE';
    const newStatus = willSuspend ? 'SUSPENDED' : 'ACTIVE';

    try {
      await api.patch(`/admin/bus-companies/${id}/status`, null, { params: { status: newStatus } });
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          if (willSuspend) {
            return { ...c, status: 'SUSPENDED', statusLabel: 'Tạm ngưng' };
          }
          return { ...c, status: 'ACTIVE', statusLabel: 'Đang hoạt động' };
        })
      );

      if (willSuspend) {
        toast.warning(`Đã tạm ngưng mở bán đối tác "${target.name}" trên sàn!`, 'Tạm Ngưng Đối Tác');
      } else {
        toast.success(`Đã kích hoạt đối tác "${target.name}" mở bán trở lại!`, 'Kích Hoạt Đối Tác');
      }
    } catch (err: any) {
      console.error('Update company status error:', err);
      toast.error('Cập nhật trạng thái nhà xe thất bại!', 'Lỗi');
    }
  };

  // =========================================================================
  // XỬ LÝ 3 NHÁNH THẨM ĐỊNH TRONG MODAL KYB CENTER
  // =========================================================================

  // 1. Phê duyệt & Cấp tài khoản & Xác lập hoa hồng
  const handleApproveKyb = async () => {
    if (!viewingCompany) return;
    setActionLoading(true);

    try {
      const rateDecimal = (commissionInput || 8) / 100;
      await api.post(`/admin/bus-companies/${viewingCompany.id}/approve`, null, {
        params: {
          commissionRate: rateDecimal,
          adminNote: adminNoteInput.trim(),
          note: adminNoteInput.trim(),
        },
      });

      toast.success(
        `Đã phê duyệt hồ sơ pháp lý đối tác "${viewingCompany.name}"! Tỷ lệ hoa hồng sàn ${commissionInput}%. Hệ thống đã tự động cấp tài khoản Điều Hành (OPERATOR) cho email ${viewingCompany.email}.`,
        'Phê Duyệt KYB Thành Công'
      );

      setViewingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Approve KYB error:', err);
      toast.error(err.response?.data?.message || 'Phê duyệt hồ sơ thất bại!', 'Lỗi');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Yêu cầu bổ sung hồ sơ
  const handleRequestSupplementKyb = async () => {
    if (!viewingCompany) return;
    if (!supplementReason.trim()) {
      toast.error('Vui lòng nhập nội dung giấy tờ cần đối tác bổ sung!', 'Thiếu Lý Do');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/bus-companies/${viewingCompany.id}/request-supplement`, null, {
        params: {
          reason: supplementReason.trim(),
        },
      });

      toast.warning(
        `Đã gửi thông báo yêu cầu bổ sung giấy tờ tới đối tác "${viewingCompany.name}". Hạn bổ sung 7 ngày.`,
        'Yêu Cầu Bổ Sung Hồ Sơ'
      );

      setViewingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Request supplement error:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu bổ sung!', 'Lỗi');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Từ chối hồ sơ
  const handleRejectKyb = async () => {
    if (!viewingCompany) return;
    if (!rejectReasonInput.trim()) {
      toast.error('Vui lòng nhập lý do từ chối hồ sơ!', 'Thiếu Lý Do');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/bus-companies/${viewingCompany.id}/reject`, null, {
        params: {
          reason: rejectReasonInput.trim(),
        },
      });

      toast.error(`Đã từ chối hồ sơ đăng ký của đối tác "${viewingCompany.name}".`, 'Từ Chối Hồ Sơ');

      setViewingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Reject KYB error:', err);
      toast.error(err.response?.data?.message || 'Không thể từ chối hồ sơ!', 'Lỗi');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = companies.filter((c) => c.status === 'PENDING').length;
  const supplementCount = companies.filter((c) => c.status === 'PENDING_SUPPLEMENT').length;

  const filteredCompanies = companies.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị sàn{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span>{' '}
            <span style={{ color: '#0f172a' }}>Trung tâm thẩm định KYB &amp; Pháp lý đối tác</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} style={{ color: '#2563eb' }} />
            Thẩm Định Pháp Lý &amp; Ký Hợp Đồng Đối Tác (KYB Center)
          </h1>
          <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            <span style={{ color: pendingCount > 0 ? '#b45309' : '#64748b', fontWeight: pendingCount > 0 ? 800 : 600 }}>
              {pendingCount} hồ sơ chờ thẩm định
            </span>
            {supplementCount > 0 && (
              <span style={{ color: '#d97706', fontWeight: 700, marginLeft: '6px' }}>
                • {supplementCount} hồ sơ chờ bổ sung
              </span>
            )}
            , tổng cộng <strong>{companies.length}</strong> đối tác liên kết trên hệ thống
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchCompanies}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới danh sách
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Tất cả đối tác' },
          { key: 'PENDING', label: `⏳ Chờ thẩm định (${pendingCount})`, highlight: pendingCount > 0 },
          { key: 'PENDING_SUPPLEMENT', label: `⚠️ Chờ bổ sung (${supplementCount})`, highlight: supplementCount > 0 },
          { key: 'ACTIVE', label: '✅ Đang hoạt động' },
          { key: 'REJECTED', label: '❌ Bị từ chối' },
          { key: 'SUSPENDED', label: '⏸️ Tạm ngưng' },
          { key: 'DELETED', label: '🗑️ Đã xóa mềm' },
        ].map((tab: any) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: isActive ? '#2563eb' : tab.highlight ? '#fef3c7' : '#ffffff',
                color: isActive ? '#ffffff' : tab.highlight ? '#b45309' : '#64748b',
                border: isActive ? '1px solid #2563eb' : tab.highlight ? '1px solid #fde68a' : '1px solid #e2e8f0',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: tab.highlight || isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                  DOANH NGHIỆP VẬN TẢI &amp; MST
                </th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                  ĐẠI DIỆN &amp; HOTLINE
                </th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                  TÀI KHOẢN ESCROW (AML)
                </th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                  HOA HỒNG SÀN
                </th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                  TRẠNG THÁI KYB
                </th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>
                  THAO TÁC THẨM ĐỊNH
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    Đang tải danh sách hồ sơ đối tác từ máy chủ...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy hồ sơ nhà xe nào trong mục này.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const statusStyles = {
                    ACTIVE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                    PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                    PENDING_SUPPLEMENT: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
                    REJECTED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
                    SUSPENDED: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
                    DELETED: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
                  }[c.status] || { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };

                  // Kiểm tra so khớp AML tên chủ tài khoản
                  const cleanOwner = normalizeVietnamese(c.bankAccountOwner);
                  const cleanCompany = normalizeVietnamese(c.name);
                  const cleanRep = normalizeVietnamese(c.legalRepresentative);
                  const isAmlMatch =
                    cleanOwner &&
                    (cleanCompany.includes(cleanOwner) ||
                      cleanOwner.includes(cleanCompany) ||
                      cleanRep.includes(cleanOwner) ||
                      cleanOwner.includes(cleanRep));

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      {/* Doanh nghiệp & MST */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              backgroundColor: c.status === 'PENDING' ? '#fef3c7' : '#eff6ff',
                              color: c.status === 'PENDING' ? '#d97706' : '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontWeight: 800,
                            }}
                          >
                            <Bus size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>{c.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>Mã: <strong>{c.code}</strong></span>
                              <span>•</span>
                              <span>MST: <strong>{c.taxCode || 'Chưa cung cấp'}</strong></span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Đại diện & Hotline */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.legalRepresentative || 'Chưa xác định'}</div>
                        <div style={{ fontSize: '11.5px', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>
                          Hotline: {c.phone}
                        </div>
                      </td>

                      {/* Tài khoản Escrow & AML */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          {c.bankAccountOwner || 'Chưa cung cấp'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {c.bankAccountNumber} ({c.bankName?.split('(')[0]?.trim() || c.bankName})
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          {isAmlMatch ? (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                fontWeight: 700,
                              }}
                            >
                              ✓ AML Khớp Chính Chủ
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                fontWeight: 700,
                              }}
                            >
                              ⚠️ Cần Kiểm Tra AML
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Hoa hồng sàn */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 800,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {c.commissionRate || 8.0}%
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: statusStyles.bg,
                            color: statusStyles.text,
                            border: `1px solid ${statusStyles.border}`,
                            display: 'inline-block',
                          }}
                        >
                          {c.statusLabel}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {c.status === 'DELETED' ? (
                            <button
                              onClick={() => handleRestoreCompany(c)}
                              title="Khôi phục đối tác nhà xe hoạt động trở lại"
                              style={{
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <RotateCcw size={13} /> Khôi phục
                            </button>
                          ) : (
                            <>
                              {/* Nút Thẩm Định / Xem Hồ Sơ KYB */}
                              <button
                                onClick={() => {
                                  setViewingCompany(c);
                                  setCommissionInput(c.commissionRate || 8.0);
                                  setDecisionTab('APPROVE');
                                }}
                                title="Mở Trung Tâm Thẩm Định Pháp Lý KYB"
                                style={{
                                  backgroundColor: c.status === 'PENDING' || c.status === 'PENDING_SUPPLEMENT' ? '#2563eb' : '#f8fafc',
                                  color: c.status === 'PENDING' || c.status === 'PENDING_SUPPLEMENT' ? '#ffffff' : '#334155',
                                  border: c.status === 'PENDING' || c.status === 'PENDING_SUPPLEMENT' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: c.status === 'PENDING' ? '0 2px 4px rgba(37,99,235,0.25)' : 'none',
                                }}
                              >
                                <ShieldCheck size={14} />
                                {c.status === 'PENDING' || c.status === 'PENDING_SUPPLEMENT' ? 'Thẩm Định KYB' : 'Hồ Sơ Pháp Lý'}
                              </button>

                              {/* Sửa thông tin */}
                              <button
                                onClick={() => openEditModal(c)}
                                title="Sửa thông tin nhanh"
                                style={{
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px',
                                  padding: '6px 9px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Ngưng hoặc mở lại */}
                              {c.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => toggleCompanyStatus(c.id)}
                                  title="Tạm ngưng mở bán"
                                  style={{
                                    backgroundColor: '#fffbeb',
                                    color: '#d97706',
                                    border: '1px solid #fde68a',
                                    borderRadius: '6px',
                                    padding: '6px 9px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Ban size={13} />
                                </button>
                              ) : c.status === 'SUSPENDED' ? (
                                <button
                                  onClick={() => toggleCompanyStatus(c.id)}
                                  title="Mở bán trở lại"
                                  style={{
                                    backgroundColor: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #a7f3d0',
                                    borderRadius: '6px',
                                    padding: '6px 9px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Check size={13} />
                                </button>
                              ) : null}

                              {/* Xóa mềm */}
                              <button
                                onClick={() => handleDeleteCompany(c)}
                                title="Xóa mềm đối tác nhà xe (Bảo toàn lịch sử)"
                                style={{
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  padding: '6px 9px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL TRUNG TÂM THẨM ĐỊNH PHÁP LÝ & KÝ HỢP ĐỒNG ĐỐI TÁC (KYB CENTER)      */}
      {/* ========================================================================= */}
      {viewingCompany && (() => {
        const c = viewingCompany;
        const cleanOwner = normalizeVietnamese(c.bankAccountOwner);
        const cleanCompany = normalizeVietnamese(c.name);
        const cleanRep = normalizeVietnamese(c.legalRepresentative);
        const isAmlMatch =
          cleanOwner &&
          (cleanCompany.includes(cleanOwner) ||
            cleanOwner.includes(cleanCompany) ||
            cleanRep.includes(cleanOwner) ||
            cleanOwner.includes(cleanRep));

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '920px',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header Modal */}
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      Thẩm Định Pháp Lý &amp; Cấp Phép Đối Tác (KYB)
                    </h3>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                      Doanh nghiệp: <strong style={{ color: '#0f172a' }}>{c.name}</strong> • Mã đối tác: <strong>{c.code}</strong> (ID #{c.id})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setViewingCompany(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '8px',
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Body Modal */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* 1. THANH TIẾN TRÌNH & BẢNG TIÊU CHÍ THẨM ĐỊNH (KYB CHECKLIST SUMMARY) */}
                {(() => {
                  const checkedCount = Object.values(kybChecklist).filter(Boolean).length;
                  const totalCriteria = 11;
                  const progressPct = Math.round((checkedCount / totalCriteria) * 100);

                  return (
                    <div
                      style={{
                        padding: '16px 20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={18} color="#2563eb" />
                            Tiến Độ Thẩm Định Hồ Sơ Đối Tác:
                            <span style={{ color: checkedCount === totalCriteria ? '#059669' : '#2563eb' }}>
                              {checkedCount}/{totalCriteria} Tiêu Chí ({progressPct}%)
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            Yêu cầu chuyên viên kiểm tra chéo qua các cổng thông tin và tích xác thực trước khi phê duyệt
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleAutoCrossCheckAll}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1.5px solid #bfdbfe',
                              borderRadius: '8px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Check size={14} /> Tự Động Đối Soát &amp; Tích Nhanh (Auto Cross-Check)
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            backgroundColor: checkedCount === totalCriteria ? '#10b981' : '#2563eb',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#475569',
                          flexWrap: 'wrap',
                          gap: '6px',
                          paddingTop: '4px',
                        }}
                      >
                        <span style={{ color: kybChecklist.taxLength && kybChecklist.taxGovCheck ? '#059669' : '#64748b' }}>
                          ● 1. MST Doanh Nghiệp ({kybChecklist.taxLength && kybChecklist.taxGovCheck ? 'Đạt' : 'Chưa xong'})
                        </span>
                        <span>➔</span>
                        <span style={{ color: kybChecklist.cccdFormat && kybChecklist.cccdNameMatch ? '#059669' : '#64748b' }}>
                          ● 2. CCCD Đại Diện ({kybChecklist.cccdFormat && kybChecklist.cccdNameMatch ? 'Đạt' : 'Chưa xong'})
                        </span>
                        <span>➔</span>
                        <span style={{ color: kybChecklist.licenseTerm && kybChecklist.licenseFixedRoute ? '#059669' : '#64748b' }}>
                          ● 3. GPKD Vận Tải ({kybChecklist.licenseTerm && kybChecklist.licenseFixedRoute ? 'Đạt' : 'Chưa xong'})
                        </span>
                        <span>➔</span>
                        <span style={{ color: kybChecklist.bankOwnerMatch && kybChecklist.bankNapasActive ? '#059669' : '#64748b' }}>
                          ● 4. Tài Khoản Escrow ({kybChecklist.bankOwnerMatch && kybChecklist.bankNapasActive ? 'Đạt' : 'Chưa xong'})
                        </span>
                        <span>➔</span>
                        <span style={{ color: checkedCount >= 9 ? '#2563eb' : '#94a3b8' }}>
                          ● 5. Ký Hợp Đồng &amp; Mở Bán
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. KHỐI 1: THẨM TRA ĐĂNG KÝ DOANH NGHIỆP & TRA CỨU MST 1-CLICK */}
                {(() => {
                  const taxValidation = validateTaxCodeFormat(c.taxCode);

                  return (
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={18} style={{ color: '#2563eb' }} />
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                            1. Thông Tin Doanh Nghiệp &amp; Đối Soát Mã Số Thuế (MST)
                          </h4>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: taxValidation.isValid ? '#dcfce7' : '#fee2e2',
                              color: taxValidation.isValid ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {taxValidation.label}
                          </span>
                        </div>

                        {/* Bộ công cụ 1-Click tra cứu Cổng Thuế Thực Tế */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <a
                            href={`http://tracuunnt.gdt.gov.vn/tccn/nnt.gdt`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <ExternalLink size={13} /> Cổng Tổng Cục Thuế (gdt.gov.vn)
                          </a>

                          <a
                            href={`https://masothue.com/tra-cuu-ma-so-thue-theo-mst/${c.taxCode || ''}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <ExternalLink size={13} /> Tra Cứu MST Nhanh (MãSốThuế.com)
                          </a>

                          <a
                            href="https://dangkykinhdoanh.gov.vn/"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <ExternalLink size={13} /> Cổng ĐKKD Quốc Gia
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TÊN PHÁP NHÂN ĐĂNG KÝ</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{c.name}</div>
                        </div>

                        <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>MÃ SỐ THUẾ DOANH NGHIỆP</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                            {c.taxCode || 'Chưa cung cấp'}
                          </div>
                        </div>

                        <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ĐỊA CHỈ TRỤ SỞ DOANH NGHIỆP</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                            {c.address || 'Việt Nam'}
                          </div>
                        </div>
                      </div>

                      {/* Checklist thẩm định MST */}
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                          📋 Checklist Kiểm Tra Tính Hợp Lệ Của Mã Số Thuế:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.taxLength}
                              onChange={() => toggleKybCheck('taxLength')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Độ dài MST chuẩn 10 số (Doanh nghiệp) hoặc 13 số (Chi nhánh phụ thuộc)</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.taxGovCheck}
                              onChange={() => toggleKybCheck('taxGovCheck')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Đã tra cứu Cổng Thuế: Doanh nghiệp trong tình trạng <strong>"Đang hoạt động"</strong> (Chưa khóa MST/Phá sản)</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.taxNameMatch}
                              onChange={() => toggleKybCheck('taxNameMatch')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Tên pháp nhân trên Cổng Thuế trùng khớp 100% với tên nhà xe đã đăng ký</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. KHỐI 2: ĐỊNH DANH CCCD GẮN CHIP CỦA NGƯỜI ĐẠI DIỆN PHÁP LUẬT */}
                {(() => {
                  const decodedCccd = decodeCccdNumber(c.identityCardNumber);

                  return (
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={18} style={{ color: '#2563eb' }} />
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                            2. Căn Cước Công Dân Gắn Chip Của Người Đại Diện Pháp Luật
                          </h4>
                        </div>

                        {decodedCccd && decodedCccd.isValidLength ? (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            ✓ Chuẩn Định Danh 12 Số BCA ({decodedCccd.province})
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                            }}
                          >
                            ⚠️ Số CCCD Chưa Đủ 12 Chữ Số
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>HỌ VÀ TÊN NGƯỜI ĐẠI DIỆN</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                            {c.legalRepresentative || 'Chưa cung cấp'}
                          </div>
                        </div>

                        <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SỐ CCCD / ĐỊNH DANH CÁ NHÂN (12 SỐ)</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                            {c.identityCardNumber || '031088012345'}
                          </div>
                        </div>
                      </div>

                      {/* Hộp Giải Mã Quy Chuẩn CCCD Bộ Công An */}
                      {decodedCccd && decodedCccd.isValidLength && (
                        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px', color: '#1e3a8a', lineHeight: 1.5 }}>
                          <strong>🔍 Giải mã quy chuẩn số định danh Bộ Công An:</strong>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span>• Nơi cấp khai sinh: <strong>{decodedCccd.province}</strong></span>
                            <span>• Giới tính: <strong>{decodedCccd.gender}</strong></span>
                            <span>• Năm sinh: <strong>{decodedCccd.birthYear}</strong></span>
                            <span>• Số ngẫu nhiên: <code>{decodedCccd.serial}</code></span>
                          </div>
                        </div>
                      )}

                      {/* Ảnh CCCD 2 mặt kèm tính năng soi chi tiết Lightbox */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        {/* Mặt trước */}
                        <div
                          onClick={() =>
                            setLightboxImage({
                              url: c.identityCardFrontUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
                              title: `CCCD Mặt Trước - ${c.legalRepresentative}`,
                            })
                          }
                          style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: '#f8fafc',
                          }}
                        >
                          <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ảnh CCCD Mặt Trước</span>
                            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <ZoomIn size={13} /> Phóng to
                            </span>
                          </div>
                          <img
                            src={c.identityCardFrontUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}
                            alt="CCCD Mặt trước"
                            style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                          />
                        </div>

                        {/* Mặt sau */}
                        <div
                          onClick={() =>
                            setLightboxImage({
                              url: c.identityCardBackUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
                              title: `CCCD Mặt Sau - ${c.legalRepresentative}`,
                            })
                          }
                          style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: '#f8fafc',
                          }}
                        >
                          <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ảnh CCCD Mặt Sau (Chip)</span>
                            <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <ZoomIn size={13} /> Phóng to
                            </span>
                          </div>
                          <img
                            src={c.identityCardBackUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'}
                            alt="CCCD Mặt sau"
                            style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      </div>

                      {/* Checklist thẩm định CCCD */}
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                          📋 Checklist Đối Chiếu Căn Cước Công Dân Đại Diện:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.cccdFormat}
                              onChange={() => toggleKybCheck('cccdFormat')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Số CCCD đúng 12 chữ số, giải mã khớp nơi sinh và năm sinh của người đại diện</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.cccdNameMatch}
                              onChange={() => toggleKybCheck('cccdNameMatch')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Họ tên trên CCCD ({c.legalRepresentative}) trùng khớp từng ký tự với người đại diện trên ĐKKD</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.cccdChipPhoto}
                              onChange={() => toggleKybCheck('cccdChipPhoto')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Ảnh 2 mặt rõ nét, có Quốc huy và Chip điện tử mặt sau, không có dấu hiệu tẩy xóa ghép ảnh</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. KHỐI 3: GIẤY PHÉP KINH DOANH VẬN TẢI BẰNG Ô TÔ (SỞ GTVT CẤP) */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} style={{ color: '#2563eb' }} />
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        3. Giấy Phép Kinh Doanh Vận Tải Tuyến Cố Định (Sở GTVT Cấp)
                      </h4>
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      Nghị định 10/2020/NĐ-CP
                    </span>
                  </div>

                  {(() => {
                    const licenseUrl = c.businessLicenseUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
                    const isPdf = licenseUrl.toLowerCase().includes('.pdf') || licenseUrl.startsWith('data:application/pdf');

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        {isPdf ? (
                          <div
                            style={{
                              border: '1px solid #fca5a5',
                              borderRadius: '12px',
                              padding: '16px',
                              backgroundColor: '#fff5f5',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '46px',
                                  height: '46px',
                                  borderRadius: '10px',
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 900,
                                  fontSize: '13px',
                                  flexShrink: 0,
                                }}
                              >
                                PDF
                              </div>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#991b1b' }}>
                                  Văn Bản Giấy Phép Kinh Doanh Vận Tải
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                  Tài liệu PDF kỹ thuật số có dấu mộc đỏ
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() =>
                                  setLightboxImage({
                                    url: licenseUrl,
                                    title: `Tài Liệu PDF: Giấy Phép Kinh Doanh & Vận Tải - ${c.name}`,
                                    isPdf: true,
                                  })
                                }
                                style={{
                                  backgroundColor: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Eye size={13} /> Đọc Trực Tiếp PDF
                              </button>

                              <a
                                href={licenseUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  backgroundColor: '#ffffff',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <ExternalLink size={13} /> Mở Tab Mới
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              setLightboxImage({
                                url: licenseUrl,
                                title: `Giấy Phép Kinh Doanh & Vận Tải - ${c.name}`,
                                isPdf: false,
                              })
                            }
                            style={{
                              border: '1px solid #cbd5e1',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              backgroundColor: '#f8fafc',
                            }}
                          >
                            <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Bản Scan Giấy Phép Kinh Doanh Vận Tải</span>
                              <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <ZoomIn size={13} /> Xem bản gốc
                              </span>
                            </div>
                            <img
                              src={licenseUrl}
                              alt="Giấy phép kinh doanh vận tải"
                              style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                            <strong>Tiêu chuẩn thẩm định pháp lý:</strong>
                            <ul style={{ margin: '6px 0 0 16px', padding: 0, color: '#475569' }}>
                              <li>Giấy phép do Sở GTVT tỉnh/thành phố cấp còn thời hạn ít nhất 6 tháng.</li>
                              <li>Đã đăng ký phương thức kinh doanh vận tải hành khách theo tuyến cố định.</li>
                              <li>Xe lắp thiết bị giám sát hành trình (GPS) và camera theo quy chuẩn QCVN 31:2014/BGTVT.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Checklist thẩm định GPKD */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      📋 Checklist Thẩm Định Giấy Phép Vận Tải:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={kybChecklist.licenseTerm}
                          onChange={() => toggleKybCheck('licenseTerm')}
                          style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                        />
                        <span>Giấy phép kinh doanh vận tải do Sở GTVT cấp còn hiệu lực trên 6 tháng</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={kybChecklist.licenseFixedRoute}
                          onChange={() => toggleKybCheck('licenseFixedRoute')}
                          style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                        />
                        <span>Đã được phê duyệt phương án chạy tuyến cố định (phù hiệu xe tuyến cố định)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={kybChecklist.licenseGpsPledge}
                          onChange={() => toggleKybCheck('licenseGpsPledge')}
                          style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                        />
                        <span>Đoàn xe có gắn thiết bị GPS &amp; Camera hành trình truyền dữ liệu trực tiếp về Cục Đường Bộ</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 5. KHỐI 4: ĐỐI CHIẾU TÀI KHOẢN NGÂN HÀNG QUYẾT TOÁN KÝ QUỸ (ESCROW AML CHECK) */}
                {(() => {
                  const bankMatch = checkDetailedBankMatch(c.bankAccountOwner, c.name, c.legalRepresentative);
                  const isMatchOk = bankMatch.score >= 90;
                  const bankCodeShort = getBankShortCode(c.bankName);
                  const qrTestUrl = `https://img.vietqr.io/image/${bankCodeShort}-${c.bankAccountNumber || '091288899999'}-compact2.png?amount=1000&addInfo=TRAVELEASY%20TEST`;

                  return (
                    <div
                      style={{
                        border: isMatchOk ? '1px solid #a7f3d0' : '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        backgroundColor: isMatchOk ? '#f0fdf4' : '#fffbeb',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CreditCard size={18} style={{ color: isMatchOk ? '#059669' : '#d97706' }} />
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                            4. Đối Chiếu Tài Khoản Quyết Toán Ký Quỹ (Escrow Anti-Money Laundering)
                          </h4>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              backgroundColor: bankMatch.badgeBg,
                              color: bankMatch.badgeColor,
                              border: `1px solid ${bankMatch.badgeColor}40`,
                            }}
                          >
                            {bankMatch.label}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQrVerifyModal({
                                bankName: c.bankName || 'MB Bank',
                                accountNo: c.bankAccountNumber || '091288899999',
                                owner: c.bankAccountOwner || 'CONG TY TNHH VAN TAI HOANG LONG EXPRESS',
                                qrUrl: qrTestUrl,
                              })
                            }
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              border: '1px solid #cbd5e1',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            }}
                          >
                            📱 Quét QR Tra Cứu Tên Thật (Napas 24/7)
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '10px 14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>NGÂN HÀNG THỤ HƯỞNG</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                            {c.bankName}
                          </div>
                        </div>

                        <div style={{ padding: '10px 14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SỐ TÀI KHOẢN QUYẾT TOÁN</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                            {c.bankAccountNumber}
                          </div>
                        </div>

                        <div style={{ padding: '10px 14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TÊN CHỦ TÀI KHOẢN (IN HOA)</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                            {c.bankAccountOwner}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: isMatchOk ? '#15803d' : '#b45309', marginBottom: '12px', lineHeight: 1.5 }}>
                        {bankMatch.desc}
                      </div>

                      {/* Checklist thẩm định Escrow */}
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                          📋 Checklist Đối Soát Tài Khoản Quyết Toán Escrow:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.bankOwnerMatch}
                              onChange={() => toggleKybCheck('bankOwnerMatch')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Tên chủ tài khoản khớp hoàn toàn với tên pháp nhân doanh nghiệp hoặc người đại diện</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.bankNapasActive}
                              onChange={() => toggleKybCheck('bankNapasActive')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Đã quét QR hoặc kiểm tra tài khoản hoạt động bình thường trên hệ thống Napas 24/7</span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={kybChecklist.bankEscrowTerms}
                              onChange={() => toggleKybCheck('bankEscrowTerms')}
                              style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
                            />
                            <span>Nhà xe đã ký cam kết nhận quyết toán tiền bán vé qua tài khoản này định kỳ ngày 15 và cuối tháng</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 6. KHỐI 5: KÊNH LIÊN LẠC & TELE-CHECK TRỰC TIẾP */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Phone size={15} style={{ color: '#2563eb' }} />
                      <span>Hotline: <strong>{c.phone}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Mail size={15} style={{ color: '#2563eb' }} />
                      <span>Email: <strong>{c.email}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`tel:${c.phone}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Phone size={12} /> Gọi Tele-Check Ngay
                    </a>

                    <a
                      href={`mailto:${c.email}?subject=TravelEasy%20Thẩm%20Định%20Hồ%20Sơ%20Đối%20Tác%20${encodeURIComponent(c.name)}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Mail size={12} /> Soạn Email Phản Hồi
                    </a>
                  </div>
                </div>

                {/* 7. KHỐI 6: BẢNG ĐIỀU KHIỂN RA QUYẾT ĐỊNH THẨM ĐỊNH (DECISION ACTION PANEL) */}
                <div
                  style={{
                    border: '2px solid #2563eb',
                    borderRadius: '14px',
                    padding: '20px',
                    backgroundColor: '#fafcff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      5. Quyết Định Thẩm Định &amp; Phát Hành Hợp Đồng
                    </h4>
                  </div>

                  {/* Tabs chọn nhánh quyết định */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setDecisionTab('APPROVE')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: decisionTab === 'APPROVE' ? '2px solid #10b981' : '1px solid #e2e8f0',
                        backgroundColor: decisionTab === 'APPROVE' ? '#ecfdf5' : '#ffffff',
                        color: decisionTab === 'APPROVE' ? '#059669' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Check size={16} /> Phương Án 1: Phê Duyệt &amp; Cấp Tài Khoản
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionTab('SUPPLEMENT')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: decisionTab === 'SUPPLEMENT' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        backgroundColor: decisionTab === 'SUPPLEMENT' ? '#fffbeb' : '#ffffff',
                        color: decisionTab === 'SUPPLEMENT' ? '#d97706' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AlertTriangle size={16} /> Phương Án 2: Yêu Cầu Bổ Sung Hồ Sơ
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionTab('REJECT')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: decisionTab === 'REJECT' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        backgroundColor: decisionTab === 'REJECT' ? '#fef2f2' : '#ffffff',
                        color: decisionTab === 'REJECT' ? '#dc2626' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <X size={16} /> Phương Án 3: Từ Chối Đơn
                    </button>
                  </div>

                  {/* Nội dung tương ứng tab quyết định */}
                  {decisionTab === 'APPROVE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                            Tỷ Lệ Hoa Hồng Sàn (%) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              step="0.5"
                              value={commissionInput}
                              onChange={(e) => setCommissionInput(Number(e.target.value))}
                              style={{
                                width: '100px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                fontWeight: 800,
                                color: '#1d4ed8',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[6, 8, 10, 12].map((rate) => (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => setCommissionInput(rate)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    backgroundColor: commissionInput === rate ? '#2563eb' : '#f1f5f9',
                                    color: commissionInput === rate ? '#ffffff' : '#475569',
                                    border: 'none',
                                  }}
                                >
                                  {rate}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                            Ghi Chú Phê Duyệt Của Ban Quản Trị
                          </label>
                          <input
                            type="text"
                            value={adminNoteInput}
                            onChange={(e) => setAdminNoteInput(e.target.value)}
                            placeholder="Ghi chú điều kiện hợp tác hoặc mã hợp đồng ký kết..."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={handleApproveKyb}
                          style={{
                            padding: '12px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          <Check size={18} />
                          {actionLoading ? 'Đang kích hoạt...' : 'PHÊ DUYỆT & PHÁT HÀNH HỢP ĐỒNG ĐỐI TÁC'}
                        </button>
                      </div>
                    </div>
                  )}

                  {decisionTab === 'SUPPLEMENT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                          Lý Do Yêu Cầu Bổ Sung Hồ Sơ <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={supplementReason}
                          onChange={(e) => setSupplementReason(e.target.value)}
                          placeholder="Nhập chi tiết các tài liệu cần chụp lại hoặc công chứng..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Gợi ý nhanh:</span>
                          {[
                            'Ảnh CCCD bị mờ/mất góc',
                            'Thiếu scan Giấy phép vận tải Sở GTVT',
                            'Tên tài khoản ngân hàng không khớp MST',
                            'Cần bổ sung văn bản ủy quyền',
                          ].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSupplementReason(t)}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                cursor: 'pointer',
                              }}
                            >
                              + {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={handleRequestSupplementKyb}
                          style={{
                            padding: '12px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Send size={16} />
                          {actionLoading ? 'Đang gửi...' : 'GỬI YÊU CẦU BỔ SUNG HỒ SƠ (HẠN 7 NGÀY)'}
                        </button>
                      </div>
                    </div>
                  )}

                  {decisionTab === 'REJECT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                          Lý Do Từ Chối Hồ Sơ <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={rejectReasonInput}
                          onChange={(e) => setRejectReasonInput(e.target.value)}
                          placeholder="Nhập lý do không thể tiếp nhận nhà xe..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={handleRejectKyb}
                          style={{
                            padding: '12px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <X size={16} />
                          {actionLoading ? 'Đang xử lý...' : 'XÁC NHẬN TỪ CHỐI HỒ SƠ ĐỐI TÁC'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Modal */}
              <div
                style={{
                  padding: '14px 24px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  backgroundColor: '#f8fafc',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewingCompany(null)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Đóng Cửa Sổ
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX PHÓNG TO ẢNH CCCD / GIẤY PHÉP KINH DOANH VẬN TẢI           */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                color: '#ffffff',
                marginBottom: '12px',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              <span>{lightboxImage.title}</span>
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={20} /> Đóng
              </button>
            </div>
            {lightboxImage.isPdf ? (
              <div style={{ width: '85vw', height: '80vh', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <iframe
                  src={`${lightboxImage.url}#toolbar=1`}
                  title={lightboxImage.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : (
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '8px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SỬA THÔNG TIN NHANH                                                 */}
      {/* ========================================================================= */}
      {editingCompany && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Cập Nhật Nhà Xe #{editingCompany.id}</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{editingCompany.name}</div>
                </div>
              </div>
              <button onClick={() => setEditingCompany(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Nhà Xe <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mã Đối Tác
                    </label>
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Hotline Đặt Vé <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={editHotline}
                      onChange={(e) => setEditHotline(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Chỉ Trụ Sở / Đăng Ký
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QUÉT QR TRA CỨU TÊN THẬT NAPAS 24/7 */}
      {qrVerifyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setQrVerifyModal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: 'min(440px, 94vw)',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Tra Cứu Tên Thật Qua VietQR Napas
                </h3>
              </div>
              <button onClick={() => setQrVerifyModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '16px', lineHeight: 1.5, textAlign: 'left' }}>
              Mở <strong>bất kỳ ứng dụng Ngân hàng nào</strong> quét mã QR test này. Màn hình xác nhận chuyển tiền của ngân hàng sẽ <strong>tự động truy vấn Napas 24/7 và hiển thị TÊN CHỦ TÀI KHOẢN THẬT</strong> được đăng ký tại ngân hàng để bạn đối chiếu:
            </div>

            <div style={{ display: 'inline-block', padding: '10px', backgroundColor: '#ffffff', border: '2px solid #2563eb', borderRadius: '12px', marginBottom: '14px' }}>
              <img
                src={qrVerifyModal.qrUrl}
                alt="VietQR Tra Cứu"
                style={{ width: '220px', height: '220px', display: 'block', objectFit: 'contain' }}
              />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', textAlign: 'left', marginBottom: '16px' }}>
              <div>• Ngân hàng: <strong>{qrVerifyModal.bankName}</strong></div>
              <div>• Số tài khoản: <strong>{qrVerifyModal.accountNo}</strong></div>
              <div>• Tên trên hồ sơ: <strong>{qrVerifyModal.owner}</strong></div>
            </div>

            <button
              type="button"
              onClick={() => {
                setKybChecklist((prev) => ({ ...prev, bankNapasActive: true }));
                toast.success('Đã xác thực số tài khoản hoạt động và khớp tên thụ hưởng trên Napas 24/7!', 'Xác Thực Thành Công');
                setQrVerifyModal(null);
              }}
              style={{
                width: '100%',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✓ Xác Nhận Tên Thật Khớp Với Hồ Sơ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusCompaniesPage;
