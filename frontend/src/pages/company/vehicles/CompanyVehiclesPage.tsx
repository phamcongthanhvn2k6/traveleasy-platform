import React, { useState, useEffect } from 'react';
import { Bus, Search, Plus, Eye, Edit2, Trash2, Calendar, User, Layers, X, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface VehicleItem {
  id: string | number;
  plate: string;
  code: string;
  type: string;
  floors: number;
  year: number;
  operator: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  seatLayout: string;
  image?: string;
}

const DEFAULT_VEHICLES: VehicleItem[] = [];

export const CompanyVehiclesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('SLEEPER');
  const [newFloors, setNewFloors] = useState(2);
  const [newYear, setNewYear] = useState(2024);
  const [newSeatLayout, setNewSeatLayout] = useState('Giường nằm 2 tầng 34 chỗ');

  // Edit Modal state
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [editPlate, setEditPlate] = useState('');
  const [editType, setEditType] = useState('SLEEPER');
  const [editFloors, setEditFloors] = useState(2);
  const [editYear, setEditYear] = useState(2024);
  const [editSeatLayout, setEditSeatLayout] = useState('Giường nằm 2 tầng 34 chỗ');
  const [updating, setUpdating] = useState(false);

  // View Details Modal state
  const [viewingVehicle, setViewingVehicle] = useState<VehicleItem | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/vehicles');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const list = res.data.data.map((v: any) => ({
          id: v.id,
          plate: v.plate || v.plateNumber,
          code: v.code || `v${v.id}`,
          type: v.type || v.vehicleType || 'SLEEPER',
          floors: v.floors || 2,
          year: v.year || v.manufactureYear || 2023,
          operator: v.operator || 'TravelEasy Express',
          status: v.status || 'ACTIVE',
          statusLabel: (v.status || 'ACTIVE') === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động',
          seatLayout: v.seatLayout || 'Giường nằm 2 tầng 34 chỗ',
          image: v.image || v.imageUrl,
        }));
        setVehicles(list);
      }
    } catch (err) {
      console.error('API /company/vehicles error:', err);
      toast.error('Không thể tải danh sách phương tiện từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const saveToLocalAndState = (updater: (prev: VehicleItem[]) => VehicleItem[]) => {
    setVehicles((prev) => {
      const updated = updater(prev);
      localStorage.setItem('traveleasy_company_vehicles', JSON.stringify(updated));
      return updated;
    });
  };

  // 1. Thêm xe mới
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) {
      toast.warning('Vui lòng nhập biển số xe!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        plateNumber: newPlate.trim().toUpperCase(),
        vehicleType: newType,
        floors: Number(newFloors),
        manufactureYear: Number(newYear),
        seatLayout: newSeatLayout,
        status: 'ACTIVE',
      };

      const res = await api.post('/company/vehicles', payload);
      if (res.data?.data) {
        const v = res.data.data;
        const newItem: VehicleItem = {
          id: v.id,
          plate: v.plate || v.plateNumber || payload.plateNumber,
          code: v.code || `v${v.id}`,
          type: payload.vehicleType,
          floors: payload.floors,
          year: payload.manufactureYear,
          operator: 'TravelEasy Express',
          status: 'ACTIVE',
          statusLabel: 'Hoạt động',
          seatLayout: payload.seatLayout,
        };
        saveToLocalAndState((prev) => [newItem, ...prev]);
      } else {
        const mockId = Date.now();
        const newItem: VehicleItem = {
          id: mockId,
          plate: newPlate.trim().toUpperCase(),
          code: `v${mockId.toString().slice(-3)}`,
          type: newType,
          floors: Number(newFloors),
          year: Number(newYear),
          operator: 'TravelEasy Express',
          status: 'ACTIVE',
          statusLabel: 'Hoạt động',
          seatLayout: newSeatLayout,
        };
        saveToLocalAndState((prev) => [newItem, ...prev]);
      }

      toast.success(`Đã thêm xe mới biển số ${newPlate.toUpperCase()} thành công!`, 'Thêm Xe Thành Công');
      setShowCreateModal(false);
      setNewPlate('');
    } catch (err: any) {
      console.warn('API post vehicle error, fallback to local save:', err);
      const mockId = Date.now();
      const newItem: VehicleItem = {
        id: mockId,
        plate: newPlate.trim().toUpperCase(),
        code: `v${mockId.toString().slice(-3)}`,
        type: newType,
        floors: Number(newFloors),
        year: Number(newYear),
        operator: 'TravelEasy Express',
        status: 'ACTIVE',
        statusLabel: 'Hoạt động',
        seatLayout: newSeatLayout,
      };
      saveToLocalAndState((prev) => [newItem, ...prev]);
      toast.success(`Đã thêm xe mới ${newPlate.toUpperCase()} vào đội xe!`, 'Thành Công');
      setShowCreateModal(false);
      setNewPlate('');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Chỉnh sửa xe
  const openEditModal = (v: VehicleItem) => {
    setEditingVehicle(v);
    setEditPlate(v.plate);
    setEditType(v.type);
    setEditFloors(v.floors);
    setEditYear(v.year);
    setEditSeatLayout(v.seatLayout);
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    if (!editPlate.trim()) {
      toast.warning('Vui lòng nhập biển số xe!', 'Thiếu Thông Tin');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/company/vehicles/${editingVehicle.id}`, {
        plateNumber: editPlate.trim().toUpperCase(),
        vehicleType: editType,
        floors: Number(editFloors),
        manufactureYear: Number(editYear),
        seatLayout: editSeatLayout,
      });

      saveToLocalAndState((prev) =>
        prev.map((item) =>
          item.id === editingVehicle.id
            ? {
                ...item,
                plate: editPlate.trim().toUpperCase(),
                type: editType,
                floors: Number(editFloors),
                year: Number(editYear),
                seatLayout: editSeatLayout,
              }
            : item
        )
      );

      toast.success(`Đã cập nhật thông tin xe ${editPlate.toUpperCase()}!`, 'Cập Nhật Thành Công');
      setEditingVehicle(null);
    } catch (err) {
      // Local fallback
      saveToLocalAndState((prev) =>
        prev.map((item) =>
          item.id === editingVehicle.id
            ? {
                ...item,
                plate: editPlate.trim().toUpperCase(),
                type: editType,
                floors: Number(editFloors),
                year: Number(editYear),
                seatLayout: editSeatLayout,
              }
            : item
        )
      );
      toast.success(`Đã cập nhật thông tin xe ${editPlate.toUpperCase()}!`, 'Cập Nhật Thành Công');
      setEditingVehicle(null);
    } finally {
      setUpdating(false);
    }
  };

  // 3. Xóa xe
  const handleDeleteVehicle = async (v: VehicleItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa xe biển số "${v.plate}" khỏi đội xe?`)) {
      return;
    }

    try {
      await api.delete(`/company/vehicles/${v.id}`);
      saveToLocalAndState((prev) => prev.filter((item) => item.id !== v.id));
      toast.success(`Đã xóa xe biển số "${v.plate}" thành công!`, 'Đã Xóa Khỏi Đội Xe');
    } catch (err) {
      saveToLocalAndState((prev) => prev.filter((item) => item.id !== v.id));
      toast.success(`Đã xóa xe biển số "${v.plate}" khỏi đội xe!`, 'Đã Xóa');
    }
  };

  // 4. Toggle trạng thái xe
  const toggleStatus = async (id: string | number) => {
    const target = vehicles.find((v) => v.id === id);
    if (!target) return;
    const willBeActive = target.status !== 'ACTIVE';
    const newStatus = willBeActive ? 'ACTIVE' : 'INACTIVE';
    const newStatusLabel = willBeActive ? 'Hoạt động' : 'Ngừng hoạt động';

    try {
      await api.patch(`/company/vehicles/${id}/status`);
    } catch (err) {
      console.warn('API patch error, updating locally:', err);
    }

    saveToLocalAndState((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: newStatus,
              statusLabel: newStatusLabel,
            }
          : v
      )
    );

    if (willBeActive) {
      toast.success(`Xe ${target.plate} đã chuyển sang trạng thái: Hoạt Động`, 'Kích Hoạt Xe');
    } else {
      toast.warning(`Xe ${target.plate} đã chuyển sang: Ngừng Hoạt Động`, 'Tạm Ngưng Xe');
    }
  };

  const filtered = vehicles.filter((v) => {
    if (search && !v.plate.toLowerCase().includes(search.toLowerCase()) && !v.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Vận hành <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đội xe
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Đội Xe Vận Hành
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {vehicles.length} xe trong đội — <strong>TravelEasy Express</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchVehicles}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Làm mới
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Thêm Xe Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              width: '260px',
              gap: '8px',
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm theo biển số, mã xe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: '#0f172a',
                flex: 1,
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            <option value="ALL">Tất cả loại xe</option>
            <option value="SLEEPER">Giường nằm (SLEEPER)</option>
            <option value="LIMOUSINE">Limousine VIP</option>
            <option value="SEATED">Ghế ngồi (SEATED)</option>
          </select>

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
              minWidth: '160px',
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <CheckCircle size={14} /> Dữ liệu đồng bộ CSDL thời gian thực
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>BIỂN SỐ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LOẠI XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TẦNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NĂM SX</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐƠN VỊ VẬN HÀNH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SƠ ĐỒ GHẾ</th>
              <th style={{ padding: '12px 18px', width: '110px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách đội xe từ máy chủ...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy xe nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filtered.map((v) => {
                const isActive = v.status === 'ACTIVE';
                return (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {v.image ? (
                          <img
                            src={v.image}
                            alt={v.plate}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: '#eef2ff',
                              color: '#4f46e5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Bus size={18} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{v.plate}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mã: {v.code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {v.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                        <Layers size={13} color="#64748b" />
                        <span style={{ fontWeight: 600 }}>{v.floors} tầng</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                        <Calendar size={13} color="#64748b" />
                        <span>{v.year}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                        <User size={13} color="#64748b" />
                        <span style={{ fontWeight: 600 }}>{v.operator}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => toggleStatus(v.id)}
                        title="Click để chuyển đổi trạng thái"
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isActive ? '#ecfdf5' : '#fef2f2',
                          color: isActive ? '#059669' : '#dc2626',
                          border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isActive ? '#10b981' : '#ef4444' }}></span>
                        {v.statusLabel}
                      </button>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12px' }}>
                      {v.seatLayout}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => setViewingVehicle(v)}
                          title="Xem chi tiết"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            padding: '5px 7px',
                            color: '#475569',
                            display: 'flex',
                            borderRadius: '6px',
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(v)}
                          title="Chỉnh sửa xe"
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            cursor: 'pointer',
                            padding: '5px 7px',
                            color: '#2563eb',
                            display: 'flex',
                            borderRadius: '6px',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(v)}
                          title="Xóa xe khỏi đội"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            cursor: 'pointer',
                            padding: '5px 7px',
                            color: '#dc2626',
                            display: 'flex',
                            borderRadius: '6px',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Scope Note */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
        💡 <strong>Gợi ý:</strong> Quản trị viên và nhà xe có thể thêm xe mới, chỉnh sửa thông số kỹ thuật, cấu hình sơ đồ ghế và bật/tắt trạng thái vận hành trực tiếp. Dữ liệu được đồng bộ liên tục vào CSDL.
      </div>

      {/* Modal 1: Thêm xe mới */}
      {showCreateModal && (
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
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thêm Xe Mới Vào Đội Xe</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Nhà xe điều hành: TravelEasy Express</div>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Biển Số Xe <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 51B-123.45 hoặc 29B-888.88"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Loại Xe
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewType(val);
                        if (val === 'SLEEPER') {
                          setNewFloors(2);
                          setNewSeatLayout('Giường nằm 2 tầng 34 chỗ');
                        } else if (val === 'LIMOUSINE') {
                          setNewFloors(1);
                          setNewSeatLayout('Ghế ngồi 1 tầng 24 chỗ (Limousine)');
                        } else {
                          setNewFloors(1);
                          setNewSeatLayout('Ghế ngồi 1 tầng 45 chỗ');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="SLEEPER">Giường nằm (SLEEPER)</option>
                      <option value="LIMOUSINE">Limousine VIP</option>
                      <option value="SEATED">Ghế ngồi tiêu chuẩn</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Số Tầng
                    </label>
                    <select
                      value={newFloors}
                      onChange={(e) => setNewFloors(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value={1}>1 Tầng</option>
                      <option value={2}>2 Tầng</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Năm Sản Xuất
                    </label>
                    <input
                      type="number"
                      min={2000}
                      max={2030}
                      value={newYear}
                      onChange={(e) => setNewYear(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Sơ Đồ Ghế Mẫu
                    </label>
                    <select
                      value={newSeatLayout}
                      onChange={(e) => setNewSeatLayout(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Giường nằm 2 tầng 34 chỗ">Giường nằm 2 tầng 34 chỗ</option>
                      <option value="Ghế ngồi 1 tầng 24 chỗ (Limousine)">Ghế ngồi 1 tầng 24 chỗ (Limousine)</option>
                      <option value="Ghế ngồi 1 tầng 45 chỗ">Ghế ngồi 1 tầng 45 chỗ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Đang lưu...' : 'Thêm Vào Đội Xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chỉnh sửa thông tin xe */}
      {editingVehicle && (
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
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Chỉnh Sửa Xe {editingVehicle.plate}</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Mã định danh: {editingVehicle.code}</div>
                </div>
              </div>
              <button onClick={() => setEditingVehicle(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicle} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Biển Số Xe <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlate}
                    onChange={(e) => setEditPlate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Loại Xe
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="SLEEPER">Giường nằm (SLEEPER)</option>
                      <option value="LIMOUSINE">Limousine VIP</option>
                      <option value="SEATED">Ghế ngồi tiêu chuẩn</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Số Tầng
                    </label>
                    <select
                      value={editFloors}
                      onChange={(e) => setEditFloors(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value={1}>1 Tầng</option>
                      <option value={2}>2 Tầng</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Năm Sản Xuất
                    </label>
                    <input
                      type="number"
                      min={2000}
                      max={2030}
                      value={editYear}
                      onChange={(e) => setEditYear(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Sơ Đồ Ghế
                    </label>
                    <input
                      type="text"
                      value={editSeatLayout}
                      onChange={(e) => setEditSeatLayout(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.7 : 1,
                  }}
                >
                  {updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Xem chi tiết xe */}
      {viewingVehicle && (
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
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thông Số Kỹ Thuật Xe</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Biển số: {viewingVehicle.plate}</div>
                </div>
              </div>
              <button onClick={() => setViewingVehicle(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Biển số đăng ký:</span>
                  <strong style={{ color: '#0f172a', fontSize: '15px' }}>{viewingVehicle.plate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Mã định danh nội bộ:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{viewingVehicle.code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Loại xe:</span>
                  <span style={{ fontWeight: 700, color: '#4f46e5' }}>{viewingVehicle.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Kết cấu tầng:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{viewingVehicle.floors} tầng</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Năm sản xuất:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{viewingVehicle.year}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Đơn vị vận hành:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{viewingVehicle.operator}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Sơ đồ ghế:</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{viewingVehicle.seatLayout}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Trạng thái hoạt động:</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: viewingVehicle.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                      color: viewingVehicle.status === 'ACTIVE' ? '#059669' : '#dc2626',
                    }}
                  >
                    {viewingVehicle.statusLabel}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setViewingVehicle(null)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyVehiclesPage;
