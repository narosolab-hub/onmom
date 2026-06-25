"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

const menuItems = [
  { href: '/store',              icon: '🏠', label: '대시보드'      },
  { href: '/store/reservations', icon: '📋', label: '예약 관리'     },
  { href: '/store/products',     icon: '📦', label: '상품 관리'     },
  { href: '/store/alimtalk',     icon: '📱', label: '채널 알림'     },
  { href: '/store/members',      icon: '👥', label: '회원 관리'     },
  { href: '/store/analytics',    icon: '📊', label: '매출 분석'     },
  { href: '/store/alerts',       icon: '🔔', label: '알림', showBadge: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { alerts } = useApp();
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 z-40">
      {/* 로고 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥬</span>
          <div>
            <h1 className="font-bold text-[#111827]">온맘마켓</h1>
            <p className="text-xs text-[#6B7280]">사장님 관리</p>
          </div>
        </div>
      </div>

      {/* 마켓 정보 */}
      <div className="p-4 mx-4 mt-4 bg-[#F8FAF6] rounded-xl">
        <p className="text-sm font-medium text-[#111827]">온맘마켓 일산점</p>
        <p className="text-xs text-[#6B7280] mt-0.5">경기 고양시 일산동구</p>
      </div>

      {/* 메뉴 */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/store' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#E8F5E9] text-[#609966]'
                  : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`font-medium flex-1 ${isActive ? 'text-[#609966]' : ''}`}>
                {item.label}
              </span>
              {item.showBadge && unreadCount > 0 && (
                <span className="w-5 h-5 bg-[#FF5C38] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#111827]">박사장님</p>
            <p className="text-xs text-[#6B7280]">관리자</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
