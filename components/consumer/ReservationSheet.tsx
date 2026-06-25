"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gonggu, Market, Reservation, ReceiveMethod, ReservationOptions } from '@/data/types';
import { formatPrice } from '@/lib/utils';

interface ReservationSheetProps {
  gonggu: Gonggu;
  market?: Market;
  onClose: () => void;
  onConfirm: (gonggu: Gonggu, quantity: number, options: ReservationOptions) => Reservation;
}

const DELIVERY_FEE = 3000;

function getAvailableDates(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return {
      label: i === 0 ? '내일' : `${d.getMonth() + 1}/${d.getDate()}`,
      value: `${d.getMonth() + 1}/${d.getDate()}`,
      day: days[d.getDay()],
    };
  });
}

export function ReservationSheet({ gonggu, market, onClose, onConfirm }: ReservationSheetProps) {
  const router = useRouter();
  const isService = gonggu.type === 'service';

  const [step, setStep] = useState<'form' | 'complete'>('form');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [receiveMethod, setReceiveMethod] = useState<ReceiveMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [visitAddress, setVisitAddress] = useState('');
  const [customerName, setCustomerName] = useState('김지연');
  const [notes, setNotes] = useState('');

  const maxQuantity = gonggu.total - gonggu.reserved;
  const totalPrice = gonggu.price * quantity;
  const deliveryFee = !isService && receiveMethod === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = totalPrice + deliveryFee;
  const availableDates = getAvailableDates();

  const canSubmit =
    customerName.trim() &&
    (isService ? serviceDate : true) &&
    (!isService && receiveMethod === 'delivery' ? deliveryAddress.trim() : true);

  const handleReserve = () => {
    const opts: ReservationOptions = {
      receiveMethod: isService ? 'pickup' : receiveMethod,
      deliveryAddress: receiveMethod === 'delivery' ? deliveryAddress : undefined,
      deliveryFee: receiveMethod === 'delivery' ? deliveryFee : undefined,
      serviceDate: isService ? `${serviceDate}${visitAddress ? ` (${visitAddress})` : ''}` : undefined,
      notes: notes || undefined,
      userName: customerName,
    };
    const newReservation = onConfirm(gonggu, quantity, opts);
    setReservation(newReservation);
    setStep('complete');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto">

        {step === 'form' && (
          <>
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* 상품/서비스 요약 */}
            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: gonggu.imageColor }}>
                  {gonggu.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isService && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">서비스</span>
                    )}
                    <p className="text-xs text-[#6B7280]">{market?.name}</p>
                  </div>
                  <h3 className="font-bold text-[#111827] leading-snug line-clamp-1">{gonggu.title}</h3>
                  <p className="text-base font-bold text-[#111827] mt-0.5">
                    ₩{formatPrice(gonggu.price)}
                    <span className="text-xs font-normal text-[#6B7280] line-through ml-1.5">
                      ₩{formatPrice(gonggu.originalPrice)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ── 서비스 날짜 선택 ── */}
            {isService && (
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#111827] mb-3">
                  서비스 날짜 <span className="text-[#FF5C38]">*</span>
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableDates.map(d => (
                    <button key={d.value} onClick={() => setServiceDate(d.value)}
                      className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-colors min-w-[52px] ${
                        serviceDate === d.value
                          ? 'border-[#609966] bg-[#E8F5E9] text-[#4A7A50]'
                          : 'border-gray-200 text-[#6B7280]'
                      }`}>
                      <span className="text-[11px]">{d.day}</span>
                      <span className="text-sm font-bold mt-0.5">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 방문 주소 (서비스) ── */}
            {isService && (
              <div className="px-5 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">방문 주소</label>
                <input type="text" value={visitAddress} onChange={e => setVisitAddress(e.target.value)}
                  placeholder="서비스 방문 주소를 입력해주세요"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966]" />
              </div>
            )}

            {/* ── 수량 선택 (상품만) ── */}
            {!isService && (
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#111827] text-sm">수량</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg disabled:opacity-40">−</button>
                    <span className="w-6 text-center font-semibold text-base">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} disabled={quantity >= maxQuantity}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg disabled:opacity-40">+</button>
                  </div>
                </div>
                <p className="text-xs text-[#6B7280] mt-1.5 text-right">잔여 {maxQuantity}개</p>
              </div>
            )}

            {/* ── 수령 방식 (상품 + 배달 가능) ── */}
            {!isService && gonggu.deliveryAvailable && (
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#111827] mb-3">수령 방식</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'pickup', label: '🏪 픽업', sub: '현장 결제' },
                    { value: 'delivery', label: '🚚 배달', sub: `배달비 ₩${formatPrice(DELIVERY_FEE)}` },
                  ] as const).map(opt => (
                    <button key={opt.value} onClick={() => setReceiveMethod(opt.value as ReceiveMethod)}
                      className={`py-3 rounded-xl border-2 transition-colors ${
                        receiveMethod === opt.value
                          ? 'border-[#609966] bg-[#E8F5E9] text-[#4A7A50]'
                          : 'border-gray-200 text-[#6B7280]'
                      }`}>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-[10px] mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 배달 주소 ── */}
            {!isService && receiveMethod === 'delivery' && (
              <div className="px-5 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">
                  배달 주소 <span className="text-[#FF5C38]">*</span>
                </label>
                <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="배달받을 주소를 입력해주세요"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966]" />
              </div>
            )}

            {/* ── 픽업/배달/서비스 안내 ── */}
            <div className="px-5 py-3 border-b border-gray-100 space-y-1.5 text-sm text-[#6B7280]">
              {isService ? (
                <>
                  <div className="flex gap-2"><span>📱</span><span>일정 확정 시 카카오 알림톡으로 안내해드려요</span></div>
                  <div className="flex gap-2"><span>💳</span><span>결제는 서비스 완료 후 현장에서</span></div>
                  {serviceDate && <div className="flex gap-2"><span>📅</span><span>선택하신 날짜: <strong className="text-[#111827]">{serviceDate}</strong></span></div>}
                </>
              ) : receiveMethod === 'delivery' ? (
                <>
                  <div className="flex gap-2"><span>🚚</span><span>준비 완료 시 카카오 알림톡으로 배달 일정을 안내해드려요</span></div>
                  <div className="flex gap-2"><span>💳</span><span>온라인 결제 (프로토타입: 완료 처리)</span></div>
                </>
              ) : (
                <>
                  <div className="flex gap-2"><span>📱</span><span>입고 완료 시 카카오 알림톡으로 안내해드려요</span></div>
                  <div className="flex gap-2"><span>💳</span><span>결제는 픽업 시 현장에서 (카드/현금)</span></div>
                  <div className="flex gap-2"><span>📅</span><span>픽업 기간: {gonggu.pickupDate}</span></div>
                </>
              )}
            </div>

            {/* ── 고객명 ── */}
            <div className="px-5 py-3 border-b border-gray-100">
              <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">
                고객명 <span className="text-[#FF5C38]">*</span>
              </label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966]" />
              <p className="text-[10px] text-[#6B7280] mt-1">처음 1회만 입력하면 이후 자동 완성됩니다</p>
            </div>

            {/* ── 요청사항 ── */}
            <div className="px-5 py-3 border-b border-gray-100">
              <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">요청사항</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="사장님에게 전달할 요청사항 (선택)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966] resize-none" />
            </div>

            {/* ── 주문 요약 + 버튼 ── */}
            <div className="px-5 py-4">
              <div className="space-y-1.5 mb-4 text-sm">
                {!isService && (
                  <div className="flex justify-between text-[#6B7280]">
                    <span>주문 수량</span><span>{quantity}개</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B7280]">
                  <span>주문 금액</span><span>₩{formatPrice(totalPrice)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-[#6B7280]">
                    <span>배달비</span><span>₩{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#111827] pt-1.5 border-t border-gray-100">
                  <span>합계</span><span>₩{formatPrice(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6B7280]">
                  <span>결제 방식</span>
                  <span>{receiveMethod === 'delivery' ? '온라인 결제' : '현장 결제'}</span>
                </div>
              </div>

              <button onClick={handleReserve} disabled={!canSubmit}
                className="w-full py-4 bg-[#609966] text-white rounded-xl font-semibold hover:bg-[#4A7A50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isService
                  ? `서비스 예약하기${serviceDate ? ` · ${serviceDate}` : ''}`
                  : `예약하기 (${quantity}개) · ₩${formatPrice(grandTotal)}`}
              </button>
            </div>
          </>
        )}

        {/* ── 완료 단계 ── */}
        {step === 'complete' && reservation && (
          <>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="px-5 py-5">
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">{isService ? '🛠️' : '✅'}</div>
                <h3 className="text-lg font-semibold text-[#111827]">
                  {isService ? '서비스 예약이 완료되었습니다!' : '예약이 완료되었습니다!'}
                </h3>
                <p className="text-sm text-[#609966] font-medium mt-1">{reservation.id}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">{isService ? '서비스' : '상품'}</span>
                  <span className="font-medium text-right max-w-[60%]">{gonggu.title}</span>
                </div>
                {!isService && (
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">수령 방식</span>
                    <span>{receiveMethod === 'pickup' ? '픽업 (현장결제)' : '배달 (온라인결제)'}</span>
                  </div>
                )}
                {isService && serviceDate && (
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">서비스 날짜</span>
                    <span className="font-medium">{serviceDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">합계</span>
                  <span className="font-bold">₩{formatPrice(grandTotal)}</span>
                </div>
                {notes && (
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">요청사항</span>
                    <span className="text-right max-w-[60%]">{notes}</span>
                  </div>
                )}
              </div>

              <div className="bg-[#E8F5E9] rounded-xl p-4 mb-5 text-sm text-[#4A7A50] space-y-1.5">
                <p>• {isService ? '일정 확정 시' : receiveMethod === 'delivery' ? '배달 출발 시' : '상품 준비 완료 시'} 카카오 알림톡으로 안내해드려요</p>
                <p>• 결제는 {receiveMethod === 'delivery' ? '온라인으로 진행됩니다' : '현장에서 카드/현금으로'}</p>
              </div>

              <button onClick={() => { onClose(); router.push('/consumer/reservations'); }}
                className="w-full py-3.5 bg-[#609966] text-white rounded-xl font-semibold text-sm">
                내 예약에서 확인하기
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
