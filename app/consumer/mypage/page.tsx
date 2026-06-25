"use client";

import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/utils';

export default function MyPage() {
  const { reservations } = useApp();

  // 통계 계산
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const totalPurchase = completedReservations.reduce((sum, r) => sum + r.totalPrice, 0);
  const totalSaved = completedReservations.reduce((sum, r) => {
    // 간단히 30% 절약으로 계산
    return sum + Math.round(r.totalPrice * 0.3);
  }, 0);
  const noshowCount = reservations.filter(r => r.status === 'noshow').length;

  const menuItems = [
    { icon: '🏪', label: '구독 마켓', badge: '2' },
    { icon: '🔔', label: '알림 설정', badge: null },
    { icon: '📍', label: '내 동네 설정', badge: '일산동구' },
    { icon: '💬', label: '문의하기', badge: null },
    { icon: '📄', label: '이용약관', badge: null },
    { icon: 'ℹ️', label: '버전 정보', badge: 'v1.0.0' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF6]">
      {/* 헤더 */}
      <header className="bg-white px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center text-3xl">
            👤
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827]">김지연</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#609966] text-white text-xs font-medium rounded-full">
                그린회원
              </span>
              <span className="text-sm text-[#6B7280]">
                공구 {completedReservations.length}회 참여
              </span>
            </div>
          </div>

          {/* 설정 버튼 */}
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            ⚙️
          </button>
        </div>
      </header>

      {/* 통계 카드 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center px-2">
              <p className="text-xs text-[#6B7280]">총 구매</p>
              <p className="text-lg font-bold text-[#111827] mt-1">
                ₩{formatPrice(totalPurchase)}
              </p>
            </div>
            <div className="text-center px-2">
              <p className="text-xs text-[#6B7280]">총 절약</p>
              <p className="text-lg font-bold text-[#609966] mt-1">
                ₩{formatPrice(totalSaved)}
              </p>
            </div>
            <div className="text-center px-2">
              <p className="text-xs text-[#6B7280]">노쇼</p>
              <p className="text-lg font-bold text-[#111827] mt-1">
                {noshowCount}회
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
                index > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-[#111827]">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-sm text-[#6B7280]">{item.badge}</span>
                )}
                <span className="text-[#6B7280]">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="px-4 pb-8">
        <button className="w-full py-3 text-center text-[#6B7280] text-sm">
          로그아웃
        </button>
      </div>
    </div>
  );
}
