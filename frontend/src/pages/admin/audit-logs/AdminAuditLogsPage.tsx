import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  User,
  Search,
  RefreshCw,
  FileText,
  Printer,
  X,
  Lock,
  Unlock,
  CheckCircle2,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  before: string;
  after: string;
}

export interface SystemDefenseStatus {
  mode: 'NORMAL' | 'LOCKDOWN' | 'MAINTENANCE';
  isLockdown: boolean;
  incidentType: string;
  reason: string;
  publicNotice: string;
  disclaimerActive: boolean;
  disclaimerText: string;
  activatedAt: string;
  activatedBy: string;
}

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Trạng thái phòng vệ an ninh & công tắc khẩn cấp
  const [defenseStatus, setDefenseStatus] = useState<SystemDefenseStatus>({
    mode: 'NORMAL',
    isLockdown: false,
    incidentType: 'NONE',
    reason: 'Hệ thống hoạt động bình thường, các cơ chế an ninh mạng đang giám sát 24/7.',
    publicNotice: '',
    disclaimerActive: false,
    disclaimerText:
      'Điều khoản Bất khả kháng & Miễn trừ trách nhiệm bồi thường theo Điều 14 Quy chế Hoạt động Sàn TravelEasy.',
    activatedAt: '',
    activatedBy: 'System Sentinel',
  });

  // Modal kích hoạt phòng vệ khẩn cấp
  const [showKillSwitchModal, setShowKillSwitchModal] = useState(false);
  const [targetMode, setTargetMode] = useState<'LOCKDOWN' | 'MAINTENANCE'>('LOCKDOWN');
  const [selectedIncident, setSelectedIncident] = useState('CYBER_ATTACK');
  const [incidentReason, setIncidentReason] = useState('');
  const [customNotice, setCustomNotice] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [applyingKillSwitch, setApplyingKillSwitch] = useState(false);

  // Modal xem chi tiết nhật ký kiểm toán (Before / After diff)
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Modal xuất biên bản kiểm toán pháp lý
  const [showExportModal, setShowExportModal] = useState(false);

  // Lấy dữ liệu nhật ký kiểm toán từ API
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setLogs(
          res.data.data.map((l: any) => ({
            id: l.id,
            timestamp: l.createdAt
              ? new Date(l.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'Mới ghi nhận',
            user: l.userEmail || 'admin@traveleasy.vn',
            action: l.action || 'UPDATE_SYSTEM',
            target: l.target || 'system',
            before: l.beforeState || '-',
            after: l.afterState || '-',
          }))
        );
      }
    } catch (err) {
      console.error('Could not fetch audit logs from API:', err);
      toast.error('Không thể tải dữ liệu nhật ký kiểm toán từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  // Lấy trạng thái phòng vệ hệ thống
  const fetchDefenseStatus = async () => {
    try {
      const res = await api.get('/admin/system/defense-status');
      if (res.data?.data) {
        setDefenseStatus(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch defense status, using fallback:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDefenseStatus();
  }, []);

  // Xử lý kích hoạt Chế độ Khẩn Cấp (Lockdown / Maintenance)
  const handleTriggerDefense = async () => {
    if (confirmCode !== 'CONFIRM') {
      toast.warning('Vui lòng gõ chữ "CONFIRM" để xác nhận hành động khẩn cấp này!', 'Xác nhận bảo mật');
      return;
    }

    setApplyingKillSwitch(true);
    try {
      const defaultNotice =
        targetMode === 'LOCKDOWN'
          ? 'Hệ thống TravelEasy đang kích hoạt Quy trình Phòng vệ An ninh Mạng theo Điều 14 - Điều khoản Dịch vụ. Toàn bộ dữ liệu đặt chỗ và tiền thanh toán trước thời điểm này được bảo toàn 100%. Sàn miễn trừ mọi trách nhiệm bồi thường thiệt hại gián tiếp phát sinh từ sự kiện kỹ thuật bất khả kháng này.'
          : 'Hệ thống TravelEasy đang thực hiện cập nhật hạ tầng kỹ thuật định kỳ nhằm nâng cấp chất lượng dịch vụ. Các chuyến xe đã đặt vé vẫn diễn ra bình thường theo lịch trình của nhà xe.';

      const payload = {
        mode: targetMode,
        incidentType: selectedIncident,
        reason: incidentReason.trim() || (targetMode === 'LOCKDOWN' ? 'Phát hiện truy cập khả nghi cần khóa an toàn' : 'Bảo trì nâng cấp hệ thống'),
        publicNotice: customNotice.trim() || defaultNotice,
        disclaimerActive: true,
      };

      const res = await api.post('/admin/system/defense-status', payload);
      if (res.data?.data) {
        setDefenseStatus(res.data.data);
      }

      toast.success(
        targetMode === 'LOCKDOWN'
          ? 'ĐÃ KÍCH HOẠT CHẾ ĐỘ PHÒNG VỆ AN NINH KHẨN CẤP (LOCKDOWN)! Đã khóa thanh toán và kích hoạt điều khoản miễn trừ trách nhiệm.'
          : 'ĐÃ KÍCH HOẠT CHẾ ĐỘ BẢO TRÌ HỆ THỐNG!',
        'An Ninh Kích Hoạt'
      );

      setShowKillSwitchModal(false);
      setConfirmCode('');
      setIncidentReason('');
      setCustomNotice('');
      fetchLogs(); // Cập nhật ngay nhật ký audit mới
    } catch (err) {
      console.error('Failed to trigger defense mode:', err);
      toast.error('Không thể kích hoạt chế độ phòng vệ', 'Lỗi Hệ Thống');
    } finally {
      setApplyingKillSwitch(false);
    }
  };

  // Khôi phục trạng thái hoạt động bình thường
  const handleRestoreNormal = async () => {
    try {
      const payload = {
        mode: 'NORMAL',
        incidentType: 'NONE',
        reason: 'Sự cố đã được khắc phục hoàn toàn. Khôi phục vận hành thông suốt toàn sàn.',
        publicNotice: 'Hệ thống đã hoạt động bình thường trở lại. Trân trọng cảm ơn sự đồng hành của quý khách và đối tác!',
        disclaimerActive: false,
      };

      const res = await api.post('/admin/system/defense-status', payload);
      if (res.data?.data) {
        setDefenseStatus(res.data.data);
      }

      toast.success('Đã khôi phục hệ thống về trạng thái BÌNH THƯỜNG (ONLINE)!', 'Khôi Phục Thành Công');
      fetchLogs();
    } catch (err) {
      console.error('Failed to restore system:', err);
      toast.error('Khôi phục hệ thống thất bại', 'Lỗi');
    }
  };

  // Lọc dữ liệu nhật ký
  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.before.toLowerCase().includes(q) ||
        log.after.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Đếm theo nhóm
  const securityLogsCount = logs.filter((l) =>
    l.action.includes('LOCKDOWN') || l.action.includes('NORMAL') || l.action.includes('SANDBOX')
  ).length;
  const settlementLogsCount = logs.filter((l) => l.action.includes('SETTLEMENT')).length;
  const companyLogsCount = logs.filter((l) => l.action.includes('COMPANY')).length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. Tiêu đề & Nút thao tác nhanh */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống sàn{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> An ninh & Kiểm toán
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Nhật Ký Kiểm Toán (Audit Logs) & Cơ Chế Phòng Vệ An Ninh
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
            Ghi nhận vết can thiệp CSDL (Before/After), cơ chế Công Tắc Khẩn Cấp (Kill Switch) và Biên bản miễn trừ trách nhiệm pháp lý
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f766e',
              border: '1px solid #99f6e4',
              borderRadius: '9px',
              padding: '9px 15px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Printer size={15} /> Xuất Biên Bản Pháp Lý
          </button>

          <button
            onClick={fetchLogs}
            style={{
              backgroundColor: '#ffffff',
              color: '#1e3a8a',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              padding: '9px 15px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới CSDL
          </button>
        </div>
      </div>

      {/* 2. CƠ CHẾ BẢO VỆ PHÒNG VỆ AN NINH KHẨN CẤP (SECURITY SHIELD & KILL SWITCH) */}
      <div
        style={{
          borderRadius: '14px',
          border: `2px solid ${
            defenseStatus.mode === 'LOCKDOWN'
              ? '#dc2626'
              : defenseStatus.mode === 'MAINTENANCE'
              ? '#f59e0b'
              : '#10b981'
          }`,
          backgroundColor:
            defenseStatus.mode === 'LOCKDOWN'
              ? '#fef2f2'
              : defenseStatus.mode === 'MAINTENANCE'
              ? '#fffbeb'
              : '#f0fdf4',
          padding: '20px 24px',
          marginBottom: '22px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor:
                  defenseStatus.mode === 'LOCKDOWN'
                    ? '#dc2626'
                    : defenseStatus.mode === 'MAINTENANCE'
                    ? '#d97706'
                    : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {defenseStatus.mode === 'LOCKDOWN' ? (
                <ShieldAlert size={26} />
              ) : defenseStatus.mode === 'MAINTENANCE' ? (
                <Sliders size={26} />
              ) : (
                <ShieldCheck size={26} />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    backgroundColor:
                      defenseStatus.mode === 'LOCKDOWN'
                        ? '#fee2e2'
                        : defenseStatus.mode === 'MAINTENANCE'
                        ? '#fef3c7'
                        : '#dcfce7',
                    color:
                      defenseStatus.mode === 'LOCKDOWN'
                        ? '#991b1b'
                        : defenseStatus.mode === 'MAINTENANCE'
                        ? '#92400e'
                        : '#166534',
                    border: '1px solid currentColor',
                  }}
                >
                  {defenseStatus.mode === 'LOCKDOWN'
                    ? '🚨 KHẨN CẤP: ĐANG KHÓA AN NINH (LOCKDOWN)'
                    : defenseStatus.mode === 'MAINTENANCE'
                    ? '🛠️ BẢO TRÌ HỆ THỐNG (MAINTENANCE)'
                    : '🟢 AN TOÀN: BÌNH THƯỜNG (ONLINE - 24/7)'}
                </span>

                {defenseStatus.disclaimerActive && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      border: '1px solid #ddd6fe',
                    }}
                  >
                    ⚖️ Điều Khoản Bất Khả Kháng Kích Hoạt
                  </span>
                )}
              </div>

              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                {defenseStatus.mode === 'LOCKDOWN'
                  ? 'Cơ Chế Phòng Vệ Khẩn Cấp Đang Hoạt Động - Toàn Bộ Tiền & CSDL Đã Được Phong Tỏa An Toàn'
                  : defenseStatus.mode === 'MAINTENANCE'
                  ? 'Hệ Thống Đang Trong Thời Gian Bảo Trì Hạ Tầng & Cập Nhật Phiên Bản Mới'
                  : 'Hệ Thống TravelEasy Đang Hoạt Động Thông Suốt & Giám Sát An Ninh Tự Động'}
              </div>

              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', maxWidth: '850px', lineHeight: '1.45' }}>
                {defenseStatus.reason}
                {defenseStatus.activatedAt && (
                  <span style={{ fontWeight: 600, color: '#0f172a', marginLeft: '6px' }}>
                    (Kích hoạt lúc: {defenseStatus.activatedAt} bởi {defenseStatus.activatedBy})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons on Shield banner */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {defenseStatus.mode !== 'NORMAL' ? (
              <button
                onClick={handleRestoreNormal}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(5,150,105,0.3)',
                }}
              >
                <Unlock size={15} /> Khôi Phục Hoạt Động Bình Thường
              </button>
            ) : (
              <button
                onClick={() => setShowKillSwitchModal(true)}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220,38,38,0.3)',
                }}
              >
                <Lock size={15} /> Kích Hoạt Công Tắc Khẩn Cấp (Kill Switch)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Thống kê KPI Nhật Ký */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Tổng số bản ghi kiểm toán
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {logs.length}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Lưu trữ vĩnh viễn trên Supabase</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>
            Nhật ký an ninh & Phòng vệ
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            {securityLogsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Công tắc khẩn cấp & Môi trường</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
            Nhật ký tài chính & Đối soát
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {settlementLogsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Chi trả hoa hồng & Khóa sổ</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
            Nhật ký nhà xe đối tác
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {companyLogsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Phê duyệt & Tạm ngưng hoạt động</div>
        </div>
      </div>

      {/* 4. Toolbar: Tìm kiếm & Bộ lọc */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 12px',
            flex: '1 1 320px',
            gap: '8px',
          }}
        >
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Tìm theo email người thực hiện, hành động, đối tượng tác động (Target)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              width: '100%',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Lọc hành động:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              minWidth: '240px',
            }}
          >
            <option value="ALL">Tất cả hành động ({logs.length})</option>
            <option value="TRIGGER_EMERGENCY_LOCKDOWN">🚨 TRIGGER_EMERGENCY_LOCKDOWN (Khóa khẩn cấp)</option>
            <option value="RESTORE_SYSTEM_NORMAL">🟢 RESTORE_SYSTEM_NORMAL (Khôi phục bình thường)</option>
            <option value="TRIGGER_MAINTENANCE_MODE">🛠️ TRIGGER_MAINTENANCE_MODE (Bảo trì hệ thống)</option>
            <option value="APPROVE_COMPANY">APPROVE_COMPANY (Duyệt nhà xe)</option>
            <option value="SUSPEND_COMPANY">SUSPEND_COMPANY (Tạm ngưng nhà xe)</option>
            <option value="DELETE_COMPANY">DELETE_COMPANY (Xóa nhà xe)</option>
            <option value="PAY_SETTLEMENT">PAY_SETTLEMENT (Chi trả đối tác)</option>
            <option value="RECONCILE_SETTLEMENT">RECONCILE_SETTLEMENT (Đối soát)</option>
            <option value="TOGGLE_GATEWAY_SANDBOX">TOGGLE_GATEWAY_SANDBOX (Đổi môi trường)</option>
            <option value="APPROVE_REVIEW_REPORT">APPROVE_REVIEW_REPORT (Ẩn đánh giá)</option>
            <option value="REJECT_REVIEW_REPORT">REJECT_REVIEW_REPORT (Bác bỏ báo cáo)</option>
            <option value="CREATE_USER">CREATE_USER (Tạo người dùng)</option>
            <option value="TOGGLE_USER_STATUS">TOGGLE_USER_STATUS (Khóa tài khoản)</option>
          </select>
        </div>
      </div>

      {/* 5. Bảng Nhật Ký Kiểm Toán (Data Table) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>THỜI GIAN</th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>TÀI KHOẢN THAO TÁC</th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>HÀNH ĐỘNG HỆ THỐNG</th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>ĐỐI TƯỢNG (TARGET)</th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>BEFORE STATE</th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>AFTER STATE</th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px', textAlign: 'right' }}>CHI TIẾT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                  <div>Đang đồng bộ dữ liệu nhật ký kiểm toán từ PostgreSQL...</div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <AlertTriangle size={28} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 700, color: '#334155' }}>Không tìm thấy nhật ký kiểm toán phù hợp</div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isEmergency = log.action.includes('LOCKDOWN') || log.action.includes('NORMAL');
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isEmergency ? '#fef2f2' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease',
                    }}
                    onClick={() => setSelectedLog(log)}
                    onMouseEnter={(e) => {
                      if (!isEmergency) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isEmergency) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Thời gian */}
                    <td style={{ padding: '13px 18px', whiteSpace: 'nowrap', color: '#64748b', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} color="#94a3b8" />
                        {log.timestamp}
                      </div>
                    </td>

                    {/* Người thao tác */}
                    <td style={{ padding: '13px 18px', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="#3b82f6" />
                        {log.user}
                      </div>
                    </td>

                    {/* Hành động */}
                    <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: log.action.includes('LOCKDOWN')
                            ? '#fee2e2'
                            : log.action.includes('APPROVE')
                            ? '#ecfdf5'
                            : log.action.includes('DELETE') || log.action.includes('SUSPEND')
                            ? '#fff1f2'
                            : '#eff6ff',
                          color: log.action.includes('LOCKDOWN')
                            ? '#991b1b'
                            : log.action.includes('APPROVE')
                            ? '#059669'
                            : log.action.includes('DELETE') || log.action.includes('SUSPEND')
                            ? '#e11d48'
                            : '#2563eb',
                          border: `1px solid ${
                            log.action.includes('LOCKDOWN')
                              ? '#fecaca'
                              : log.action.includes('APPROVE')
                              ? '#a7f3d0'
                              : log.action.includes('DELETE') || log.action.includes('SUSPEND')
                              ? '#fecdd3'
                              : '#bfdbfe'
                          }`,
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Đối tượng (Target) */}
                    <td style={{ padding: '13px 18px', fontWeight: 600, color: '#0f172a' }}>
                      {log.target}
                    </td>

                    {/* Before State */}
                    <td style={{ padding: '13px 18px', maxWidth: '200px' }}>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          color: '#dc2626',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={log.before}
                      >
                        {log.before}
                      </div>
                    </td>

                    {/* After State */}
                    <td style={{ padding: '13px 18px', maxWidth: '240px' }}>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          color: '#16a34a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={log.after}
                      >
                        {log.after}
                      </div>
                    </td>

                    {/* Chi tiết */}
                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        Xem <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL 1: CÔNG TẮC KHẨN CẤP & ĐIỀU KHOẢN PHÁP LÝ MIỄN TRỪ TRÁCH NHIỆM    */}
      {/* ========================================================================= */}
      {showKillSwitchModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !applyingKillSwitch && setShowKillSwitchModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <Lock size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    Kích Hoạt Chế Độ Phòng Vệ An Ninh Khẩn Cấp (Kill Switch)
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Cơ chế bảo vệ dữ liệu & miễn trừ trách nhiệm bồi thường khi bị tấn công mạng / sự cố bất khả kháng
                  </div>
                </div>
              </div>

              {!applyingKillSwitch && (
                <button onClick={() => setShowKillSwitchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Step 1: Chọn Chế độ */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                1. Chọn Chế Độ Kích Hoạt:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  onClick={() => setTargetMode('LOCKDOWN')}
                  style={{
                    border: `2px solid ${targetMode === 'LOCKDOWN' ? '#dc2626' : '#e2e8f0'}`,
                    backgroundColor: targetMode === 'LOCKDOWN' ? '#fef2f2' : '#ffffff',
                    padding: '14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} /> 🚨 KHÓA AN NINH (LOCKDOWN)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Dùng khi phát hiện hacker xâm nhập, nghi ngờ rò rỉ CSDL, tấn công DDoS hoặc sự cố nghiêm trọng.
                  </div>
                </div>

                <div
                  onClick={() => setTargetMode('MAINTENANCE')}
                  style={{
                    border: `2px solid ${targetMode === 'MAINTENANCE' ? '#d97706' : '#e2e8f0'}`,
                    backgroundColor: targetMode === 'MAINTENANCE' ? '#fffbeb' : '#ffffff',
                    padding: '14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} /> 🛠️ BẢO TRÌ NÂNG CẤP HỆ THỐNG
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Dùng khi triển khai phiên bản mới, vá lỗi định kỳ, nâng cấp hạ tầng server.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Lý do sự cố */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                2. Phân loại tình huống & Lý do kỹ thuật:
              </label>
              <select
                value={selectedIncident}
                onChange={(e) => setSelectedIncident(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  marginBottom: '10px',
                }}
              >
                <option value="CYBER_ATTACK">🚨 Cảnh báo tấn công an ninh mạng / Dấu hiệu rò rỉ dữ liệu (Cyber Attack)</option>
                <option value="PAYMENT_GATEWAY_FAILURE">⚡ Sự cố gián đoạn cổng thanh toán ngân hàng / VietQR</option>
                <option value="DATABASE_CORRUPTION_PREVENTION">🛡️ Phong tỏa bảo vệ tính toàn vẹn CSDL (Data Protection)</option>
                <option value="INFRASTRUCTURE_UPGRADE">🛠️ Nâng cấp phiên bản hạ tầng máy chủ định kỳ</option>
                <option value="OTHER">Khác (Theo quyết định của Hội đồng Kỹ thuật)</option>
              </select>

              <textarea
                placeholder="Mô tả tóm tắt lý do kích hoạt (Ví dụ: Phát hiện lưu lượng truy cập bất thường vào cổng thanh toán, tạm khóa để đối soát)..."
                rows={2}
                value={incidentReason}
                onChange={(e) => setIncidentReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Step 3: VĂN BẢN PHÁP LÝ MIỄN TRỪ TRÁCH NHIỆM BỒI THƯỜNG (LEGAL DISCLAIMER) */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#2563eb" /> ⚖️ Điều Khoản Bất Khả Kháng & Miễn Trừ Trách Nhiệm Pháp Lý:
              </div>
              <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                "Căn cứ Điều 156 Bộ luật Dân sự 2015 và Điều 14 Quy chế Hoạt động Sàn TMĐT TravelEasy: Khi xảy ra sự cố kỹ thuật bất khả kháng hoặc tấn công an ninh mạng đe dọa tài sản người dùng, Sàn được quyền kích hoạt Chế độ Phòng Vệ Khẩn Cấp. Toàn bộ giao dịch đã xác nhận thành công trước thời điểm kích hoạt được bảo toàn 100%. Sàn TravelEasy được miễn trừ toàn bộ nghĩa vụ bồi thường thiệt hại gián tiếp, cơ hội kinh doanh phát sinh đối với hành khách và nhà xe đối tác."
              </div>
            </div>

            {/* Step 4: Xác nhận bảo mật */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                4. Nhập chữ "CONFIRM" để xác nhận kích hoạt:
              </label>
              <input
                type="text"
                placeholder="Gõ đúng chữ CONFIRM..."
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '2px solid #f87171',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                disabled={applyingKillSwitch}
                onClick={() => setShowKillSwitchModal(false)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Hủy Bỏ
              </button>

              <button
                disabled={applyingKillSwitch || confirmCode !== 'CONFIRM'}
                onClick={handleTriggerDefense}
                style={{
                  backgroundColor: confirmCode === 'CONFIRM' ? '#dc2626' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: confirmCode === 'CONFIRM' ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Lock size={15} /> Kích Hoạt Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL 2: XEM CHI TIẾT NHẬT KÝ KIỂM TOÁN (BEFORE / AFTER DIFF MODAL)     */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  Chi Tiết Bản Ghi Kiểm Toán #{selectedLog.id}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Ghi nhận vào lúc {selectedLog.timestamp}
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Tài khoản thao tác:</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', marginTop: '2px' }}>
                  {selectedLog.user}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Hành động:</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {selectedLog.action}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Đối tượng tác động:</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                  {selectedLog.target}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700 }}>Trạng thái Trước (Before State):</div>
                <pre
                  style={{
                    backgroundColor: '#fff5f5',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#991b1b',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: '4px 0 0 0',
                  }}
                >
                  {selectedLog.before}
                </pre>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>Trạng thái Sau (After State):</div>
                <pre
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#166534',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: '4px 0 0 0',
                  }}
                >
                  {selectedLog.after}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL 3: XUẤT BIÊN BẢN KIỂM TOÁN PHÁP LÝ & BẰNG CHỨNG BẢO MẬT (PRINT)  */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '820px',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Biên bản pháp lý */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, textDecoration: 'underline', marginTop: '2px' }}>
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', marginTop: '16px' }}>
                BIÊN BẢN KIỂM TOÁN AN NINH VÀ NHẬT KÝ VẬN HÀNH HỆ THỐNG
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Mã trích xuất điện tử: AUDIT-SEC-{new Date().getFullYear()}-{Math.floor(100000 + Math.random() * 900000)} | Thời gian: {new Date().toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Thông tin Đơn vị chủ quản & Căn cứ */}
            <div style={{ marginBottom: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
              <div><strong>Đơn vị vận hành:</strong> NỀN TẢNG CÔNG NGHỆ ĐẶT VÉ XE KHÁCH TRAVELEASY</div>
              <div><strong>Hệ thống quản trị CSDL:</strong> Supabase PostgreSQL (Distributed High-Availability)</div>
              <div><strong>Tài khoản Quản trị viên phụ trách:</strong> admin@traveleasy.vn</div>
              <div><strong>Tình trạng phòng vệ hiện tại:</strong> <span style={{ fontWeight: 800, color: defenseStatus.mode === 'LOCKDOWN' ? '#dc2626' : '#059669' }}>{defenseStatus.mode}</span></div>
            </div>

            {/* CĂN CỨ PHÁP LÝ MIỄN TRỪ TRÁCH NHIỆM */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#1e293b',
                lineHeight: '1.55',
              }}
            >
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: '6px' }}>
                CĂN CỨ PHÁP LÝ VỀ AN TOÀN AN NINH MẠNG & SỰ KIỆN BẤT KHẢ KHÁNG:
              </div>
              <div>
                1. Căn cứ <strong>Điều 156 Bộ luật Dân sự 2015</strong> và <strong>Luật An toàn thông tin mạng số 86/2015/QH13</strong>.
              </div>
              <div>
                2. Căn cứ <strong>Điều 14 Quy chế Hoạt động Sàn TMĐT TravelEasy</strong> về Gián đoạn Kỹ thuật & Bảo trì An ninh khẩn cấp: Mọi sự cố tấn công mạng, hacker xâm nhập hoặc sự cố đường truyền viễn thông bên thứ 3 thuộc phạm trù <em>Sự kiện Bất Khả Kháng</em>.
              </div>
              <div>
                3. Nền tảng TravelEasy cam kết bảo toàn 100% số dư và dữ liệu đặt vé hợp lệ trước thời điểm sự cố, đồng thời <strong>miễn trừ toàn bộ nghĩa vụ bồi thường thiệt hại gián tiếp</strong> đối với khách hàng và nhà xe đối tác.
              </div>
            </div>

            {/* Bảng 5 bản ghi kiểm toán gần nhất làm bằng chứng */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Trích lục 5 Thao Tác Hệ Thống Gần Nhất (Forensic Trace):
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>Thời gian</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>Thao tác</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>Hành động</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>Chi tiết (After State)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 5).map((l) => (
                    <tr key={l.id}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{l.timestamp}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 700 }}>{l.user}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontFamily: 'monospace' }}>{l.action}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontFamily: 'monospace', color: '#15803d' }}>{l.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chữ ký xác nhận */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', padding: '0 40px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>BỘ PHẬN AN NINH MẠNG & AN TOÀN THÔNG TIN</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>(Ký, đóng dấu số)</div>
                <div style={{ marginTop: '50px', fontSize: '13px', fontWeight: 800, color: '#059669' }}>
                  ✓ ĐÃ XÁC THỰC BẢO MẬT
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>ĐẠI DIỆN BAN QUẢN TRỊ SÀN TRAVELEASY</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>(Ký, ghi rõ họ tên)</div>
                <div style={{ marginTop: '50px', fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
                  PHẠM CÔNG THÀNH - GIÁM ĐỐC ĐIỀU HÀNH
                </div>
              </div>
            </div>

            {/* Nút In ấn */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Printer size={15} /> In / Lưu PDF Biên Bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
