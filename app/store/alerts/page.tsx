"use client";

import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

const typeLabel: Record<string, string> = {
  reservation: '새 예약',
  pickup: '픽업 완료',
  noshow: '노쇼',
  closing: '마감 임박',
  system: '시스템',
};

export default function AlertsPage() {
  const { alerts, markAlertRead } = useApp();

  const unread = alerts.filter(a => !a.read);
  const read = alerts.filter(a => a.read);

  const handleMarkRead = (id: number) => {
    markAlertRead(id);
  };

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">알림</h1>
          <p className="text-[#6B7280] mt-1">
            {unread.length > 0 ? `읽지 않은 알림 ${unread.length}건` : '모든 알림을 확인했습니다'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={() => unread.forEach(a => markAlertRead(a.id))}
            className="px-4 py-2 text-sm text-[#609966] bg-[#E8F5E9] rounded-xl font-medium hover:bg-[#C8E6C9] transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-[#6B7280]">알림이 없습니다.</p>
          <p className="text-sm text-[#6B7280] mt-1">
            예약이 들어오면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 읽지 않은 알림 */}
          {unread.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#6B7280] mb-2 px-1">읽지 않음</p>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {unread.map((alert, idx) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 px-6 py-4 bg-blue-50/40 cursor-pointer hover:bg-blue-50 transition-colors ${
                      idx < unread.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                    onClick={() => handleMarkRead(alert.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                      {alert.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-[#609966] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                          {typeLabel[alert.type] || alert.type}
                        </span>
                        <span className="text-xs text-[#6B7280]">{alert.time}</span>
                      </div>
                      <p className="text-sm text-[#111827]">{alert.message}</p>
                      {alert.reservationId && (
                        <Link
                          href="/store/reservations"
                          className="text-xs text-[#609966] mt-1 inline-block hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          예약 보기 →
                        </Link>
                      )}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#609966] flex-shrink-0 mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 읽은 알림 */}
          {read.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#6B7280] mb-2 px-1">이전 알림</p>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {read.map((alert, idx) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 px-6 py-4 ${
                      idx < read.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 opacity-60">
                      {alert.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-[#6B7280]">
                          {typeLabel[alert.type] || alert.type}
                        </span>
                        <span className="text-xs text-[#6B7280]">·</span>
                        <span className="text-xs text-[#6B7280]">{alert.time}</span>
                      </div>
                      <p className="text-sm text-[#6B7280]">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
