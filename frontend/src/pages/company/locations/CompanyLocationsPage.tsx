import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, Building2, X, CheckCircle, RefreshCw, Info } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface CompanyLocationItem {
  id: string | number;
  code: string;
  displayName: string;
  masterLocationId?: number;
  masterLocation: string;
  masterSub: string;
  address: string;
  pickupGuide: string;
}

interface MasterLocation {
  id: number;
  name: string;
  province: string;
  address: string;
  type?: string;
  typeLabel?: string;
}

const DEFAULT_COMPANY_LOCATIONS: CompanyLocationItem[] = [
  {
    id: 'cl1',
    code: 'bl1',
    displayName: 'TE - Bến Xe Miền Đông',
    masterLocationId: 1,
    masterLocation: 'Bến xe Miền Đông',
    masterSub: 'TP. HCM · BUS_STATION',
    address: '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh',
    pickupGuide: 'Đến quầy vé 12-14 trước giờ xuất phát 30 phút để in vé lên xe.',
  },
  {
    id: 'cl2',
    code: 'bl2',
    displayName: 'TE - Bến Xe Đà Lạt',
    masterLocationId: 2,
    masterLocation: 'Bến xe Liên Tỉnh Đà Lạt',
    masterSub: 'Lâm Đồng · BUS_STATION',
    address: 'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt',
    pickupGuide: 'Đến quầy vé số 5, phòng chờ khách VIP TravelEasy Express.',
  },
  {
    id: 'cl3',
    code: 'bl3',
    displayName: 'TE - Bến Xe Mỹ Đình',
    masterLocationId: 3,
    masterLocation: 'Bến xe Mỹ Đình',
    masterSub: 'Hà Nội · BUS_STATION',
    address: 'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm',
    pickupGuide: 'Vào cổng 2, quầy tiếp nhận hành khách TravelEasy.',
  },
];

export const CompanyLocationsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<CompanyLocationItem[]>([]);
  const [masterLocations, setMasterLocations] = useState<MasterLocation[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal: Gán địa điểm mới
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<number>(1);
  const [displayName, setDisplayName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [pickupGuide, setPickupGuide] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal: Chỉnh sửa địa điểm
  const [editingItem, setEditingItem] = useState<CompanyLocationItem | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPickupGuide, setEditPickupGuide] = useState('');
  const [updating, setUpdating] = useState(false);

  // Tải danh sách Master Locations từ Backend CSDL
  const fetchMasterLocations = async () => {
    try {
      const res = await api.get('/admin/locations');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setMasterLocations(
          res.data.data.map((l: any) => ({
            id: l.id,
            name: l.name,
            province: l.province || 'Toàn quốc',
            address: l.address || l.name,
            type: l.locationType || 'BUS_STATION',
            typeLabel: l.locationType === 'TRANSIT_POINT' ? 'Trạm trung chuyển' : 'Bến xe khách',
          }))
        );
      }
    } catch (err) {
      console.warn('Could not fetch master locations from API, fallback default list:', err);
      setMasterLocations([
        { id: 1, name: 'Bến xe Miền Đông', province: 'TP. Hồ Chí Minh', address: '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh' },
        { id: 2, name: 'Bến xe Liên Tỉnh Đà Lạt', province: 'Lâm Đồng', address: 'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt' },
        { id: 3, name: 'Bến xe Mỹ Đình', province: 'Hà Nội', address: 'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm' },
        { id: 4, name: 'Bến xe Miền Tây', province: 'TP. Hồ Chí Minh', address: '395 Kinh Dương Vương, An Lạc, Bình Tân' },
        { id: 5, name: 'Trạm dừng chân Dầu Giây', province: 'Đồng Nai', address: 'QL1A, TT. Dầu Giây, Thống Nhất' },
      ]);
    }
  };

  const loadLocations = () => {
    try {
      const saved = localStorage.getItem('traveleasy_company_locations');
      if (saved) {
        setLocations(JSON.parse(saved));
      } else {
        setLocations(DEFAULT_COMPANY_LOCATIONS);
        localStorage.setItem('traveleasy_company_locations', JSON.stringify(DEFAULT_COMPANY_LOCATIONS));
      }
    } catch {
      setLocations(DEFAULT_COMPANY_LOCATIONS);
    }
  };

  useEffect(() => {
    loadLocations();
    fetchMasterLocations();
  }, []);

  const saveToStateAndStorage = (newLocations: CompanyLocationItem[]) => {
    setLocations(newLocations);
    localStorage.setItem('traveleasy_company_locations', JSON.stringify(newLocations));
  };

  // Mở modal gán địa điểm mới
  const handleOpenAssignModal = () => {
    if (masterLocations.length > 0) {
      const first = masterLocations[0];
      setSelectedMasterId(first.id);
      setDisplayName(`TE - ${first.name}`);
      setCustomAddress(first.address);
      setPickupGuide('Đến quầy vé TravelEasy trước giờ xuất bến 30 phút.');
    }
    setShowAssignModal(true);
  };

  // Khi chọn đổi master location trong dropdown
  const handleSelectMaster = (id: number) => {
    setSelectedMasterId(id);
    const chosen = masterLocations.find((m) => m.id === id);
    if (chosen) {
      setDisplayName(`TE - ${chosen.name}`);
      setCustomAddress(chosen.address);
    }
  };

  // Submit Gán địa điểm
  const handleAssignLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.warning('Vui lòng nhập tên hiển thị của địa điểm!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    const chosenMaster = masterLocations.find((m) => m.id === selectedMasterId);
    const newId = `cl_${Date.now()}`;
    const code = `bl${locations.length + 1}`;

    const newItem: CompanyLocationItem = {
      id: newId,
      code,
      displayName: displayName.trim(),
      masterLocationId: selectedMasterId,
      masterLocation: chosenMaster ? chosenMaster.name : 'Bến xe trung tâm',
      masterSub: `${chosenMaster?.province || 'Toàn quốc'} · BUS_STATION`,
      address: customAddress.trim() || chosenMaster?.address || displayName.trim(),
      pickupGuide: pickupGuide.trim() || 'Có mặt tại bến trước giờ chạy 30 phút.',
    };

    const updated = [newItem, ...locations];
    saveToStateAndStorage(updated);
    toast.success(`Đã gán thành công địa điểm "${newItem.displayName}" cho nhà xe!`, 'Gán Địa Điểm Thành Công');
    setShowAssignModal(false);
    setSubmitting(false);
  };

  // Mở modal sửa
  const handleOpenEdit = (item: CompanyLocationItem) => {
    setEditingItem(item);
    setEditDisplayName(item.displayName);
    setEditAddress(item.address);
    setEditPickupGuide(item.pickupGuide);
  };

  // Submit Sửa
  const handleUpdateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editDisplayName.trim()) {
      toast.warning('Tên hiển thị không được để trống!', 'Thiếu Thông Tin');
      return;
    }

    setUpdating(true);
    const updated = locations.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            displayName: editDisplayName.trim(),
            address: editAddress.trim(),
            pickupGuide: editPickupGuide.trim(),
          }
        : item
    );

    saveToStateAndStorage(updated);
    toast.success(`Đã cập nhật cấu hình địa điểm "${editDisplayName}"!`, 'Cập Nhật Thành Công');
    setEditingItem(null);
    setUpdating(false);
  };

  // Xóa địa điểm
  const handleDeleteLocation = (item: CompanyLocationItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy gán địa điểm "${item.displayName}" khỏi nhà xe?`)) {
      return;
    }

    const updated = locations.filter((loc) => loc.id !== item.id);
    saveToStateAndStorage(updated);
    toast.success(`Đã xóa địa điểm "${item.displayName}" khỏi danh mục nhà xe!`, 'Đã Xóa');
  };

  const filtered = locations.filter((loc) => {
    if (
      search &&
      !loc.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !loc.masterLocation.toLowerCase().includes(search.toLowerCase()) &&
      !loc.address.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Vận hành <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Địa điểm
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Địa Điểm Đón Trả Của Nhà Xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {locations.length} cấu hình đón trả — <strong>TravelEasy Express</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              loadLocations();
              fetchMasterLocations();
              toast.info('Đã làm mới danh mục địa điểm.', 'Đồng Bộ');
            }}
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
            onClick={handleOpenAssignModal}
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
            <span>Gán Địa Điểm Mới</span>
          </button>
        </div>
      </div>

      {/* Info Pill */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            color: '#0369a1',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          <Building2 size={14} color="#0284c7" />
          <span style={{ fontWeight: 700, color: '#0284c7' }}>TravelEasy Express</span>
          <span style={{ color: '#64748b' }}>Admin Location (master) $\leftrightarrow$ BusCompanyLocationConfig</span>
        </span>

        <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <CheckCircle size={14} /> Dữ liệu cấu hình đã đồng bộ thời gian thực
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '320px',
            gap: '8px',
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo tên hiển thị, bến xe gốc, địa chỉ..."
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TÊN HIỂN THỊ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐỊA ĐIỂM GỐC (MASTER)</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐỊA CHỈ CHI TIẾT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HƯỚNG DẪN ĐÓN TRẢ</th>
              <th style={{ padding: '12px 18px', width: '100px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy địa điểm nào phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.displayName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mã: {item.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.masterLocation}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.masterSub}</div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 500 }}>{item.address}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>{item.pickupGuide}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Chỉnh sửa cấu hình"
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          cursor: 'pointer',
                          padding: '5px 8px',
                          color: '#2563eb',
                          display: 'flex',
                          borderRadius: '6px',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <Edit2 size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(item)}
                        title="Xóa cấu hình địa điểm"
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          cursor: 'pointer',
                          padding: '5px 8px',
                          color: '#dc2626',
                          display: 'flex',
                          borderRadius: '6px',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Scope Note */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
        💡 <strong>Gợi ý:</strong> Nhà xe chỉ cần chọn Địa điểm gốc Master Data có sẵn trong CSDL toàn quốc, sau đó đặt tên văn phòng đại diện hoặc quầy vé riêng của mình kèm hướng dẫn đón khách để hành khách dễ dàng tìm thấy.
      </div>

      {/* Modal 1: Gán địa điểm mới */}
      {showAssignModal && (
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
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Gán Địa Điểm Cho Nhà Xe</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Chọn từ danh mục Master Data CSDL toàn sàn</div>
                </div>
              </div>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignLocation} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Điểm Gốc Master Data <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={selectedMasterId}
                    onChange={(e) => handleSelectMaster(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                    }}
                  >
                    {masterLocations.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Hiển Thị Của Nhà Xe <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="VD: TE - Bến xe Miền Đông"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Chỉ Cụ Thể (Văn phòng / Quầy vé)
                  </label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Số nhà, quầy vé, cổng đón..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Hướng Dẫn Đón Trả Khách
                  </label>
                  <textarea
                    rows={3}
                    value={pickupGuide}
                    onChange={(e) => setPickupGuide(e.target.value)}
                    placeholder="VD: Quý khách vui lòng có mặt trước giờ xuất bến 30 phút tại quầy vé số 12..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
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
                  {submitting ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chỉnh sửa địa điểm */}
      {editingItem && (
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
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Cập Nhật Điểm Đón Trả</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Bến gốc: {editingItem.masterLocation}</div>
                </div>
              </div>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateLocation} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Hiển Thị Của Nhà Xe <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
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
                    Địa Chỉ Chi Tiết
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
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
                    Hướng Dẫn Đón Trả Khách
                  </label>
                  <textarea
                    rows={3}
                    value={editPickupGuide}
                    onChange={(e) => setEditPickupGuide(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
    </div>
  );
};

export default CompanyLocationsPage;
