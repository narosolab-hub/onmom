"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Gonggu, ReservationOptions } from '@/data/types';
import { CategoryFilter } from '@/components/consumer/CategoryFilter';
import { GongguCard } from '@/components/consumer/GongguCard';
import { ReservationSheet } from '@/components/consumer/ReservationSheet';
import { CartSheet } from '@/components/consumer/CartSheet';
import { getRelativeDate, formatPrice, productCategories, serviceCategories } from '@/lib/utils';
import { OnboardingTour } from '@/components/consumer/OnboardingTour';

type TypeTab = 'all' | 'product' | 'service';

const TYPE_TABS: { label: string; value: TypeTab; emoji: string }[] = [
  { label: '전체', value: 'all', emoji: '' },
  { label: '상품', value: 'product', emoji: '🛍️' },
  { label: '서비스', value: 'service', emoji: '🛠️' },
];

export default function ConsumerFeedPage() {
  const { gongguList, addReservation, getMarketById, reservations, cart, markets } = useApp();

  const [selectedType, setSelectedType] = useState<TypeTab>('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGonggu, setSelectedGonggu] = useState<Gonggu | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');

  const readyReservations = reservations.filter(r => r.status === 'ready');
  const unreadCount = readyReservations.length;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.gonggu.price * item.quantity, 0);

  // 타입 탭 변경 시 카테고리 초기화
  const handleTypeChange = (type: TypeTab) => {
    setSelectedType(type);
    setSelectedCategory('all');
    if (type === 'service') setSelectedDate('all');
  };

  const currentCategories = selectedType === 'service' ? serviceCategories : productCategories;

  // 오늘 날짜 레이블
  const todayLabel = useMemo(() => {
    const d = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  }, []);

  // 픽업 날짜 탭 — 등록된 날짜 전체 (사장님이 공구 등록 시 날짜 결정)
  const dateTabs = useMemo(() => {
    const dateMap = new Map<string, number>();
    gongguList.forEach(g => {
      if (g.type !== 'service') {
        dateMap.set(g.arrivalDate, (dateMap.get(g.arrivalDate) || 0) + 1);
      }
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => {
        const [am, ad] = a.split('/').map(Number);
        const [bm, bd] = b.split('/').map(Number);
        return (am * 100 + ad) - (bm * 100 + bd);
      })
      .map(([date, count]) => ({ date, label: `${date} 공구`, count }));
  }, [gongguList]);

  const filteredGonggu = useMemo(() => {
    return gongguList.filter((g) => {
      if (selectedType !== 'all' && g.type !== selectedType) return false;
      if (selectedType !== 'service' && selectedDate !== 'all' && g.arrivalDate !== selectedDate) return false;
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
      return true;
    });
  }, [gongguList, selectedType, selectedDate, selectedCategory]);

  const arrivedProducts = gongguList.filter(g => g.type === 'product' && g.status === 'arrived');
  const totalActiveCount = gongguList.filter(g =>
    g.status === 'open' || g.status === 'closing' || g.status === 'arrived'
  ).length;
  const serviceCount = gongguList.filter(g => g.type === 'service' && (g.status === 'open' || g.status === 'closing')).length;

  const handleReserve = (gonggu: Gonggu) => setSelectedGonggu(gonggu);

  const handleNotify = (gonggu: Gonggu) => {
    setNotifiedIds(prev => new Set([...prev, gonggu.id]));
    setToastMessage('오픈 시 카카오 알림톡으로 알려드릴게요!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6]">
      <OnboardingTour />

      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-30 border-b border-gray-100">
        <div className="px-4 pt-4 pb-0">
          {/* 상단 행: 마켓명 + 액션 */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#6B7280]">{markets[0]?.name ?? '온맘마켓'}</p>
            <div className="flex items-center gap-1.5">
              {/* 레이아웃 토글 */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setLayout('list')}
                  className={`px-2 py-1.5 rounded-md text-sm transition-colors ${layout === 'list' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>☰</button>
                <button onClick={() => setLayout('grid')}
                  className={`px-2 py-1.5 rounded-md text-sm transition-colors ${layout === 'grid' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>⊞</button>
              </div>
              {/* 알림 버튼 */}
              <div className="relative">
                <button onClick={() => setShowNotifications(v => !v)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base relative">
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF5C38] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-lg z-40 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-[#111827] text-sm">알림</p>
                      </div>
                      {readyReservations.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-[#6B7280]">새로운 알림이 없습니다</div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {readyReservations.map(r => (
                            <div key={r.id} className="px-4 py-3 bg-[#E8F5E9]/60">
                              <p className="text-sm font-medium text-[#111827]">
                                {r.productType === 'service' ? '🛠️ 서비스 일정 확정!' : r.receiveMethod === 'delivery' ? '🚚 배달 출발!' : '📦 픽업 준비완료!'}
                              </p>
                              <p className="text-xs text-[#6B7280] mt-0.5">{r.productTitle}</p>
                              <p className="text-xs text-[#609966] mt-1 font-medium">카카오 알림톡이 발송되었습니다</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 오늘 날짜 크게 */}
          <h1 className="text-2xl font-bold text-[#111827] leading-tight">{todayLabel}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5 mb-3">
            {selectedType === 'service' ? `서비스 ${serviceCount}개` : `${totalActiveCount}개 상품 공구중`}
          </p>

          {/* 타입 탭 */}
          <div className="flex gap-2 pb-2">
            {TYPE_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedType === tab.value
                    ? 'bg-[#111827] text-white'
                    : 'bg-gray-100 text-[#6B7280]'
                }`}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 픽업 날짜 탭 (상품/전체만) — 최대 3개 */}
      {selectedType !== 'service' && dateTabs.length > 0 && (
        <div className="bg-white border-b border-gray-100" data-tour="date-filter">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedDate('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedDate === 'all' ? 'bg-[#609966] text-white' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {dateTabs.map(({ date, label, count }) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDate === date ? 'bg-[#609966] text-white' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                }`}
              >
                {label}
                <span className={`text-xs font-normal ${selectedDate === date ? 'text-white/70' : 'text-[#6B7280]/70'}`}>
                  ({count})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="bg-white" data-tour="category-filter">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={currentCategories}
        />
      </div>

      {/* 입고 완료 배너 (상품만) */}
      {arrivedProducts.length > 0 && selectedType !== 'service' && selectedDate === 'all' && (
        <div className="mx-3 mt-3 px-4 py-3 bg-[#E8F5E9] rounded-2xl flex items-center gap-3">
          <span className="text-lg">📦</span>
          <div>
            <span className="text-sm font-semibold text-[#4A7A50]">오늘 입고 완료 {arrivedProducts.length}건</span>
            <p className="text-xs text-[#609966]">지금 바로 픽업 가능해요!</p>
          </div>
        </div>
      )}

      {/* 서비스 안내 배너 */}
      {selectedType === 'service' && (
        <div className="mx-3 mt-3 px-4 py-3 bg-blue-50 rounded-2xl flex items-center gap-3">
          <span className="text-lg">🛠️</span>
          <div>
            <span className="text-sm font-semibold text-blue-700">전문가 방문 서비스</span>
            <p className="text-xs text-blue-600">예약 시 원하는 날짜를 선택할 수 있어요</p>
          </div>
        </div>
      )}

      {/* 카드 리스트 */}
      <div className="px-3 pt-3 pb-24">
        <p className="text-xs text-[#6B7280] mb-2 px-1">
          총 {filteredGonggu.length}{selectedType === 'service' ? '개 서비스' : '개 공구'}
        </p>

        {filteredGonggu.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#6B7280] mb-4 text-sm">해당 조건의 공구가 없습니다.</p>
            <button
              onClick={() => { setSelectedDate('all'); setSelectedCategory('all'); }}
              className="px-4 py-2 bg-[#E8F5E9] text-[#609966] rounded-xl text-sm font-medium"
            >
              전체 보기
            </button>
          </div>
        ) : layout === 'list' ? (
          <div className="space-y-2.5" data-tour="first-gonggu-card">
            {filteredGonggu.map((gonggu) => (
              <GongguCard key={gonggu.id} gonggu={gonggu} layout="list"
                market={getMarketById(gonggu.marketId)}
                onReserve={handleReserve} onNotify={handleNotify}
                isNotified={notifiedIds.has(gonggu.id)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5" data-tour="first-gonggu-card">
            {filteredGonggu.map((gonggu) => (
              <GongguCard key={gonggu.id} gonggu={gonggu} layout="grid"
                market={getMarketById(gonggu.marketId)}
                onReserve={handleReserve} onNotify={handleNotify}
                isNotified={notifiedIds.has(gonggu.id)} />
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 장바구니 */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-3 z-20">
          <button onClick={() => setShowCart(true)}
            className="w-full bg-[#111827] text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#609966] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              <span className="font-semibold text-sm">장바구니 보기</span>
            </div>
            <span className="font-bold text-sm">₩{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#111827] text-white text-sm rounded-full shadow-lg whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* 예약 시트 */}
      {selectedGonggu && (
        <ReservationSheet
          gonggu={selectedGonggu}
          market={getMarketById(selectedGonggu.marketId)}
          onClose={() => setSelectedGonggu(null)}
          onConfirm={(g, qty, opts) => addReservation(g, qty, opts)}
        />
      )}

      {/* 장바구니 시트 */}
      {showCart && (
        <CartSheet onClose={() => setShowCart(false)} onComplete={() => setShowCart(false)} />
      )}
    </div>
  );
}
