"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { getRelativeDate } from '@/lib/utils';
import { Gonggu } from '@/data/types';

const emojis = ['🍇', '🍎', '🍊', '🥬', '🥕', '🥩', '🍞', '🥐', '🍪', '🫒', '🍋', '🌿', '💼', '📦'];
const categories = ['과일', '식품', '건강식품', '생활용품', '베이커리', '정육'];
const colors = ['#E8F5E9', '#E3F2FD', '#FFF9C4', '#FFE0B2', '#FCE4EC', '#FFECB3', '#F1F8E9', '#FFCDD2'];

export default function NewProductPage() {
  const router = useRouter();
  const { addGonggu } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '과일',
    originalPrice: '',
    price: '',
    total: '',
    arrivalDate: '',
    pickupEndDate: '',
    emoji: '🍇',
    imageColor: '#E8F5E9',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 날짜 파싱: "YYYY-MM-DD" → "M/D" 형식으로 변환
    const parseDate = (dateStr: string) => {
      if (!dateStr) return getRelativeDate(0);
      const d = new Date(dateStr + 'T00:00:00');
      return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const arrivalStr = parseDate(formData.arrivalDate);
    const endStr = parseDate(formData.pickupEndDate);

    addGonggu({
      marketId: 1,
      type: 'product',
      deliveryAvailable: false,
      title: formData.title,
      emoji: formData.emoji,
      description: formData.description || '새로 등록된 공구 상품입니다.',
      category: formData.category as Gonggu['category'],
      originalPrice: Number(formData.originalPrice),
      price: Number(formData.price),
      arrivalDate: arrivalStr,
      pickupDate: `${arrivalStr}~${endStr}`,
      status: 'open',
      total: Number(formData.total),
      tags: [],
      imageColor: formData.imageColor,
    });

    router.push('/store/products');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/store/products"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">새 공구 등록</h1>
          <p className="text-[#6B7280] mt-1">새로운 공동구매 상품을 등록하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#111827] mb-4">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                상품명 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="예: 애플청포도 (신선)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                카테고리 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                상품 설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="상품에 대한 간단한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#111827] mb-4">가격 정보</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                정가 *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">₩</span>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleChange('originalPrice', e.target.value)}
                  placeholder="12000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                판매가 *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">₩</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="6900"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {formData.originalPrice && formData.price && (
            <div className="mt-3 p-3 bg-[#E8F5E9] rounded-lg">
              <p className="text-sm text-[#609966]">
                할인율: <span className="font-bold">
                  {Math.round((1 - Number(formData.price) / Number(formData.originalPrice)) * 100)}%
                </span>
              </p>
            </div>
          )}
        </div>

        {/* 수량 및 일정 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#111827] mb-4">수량 및 일정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                총 수량 *
              </label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => handleChange('total', e.target.value)}
                placeholder="40"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  입고 예정일 *
                </label>
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => handleChange('arrivalDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  픽업 마감일 *
                </label>
                <input
                  type="date"
                  value={formData.pickupEndDate}
                  onChange={(e) => handleChange('pickupEndDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 (이모지 선택) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#111827] mb-4">상품 이미지</h2>
          <p className="text-sm text-[#6B7280] mb-4">
            프로토타입에서는 이모지로 대체합니다
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              이모지 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange('emoji', emoji)}
                  className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-colors ${
                    formData.emoji === emoji
                      ? 'bg-[#E8F5E9] ring-2 ring-[#609966]'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              배경색 선택
            </label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('imageColor', color)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.imageColor === color
                      ? 'ring-2 ring-[#609966] ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 미리보기 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              미리보기
            </label>
            <div
              className="w-24 h-24 rounded-xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: formData.imageColor }}
            >
              {formData.emoji}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <Link
            href="/store/products"
            className="flex-1 py-4 bg-gray-100 text-[#6B7280] rounded-xl font-medium text-center hover:bg-gray-200 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="flex-1 py-4 bg-[#609966] text-white rounded-xl font-semibold hover:bg-[#4A7A50] transition-colors"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
