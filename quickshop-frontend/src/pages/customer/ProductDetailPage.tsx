import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import { useCartStore } from '../../store/useCartStore';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (id) {
      productService.getProductById(Number(id)).then((res) => setProduct(res.data));
    }
  }, [id]);

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Đang tải sản phẩm...</div>;
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">{product.categoryName}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <p className="text-3xl font-extrabold text-primary-600 mt-4">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Trạng thái: {product.stock > 0 ? `Còn hàng (${product.stock} chiếc)` : 'Hết hàng'}</p>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Mô tả sản phẩm:</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description || 'Chưa có mô tả'}</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {added ? <Check className="w-5 h-5 text-white" /> : <ShoppingCart className="w-5 h-5" />}
              <span>{added ? 'Đã thêm vào giỏ hàng!' : 'Thêm vào giỏ hàng'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
