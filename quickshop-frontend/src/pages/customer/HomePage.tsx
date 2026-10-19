import React, { useEffect, useState } from 'react';
import { CategorySidebar } from '../../components/product/CategorySidebar';
import { ProductGrid } from '../../components/product/ProductGrid';
import { productService } from '../../services/productService';
import { Category, Product } from '../../types/product';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productService
      .getProducts({ categoryId: selectedCategoryId || undefined })
      .then((res) => setProducts(res.data.content))
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-emerald-500 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-tight">Rikkei E-Commerce QuickShop</h1>
        <p className="mt-2 text-primary-100 max-w-xl">
          Mua sắm tiện lợi, giao hàng COD toàn quốc với sự trợ giúp thông minh từ AI!
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <CategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        <div className="flex-1">
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  );
};
