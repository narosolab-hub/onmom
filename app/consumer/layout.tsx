"use client";

import { BottomNav } from '@/components/consumer/BottomNav';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAF6]">
      {/* 모바일 컨테이너 */}
      <div className="relative mx-auto max-w-[375px] min-h-screen bg-white shadow-lg">
        {/* 메인 컨텐츠 */}
        <main className="pb-20">
          {children}
        </main>

        {/* 하단 네비게이션 */}
        <BottomNav />
      </div>
    </div>
  );
}
