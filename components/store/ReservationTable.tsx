"use client";

import { Reservation } from '@/data/types';
import { ReservationStatusBadge } from '@/components/shared/StatusBadge';
import { formatPrice, formatRelativeTime, getReceiveMethodLabel, getReceiveMethodColor } from '@/lib/utils';

interface ReservationTableProps {
  reservations: Reservation[];
  onPickupComplete: (reservationId: string) => void;
  onMarkReady: (reservationId: string) => void;
  onQRScan: (reservationId: string) => void;
  onNoshow: (reservationId: string) => void;
}

export function ReservationTable({
  reservations,
  onPickupComplete,
  onMarkReady,
  onQRScan,
  onNoshow,
}: ReservationTableProps) {
  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-[#6B7280]">예약 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['예약번호', '고객명', '상품', '수량/금액', '수령방식', '예약시간', '상태', '액션'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reservations.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 text-sm font-medium text-[#111827]">{r.id}</td>

              <td className="px-4 py-4">
                <p className="text-sm font-medium text-[#111827]">{r.userName}</p>
                <p className="text-xs text-[#6B7280]">{r.userPhone}</p>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{r.productEmoji}</span>
                  <div>
                    <p className="text-sm text-[#111827]">{r.productTitle}</p>
                    {r.notes && (
                      <p className="text-xs text-[#6B7280] mt-0.5 max-w-[180px] truncate">
                        💬 {r.notes}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-4 py-4">
                <p className="text-sm font-medium text-[#111827]">{r.quantity}개</p>
                <p className="text-xs text-[#6B7280]">₩{formatPrice(r.totalPrice)}</p>
              </td>

              <td className="px-4 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getReceiveMethodColor(r.receiveMethod)}`}>
                  {getReceiveMethodLabel(r.receiveMethod)}
                </span>
                {r.serviceDate && (
                  <p className="text-xs text-[#6B7280] mt-1">{r.serviceDate}</p>
                )}
              </td>

              <td className="px-4 py-4 text-sm text-[#6B7280]">
                {formatRelativeTime(r.reservedAt)}
              </td>

              <td className="px-4 py-4">
                <ReservationStatusBadge status={r.status} />
              </td>

              <td className="px-4 py-4">
                {r.status === 'pending' && (
                  <button
                    onClick={() => onMarkReady(r.id)}
                    className="px-3 py-1.5 bg-[#609966] text-white text-xs font-semibold rounded-lg hover:bg-[#4A7A50] transition-colors whitespace-nowrap"
                  >
                    📱 알림톡 발송
                  </button>
                )}
                {r.status === 'ready' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onQRScan(r.id)}
                      className="px-3 py-1.5 bg-[#E8F5E9] text-[#609966] text-xs font-medium rounded-lg hover:bg-[#C8E6C9] transition-colors"
                    >
                      QR 스캔
                    </button>
                    <button
                      onClick={() => onPickupComplete(r.id)}
                      className="px-3 py-1.5 bg-[#111827] text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      완료 처리
                    </button>
                  </div>
                )}
                {r.status === 'completed' && (
                  <span className="text-xs text-[#6B7280]">완료</span>
                )}
                {(r.status === 'pending' || r.status === 'ready') && (
                  <button
                    onClick={() => onNoshow(r.id)}
                    className="mt-1 px-3 py-1 text-[#6B7280] text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors block"
                  >
                    노쇼
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
