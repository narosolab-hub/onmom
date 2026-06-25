"use client";

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Market } from '@/data/types';
import { getRelativeDate } from '@/lib/utils';

export default function MapPage() {
  const { markets, gongguList } = useApp();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  // 마켓별 오늘 공구 개수
  const getGongguCount = (marketId: number) => {
    return gongguList.filter(g => g.marketId === marketId && g.arrivalDate === getRelativeDate(0)).length;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6]">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-30 px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#111827]">주변 마켓</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          내 주변 마켓 {markets.length}곳
        </p>
      </header>

      {/* 지도 영역 (시뮬레이션) */}
      <div className="relative h-[400px] bg-gray-100">
        {/* 지도 배경 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8F5E9] to-[#C8E6C9]">
          {/* 격자 패턴 */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(#609966 1px, transparent 1px), linear-gradient(90deg, #609966 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* 내 위치 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500/20 rounded-full animate-ping" />
        </div>

        {/* 마켓 핀들 */}
        {markets.map((market, index) => (
          <button
            key={market.id}
            onClick={() => setSelectedMarket(market)}
            className={`absolute transform -translate-x-1/2 transition-transform ${
              selectedMarket?.id === market.id ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{
              top: `${30 + index * 20}%`,
              left: `${30 + index * 30}%`,
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg ${
              selectedMarket?.id === market.id
                ? 'bg-[#609966] ring-4 ring-[#609966]/30'
                : 'bg-white'
            }`}>
              {market.emoji}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
          </button>
        ))}

        {/* 확대/축소 버튼 */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-xl">
            +
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-xl">
            -
          </button>
        </div>
      </div>

      {/* 선택된 마켓 카드 */}
      {selectedMarket && (
        <div className="absolute bottom-24 left-4 right-4 max-w-[343px] mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-2xl">
                {selectedMarket.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#111827]">
                  {selectedMarket.name}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {selectedMarket.area} · 구독자 {selectedMarket.followers}명
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {selectedMarket.address}
                </p>
              </div>
            </div>

            <button className="w-full mt-4 py-3 bg-[#609966] text-white rounded-xl font-semibold">
              오늘 공구 {getGongguCount(selectedMarket.id)}개 보기
            </button>
          </div>
        </div>
      )}

      {/* 마켓 리스트 */}
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[#6B7280]">전체 마켓</h2>
        {markets.map((market) => (
          <button
            key={market.id}
            onClick={() => setSelectedMarket(market)}
            className={`w-full bg-white rounded-xl p-4 text-left transition-colors ${
              selectedMarket?.id === market.id ? 'ring-2 ring-[#609966]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-xl">
                {market.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#111827]">{market.name}</h3>
                <p className="text-xs text-[#6B7280]">
                  {market.area} · 오늘 공구 {getGongguCount(market.id)}개
                </p>
              </div>
              <span className="text-[#6B7280]">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
