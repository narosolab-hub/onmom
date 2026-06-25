"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ReservationTable } from '@/components/store/ReservationTable';
import { QRScanner } from '@/components/store/QRScanner';

type FilterType = 'all' | 'pending' | 'ready' | 'completed' | 'noshow';

export default function StoreReservationsPage() {
  const { reservations, completePickup, markReady, markNoshow } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanningReservationId, setScanningReservationId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.productTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reservations, filter, searchQuery]);

  const stats = useMemo(() => ({
    pending: reservations.filter(r => r.status === 'pending').length,
    ready: reservations.filter(r => r.status === 'ready').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    noshow: reservations.filter(r => r.status === 'noshow').length,
  }), [reservations]);

  const scanningReservation = scanningReservationId
    ? reservations.find(r => r.id === scanningReservationId)
    : null;

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: '전체', value: 'all', count: reservations.length },
    { label: '준비 대기', value: 'pending', count: stats.pending },
    { label: '준비완료', value: 'ready', count: stats.ready },
    { label: '완료', value: 'completed', count: stats.completed },
    { label: '노쇼', value: 'noshow', count: stats.noshow },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">예약 관리</h1>
          <p className="text-[#6B7280] mt-1">고객 예약을 확인하고 준비완료 알림톡을 발송하세요</p>
        </div>
        <button
          onClick={() => { setScanningReservationId(null); setShowScanner(true); }}
          className="px-4 py-2 bg-[#609966] text-white rounded-xl font-medium hover:bg-[#4A7A50] transition-colors flex items-center gap-2"
        >
          📷 QR 스캔
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-[#6B7280]">준비 대기</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}건</p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-[#6B7280]">준비완료 (알림톡 발송)</p>
          <p className="text-2xl font-bold text-[#609966] mt-1">{stats.ready}건</p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-[#6B7280]">완료</p>
          <p className="text-2xl font-bold text-[#111827] mt-1">{stats.completed}건</p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-[#6B7280]">노쇼</p>
          <p className="text-2xl font-bold text-[#FF5C38] mt-1">{stats.noshow}건</p>
        </div>
      </div>

      {/* 필터 & 검색 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
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
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="예약번호, 고객명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-4 py-2 pl-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966] focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">🔍</span>
        </div>
      </div>

      <ReservationTable
        reservations={filteredReservations}
        onPickupComplete={completePickup}
        onMarkReady={markReady}
        onQRScan={(id) => { setScanningReservationId(id); setShowScanner(true); }}
        onNoshow={markNoshow}
      />

      {showScanner && (
        <QRScanner
          reservation={scanningReservation}
          onClose={() => { setShowScanner(false); setScanningReservationId(null); }}
          onConfirmPickup={completePickup}
        />
      )}
    </div>
  );
}
