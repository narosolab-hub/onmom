"use client";

import { Sidebar } from '@/components/store/Sidebar';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAF6]">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
