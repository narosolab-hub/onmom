"use client";

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Reservation } from '@/data/types';
import { formatPrice } from '@/lib/utils';

interface CartSheetProps {
  onClose: () => void;
  onComplete: (reservations: Reservation[]) => void;
}

export function CartSheet({ onClose, onComplete }: CartSheetProps) {
  const { cart, removeFromCart, updateCartQuantity, checkoutCart } = useApp();
  const [step, setStep] = useState<'cart' | 'complete'>('cart');
  const [completedReservations, setCompletedReservations] = useState<Reservation[]>([]);

  const totalPrice = cart.reduce((sum, item) => sum + item.gonggu.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    const reservations = checkoutCart();
    setCompletedReservations(reservations);
    setStep('complete');
    onComplete(reservations);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto">

        {step === 'cart' && (
          <>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-bold text-[#111827] text-base">장바구니 <span className="text-[#609966]">{cart.length}종</span></h2>
              <button onClick={onClose} className="text-[#6B7280] text-sm">닫기</button>
            </div>

            {cart.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-[#6B7280] text-sm">담은 상품이 없어요</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {cart.map(({ gonggu, quantity }) => {
                    const max = gonggu.total - gonggu.reserved;
                    return (
                      <div key={gonggu.id} className="px-5 py-3 flex gap-3 items-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: gonggu.imageColor }}
                        >
                          {gonggu.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111827] line-clamp-1">{gonggu.title}</p>
                          <p className="text-xs text-[#6B7280]">픽업 {gonggu.pickupDate}</p>
                          <p className="text-sm font-bold text-[#111827] mt-0.5">₩{formatPrice(gonggu.price * quantity)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateCartQuantity(gonggu.id, quantity - 1)}
                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(gonggu.id, quantity + 1)}
                            disabled={quantity >= max}
                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium disabled:opacity-40"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(gonggu.id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#FF5C38] ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                    <span>총 {totalCount}개 상품</span>
                    <span>현장결제</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#111827]">합계</span>
                    <span className="text-xl font-bold text-[#111827]">₩{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[#609966] text-white rounded-xl font-semibold text-base hover:bg-[#4A7A50] transition-colors"
                  >
                    {totalCount}개 전체 예약하기
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="px-5 py-5">
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-[#111827]">예약이 완료되었습니다!</h3>
                <p className="text-sm text-[#6B7280] mt-1">{completedReservations.length}개 상품 예약 완료</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                {completedReservations.map(r => (
                  <div key={r.id} className="flex justify-between">
                    <span className="text-[#6B7280] truncate mr-2">{r.productEmoji} {r.productTitle} {r.quantity}개</span>
                    <span className="text-[#111827] font-medium flex-shrink-0">₩{formatPrice(r.totalPrice)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span className="text-[#111827]">합계</span>
                  <span className="text-[#111827]">₩{formatPrice(completedReservations.reduce((s, r) => s + r.totalPrice, 0))}</span>
                </div>
              </div>

              <div className="bg-[#E8F5E9] rounded-xl p-4 mb-5 text-sm text-[#4A7A50] space-y-1.5">
                <p>• 입고 완료 시 앱 알림을 보내드려요</p>
                <p>• 결제는 픽업 시 현장에서 진행해요</p>
                <p>• 미방문 시 자동 취소될 수 있어요</p>
              </div>

              <div className="flex gap-3">
                <a
                  href="/consumer/reservations"
                  className="flex-1 py-3 bg-[#E8F5E9] text-[#609966] rounded-xl font-medium text-center text-sm"
                >
                  내 예약 확인
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#609966] text-white rounded-xl font-semibold text-sm"
                >
                  확인
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
