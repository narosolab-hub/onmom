"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { QRTicket } from '@/components/consumer/QRTicket';

type TabType = 'all' | 'ready' | 'pending' | 'done';

const TABS: { label: string; value: TabType }[] = [
  { label: '전체', value: 'all' },
  { label: '픽업가능', value: 'ready' },
  { label: '대기중', value: 'pending' },
  { label: '완료', value: 'done' },
];

export default function ReservationsPage() {
  const { reservations, cancelReservation } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => ({
    arrived: reservations.filter(r => r.status === 'ready').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    done: reservations.filter(r =>
      r.status === 'completed' || r.status === 'cancelled' || r.status === 'noshow'
    ).length,
  }), [reservations]);

  const filteredReservations = useMemo(() => {
    let list = [...reservations].sort(
      (a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()
    );
    if (activeTab === 'ready') list = list.filter(r => r.status === 'ready');
    else if (activeTab === 'pending') list = list.filter(r => r.status === 'pending');
    else if (activeTab === 'done') list = list.filter(r =>
      r.status === 'completed' || r.status === 'cancelled' || r.status === 'noshow'
    );

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(r => r.productTitle.toLowerCase().includes(q));
    }
    return list;
  }, [reservations, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAF6]">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-30 border-b border-gray-100">
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-[#111827]">내 예약</h1>
            <span className="text-sm text-[#6B7280]">총 {reservations.length}건</span>
          </div>

          {/* 상태별 카운트 */}
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] rounded-full">
              <span className="text-xs font-semibold text-[#609966]">픽업가능</span>
              <span className="text-xs font-bold text-[#609966]">{counts.arrived}건</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-full">
              <span className="text-xs font-semibold text-yellow-700">대기중</span>
              <span className="text-xs font-bold text-yellow-700">{counts.pending}건</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
              <span className="text-xs font-semibold text-[#6B7280]">완료</span>
              <span className="text-xs font-bold text-[#6B7280]">{counts.done}건</span>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`relative flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.value ? 'text-[#609966]' : 'text-[#6B7280]'
                }`}
              >
                {tab.label}
                {tab.value === 'ready' && counts.arrived > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-[#609966] text-white text-[10px] rounded-full font-bold">
                    {counts.arrived}
                  </span>
                )}
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#609966] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 검색 */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="상품명으로 검색"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 픽업 가능 배너 */}
      {counts.arrived > 0 && activeTab === 'all' && (
        <button
          onClick={() => setActiveTab('ready')}
          className="w-full px-4 py-3 bg-[#609966] text-white flex items-center justify-between mt-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="font-semibold text-sm">픽업 가능한 상품 {counts.arrived}건</span>
          </div>
          <span className="text-white/80 text-sm">확인하기 →</span>
        </button>
      )}

      {/* 목록 */}
      <div className="p-4 space-y-3">
        {filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-[#6B7280] font-medium">
              {searchQuery
                ? `"${searchQuery}" 검색 결과가 없습니다.`
                : activeTab === 'ready' ? '픽업 가능한 예약이 없습니다.'
                : activeTab === 'pending' ? '입고 대기 중인 예약이 없습니다.'
                : activeTab === 'done' ? '완료된 예약이 없습니다.'
                : '예약 내역이 없습니다.'}
            </p>
            {activeTab === 'all' && !searchQuery && (
              <Link
                href="/consumer"
                className="mt-4 px-5 py-2.5 bg-[#609966] text-white rounded-xl text-sm font-semibold"
              >
                공구 보러 가기
              </Link>
            )}
          </div>
        ) : (
          filteredReservations.map(reservation => (
            <QRTicket
              key={reservation.id}
              reservation={reservation}
              onCancel={cancelReservation}
            />
          ))
        )}
      </div>
    </div>
  );
}
