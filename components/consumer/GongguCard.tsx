"use client";

import Link from 'next/link';
import { Gonggu, Market } from '@/data/types';
import { useApp } from '@/contexts/AppContext';
import { GongguStatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatPrice, getDiscountRate, getProgressPercent, getRelativeDate } from '@/lib/utils';

interface GongguCardProps {
  gonggu: Gonggu;
  market?: Market;
  onReserve: (gonggu: Gonggu) => void;
  onNotify?: (gonggu: Gonggu) => void;
  isNotified?: boolean;
  layout?: 'list' | 'grid';
}

function getArrivalLabel(arrivalDate: string): string {
  if (arrivalDate === getRelativeDate(0)) return '오늘';
  if (arrivalDate === getRelativeDate(1)) return '내일';
  return arrivalDate;
}

function ActionButton({
  gonggu,
  isNotified,
  onReserve,
  onNotify,
  compact,
}: {
  gonggu: Gonggu;
  isNotified?: boolean;
  onReserve: (g: Gonggu) => void;
  onNotify?: (g: Gonggu) => void;
  compact?: boolean;
}) {
  const { cart, addToCart, updateCartQuantity } = useApp();
  const remaining = gonggu.total - gonggu.reserved;
  const isUpcoming = gonggu.status === 'upcoming';
  const isArrived = gonggu.status === 'arrived';
  const isDone = gonggu.status === 'done' || remaining <= 0;
  const cartItem = cart.find(item => item.gonggu.id === gonggu.id);

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  // 서비스는 장바구니 없이 바로 예약
  if (gonggu.type === 'service') {
    if (isDone) {
      return (
        <button disabled className={`${compact ? 'w-full py-1.5 text-xs rounded-lg' : 'w-full py-2 text-sm rounded-xl'} bg-gray-100 text-gray-400 cursor-not-allowed font-semibold`}>
          마감
        </button>
      );
    }
    if (isUpcoming) {
      return (
        <button onClick={(e) => { stop(e); onNotify?.(gonggu); }}
          className={`${compact ? 'w-full py-1.5 text-xs rounded-lg' : 'w-full py-2 text-sm rounded-xl'} ${isNotified ? 'bg-gray-100 text-[#609966] cursor-default' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} font-semibold transition-colors`}>
          {isNotified ? '✓ 알림됨' : '알림 받기'}
        </button>
      );
    }
    return (
      <button onClick={(e) => { stop(e); onReserve(gonggu); }}
        className={`${compact ? 'w-full py-1.5 text-xs rounded-lg' : 'w-full py-2 text-sm rounded-xl'} bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors`}>
        서비스 예약
      </button>
    );
  }

  if (cartItem && !isArrived && !isDone && !isUpcoming) {
    return (
      <div className="flex items-center justify-between w-full bg-[#E8F5E9] rounded-lg overflow-hidden" onClick={stop}>
        <button
          onClick={() => updateCartQuantity(gonggu.id, cartItem.quantity - 1)}
          className={`${compact ? 'px-2 py-1.5' : 'px-3 py-2'} text-[#609966] font-bold text-base hover:bg-[#C8E6C9] transition-colors`}
        >
          −
        </button>
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-[#609966]`}>
          {cartItem.quantity}
        </span>
        <button
          onClick={() => updateCartQuantity(gonggu.id, cartItem.quantity + 1)}
          disabled={cartItem.quantity >= remaining}
          className={`${compact ? 'px-2 py-1.5' : 'px-3 py-2'} text-[#609966] font-bold text-base hover:bg-[#C8E6C9] transition-colors disabled:opacity-40`}
        >
          +
        </button>
      </div>
    );
  }

  const label = isDone
    ? gonggu.status === 'done' ? '마감' : '품절'
    : isUpcoming
    ? isNotified ? '✓ 알림됨' : '알림 받기'
    : isArrived
    ? '바로 픽업'
    : '+ 담기';

  const colorClass = isDone
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : isUpcoming
    ? isNotified
      ? 'bg-gray-100 text-[#609966] cursor-default'
      : 'bg-[#E8F5E9] text-[#609966] hover:bg-[#C8E6C9]'
    : isArrived
    ? 'bg-[#4A7A50] text-white hover:bg-[#3D6341]'
    : 'bg-[#609966] text-white hover:bg-[#4A7A50] active:bg-[#3D6341]';

  return (
    <button
      onClick={(e) => {
        stop(e);
        if (isDone) return;
        if (isUpcoming) { onNotify?.(gonggu); return; }
        if (isArrived) { onReserve(gonggu); return; }
        addToCart(gonggu, 1);
      }}
      disabled={isDone}
      className={`${compact ? 'w-full py-1.5 text-xs rounded-lg' : 'w-full py-2 text-sm rounded-xl'} font-semibold transition-colors ${colorClass}`}
    >
      {label}
    </button>
  );
}

/** 2열 그리드 카드 */
function GridCard({ gonggu, market, onReserve, onNotify, isNotified }: GongguCardProps) {
  const discountRate = getDiscountRate(gonggu.originalPrice, gonggu.price);
  const arrivalLabel = getArrivalLabel(gonggu.arrivalDate);
  const remaining = gonggu.total - gonggu.reserved;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 이미지 영역 — 클릭 시 상세 */}
      <Link href={`/consumer/gonggu/${gonggu.id}`} className="block">
        <div
          className="relative w-full aspect-square flex items-center justify-center text-5xl"
          style={{ backgroundColor: gonggu.imageColor }}
        >
          {gonggu.emoji}

          {/* 상태 배지 — top-left */}
          <div className="absolute top-2 left-2">
            <GongguStatusBadge status={gonggu.status} />
          </div>

          {/* 할인율 — top-right */}
          {discountRate > 0 && (
            <div className="absolute top-2 right-2 bg-[#FF5C38] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md">
              -{discountRate}%
            </div>
          )}

          {/* 마켓명 워터마크 — bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-2 pb-2 pt-4">
            <p className="text-[10px] text-white/90 font-medium truncate">
              {gonggu.type === 'service' ? '🛠️ ' : ''}{market?.name || '온맘마켓'}
            </p>
          </div>
        </div>
      </Link>

      {/* 정보 영역 */}
      <div className="px-2.5 pt-2 pb-2.5">
        <Link href={`/consumer/gonggu/${gonggu.id}`} className="block">
          <h3 className="text-sm font-bold text-[#111827] line-clamp-2 leading-snug mb-1">
            {gonggu.title}
          </h3>
          <p className="text-base font-bold text-[#111827] mb-0.5">
            ₩{formatPrice(gonggu.price)}
          </p>
          <p className="text-[11px] text-[#6B7280] mb-2">
            {gonggu.type === 'service'
              ? `${arrivalLabel} 방문`
              : `재고 ${remaining}개`}
          </p>
        </Link>

        {/* 액션 버튼 */}
        <ActionButton
          gonggu={gonggu}
          isNotified={isNotified}
          onReserve={onReserve}
          onNotify={onNotify}
          compact
        />
      </div>
    </div>
  );
}

/** 1열 리스트 카드 */
function ListCard({ gonggu, market, onReserve, onNotify, isNotified }: GongguCardProps) {
  const discountRate = getDiscountRate(gonggu.originalPrice, gonggu.price);
  const progressPercent = getProgressPercent(gonggu.reserved, gonggu.total);
  const remaining = gonggu.total - gonggu.reserved;
  const arrivalLabel = getArrivalLabel(gonggu.arrivalDate);

  return (
    <Link href={`/consumer/gonggu/${gonggu.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex gap-3 p-3">

          {/* 이미지 박스 */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: gonggu.imageColor }}
            >
              {gonggu.emoji}
            </div>
            {/* 상태 배지 — top-left */}
            <div className="absolute -top-1 -left-1">
              <GongguStatusBadge status={gonggu.status} />
            </div>
            {/* 입고일 배지 — bottom-right */}
            <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none">
              {arrivalLabel}
            </div>
          </div>

          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-[11px] text-[#6B7280] truncate">{market?.name || '온맘마켓'} · {gonggu.category}</p>
              {gonggu.type === 'service' && (
                <span className="flex-shrink-0 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">서비스</span>
              )}
            </div>
            <h3 className="font-bold text-[#111827] text-sm leading-snug line-clamp-1">
              {gonggu.title}
            </h3>
            <div className="flex items-baseline gap-1.5 mt-0.5 mb-1">
              <span className="text-base font-bold text-[#111827]">
                ₩{formatPrice(gonggu.price)}
              </span>
              <span className="text-xs text-[#6B7280] line-through">
                ₩{formatPrice(gonggu.originalPrice)}
              </span>
              <span className="text-xs font-bold text-[#FF5C38]">-{discountRate}%</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-[#6B7280] mb-1">
                  <span>👥 {gonggu.reserved}{gonggu.type === 'service' ? '건' : '명'}</span>
                  <span>잔여 {remaining}{gonggu.type === 'service' ? '건' : '개'}</span>
                </div>
                <ProgressBar percent={progressPercent} />
              </div>
              <div className="w-[76px] flex-shrink-0">
                <ActionButton
                  gonggu={gonggu}
                  isNotified={isNotified}
                  onReserve={onReserve}
                  onNotify={onNotify}
                  compact
                />
              </div>
            </div>

            {/* 상세보기 */}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-end">
              <span className="text-[11px] text-[#609966] font-medium">상세보기 →</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function GongguCard(props: GongguCardProps) {
  if (props.layout === 'grid') return <GridCard {...props} />;
  return <ListCard {...props} />;
}
