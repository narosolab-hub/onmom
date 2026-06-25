"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { GongguStatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatPrice, getDiscountRate, getProgressPercent } from '@/lib/utils';
import { GongguStatus } from '@/data/types';

type FilterType = 'all' | 'open' | 'arrived' | 'done';

export default function StoreProductsPage() {
  const { gongguList, updateGongguStatus } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    if (filter === 'all') return gongguList;
    if (filter === 'open') {
      return gongguList.filter(g =>
        g.status === 'open' || g.status === 'closing' || g.status === 'upcoming'
      );
    }
    return gongguList.filter(g => g.status === filter);
  }, [gongguList, filter]);

  const handleStatusChange = (gongguId: number, newStatus: GongguStatus) => {
    updateGongguStatus(gongguId, newStatus);
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: '전체', value: 'all' },
    { label: '예약중', value: 'open' },
    { label: '입고완료', value: 'arrived' },
    { label: '마감', value: 'done' },
  ];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">상품 관리</h1>
          <p className="text-[#6B7280] mt-1">공구 상품을 관리하세요</p>
        </div>
        <Link
          href="/store/products/new"
          className="px-4 py-2 bg-[#609966] text-white rounded-xl font-medium hover:bg-[#4A7A50] transition-colors flex items-center gap-2"
        >
          + 새 공구 등록
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#609966] text-white'
                : 'bg-white text-[#6B7280] hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-3 gap-6">
        {filteredProducts.map((gonggu) => {
          const discountRate = getDiscountRate(gonggu.originalPrice, gonggu.price);
          const progressPercent = getProgressPercent(gonggu.reserved, gonggu.total);

          return (
            <div key={gonggu.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* 상품 이미지 */}
              <div
                className="h-32 flex items-center justify-center text-5xl"
                style={{ backgroundColor: gonggu.imageColor }}
              >
                {gonggu.emoji}
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#111827] truncate">
                      {gonggu.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {gonggu.category} · 입고 {gonggu.arrivalDate}
                    </p>
                  </div>
                  <GongguStatusBadge status={gonggu.status} />
                </div>

                {/* 가격 */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-bold text-[#111827]">
                    ₩{formatPrice(gonggu.price)}
                  </span>
                  <span className="text-xs text-[#6B7280] line-through">
                    ₩{formatPrice(gonggu.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-[#FF5C38]">
                    -{discountRate}%
                  </span>
                </div>

                {/* 예약 현황 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                    <span>예약 {gonggu.reserved}개</span>
                    <span>총 {gonggu.total}개</span>
                  </div>
                  <ProgressBar percent={progressPercent} showLabel={false} />
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {gonggu.status === 'open' || gonggu.status === 'closing' ? (
                    <button
                      onClick={() => handleStatusChange(gonggu.id, 'arrived')}
                      className="flex-1 py-2 bg-[#E8F5E9] text-[#609966] text-sm font-medium rounded-lg hover:bg-[#C8E6C9] transition-colors"
                    >
                      입고 완료
                    </button>
                  ) : gonggu.status === 'arrived' ? (
                    <button
                      onClick={() => handleStatusChange(gonggu.id, 'done')}
                      className="flex-1 py-2 bg-gray-100 text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      마감 처리
                    </button>
                  ) : gonggu.status === 'upcoming' ? (
                    <button
                      onClick={() => handleStatusChange(gonggu.id, 'open')}
                      className="flex-1 py-2 bg-[#609966] text-white text-sm font-medium rounded-lg hover:bg-[#4A7A50] transition-colors"
                    >
                      예약 시작
                    </button>
                  ) : (
                    <span className="flex-1 py-2 text-center text-sm text-[#6B7280]">
                      마감됨
                    </span>
                  )}
                  <button className="px-3 py-2 bg-gray-100 text-[#6B7280] text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    수정
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-[#6B7280]">해당 조건의 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
