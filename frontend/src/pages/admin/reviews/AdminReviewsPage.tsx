import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Star,
  RefreshCw,
  Clock,
  User,
  Mail,
  MessageSquare,
  X,
  Check,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export interface ReviewReportItem {
  id: number;
  reporterEmail: string;
  reviewAuthor: string;
  reviewSnippet: string;
  rating: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export const AdminReviewsPage: React.FC = () => {
  const [reports, setReports] = useState<ReviewReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  // Modal xem chi tiết & xử lý báo cáo
  const [selectedReport, setSelectedReport] = useState<ReviewReportItem | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Tải danh sách báo cáo đánh giá từ CSDL Supabase
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/review-reports');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: ReviewReportItem[] = res.data.data.map((r: any) => ({
          id: Number(r.id),
          reporterEmail: r.reporterEmail || r.reporter_email || 'Chưa cung cấp',
          reviewAuthor: r.reviewAuthor || r.review_author || 'Khách hàng ẩn danh',
          reviewSnippet: r.reviewSnippet || r.review_snippet || 'Nội dung đánh giá trống',
          rating: Number(r.rating || 5),
          reason: r.reason || 'Báo cáo vi phạm nội quy đánh giá',
          status: (r.status || 'PENDING').toUpperCase() as ReviewReportItem['status'],
          createdAt: r.createdAt || r.created_at || new Date().toISOString(),
        }));
        // Sắp xếp báo cáo PENDING lên trước, sau đó theo ID giảm dần
        mapped.sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          return b.id - a.id;
        });
        setReports(mapped);
      }
    } catch (err) {
      console.error('Could not fetch review reports from API:', err);
      toast.error('Không thể tải danh sách báo cáo đánh giá từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Xử lý cập nhật trạng thái báo cáo (APPROVED, REJECTED, RESOLVED)
  const handleUpdateStatus = async (id: number, nextStatus: 'APPROVED' | 'REJECTED' | 'RESOLVED') => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/review-reports/${id}/status?status=${nextStatus}`);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );

      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({ ...selectedReport, status: nextStatus });
      }

      if (nextStatus === 'APPROVED') {
        toast.success(
          `Đã phê duyệt báo cáo #${id}: Ẩn bài đánh giá vi phạm khỏi hiển thị công khai!`,
          'Đã Ẩn Đánh Giá Vi Phạm'
        );
      } else if (nextStatus === 'REJECTED') {
        toast.warning(
          `Đã bác bỏ báo cáo #${id}: Xác nhận bài đánh giá hợp lệ, giữ nguyên hiển thị.`,
          'Đã Bác Bỏ Báo Cáo'
        );
      } else {
        toast.success(
          `Đã đánh dấu báo cáo #${id} là Đã giải quyết hòa giải thành công!`,
          'Đã Giải Quyết'
        );
      }
    } catch (err) {
      console.error('Failed to update report status:', err);
      toast.error('Không thể cập nhật trạng thái báo cáo đánh giá', 'Lỗi Xử Lý');
    } finally {
      setUpdatingId(null);
    }
  };

  // Thống kê nhanh
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const rejectedCount = reports.filter((r) => r.status === 'REJECTED').length;

  // Lọc dữ liệu
  const filteredReports = reports.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.reviewSnippet.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.reporterEmail.toLowerCase().includes(q) ||
        r.reviewAuthor.toLowerCase().includes(q) ||
        String(r.id).includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (ratingFilter !== 'ALL') {
      const targetRating = Number(ratingFilter);
      if (r.rating !== targetRating) return false;
    }
    return true;
  });

  // Render nhãn trạng thái trực quan
  const renderStatusBadge = (status: ReviewReportItem['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              backgroundColor: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={12} /> Chờ kiểm duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              backgroundColor: '#faf5ff',
              color: '#7e22ce',
              border: '1px solid #e9d5ff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldAlert size={12} /> Đã ẩn vi phạm
          </span>
        );
      case 'RESOLVED':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle2 size={12} /> Đã giải quyết
          </span>
        );
      case 'REJECTED':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <XCircle size={12} /> Đã bác bỏ
          </span>
        );
    }
  };

  // Định dạng ngày giờ chuẩn Việt Nam
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. Tiêu đề trang & Nút làm mới */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống sàn{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Kiểm duyệt nội dung
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Kiểm Duyệt & Xử Lý Báo Cáo Đánh Giá Vi Phạm
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
            Giám sát khiếu nại đánh giá từ khách hàng và đối tác nhà xe, bảo vệ uy tín và tính minh bạch toàn hệ thống
          </div>
        </div>

        <button
          onClick={fetchReports}
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
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới dữ liệu
        </button>
      </div>

      {/* 2. Thống kê tổng quan (Summary Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Tổng số báo cáo
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Ghi nhận từ khách hàng & nhà xe
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
            ⏳ Chờ kiểm duyệt
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', marginTop: '2px' }}>
            Cần ban quản trị xác minh
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>
            🛡️ Đã ẩn vi phạm
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '12px', color: '#9333ea', marginTop: '2px' }}>
            Đã gỡ bỏ khỏi sàn công khai
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
            ✅ Đã hòa giải / Xử lý
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
            {resolvedCount}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
            Hai bên đã thống nhất
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
            ✕ Đã bác bỏ
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
            {rejectedCount}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Đánh giá hợp lệ, giữ nguyên
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và bộ lọc đa năng */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search */}
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
            placeholder="Tìm theo nội dung đánh giá, lý do vi phạm, tác giả, email người báo..."
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
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="ALL">Tất cả trạng thái ({totalCount})</option>
            <option value="PENDING">Chờ kiểm duyệt ({pendingCount})</option>
            <option value="APPROVED">Đã ẩn vi phạm ({approvedCount})</option>
            <option value="RESOLVED">Đã giải quyết ({resolvedCount})</option>
            <option value="REJECTED">Đã bác bỏ ({rejectedCount})</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Số sao:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="ALL">Tất cả số sao</option>
            <option value="1">⭐ 1 Sao (Rất tệ)</option>
            <option value="2">⭐⭐ 2 Sao (Tệ)</option>
            <option value="3">⭐⭐⭐ 3 Sao (Trung bình)</option>
            <option value="4">⭐⭐⭐⭐ 4 Sao (Hài lòng)</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Sao (Xuất sắc)</option>
          </select>
        </div>
      </div>

      {/* 4. Bảng danh sách báo cáo */}
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
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>
                MÃ & THỜI GIAN
              </th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>
                NGƯỜI BÁO CÁO & TÁC GIẢ
              </th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>
                NỘI DUNG ĐÁNH GIÁ
              </th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>
                LÝ DO BÁO CÁO VI PHẠM
              </th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>
                TRẠNG THÁI
              </th>
              <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 700, fontSize: '11.5px', textAlign: 'right' }}>
                THAO TÁC XỬ LÝ
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 18px', textAlign: 'center', color: '#64748b' }}>
                  <AlertTriangle size={32} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>
                    Không tìm thấy báo cáo đánh giá nào phù hợp
                  </div>
                  <div style={{ fontSize: '12.5px', marginTop: '4px' }}>
                    Vui lòng thử điều chỉnh lại từ khóa tìm kiếm hoặc bộ lọc trạng thái
                  </div>
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: selectedReport?.id === item.id ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onClick={() => setSelectedReport(item)}
                  onMouseEnter={(e) => {
                    if (selectedReport?.id !== item.id) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedReport?.id !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Mã & Thời gian */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace' }}>
                      #{item.id}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                      {formatDate(item.createdAt)}
                    </div>
                  </td>

                  {/* Người báo cáo & Tác giả */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                      <User size={13} color="#2563eb" /> {item.reviewAuthor}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                      <Mail size={12} color="#94a3b8" /> Báo bởi: <span style={{ color: '#334155', fontWeight: 500 }}>{item.reporterEmail}</span>
                    </div>
                  </td>

                  {/* Nội dung đánh giá & Sao */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'top', maxWidth: '340px' }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '5px' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          color={i < item.rating ? '#eab308' : '#cbd5e1'}
                          fill={i < item.rating ? '#eab308' : 'none'}
                        />
                      ))}
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#854d0e', marginLeft: '4px' }}>
                        {item.rating}/5 sao
                      </span>
                    </div>
                    {/* Snippet */}
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: '#1e293b',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={item.reviewSnippet}
                    >
                      "{item.reviewSnippet}"
                    </div>
                  </td>

                  {/* Lý do báo cáo vi phạm */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'top', maxWidth: '240px' }}>
                    <div
                      style={{
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        color: '#9a3412',
                        fontWeight: 600,
                        lineHeight: '1.35',
                      }}
                    >
                      {item.reason}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td style={{ padding: '14px 18px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {renderStatusBadge(item.status)}
                  </td>

                  {/* Thao tác */}
                  <td
                    style={{ padding: '14px 18px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Nút Xem chi tiết */}
                      <button
                        onClick={() => setSelectedReport(item)}
                        title="Xem đầy đủ chi tiết báo cáo"
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <Eye size={13} /> Xem chi tiết
                      </button>

                      {/* Nút Duyệt ẩn (nếu chưa duyệt) */}
                      {item.status !== 'APPROVED' && (
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                          title="Duyệt báo cáo & Ẩn đánh giá vi phạm này"
                          style={{
                            backgroundColor: '#faf5ff',
                            color: '#7e22ce',
                            border: '1px solid #e9d5ff',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ShieldAlert size={13} /> Ẩn vi phạm
                        </button>
                      )}

                      {/* Nút Bác bỏ (nếu chưa bác bỏ) */}
                      {item.status !== 'REJECTED' && (
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                          title="Bác bỏ báo cáo (Đánh giá hợp lệ, giữ nguyên)"
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <XCircle size={13} /> Bác bỏ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. MODAL XEM CHI TIẾT & XỬ LÝ KIỂM DUYỆT BÁO CÁO (DETAIL MODAL) */}
      {selectedReport && (
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
          onClick={() => setSelectedReport(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '14px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    Chi Tiết Báo Cáo Đánh Giá #{selectedReport.id}
                  </h3>
                  {renderStatusBadge(selectedReport.status)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                  Gửi vào lúc {formatDate(selectedReport.createdAt)}
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Section 1: Thông tin Bài Đánh Giá Gốc */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MessageSquare size={14} color="#2563eb" /> Nội Dung Đánh Giá Bị Khiếu Nại
              </div>

              {/* Tác giả & Stars */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  Tác giả: {selectedReport.reviewAuthor}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      color={i < selectedReport.rating ? '#eab308' : '#cbd5e1'}
                      fill={i < selectedReport.rating ? '#eab308' : 'none'}
                    />
                  ))}
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#854d0e', marginLeft: '5px' }}>
                    {selectedReport.rating}/5 sao
                  </span>
                </div>
              </div>

              {/* Trích đoạn bình luận */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '13.5px',
                  color: '#1e293b',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                }}
              >
                "{selectedReport.reviewSnippet}"
              </div>
            </div>

            {/* Section 2: Lý Do Khiếu Nại / Báo Cáo Vi Phạm */}
            <div
              style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#9a3412',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={14} color="#ea580c" /> Chi Tiết Lý Do Báo Cáo Vi Phạm
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', color: '#7c2d12', fontWeight: 600 }}>Người gửi khiếu nại:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412', marginTop: '2px' }}>
                  {selectedReport.reporterEmail}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#7c2d12', fontWeight: 600 }}>Căn cứ khiếu nại:</div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#c2410c',
                    backgroundColor: '#ffffff',
                    border: '1px solid #fdba74',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginTop: '4px',
                    lineHeight: '1.45',
                  }}
                >
                  {selectedReport.reason}
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: '#9a3412', marginTop: '10px', fontStyle: 'italic' }}>
                * Lưu ý: Ban quản trị kiểm duyệt dựa trên Bộ quy tắc ứng xử sàn TravelEasy (ngăn chặn ngôn từ thù địch, xúc phạm, thông tin sai sự thật hoặc cạnh tranh không lành mạnh).
              </div>
            </div>

            {/* Section 3: Quyết Định Kiểm Duyệt (Action Buttons) */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                Hành Động Kiểm Duyệt & Quyết Định:
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {/* 1. Phê duyệt ẩn đánh giá */}
                <button
                  disabled={updatingId === selectedReport.id}
                  onClick={() => handleUpdateStatus(selectedReport.id, 'APPROVED')}
                  style={{
                    flex: '1 1 180px',
                    backgroundColor: '#7e22ce',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(126,34,206,0.25)',
                  }}
                >
                  <ShieldAlert size={15} /> Duyệt Ẩn Đánh Giá
                </button>

                {/* 2. Đã giải quyết hòa giải */}
                <button
                  disabled={updatingId === selectedReport.id}
                  onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                  style={{
                    flex: '1 1 180px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(5,150,105,0.25)',
                  }}
                >
                  <Check size={15} /> Đã Hòa Giải / Xong
                </button>

                {/* 3. Bác bỏ khiếu nại */}
                <button
                  disabled={updatingId === selectedReport.id}
                  onClick={() => handleUpdateStatus(selectedReport.id, 'REJECTED')}
                  style={{
                    flex: '1 1 160px',
                    backgroundColor: '#ffffff',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <XCircle size={15} /> Bác Bỏ Báo Cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
