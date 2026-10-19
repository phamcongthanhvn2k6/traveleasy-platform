import React from 'react';
import { Category } from '../../types/product';

interface Props {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategorySidebar: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
        Danh mục sản phẩm
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategoryId === null
                ? 'bg-primary-50 text-primary-700 font-bold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả sản phẩm
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelectCategory(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategoryId === c.id
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
