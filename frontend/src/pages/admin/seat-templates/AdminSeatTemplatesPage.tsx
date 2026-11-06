import React, { useState, useEffect, useMemo } from 'react';
import {
  Armchair,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export type CellType = 'SEAT' | 'VIP' | 'AISLE' | 'DRIVER' | 'DOOR' | 'DISABLED';

export interface SeatCell {
  id: string; // e.g. "f1_r1_c1"
  floor: number; // 1 or 2
  row: number; // 1-based
  col: number; // 1-based
  type: CellType;
  code: string; // "A01", "B01", etc.
}

interface SeatTemplateItem {
  id: number;
  name: string;
  floors: number;
  rows: number;
  columns: number;
  totalSeats: number;
  status: 'PUBLISHED' | 'DRAFT' | 'DEPRECATED';
  statusLabel: string;
  layoutJson?: string;
}

// Hàm sinh sơ đồ mặc định chuẩn xe khách Việt Nam
export const generateDefaultLayout = (floors: number, rows: number, cols: number): SeatCell[] => {
  const cells: SeatCell[] = [];
  let seatSeqF1 = 1;
  let seatSeqF2 = 1;

  for (let f = 1; f <= floors; f++) {
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        // Tầng 1, Hàng 1 đặc thù khoang lái
        if (f === 1 && r === 1 && c === 1) {
          cells.push({
            id: `f${f}_r${r}_c${c}`,
            floor: f,
            row: r,
            col: c,
            type: 'DRIVER',
            code: 'TÀI',
          });
          continue;
        }
        if (f === 1 && r === 1 && c === cols) {
          cells.push({
            id: `f${f}_r${r}_c${c}`,
            floor: f,
            row: r,
            col: c,
            type: 'DOOR',
            code: 'CỬA',
          });
          continue;
        }

        // Tầng 2, Hàng 1 phía trước nếu ở vị trí tương ứng vô lăng/cửa
        if (f === 2 && r === 1 && (c === 1 || c === cols) && cols >= 3) {
          // Có thể là ghế VIP ngắm cảnh trước
        }

        // Lối đi (Aisle)
        const isAisle =
          (cols === 3 && c === 2) ||
          (cols === 4 && c === 3) ||
          (cols === 5 && (c === 2 || c === 4));

        // Hàng cuối cùng xe khách thường là băng ghế liền (không có lối đi)
        if (isAisle && r < rows) {
          cells.push({
            id: `f${f}_r${r}_c${c}`,
            floor: f,
            row: r,
            col: c,
            type: 'AISLE',
            code: '',
          });
        } else {
          const isVip = r <= 2; // 2 hàng đầu VIP
          const code =
            f === 1
              ? `A${String(seatSeqF1++).padStart(2, '0')}`
              : `B${String(seatSeqF2++).padStart(2, '0')}`;
          cells.push({
            id: `f${f}_r${r}_c${c}`,
            floor: f,
            row: r,
            col: c,
            type: isVip ? 'VIP' : 'SEAT',
            code: code,
          });
        }
      }
    }
  }
  return cells;
};

// Đánh số lại ghế tự động theo quy chuẩn A01-A17 (Tầng 1) và B01-B17 (Tầng 2)
export const renumberLayoutSeats = (currentCells: SeatCell[]): SeatCell[] => {
  let seqF1 = 1;
  let seqF2 = 1;

  // Sắp xếp theo Floor -> Row -> Col để đánh số thứ tự từ trước ra sau
  const sorted = [...currentCells].sort((a, b) => {
    if (a.floor !== b.floor) return a.floor - b.floor;
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  return sorted.map((cell) => {
    if (cell.type === 'SEAT' || cell.type === 'VIP') {
      const prefix = cell.floor === 1 ? 'A' : 'B';
      const seq = cell.floor === 1 ? seqF1++ : seqF2++;
      return { ...cell, code: `${prefix}${String(seq).padStart(2, '0')}` };
    }
    if (cell.type === 'DRIVER') return { ...cell, code: 'TÀI' };
    if (cell.type === 'DOOR') return { ...cell, code: 'CỬA' };
    if (cell.type === 'AISLE' || cell.type === 'DISABLED') return { ...cell, code: '' };
    return cell;
  });
};

export const AdminSeatTemplatesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<SeatTemplateItem[]>([]);

  // Modal Builder & Editor State
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [floors, setFloors] = useState<number>(2);
  const [rows, setRows] = useState<number>(6);
  const [cols, setCols] = useState<number>(3);
  const [layoutCells, setLayoutCells] = useState<SeatCell[]>([]);
  const [activeBuilderFloor, setActiveBuilderFloor] = useState<number>(1);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Preview State
  const [previewTemplate, setPreviewTemplate] = useState<SeatTemplateItem | null>(null);
  const [previewFloor, setPreviewFloor] = useState<number>(1);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/seat-templates');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTemplates(
          res.data.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            floors: t.maxFloor || 2,
            rows: t.maxRows || 6,
            columns: t.maxColumns || 3,
            totalSeats: t.totalSeats || 34,
            status: t.status === 'DEPRECATED' ? 'DEPRECATED' : t.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
            statusLabel:
              t.status === 'DEPRECATED'
                ? 'Ngưng dùng (Xóa mềm)'
                : t.status === 'DRAFT'
                ? 'Bản nháp'
                : 'Đã xuất bản',
            layoutJson: t.layoutJson,
          }))
        );
      }
    } catch (err) {
      console.error('Could not fetch seat templates from API:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Đếm tổng số ghế hành khách thực tế (chỉ đếm SEAT và VIP)
  const activePassengerSeatsCount = useMemo(() => {
    return layoutCells.filter((c) => c.type === 'SEAT' || c.type === 'VIP').length;
  }, [layoutCells]);

  // Đếm số ghế tầng 1 & tầng 2
  const floor1SeatsCount = useMemo(() => {
    return layoutCells.filter((c) => c.floor === 1 && (c.type === 'SEAT' || c.type === 'VIP')).length;
  }, [layoutCells]);

  const floor2SeatsCount = useMemo(() => {
    return layoutCells.filter((c) => c.floor === 2 && (c.type === 'SEAT' || c.type === 'VIP')).length;
  }, [layoutCells]);

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setTemplateName('Sơ đồ Giường Nằm Limousine 34 Chỗ');
    setFloors(2);
    setRows(6);
    setCols(3);
    setLayoutCells(generateDefaultLayout(2, 6, 3));
    setActiveBuilderFloor(1);
    setEditingCellId(null);
    setShowBuilderModal(true);
  };

  // Mở modal sửa chi tiết
  const handleOpenEditModal = (tpl: SeatTemplateItem) => {
    setEditingTemplateId(tpl.id);
    setTemplateName(tpl.name);
    setFloors(tpl.floors);
    setRows(tpl.rows);
    setCols(tpl.columns);
    setActiveBuilderFloor(1);
    setEditingCellId(null);

    if (tpl.layoutJson) {
      try {
        const parsed = JSON.parse(tpl.layoutJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLayoutCells(parsed);
          setShowBuilderModal(true);
          return;
        }
      } catch (e) {
        console.warn('Lỗi phân tích layoutJson cũ, sinh lại layout mặc định:', e);
      }
    }
    setLayoutCells(generateDefaultLayout(tpl.floors, tpl.rows, tpl.columns));
    setShowBuilderModal(true);
  };

  // Mở modal xem trước
  const handleOpenPreview = (tpl: SeatTemplateItem) => {
    setPreviewTemplate(tpl);
    setPreviewFloor(1);
  };

  // Áp dụng Preset nhanh
  const handleApplyPreset = (presetName: string, pFloors: number, pRows: number, pCols: number) => {
    setTemplateName(presetName);
    setFloors(pFloors);
    setRows(pRows);
    setCols(pCols);
    setLayoutCells(generateDefaultLayout(pFloors, pRows, pCols));
    setActiveBuilderFloor(1);
    toast.success(`Đã áp dụng mẫu sơ đồ "${presetName}"`, 'Mẫu Chuẩn');
  };

  // Thay đổi kích thước lưới (Rows, Cols, Floors)
  const handleDimensionChange = (newFloors: number, newRows: number, newCols: number) => {
    setFloors(newFloors);
    setRows(newRows);
    setCols(newCols);
    setLayoutCells(generateDefaultLayout(newFloors, newRows, newCols));
  };

  // Xoay vòng loại ô khi click (Cycle Cell Type)
  const handleCycleCellType = (cellId: string) => {
    const cycleOrder: CellType[] = ['SEAT', 'VIP', 'AISLE', 'DOOR', 'DRIVER', 'DISABLED'];
    setLayoutCells((prev) =>
      prev.map((cell) => {
        if (cell.id !== cellId) return cell;
        const currentIdx = cycleOrder.indexOf(cell.type);
        const nextType = cycleOrder[(currentIdx + 1) % cycleOrder.length];
        return { ...cell, type: nextType };
      })
    );
  };

  // Chỉnh sửa trực tiếp mã ghế
  const handleUpdateCellCode = (cellId: string, newCode: string) => {
    setLayoutCells((prev) =>
      prev.map((cell) => (cell.id === cellId ? { ...cell, code: newCode.toUpperCase().trim() } : cell))
    );
  };

  // Bấm tự động đánh số lại
  const handleAutoRenumber = () => {
    setLayoutCells((prev) => renumberLayoutSeats(prev));
    toast.success('Đã tự động đánh số chuẩn xe khách Việt Nam (A01-A.., B01-B..)', 'Đánh Số Hoàn Tất');
  };

  // Lưu sơ đồ vào CSDL (Hỗ trợ Tạo mới & Cập nhật)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      toast.warning('Vui lòng nhập tên mẫu sơ đồ ghế!', 'Thiếu Thông Tin');
      return;
    }

    if (activePassengerSeatsCount < 1) {
      toast.error('Sơ đồ xe phải có ít nhất 1 ghế hành khách!', 'Không Hợp Lệ');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: templateName.trim(),
      maxFloor: floors,
      maxRows: rows,
      maxColumns: cols,
      totalSeats: activePassengerSeatsCount,
      status: 'PUBLISHED',
      layoutJson: JSON.stringify(layoutCells),
    };

    try {
      if (editingTemplateId) {
        // Cập nhật mẫu hiện có
        await api.put(`/admin/seat-templates/${editingTemplateId}`, payload);
        toast.success(`Cập nhật chi tiết mẫu sơ đồ "${templateName}" thành công!`, 'Thành Công');
      } else {
        // Tạo mẫu mới
        await api.post('/admin/seat-templates', payload);
        toast.success(`Tạo mới mẫu sơ đồ "${templateName}" thành công!`, 'Thành Công');
      }
      setShowBuilderModal(false);
      fetchTemplates();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu sơ đồ ghế';
      toast.error(msg, 'Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa mềm mẫu sơ đồ
  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `XÁC NHẬN NGƯNG ÁP DỤNG MẪU SƠ ĐỒ:\n\nBạn có chắc chắn muốn ngưng sử dụng mẫu "${name}"?\n• Các xe đã gán sơ đồ này vẫn hoạt động bình thường.\n• Bạn có thể khôi phục bất cứ lúc nào.`
      )
    )
      return;
    try {
      await api.delete(`/admin/seat-templates/${id}`);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: 'DEPRECATED', statusLabel: 'Ngưng dùng (Xóa mềm)' } : t
        )
      );
      toast.success(`Đã chuyển mẫu sơ đồ "${name}" sang trạng thái Ngưng dùng an toàn!`, 'Xóa Mềm Thành Công');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa mẫu sơ đồ này';
      toast.error(msg, 'Thất Bại');
    }
  };

  // Khôi phục mẫu sơ đồ
  const handleRestore = async (id: number, name: string) => {
    try {
      await api.patch(`/admin/seat-templates/${id}/restore`);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'PUBLISHED', statusLabel: 'Đã xuất bản' } : t))
      );
      toast.success(`Đã khôi phục mẫu sơ đồ "${name}" hoạt động trở lại!`, 'Khôi Phục Thành Công');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể khôi phục mẫu sơ đồ này';
      toast.error(msg, 'Thất Bại');
    }
  };

  const filtered = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  // Render ô ghế trên canvas
  const renderCellBadge = (cell: SeatCell, isInteractive = true) => {
    let bg = '#ffffff';
    let border = '1px solid #cbd5e1';
    let textColor = '#0f172a';
    let label = cell.code;
    let desc = 'Ghế thường';

    switch (cell.type) {
      case 'SEAT':
        bg = '#eff6ff';
        border = '2px solid #3b82f6';
        textColor = '#1d4ed8';
        desc = 'Ghế thường';
        break;
      case 'VIP':
        bg = '#fdf4ff';
        border = '2px solid #a855f7';
        textColor = '#7e22ce';
        desc = 'Phòng/Ghế VIP';
        break;
      case 'AISLE':
        bg = '#f8fafc';
        border = '1px dashed #cbd5e1';
        textColor = '#94a3b8';
        label = '⋯';
        desc = 'Lối đi';
        break;
      case 'DRIVER':
        bg = '#1e293b';
        border = '2px solid #0f172a';
        textColor = '#f8fafc';
        label = 'TÀI';
        desc = 'Bác tài';
        break;
      case 'DOOR':
        bg = '#ecfdf5';
        border = '2px solid #10b981';
        textColor = '#047857';
        label = 'CỬA';
        desc = 'Cửa xe';
        break;
      case 'DISABLED':
        bg = '#f1f5f9';
        border = '1px solid #94a3b8';
        textColor = '#64748b';
        label = '✕';
        desc = 'Khóa/Trống';
        break;
    }

    const isEditingCode = editingCellId === cell.id;

    return (
      <div
        key={cell.id}
        onClick={() => {
          if (isInteractive && !isEditingCode) {
            handleCycleCellType(cell.id);
          }
        }}
        title={
          isInteractive
            ? `Click để đổi loại ô: ${desc} (Mã: ${cell.code || 'không'})`
            : `${desc}: ${cell.code || 'không'}`
        }
        style={{
          width: '68px',
          height: '62px',
          backgroundColor: bg,
          border: border,
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isInteractive ? 'pointer' : 'default',
          userSelect: 'none',
          position: 'relative',
          transition: 'all 0.18s ease',
          boxShadow: cell.type === 'VIP' ? '0 2px 8px rgba(168, 85, 247, 0.2)' : 'none',
        }}
      >
        {isEditingCode && isInteractive ? (
          <input
            type="text"
            autoFocus
            maxLength={6}
            defaultValue={cell.code}
            onBlur={(e) => {
              handleUpdateCellCode(cell.id, e.target.value);
              setEditingCellId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUpdateCellCode(cell.id, (e.target as HTMLInputElement).value);
                setEditingCellId(null);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '54px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '12px',
              padding: '2px',
              borderRadius: '4px',
              border: '1px solid #2563eb',
            }}
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              if (isInteractive && (cell.type === 'SEAT' || cell.type === 'VIP')) {
                e.stopPropagation();
                setEditingCellId(cell.id);
              }
            }}
            style={{
              fontWeight: 800,
              fontSize: '13px',
              color: textColor,
              letterSpacing: '-0.2px',
            }}
          >
            {label}
          </div>
        )}

        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: textColor,
            opacity: 0.85,
            marginTop: '2px',
          }}
        >
          {cell.type === 'SEAT'
            ? 'Chuẩn'
            : cell.type === 'VIP'
            ? 'VIP'
            : cell.type === 'AISLE'
            ? 'Lối đi'
            : cell.type === 'DRIVER'
            ? 'Khoang lái'
            : cell.type === 'DOOR'
            ? 'Cửa lên'
            : 'Trống'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Breadcrumb & Header Title */}
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
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị xe{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Thiết kế sơ đồ ghế
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Armchair size={26} color="#2563eb" />
            Quản Lý & Thiết Kế Sơ Đồ Ghế Xe Khách
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Hỗ trợ tùy biến vị trí ngồi chi tiết 2 tầng (A01-A17, B01-B17), phân tách lối đi, cửa lên xuống và khoang lái chuẩn thực tế.
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 20px',
            fontWeight: 800,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={18} /> Thiết Kế Mẫu Sơ Đồ Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm kiếm mẫu sơ đồ theo tên (VD: Giường nằm 34 chỗ, Limousine 22 phòng...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              backgroundColor: '#fff',
            }}
          >
            <option value="ALL">Tất cả mẫu ({templates.length})</option>
            <option value="PUBLISHED">Đang áp dụng</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="DEPRECATED">Ngưng dùng</option>
          </select>
        </div>
      </div>

      {/* Table Danh sách Mẫu Sơ Đồ */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tên Mẫu Sơ Đồ</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Số Tầng</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kích Thước Lưới</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Số Ghế Khách</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Trạng Thái</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải danh sách mẫu sơ đồ ghế...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Armchair size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          ID: #{item.id} • {item.layoutJson ? 'Đã tùy biến ma trận ghế' : 'Cấu hình tiêu chuẩn'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#334155' }}>
                    {item.floors} Tầng {item.floors === 2 ? '(Sàn trên & dưới)' : ''}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 600 }}>
                    {item.rows} hàng × {item.columns} cột
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '13px',
                      }}
                    >
                      {item.totalSeats} chỗ
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor:
                          item.status === 'PUBLISHED'
                            ? '#ecfdf5'
                            : item.status === 'DEPRECATED'
                            ? '#fef2f2'
                            : '#f1f5f9',
                        color:
                          item.status === 'PUBLISHED'
                            ? '#059669'
                            : item.status === 'DEPRECATED'
                            ? '#dc2626'
                            : '#64748b',
                        border: `1px solid ${
                          item.status === 'PUBLISHED'
                            ? '#a7f3d0'
                            : item.status === 'DEPRECATED'
                            ? '#fecaca'
                            : '#cbd5e1'
                        }`,
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenPreview(item)}
                        title="Xem trước sơ đồ ghế 2 tầng"
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                        }}
                      >
                        <Eye size={14} /> Xem
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(item)}
                        title="Chỉnh sửa chi tiết vị trí ghế trên ma trận"
                        style={{
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                        }}
                      >
                        <Edit2 size={14} /> Thiết Kế / Sửa
                      </button>

                      {item.status === 'DEPRECATED' ? (
                        <button
                          onClick={() => handleRestore(item.id, item.name)}
                          title="Khôi phục mẫu sơ đồ hoạt động"
                          style={{
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                          }}
                        >
                          <RotateCcw size={14} /> Khôi phục
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Ngưng dùng mẫu sơ đồ"
                          style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '6px',
                            gap: '5px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                          }}
                        >
                          <Trash2 size={14} /> Ngưng dùng
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  Không tìm thấy mẫu sơ đồ nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* MODAL BUILDER & EDITOR: THIẾT KẾ VỊ TRÍ GHẾ CHI TIẾT TRỰC QUAN */}
      {/* ========================================================================= */}
      {showBuilderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
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
              <div>
                <h3
                  style={{
                    fontSize: '19px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={20} color="#2563eb" />
                  {editingTemplateId ? 'Chỉnh Sửa Chi Tiết Vị Trí Ghế' : 'Thiết Kế Mẫu Sơ Đồ Ghế Xe Khách'}
                </h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  Nhấp vào ô để đổi loại (Ghế thường / VIP / Lối đi / Bác tài / Cửa xe), nhấp đúp để đổi mã ghế.
                </div>
              </div>

              <button
                onClick={() => setShowBuilderModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSaveTemplate} id="seatTemplateForm">
                {/* 1. Thông tin cơ bản & Presets nhanh */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                    Tên Mẫu Sơ Đồ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Sơ đồ Giường Nằm Limousine 34 Chỗ (2 Tầng)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* Preset Buttons */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                    Chọn nhanh mẫu cấu hình chuẩn:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('Giường Nằm 34 Chỗ (2 Tầng)', 2, 6, 3)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🚌 Giường Nằm 34 Chỗ (2 Tầng)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('Cung Điện Di Động 22 Phòng VIP (2 Tầng)', 2, 6, 2)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fbcfe8',
                        backgroundColor: '#fdf2f8',
                        color: '#be185d',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      👑 Cung Điện 22 Phòng VIP (2 Tầng)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('Limousine Hàng Không 24 Ghế (1 Tầng)', 1, 8, 3)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        backgroundColor: '#fff7ed',
                        color: '#c2410c',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ✈️ Limousine 24 Ghế (1 Tầng)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('Ghế Ngồi Cao Cấp 45 Chỗ (1 Tầng)', 1, 11, 4)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🪑 Ghế Ngồi 45 Chỗ (1 Tầng)
                    </button>
                  </div>
                </div>

                {/* 2. Cấu hình lưới (Grid Controls) */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '14px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Số Tầng
                    </label>
                    <select
                      value={floors}
                      onChange={(e) => handleDimensionChange(Number(e.target.value), rows, cols)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      <option value={1}>1 Tầng</option>
                      <option value={2}>2 Tầng</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Số Hàng Dọc
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={15}
                      value={rows}
                      onChange={(e) => handleDimensionChange(floors, Number(e.target.value), cols)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Số Cột Ngang
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={cols}
                      onChange={(e) => handleDimensionChange(floors, rows, Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Tổng Ghế Khách
                    </label>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#dbeafe',
                        border: '1px solid #bfdbfe',
                        fontWeight: 900,
                        color: '#1d4ed8',
                        fontSize: '15px',
                        textAlign: 'center',
                      }}
                    >
                      {activePassengerSeatsCount} Chỗ
                    </div>
                  </div>
                </div>

                {/* 3. Chú thích các loại ô (Legend) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '16px',
                    backgroundColor: '#fff',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '4px' }} />
                      <span>Ghế thường</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: '#fdf4ff', border: '2px solid #a855f7', borderRadius: '4px' }} />
                      <span>Ghế/Phòng VIP</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px' }} />
                      <span>Lối đi lại</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', border: '2px solid #0f172a', borderRadius: '4px' }} />
                      <span>Bác tài</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '4px' }} />
                      <span>Cửa lên</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: '#f1f5f9', border: '1px solid #94a3b8', borderRadius: '4px' }} />
                      <span>Khóa/Trống</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoRenumber}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Check size={13} color="#2563eb" /> Đánh số lại tự động
                  </button>
                </div>

                {/* 4. Floor Selector Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveBuilderFloor(1)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '10px',
                      border: activeBuilderFloor === 1 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: activeBuilderFloor === 1 ? '#eff6ff' : '#fff',
                      color: activeBuilderFloor === 1 ? '#1d4ed8' : '#64748b',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Tầng 1 (Sàn Dưới)</span>
                    <span
                      style={{
                        backgroundColor: activeBuilderFloor === 1 ? '#2563eb' : '#e2e8f0',
                        color: activeBuilderFloor === 1 ? '#fff' : '#64748b',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    >
                      {floor1SeatsCount} ghế
                    </span>
                  </button>

                  {floors === 2 && (
                    <button
                      type="button"
                      onClick={() => setActiveBuilderFloor(2)}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '10px',
                        border: activeBuilderFloor === 2 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: activeBuilderFloor === 2 ? '#eff6ff' : '#fff',
                        color: activeBuilderFloor === 2 ? '#1d4ed8' : '#64748b',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>Tầng 2 (Sàn Trên)</span>
                      <span
                        style={{
                          backgroundColor: activeBuilderFloor === 2 ? '#2563eb' : '#e2e8f0',
                          color: activeBuilderFloor === 2 ? '#fff' : '#64748b',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      >
                        {floor2SeatsCount} ghế
                      </span>
                    </button>
                  )}
                </div>

                {/* 5. Canvas Khung Xe & Ma Trận Ghế */}
                <div
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    border: '2px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  {/* Đầu xe (Front Windshield & Cabin) */}
                  <div
                    style={{
                      width: `${Math.max(260, cols * 78)}px`,
                      backgroundColor: '#334155',
                      color: '#f8fafc',
                      padding: '8px 16px',
                      borderRadius: '14px 14px 4px 4px',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      letterSpacing: '1px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <span>🟡 ĐÈN TRÁI</span>
                    <span>ĐẦU XE • {activeBuilderFloor === 1 ? 'TẦNG 1' : 'TẦNG 2'}</span>
                    <span>ĐÈN PHẢI 🟡</span>
                  </div>

                  {/* Lưới các ô ghế */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cols}, 68px)`,
                      gap: '10px',
                      backgroundColor: '#ffffff',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    {layoutCells
                      .filter((c) => c.floor === activeBuilderFloor)
                      .map((cell) => renderCellBadge(cell, true))}
                  </div>

                  {/* Đuôi xe (Rear of bus) */}
                  <div
                    style={{
                      width: `${Math.max(260, cols * 78)}px`,
                      backgroundColor: '#64748b',
                      color: '#f8fafc',
                      padding: '6px 16px',
                      borderRadius: '4px 4px 14px 14px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '11px',
                      marginTop: '16px',
                    }}
                  >
                    🔴 ĐUÔI XE • KHOANG HÀNH LÝ
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                Tổng quy mô:{' '}
                <strong style={{ color: '#2563eb' }}>
                  {activePassengerSeatsCount} ghế khách
                </strong>{' '}
                ({floor1SeatsCount} tầng 1 + {floor2SeatsCount} tầng 2)
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  form="seatTemplateForm"
                  disabled={submitting}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {submitting ? 'Đang lưu vào CSDL...' : editingTemplateId ? 'Cập Nhật Mẫu Sơ Đồ' : 'Lưu Vào CSDL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PREVIEW: XEM TRƯỚC SƠ ĐỒ 2 TẦNG TRỰC QUAN */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
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
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Xem Trước Sơ Đồ: {previewTemplate.name}
                </h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  {previewTemplate.floors} Tầng • {previewTemplate.rows} hàng × {previewTemplate.columns} cột • {previewTemplate.totalSeats} ghế hành khách
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {/* Floor Switcher */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => setPreviewFloor(1)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: previewFloor === 1 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: previewFloor === 1 ? '#eff6ff' : '#fff',
                    color: previewFloor === 1 ? '#1d4ed8' : '#64748b',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Tầng 1 (Sàn Dưới)
                </button>
                {previewTemplate.floors === 2 && (
                  <button
                    onClick={() => setPreviewFloor(2)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: previewFloor === 2 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: previewFloor === 2 ? '#eff6ff' : '#fff',
                      color: previewFloor === 2 ? '#1d4ed8' : '#64748b',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Tầng 2 (Sàn Trên)
                  </button>
                )}
              </div>

              {/* Chassis Render */}
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  border: '2px solid #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(260, previewTemplate.columns * 78)}px`,
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    padding: '8px 16px',
                    borderRadius: '14px 14px 4px 4px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  ĐẦU XE • {previewFloor === 1 ? 'TẦNG 1' : 'TẦNG 2'}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${previewTemplate.columns}, 68px)`,
                    gap: '10px',
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {(previewTemplate.layoutJson
                    ? (JSON.parse(previewTemplate.layoutJson) as SeatCell[])
                    : generateDefaultLayout(previewTemplate.floors, previewTemplate.rows, previewTemplate.columns)
                  )
                    .filter((c) => c.floor === previewFloor)
                    .map((cell) => renderCellBadge(cell, false))}
                </div>

                <div
                  style={{
                    width: `${Math.max(260, previewTemplate.columns * 78)}px`,
                    backgroundColor: '#64748b',
                    color: '#f8fafc',
                    padding: '6px 16px',
                    borderRadius: '4px 4px 14px 14px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '11px',
                    marginTop: '16px',
                  }}
                >
                  ĐUÔI XE
                </div>
              </div>
            </div>

            {/* Footer */}
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
                onClick={() => setPreviewTemplate(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  color: '#475569',
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
    </div>
  );
};
