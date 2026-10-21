import React, { useState } from 'react';
import { Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface ReviewReportItem {
  id: string;
  reviewContent: string;
  rating: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  statusLabel: string;
  reportedAt: string;
}

export const AdminReviewsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const [reports, setReports] = useState<ReviewReportItem[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/review-reports');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setReports(res.data.data.map((r: any) => ({
          id: String(r.id),
          reviewContent: r.reviewSnippet || 'Nội dung đánh giá',
          rating: `Rating: ${r.rating || 5}/5`,
          reason: r.reason || 'Đánh giá chuyến đi',
          status: r.status === 'APPROVED' ? 'RESOLVED' : r.status,
          statusLabel: r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Chờ xử lý',
          reportedAt: r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'Mới gửi',
        })));
      }
    } catch (err) {
      console.warn('Could not fetch review reports from API, fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/review-reports/${id}/status`, null, { params: { status: 'APPROVED' } });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'RESOLVED', statusLabel: 'Đã duyệt' } : r
        )
      );
      toast.success('Đã phê duyệt xử lý đánh giá thành công!', 'Đồng Bộ CSDL');
    } catch (err) {
      toast.error('Lỗi khi phê duyệt báo cáo', 'Thất Bại');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/admin/review-reports/${id}/status`, null, { params: { status: 'REJECTED' } });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'REJECTED', statusLabel: 'Từ chối' } : r
        )
      );
      toast.warning('Đã từ chối yêu cầu xử lý đánh giá!', 'Đồng Bộ CSDL');
    } catch (err) {
      toast.error('Lỗi khi từ chối báo cáo', 'Thất Bại');
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;

  const filtered = reports.filter((r) => {
    if (search && !r.reviewContent.toLowerCase().includes(search.toLowerCase()) && !r.reason.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Bao cao danh gia</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Bao cao danh gia
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          {pendingCount} cho xu ly
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            flex: 1,
            gap: '8px'
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tim kiem bao cao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              width: '100%'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          <option value="ALL">Tat ca trang thai</option>
          <option value="PENDING">Cho xu ly</option>
          <option value="RESOLVED">Da duyet</option>
          <option value="REJECTED">Tu choi</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DANH GIA</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LY DO BAO CAO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGAY BAO CAO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.reviewContent}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.rating}</div>
                </td>
                <td style={{ padding: '14px 18px', color: '#334155' }}>{item.reason}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#fffbeb',
                      color: '#d97706',
                      border: '1px solid #fde68a',
                    }}
                  >
                    {item.statusLabel}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.reportedAt}</td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      title="Xem danh gia"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748b',
                        display: 'flex',
                        borderRadius: '4px'
                      }}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      title="Duyet go bo"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#10b981',
                        display: 'flex',
                        borderRadius: '4px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      title="Tu choi yeu cau"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#ef4444',
                        display: 'flex',
                        borderRadius: '4px'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewsPage;

