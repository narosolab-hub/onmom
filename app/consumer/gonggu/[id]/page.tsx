"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { ReservationSheet } from '@/components/consumer/ReservationSheet';
import { GongguStatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatPrice, getDiscountRate, getProgressPercent, getRelativeDate } from '@/lib/utils';
import { Gonggu } from '@/data/types';

// 카테고리별 기본 스펙
const CATEGORY_SPECS: Record<Gonggu['category'], { label: string; value: string }[]> = {
  '과일': [
    { label: '원산지', value: '표기 참조' },
    { label: '보관방법', value: '냉장 보관 (0~5℃)' },
    { label: '소비기한', value: '구매일로부터 3~5일' },
    { label: '구성', value: '1박스' },
  ],
  '식품': [
    { label: '보관방법', value: '서늘하고 건조한 곳' },
    { label: '소비기한', value: '제조일로부터 1년' },
    { label: '구성', value: '1개' },
  ],
  '건강식품': [
    { label: '보관방법', value: '직사광선 피해 서늘한 곳' },
    { label: '소비기한', value: '제조일로부터 2년' },
    { label: '구성', value: '1박스' },
  ],
  '생활용품': [
    { label: '원산지', value: '국내산' },
    { label: '소재', value: '상세페이지 참조' },
    { label: '구성', value: '1개' },
  ],
  '베이커리': [
    { label: '보관방법', value: '냉동 보관 권장' },
    { label: '소비기한', value: '당일 제조, 3일 이내 섭취 권장' },
    { label: '구성', value: '1박스' },
  ],
  '정육': [
    { label: '원산지', value: '국내산' },
    { label: '보관방법', value: '냉장/냉동 보관' },
    { label: '소비기한', value: '냉장 3일, 냉동 3개월' },
    { label: '구성', value: '1팩' },
  ],
  '가전수리': [
    { label: '방문 형태', value: '전문가 방문' },
    { label: '소요 시간', value: '1~2시간' },
    { label: '결제 방식', value: '서비스 완료 후 현장 결제' },
  ],
  '청소/방역': [
    { label: '방문 형태', value: '전문가 방문' },
    { label: '소요 시간', value: '2~4시간' },
    { label: '결제 방식', value: '서비스 완료 후 현장 결제' },
  ],
  '교육': [
    { label: '진행 방식', value: '방문 또는 온라인' },
    { label: '소요 시간', value: '1시간' },
    { label: '결제 방식', value: '현장 결제' },
  ],
  '건강/미용': [
    { label: '방문 형태', value: '전문가 방문' },
    { label: '소요 시간', value: '1~2시간' },
    { label: '결제 방식', value: '서비스 완료 후 현장 결제' },
  ],
  '기타서비스': [
    { label: '방문 형태', value: '전문가 방문' },
    { label: '결제 방식', value: '서비스 완료 후 현장 결제' },
  ],
};

function usePickupCountdown(pickupDate: string) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const endStr = pickupDate.includes('~')
      ? pickupDate.split('~')[1]
      : pickupDate;
    const [month, day] = endStr.split('/').map(Number);
    const now = new Date();
    const endDate = new Date(now.getFullYear(), month - 1, day, 23, 59, 59);

    const tick = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) { setLabel('픽업 기간 종료'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h >= 48) setLabel(`D-${Math.floor(h / 24)}`);
      else if (h >= 24) setLabel('내일 마감');
      else setLabel(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pickupDate]);

  return label;
}

export default function GongguDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getGongguById, getMarketById, addReservation } = useApp();
  const [showSheet, setShowSheet] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const gonggu = getGongguById(Number(params.id));
  const market = gonggu ? getMarketById(gonggu.marketId) : undefined;
  const countdown = usePickupCountdown(gonggu?.pickupDate ?? '');

  if (!gonggu) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-[#6B7280]">상품을 찾을 수 없습니다.</p>
          <button onClick={() => router.back()} className="mt-4 text-[#609966] font-medium">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const discountRate = getDiscountRate(gonggu.originalPrice, gonggu.price);
  const progressPercent = getProgressPercent(gonggu.reserved, gonggu.total);
  const remaining = gonggu.total - gonggu.reserved;
  const isReservable = (gonggu.status === 'open' || gonggu.status === 'closing' || gonggu.status === 'arrived') && remaining > 0;
  const specs = gonggu.specs ?? CATEGORY_SPECS[gonggu.category] ?? [];

  const arrivalLabel = gonggu.arrivalDate === getRelativeDate(0)
    ? '오늘 입고'
    : gonggu.arrivalDate === getRelativeDate(1)
    ? '내일 입고'
    : `${gonggu.arrivalDate} 입고`;

  const isUrgent = countdown && !countdown.startsWith('D-') && countdown !== '내일 마감' && countdown !== '픽업 기간 종료';

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-30 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg"
        >
          ←
        </button>
        <span className="font-medium text-[#111827] truncate mx-3 flex-1 text-center text-sm">
          {market?.name || '온맘마켓'}
        </span>
        <div className="w-9" />
      </header>

      {/* 이미지 영역 */}
      <div
        className="relative w-full h-56 flex items-center justify-center text-8xl"
        style={{ backgroundColor: gonggu.imageColor }}
      >
        {gonggu.emoji}

        {/* 할인율 배지 — top-right */}
        {discountRate > 0 && (
          <div className="absolute top-3 right-3 bg-[#FF5C38] text-white text-sm font-bold px-2.5 py-1 rounded-lg">
            -{discountRate}%
          </div>
        )}

        {/* 입고일 배지 — bottom-left */}
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {arrivalLabel}
        </div>

        {/* 카운트다운 — bottom-right */}
        {countdown && gonggu.status !== 'upcoming' && gonggu.status !== 'done' && (
          <div className={`absolute bottom-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${
            isUrgent ? 'bg-[#FF5C38]' : 'bg-black/50'
          }`}>
            {isUrgent ? '⏱ ' : ''}{countdown}
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 mb-2">
          <GongguStatusBadge status={gonggu.status} />
          <span className="text-sm text-[#6B7280]">{gonggu.category}</span>
        </div>
        <h1 className="text-xl font-bold text-[#111827] mb-2">{gonggu.title}</h1>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#111827]">
            ₩{formatPrice(gonggu.price)}
          </span>
          <span className="text-sm text-[#6B7280] line-through">
            소비자가 ₩{formatPrice(gonggu.originalPrice)}
          </span>
        </div>
      </div>

      <div className="h-2 bg-[#F8FAF6]" />

      {/* 상품 설명 */}
      <div className="px-4 py-5">
        <h2 className="font-semibold text-[#111827] mb-2">상품 설명</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed">{gonggu.description}</p>
      </div>

      <div className="h-2 bg-[#F8FAF6]" />

      {/* 상품 스펙 */}
      {specs.length > 0 && (
        <>
          <div className="px-4 py-5">
            <h2 className="font-semibold text-[#111827] mb-3">상품 정보</h2>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex text-sm ${i < specs.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="w-24 flex-shrink-0 px-4 py-3 bg-gray-50 text-[#6B7280] font-medium">
                    {spec.label}
                  </span>
                  <span className="flex-1 px-4 py-3 text-[#111827]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-2 bg-[#F8FAF6]" />
        </>
      )}

      {/* 예약 현황 */}
      <div className="px-4 py-5">
        <h2 className="font-semibold text-[#111827] mb-3">예약 현황</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#6B7280]">👥 {gonggu.reserved}명 예약</span>
          <span className="text-[#6B7280]">잔여 {remaining}개</span>
        </div>
        <ProgressBar percent={progressPercent} />
        <p className="text-xs text-[#6B7280] mt-2 text-right">
          전체 {gonggu.total}개 중 {progressPercent}% 달성
        </p>
      </div>

      <div className="h-2 bg-[#F8FAF6]" />

      {/* 픽업/서비스 안내 */}
      <div className="px-4 py-5">
        <h2 className="font-semibold text-[#111827] mb-3">{gonggu.type === 'service' ? '서비스 안내' : '픽업 안내'}</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-base">📍</span>
            <div>
              <p className="font-medium text-[#111827]">{market?.name}</p>
              <p className="text-[#6B7280]">{market?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">📅</span>
            <p className="text-[#111827]">픽업 기간: <span className="font-medium">{gonggu.pickupDate}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">💳</span>
            <p className="text-[#111827]">현장 결제 (카드/현금)</p>
          </div>
        </div>
      </div>

      {/* 태그 */}
      {gonggu.tags.length > 0 && (
        <>
          <div className="h-2 bg-[#F8FAF6]" />
          <div className="px-4 py-5 flex gap-2 flex-wrap">
            {gonggu.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-sm text-[#6B7280] rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Sticky 하단 — 수량 + 예약 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-gray-100 px-4 py-4 z-20">
        {isReservable ? (
          <div className="flex items-center gap-3">
            {/* 수량 스테퍼 (상품만) */}
            {gonggu.type !== 'service' && <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 flex-shrink-0">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-6 h-6 flex items-center justify-center font-bold text-[#111827] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-5 text-center font-bold text-[#111827] text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(remaining, q + 1))}
                disabled={quantity >= remaining}
                className="w-6 h-6 flex items-center justify-center font-bold text-[#111827] disabled:opacity-30"
              >
                +
              </button>
            </div>}
            {/* 예약 버튼 */}
            <button
              onClick={() => setShowSheet(true)}
              className="flex-1 py-3.5 bg-[#609966] text-white rounded-xl font-semibold text-sm hover:bg-[#4A7A50] transition-colors"
            >
              {gonggu.type === 'service'
                ? `서비스 예약하기 · ₩${formatPrice(gonggu.price)}`
                : `예약하기 (${quantity}개) · ₩${formatPrice(gonggu.price * quantity)}`}
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-4 bg-gray-200 text-gray-500 rounded-xl font-semibold text-base cursor-not-allowed"
          >
            {gonggu.status === 'done' ? '마감된 공구입니다'
              : gonggu.status === 'upcoming' ? '곧 예약 시작 예정'
              : '품절'}
          </button>
        )}
      </div>

      {/* 예약 바텀시트 */}
      {showSheet && (
        <ReservationSheet
          gonggu={{ ...gonggu, reserved: gonggu.reserved }}
          market={market}
          onClose={() => setShowSheet(false)}
          onConfirm={(g, qty, opts) => addReservation(g, qty, opts)}
        />
      )}
    </div>
  );
}
