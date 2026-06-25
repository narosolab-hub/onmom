"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/store/StatCard';
import { formatPrice, formatRelativeTime, getRelativeDate } from '@/lib/utils';
import { ReservationStatusBadge } from '@/components/shared/StatusBadge';
import { QRScanner } from '@/components/store/QRScanner';
import { HourlyChart } from '@/components/store/HourlyChart';
import { StoreOnboardingTour } from '@/components/store/OnboardingTour';

export default function StoreDashboardPage() {
  const { reservations, alerts, gongguList, completePickup } = useApp();
  const [showScanner, setShowScanner] = useState(false);

  // 오늘 통계 계산
  const stats = useMemo(() => {
    const todayReservations = reservations.filter(r => {
      const reservedDate = new Date(r.reservedAt).toDateString();
      const today = new Date().toDateString();
      return reservedDate === today;
    });

    const pendingPickup = reservations.filter(r => r.status === 'ready').length;
    const completed = reservations.filter(r => r.status === 'completed');
    const todayRevenue = completed.reduce((sum, r) => sum + r.totalPrice, 0);
    const noshow = reservations.filter(r => r.status === 'noshow').length;

    return {
      todayReservations: todayReservations.length,
      pendingPickup,
      todayRevenue,
      noshow,
    };
  }, [reservations]);

  // 최근 예약 5개
  const recentReservations = useMemo(() => {
    return [...reservations]
      .sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime())
      .slice(0, 5);
  }, [reservations]);

  // 오늘 공구 상품
  const todayGonggu = useMemo(() => {
    return gongguList.filter(g => g.arrivalDate === getRelativeDate(0));
  }, [gongguList]);

  return (
    <div className="p-8">
      <StoreOnboardingTour />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">대시보드</h1>
          <p className="text-[#6B7280] mt-1">오늘의 현황을 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <button
            data-tour="qr-scan-btn"
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-[#E8F5E9] text-[#609966] rounded-xl font-medium hover:bg-[#C8E6C9] transition-colors flex items-center gap-2"
          >
            📷 QR 스캔
          </button>
          <Link
            href="/store/products/new"
            className="px-4 py-2 bg-[#609966] text-white rounded-xl font-medium hover:bg-[#4A7A50] transition-colors flex items-center gap-2"
          >
            + 상품 등록
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-6 mb-8" data-tour="stat-cards">
        <StatCard
          icon="🛒"
          label="오늘 예약"
          value={`${stats.todayReservations}건`}
          trend="up"
          trendValue="어제 대비 +3"
        />
        <StatCard
          icon="📦"
          label="픽업 대기"
          value={`${stats.pendingPickup}건`}
          subtext="지금 바로 처리 가능"
        />
        <StatCard
          icon="💰"
          label="오늘 매출"
          value={`₩${formatPrice(stats.todayRevenue)}`}
          trend="up"
          trendValue="전주 대비 +12%"
        />
        <StatCard
          icon="⚠️"
          label="노쇼"
          value={`${stats.noshow}건`}
          trend={stats.noshow > 0 ? "down" : "neutral"}
          trendValue={stats.noshow > 0 ? "관리 필요" : "정상"}
        />
      </div>

      {/* 시간대별 예약 현황 */}
      <div className="bg-white rounded-2xl shadow-sm px-6 py-5 mb-6" data-tour="hourly-chart">
        <h2 className="font-semibold text-[#111827] mb-4">시간대별 예약 현황</h2>
        <HourlyChart />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 최근 예약 */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#111827]">최근 예약</h2>
              <Link
                href="/store/reservations"
                className="text-sm text-[#609966] hover:underline"
              >
                전체 보기
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{reservation.productEmoji}</span>
                    <div>
                      <p className="font-medium text-[#111827]">
                        {reservation.productTitle}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {reservation.userName} · {reservation.quantity}개 · ₩{formatPrice(reservation.totalPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#6B7280]">
                      {formatRelativeTime(reservation.reservedAt)}
                    </span>
                    <ReservationStatusBadge status={reservation.status} />
                  </div>
                </div>
              ))}

              {recentReservations.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-[#6B7280]">최근 예약이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오늘 공구 / 알림 */}
        <div className="space-y-6">
          {/* 오늘 공구 */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#111827]">오늘 공구</h2>
              <span className="text-sm text-[#6B7280]">{todayGonggu.length}개</span>
            </div>

            <div className="divide-y divide-gray-100">
              {todayGonggu.slice(0, 3).map((gonggu) => (
                <div key={gonggu.id} className="flex items-center gap-3 px-6 py-3">
                  <span className="text-xl">{gonggu.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">
                      {gonggu.title}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      예약 {gonggu.reserved}/{gonggu.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 알림 */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#111827]">알림</h2>
              {alerts.filter(a => !a.read).length > 0 && (
                <span className="w-5 h-5 bg-[#FF5C38] text-white text-xs rounded-full flex items-center justify-center">
                  {alerts.filter(a => !a.read).length}
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 px-6 py-3 ${
                    !alert.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <span className="text-lg">{alert.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-[#111827]">{alert.message}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-[#6B7280]">새로운 알림이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR 스캐너 모달 */}
      {showScanner && (
        <QRScanner
          reservation={reservations.find(r => r.status === 'ready') ?? null}
          onClose={() => setShowScanner(false)}
          onConfirmPickup={(id) => {
            completePickup(id);
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
}
