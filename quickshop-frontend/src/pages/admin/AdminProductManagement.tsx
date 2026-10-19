import React, { useEffect, useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { productService } from '../../services/productService';
import { aiService } from '../../services/aiService';
import { Product, Category } from '../../types/product';

export const AdminProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    categoryId: 1,
    price: 0,
    stock: 10,
    imageUrl: '',
    description: '',
  });

  const loadData = () => {
    productService.getProducts({ size: 50 }).then((res) => setProducts(res.data.content));
    productService.getCategories().then((res) => setCategories(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateAiDescription = async () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập Tên sản phẩm trước khi sinh mô tả!');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiService.generateDescription(form.name);
      setForm((prev) => ({ ...prev, description: res.data.description }));
    } catch {
      alert('Không thể gọi AI, vui lòng thử lại');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productService.createProduct(form);
      setIsModalOpen(false);
      setForm({ name: '', categoryId: 1, price: 0, stock: 10, imageUrl: '', description: '' });
      loadData();
      alert('Thêm sản phẩm thành công!');
    } catch {
      alert('Thêm sản phẩm thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await productService.deleteProduct(id);
      loadData();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Danh sách sản phẩm hệ thống</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Ảnh</th>
              <th className="py-3 px-4">Tên sản phẩm</th>
              <th className="py-3 px-4">Danh mục</th>
              <th className="py-3 px-4">Giá</th>
              <th className="py-3 px-4">Tồn kho</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <img src={p.imageUrl || 'https://via.placeholder.com/60'} alt="" className="w-10 h-10 object-cover rounded-md" />
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900">{p.name}</td>
                <td className="py-3 px-4 text-gray-500">{p.categoryName}</td>
                <td className="py-3 px-4 font-bold text-primary-700">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                </td>
                <td className="py-3 px-4">{p.stock}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm sản phẩm mới</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Danh mục *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giá bán (VND) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ảnh (Image URL)</label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Mô tả sản phẩm</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={aiLoading}
                    className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'AI đang viết...' : '✨ Sinh mô tả bằng AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Nhập mô tả hoặc bấm nút trên để AI sinh tự động..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
