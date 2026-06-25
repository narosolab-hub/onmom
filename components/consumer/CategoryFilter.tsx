"use client";

import { productCategories } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: { label: string; value: string }[];
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categories = productCategories,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-gray-100">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === category.value
              ? 'bg-[#E8F5E9] text-[#609966]'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
