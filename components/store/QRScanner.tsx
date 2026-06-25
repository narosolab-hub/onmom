"use client";

import { useState } from 'react';
import { Reservation } from '@/data/types';
import { formatPrice } from '@/lib/utils';
import { ReservationStatusBadge } from '@/components/shared/StatusBadge';

interface QRScannerProps {
  reservation?: Reservation | null;
  onClose: () => void;
  onConfirmPickup: (reservationId: string) => void;
}

export function QRScanner({ reservation, onClose, onConfirmPickup }: QRScannerProps) {
  const [step, setStep] = useState<'scan' | 'confirm' | 'complete'>(
    reservation ? 'confirm' : 'scan'
  );

  const handleScanSimulation = () => {
    // 프로토타입: 클릭하면 스캔 성공 시뮬레이션
    if (!reservation) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!reservation) return;
    onConfirmPickup(reservation.id);
    setStep('complete');
  };

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* 모달 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#111827]">
            {step === 'scan' ? 'QR 스캔' : step === 'confirm' ? '예약 확인' : '완료'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* 스캔 화면 */}
        {step === 'scan' && (
          <div className="p-6">
            <div
              onClick={handleScanSimulation}
              className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden cursor-pointer group"
            >
              {/* 카메라 시뮬레이션 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                  {/* 스캔 라인 애니메이션 */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#609966] animate-scan" />
                </div>
              </div>

              {/* 가이드 텍스트 */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white text-sm">
                  QR 코드를 스캔해 주세요
                </p>
                <p className="text-white/60 text-xs mt-1">
                  (클릭하여 스캔 시뮬레이션)
                </p>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-[#609966]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-lg font-medium">클릭하여 스캔</span>
              </div>
            </div>

            <p className="text-center text-sm text-[#6B7280] mt-4">
              고객의 QR 픽업권을 스캔하세요
            </p>
          </div>
        )}

        {/* 확인 화면 */}
        {step === 'confirm' && reservation && (
          <div className="p-6">
            <div className="bg-[#F8FAF6] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-2xl">
                  {reservation.productEmoji}
                </div>
                <div>
                  <h3 className="font-semibold text-[#111827]">
                    {reservation.productTitle}
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    수량: {reservation.quantity}개
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">예약번호</span>
                  <span className="font-medium text-[#111827]">{reservation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">고객명</span>
                  <span className="font-medium text-[#111827]">{reservation.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">연락처</span>
                  <span className="font-medium text-[#111827]">{reservation.userPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">결제금액</span>
                  <span className="font-bold text-[#111827]">₩{formatPrice(reservation.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">상태</span>
                  <ReservationStatusBadge status={reservation.status} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-[#6B7280] rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-[#609966] text-white rounded-xl font-semibold"
              >
                픽업 완료 처리
              </button>
            </div>
          </div>
        )}

        {/* 완료 화면 */}
        {step === 'complete' && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-[#111827] mb-2">
              픽업이 완료되었습니다
            </h3>
            <p className="text-[#6B7280] mb-6">
              고객에게 상품을 전달해 주세요
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#609966] text-white rounded-xl font-semibold"
            >
              확인
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
