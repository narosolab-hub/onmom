"use client";

import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface CustomerSummary {
  userId: string;
  userName: string;
  userPhone: string;
  reservationCount: number;
  completedCount: number;
  cancelledCount: number;
  totalSpent: number;
  lastOrderAt: string;
  productTypes: Set<'product' | 'service'>;
}

export default function MembersPage() {
  const { reservations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'count' | 'recent'>('spent');

  const customers = useMemo<CustomerSummary[]>(() => {
    const map = new Map<string, CustomerSummary>();

    reservations.forEach(r => {
      const key = r.userId;
      const existing = map.get(key);
      if (existing) {
        existing.reservationCount++;
        if (r.status === 'completed') {
          existing.completedCount++;
          existing.totalSpent += r.totalPrice;
        }
        if (r.status === 'cancelled' || r.status === 'noshow') {
          existing.cancelledCount++;
        }
        if (r.reservedAt > existing.lastOrderAt) existing.lastOrderAt = r.reservedAt;
        existing.productTypes.add(r.productType);
      } else {
        map.set(key, {
          userId: r.userId,
          userName: r.userName,
          userPhone: r.userPhone,
          reservationCount: 1,
          completedCount: r.status === 'completed' ? 1 : 0,
          cancelledCount: (r.status === 'cancelled' || r.status === 'noshow') ? 1 : 0,
          totalSpent: r.status === 'completed' ? r.totalPrice : 0,
          lastOrderAt: r.reservedAt,
          productTypes: new Set([r.productType]),
        });
      }
    });

    let list = Array.from(map.values());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.userName.toLowerCase().includes(q) || c.userPhone.includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'count') return b.reservationCount - a.reservationCount;
      return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
    });

    return list;
  }, [reservations, searchQuery, sortBy]);

  const totalStats = useMemo(() => ({
    totalCustomers: customers.length,
    totalRevenue: customers.reduce((s, c) => s + c.totalSpent, 0),
    avgSpent: customers.length > 0
      ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length)
      : 0,
    serviceCustomers: customers.filter(c => c.productTypes.has('service')).length,
  }), [customers]);

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">회원 관리</h1>
          <p className="text-[#6B7280] mt-1">예약 고객 목록 및 구매 이력</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#6B7280]">전체 회원</p>
          <p className="text-2xl font-bold text-[#111827] mt-1">{totalStats.totalCustomers}명</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#6B7280]">총 매출 (완료 기준)</p>
          <p className="text-2xl font-bold text-[#609966] mt-1">₩{formatPrice(totalStats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#6B7280]">평균 구매액</p>
          <p className="text-2xl font-bold text-[#111827] mt-1">₩{formatPrice(totalStats.avgSpent)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#6B7280]">서비스 이용 고객</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalStats.serviceCustomers}명</p>
        </div>
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">🔍</span>
          <input
            type="text"
            placeholder="이름 또는 연락처 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966]"
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: 'spent', label: '구매액순' },
            { value: 'count', label: '예약수순' },
            { value: 'recent', label: '최근순' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                sortBy === opt.value
                  ? 'bg-[#609966] text-white'
                  : 'bg-white text-[#6B7280] hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-[#6B7280]">{searchQuery ? '검색 결과가 없습니다.' : '예약 고객이 없습니다.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['고객명', '연락처', '예약', '완료/취소', '총 구매액', '유형', '마지막 예약'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c, i) => (
                <tr key={c.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E8F5E9] rounded-full flex items-center justify-center text-sm font-bold text-[#609966]">
                        {c.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{c.userName}</p>
                        {i === 0 && (
                          <span className="text-[10px] font-semibold text-[#FF5C38] bg-red-50 px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">{c.userPhone}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-[#111827]">{c.reservationCount}건</span>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className="text-[#609966]">{c.completedCount}완료</span>
                    {c.cancelledCount > 0 && (
                      <span className="text-[#FF5C38] ml-1.5">{c.cancelledCount}취소</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-[#111827]">
                      ₩{formatPrice(c.totalSpent)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      {c.productTypes.has('product') && (
                        <span className="text-[10px] font-medium text-[#609966] bg-[#E8F5E9] px-1.5 py-0.5 rounded">상품</span>
                      )}
                      {c.productTypes.has('service') && (
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">서비스</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7280]">
                    {formatRelativeTime(c.lastOrderAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
