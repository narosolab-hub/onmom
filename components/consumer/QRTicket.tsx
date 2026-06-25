"use client";

import { Reservation } from '@/data/types';
import { ReservationStatusBadge } from '@/components/shared/StatusBadge';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface QRTicketProps {
  reservation: Reservation;
  onCancel?: (reservationId: string) => void;
}

export function QRTicket({ reservation, onCancel }: QRTicketProps) {
  const isReady = reservation.status === 'ready';
  const isPending = reservation.status === 'pending';
  const isCompleted = reservation.status === 'completed';
  const isCancelled = reservation.status === 'cancelled' || reservation.status === 'noshow';
  const isService = reservation.productType === 'service';
  const isDelivery = reservation.receiveMethod === 'delivery';

  const headerBg = isReady
    ? 'bg-[#E8F5E9]'
    : isPending
    ? 'bg-[#F8FAF6]'
    : isCompleted
    ? 'bg-gray-50'
    : 'bg-red-50';

  // ready 상태 메시지
  const readyMessage = isService
    ? '🛠️ 서비스 일정이 확정되었습니다'
    : isDelivery
    ? '🚚 배달이 출발했습니다'
    : '📦 픽업 준비가 완료되었습니다';

  // pending 상태 메시지
  const pendingMessage = isService
    ? '⏳ 서비스 일정을 조율 중입니다'
    : isDelivery
    ? '⏳ 배달 준비 중입니다'
    : '⏳ 입고 완료 시 카카오 알림톡으로 안내해드려요';

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isCancelled ? 'opacity-60' : ''}`}>

      {/* 상품 헤더 */}
      <div className={`${headerBg} px-4 py-4 flex items-center gap-4`}>
        <span className="text-5xl">{reservation.productEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <ReservationStatusBadge status={reservation.status} />
            {isService && (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">서비스</span>
            )}
            {isDelivery && (
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">배달</span>
            )}
          </div>
          <h3 className="font-bold text-[#111827] text-base leading-snug truncate">
            {reservation.productTitle}
          </h3>
          <p className="text-sm text-[#6B7280] mt-0.5">{reservation.marketName}</p>
        </div>
      </div>

      {/* 주문 정보 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">수량</span>
            <span className="font-medium text-[#111827]">
              {reservation.quantity}{isService ? '건' : '개'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">결제금액</span>
            <span className="font-bold text-[#111827]">₩{formatPrice(reservation.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">결제 방식</span>
            <span className="text-[#111827]">
              {reservation.paymentMethod === 'online' ? '온라인 결제' : '현장 결제'}
            </span>
          </div>
          {isService && reservation.serviceDate ? (
            <div className="flex justify-between">
              <span className="text-[#6B7280]">서비스 날짜</span>
              <span className="font-medium text-[#111827]">{reservation.serviceDate}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-[#6B7280]">{isDelivery ? '배달 기간' : '픽업 기간'}</span>
              <span className="font-medium text-[#111827]">{reservation.pickupDate}</span>
            </div>
          )}
          {isDelivery && reservation.deliveryAddress && (
            <div className="flex justify-between">
              <span className="text-[#6B7280]">배달 주소</span>
              <span className="text-[#111827] text-right max-w-[60%] text-xs">{reservation.deliveryAddress}</span>
            </div>
          )}
          {reservation.notes && (
            <div className="flex justify-between">
              <span className="text-[#6B7280]">요청사항</span>
              <span className="text-[#111827] text-right max-w-[60%] text-xs">{reservation.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* 준비완료 — 예약번호 크게 */}
      {isReady && (
        <div className="px-4 py-4">
          <div className="bg-[#E8F5E9] rounded-xl px-4 py-3">
            <p className="text-xs text-[#609966] font-medium mb-1">{readyMessage}</p>
            {!isDelivery && !isService && (
              <>
                <p className="text-xs text-[#6B7280] mb-1.5">매장 방문 시 예약번호를 알려주세요</p>
                <p className="text-2xl font-bold text-[#4A7A50] tracking-widest">{reservation.id}</p>
              </>
            )}
            {(isDelivery || isService) && (
              <p className="text-sm text-[#4A7A50]">카카오 알림톡을 확인해주세요</p>
            )}
          </div>
        </div>
      )}

      {/* 입고/준비 대기 */}
      {isPending && (
        <div className="px-4 py-4">
          <div className="bg-yellow-50 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-yellow-700">{pendingMessage}</p>
            <p className="text-xs text-[#6B7280] mt-1.5">예약번호 {reservation.id}</p>
          </div>
        </div>
      )}

      {/* 완료 */}
      {isCompleted && (
        <div className="px-4 py-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
            <span className="text-[#6B7280]">{isService ? '서비스 완료' : isDelivery ? '배달 완료' : '픽업 완료'}</span>
            <span className="font-medium text-[#111827]">
              {reservation.completedAt ? formatRelativeTime(reservation.completedAt) : '-'}
            </span>
          </div>
        </div>
      )}

      {/* 취소/노쇼 */}
      {isCancelled && (
        <div className="px-4 py-4">
          <div className="bg-red-50 rounded-xl px-4 py-3 text-sm text-center text-red-500">
            {reservation.status === 'cancelled' ? '예약이 취소되었습니다.' : '노쇼 처리되었습니다.'}
          </div>
        </div>
      )}

      {/* 취소 버튼 */}
      {(isPending || isReady) && onCancel && (
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              if (window.confirm('예약을 취소하시겠습니까?')) onCancel(reservation.id);
            }}
            className="w-full py-2.5 text-red-400 text-sm font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            예약 취소
          </button>
        </div>
      )}
    </div>
  );
}
