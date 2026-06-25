"use client";

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getRelativeDate } from '@/lib/utils';
import { Gonggu } from '@/data/types';
import { GongguCard } from '@/components/consumer/GongguCard';
import { ReservationSheet } from '@/components/consumer/ReservationSheet';
import { QRTicket } from '@/components/consumer/QRTicket';
import { ReservationTable } from '@/components/store/ReservationTable';
import { QRScanner } from '@/components/store/QRScanner';

function DemoContent() {
  const {
    gongguList,
    reservations,
    alerts,
    lastSyncEvent,
    addReservation,
    completePickup,
    getMarketById,
  } = useApp();

  const [selectedGonggu, setSelectedGonggu] = useState<Gonggu | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningReservationId, setScanningReservationId] = useState<string | null>(null);
  const [syncIndicator, setSyncIndicator] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [autoLog, setAutoLog] = useState<string[]>([]);

  // 동기화 이벤트 감지 + 단계 자동 전환
  useEffect(() => {
    if (lastSyncEvent) {
      setSyncIndicator(true);
      if (lastSyncEvent.type === 'new_reservation') setCurrentStep(2);
      if (lastSyncEvent.type === 'pickup_complete') setCurrentStep(4);
      const timer = setTimeout(() => setSyncIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncEvent]);

  const handleReserve = (gonggu: Gonggu) => {
    setSelectedGonggu(gonggu);
  };

  const handleConfirmReservation = (gonggu: Gonggu, quantity: number) => {
    return addReservation(gonggu, quantity);
  };

  const handleQRScan = (reservationId: string) => {
    setScanningReservationId(reservationId);
    setShowScanner(true);
  };

  const handlePickupComplete = (reservationId: string) => {
    completePickup(reservationId);
  };

  const arrivedReservations = reservations.filter(r => r.status === 'ready');
  const activeReservations = reservations.filter(r =>
    r.status === 'pending' || r.status === 'ready'
  );

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const runAutoDemo = async () => {
    if (autoPlaying) return;
    setAutoPlaying(true);
    setAutoLog([]);
    setCurrentStep(1);

    const log = (msg: string) => setAutoLog(prev => [...prev, msg]);

    // Step 1: 소비자 상품 예약
    log('🛒 소비자가 "애플청포도" 예약 중...');
    await delay(1500);
    const openGonggu = gongguList.find(g => g.status === 'open' || g.status === 'arrived');
    if (!openGonggu) { setAutoPlaying(false); return; }
    addReservation(openGonggu, 2);
    log(`✅ 예약 완료! ${openGonggu.title} 2개`);
    setCurrentStep(2);

    // Step 2: 사장님 알림 확인 (시각적으로만)
    await delay(2000);
    log('📱 사장님 앱에 새 예약 알림 도착!');
    setCurrentStep(3);

    // Step 3: QR 스캔으로 픽업 완료
    await delay(2000);
    log('📷 사장님이 QR 스캔으로 픽업 처리 중...');
    await delay(1500);

    const latestArrived = reservations.find(r => r.status === 'ready');
    if (latestArrived) {
      completePickup(latestArrived.id);
      log('🎉 픽업 완료! 소비자 앱 상태 변경됨');
    } else {
      // arrived 예약 찾기: 방금 예약된 것 + 초기 데이터
      const allReservations = [...reservations];
      const arrived = allReservations.find(r => r.status === 'ready');
      if (arrived) completePickup(arrived.id);
      log('🎉 픽업 완료! 소비자 앱 상태 변경됨');
    }
    setCurrentStep(4);

    await delay(1000);
    setAutoPlaying(false);
    log('✨ 데모 완료! 다시 시작하려면 버튼을 누르세요.');
  };

  const scanningReservation = scanningReservationId
    ? reservations.find(r => r.id === scanningReservationId)
    : null;

  // 오늘 공구 상품 (처음 2개만)
  const todayGonggu = gongguList.filter(g => g.arrivalDate === getRelativeDate(0)).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">온맘마켓 연동 데모</h1>
        <p className="text-gray-400 mt-1 mb-4">
          소비자와 사장님 앱의 실시간 연동을 확인하세요
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={runAutoDemo}
            disabled={autoPlaying}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${
              autoPlaying
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#609966] text-white hover:bg-[#4A7A50]'
            }`}
          >
            {autoPlaying ? (
              <><span className="animate-spin">⏳</span> 시연 중...</>
            ) : (
              <>▶ 자동 시연</>
            )}
          </button>
          <button
            onClick={() => { setCurrentStep(0); setAutoLog([]); }}
            className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-600 transition-colors"
          >
            초기화
          </button>
        </div>

        {/* 자동 시연 로그 */}
        {autoLog.length > 0 && (
          <div className="mt-4 max-w-md mx-auto bg-gray-800 rounded-xl p-4 text-left">
            <p className="text-xs text-gray-500 mb-2 font-semibold">시연 로그</p>
            <div className="space-y-1">
              {autoLog.map((log, i) => (
                <p key={i} className={`text-sm ${i === autoLog.length - 1 ? 'text-white' : 'text-gray-400'}`}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 시나리오 진행 바 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-gray-800 rounded-xl px-6 py-4">
          {[
            { step: 1, label: '상품 탐색' },
            { step: 2, label: '예약 완료' },
            { step: 3, label: '알림 확인' },
            { step: 4, label: '픽업 완료' },
          ].map(({ step, label }, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${currentStep >= step ? 'text-[#609966]' : 'text-gray-500'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  currentStep >= step ? 'border-[#609966] bg-[#609966] text-white' : 'border-gray-600 text-gray-500'
                }`}>
                  {currentStep > step ? '✓' : step}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {idx < 3 && (
                <div className={`w-8 h-0.5 mx-1 ${currentStep > step ? 'bg-[#609966]' : 'bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>
        {currentStep === 0 && (
          <p className="text-center text-gray-400 text-sm mt-2">
            소비자 앱에서 상품을 예약해보세요 →
          </p>
        )}
        {currentStep === 2 && (
          <p className="text-center text-[#609966] text-sm mt-2 font-medium">
            ✅ 예약 완료! 사장님 앱에 알림이 도착했습니다 →
          </p>
        )}
        {currentStep === 4 && (
          <p className="text-center text-[#609966] text-sm mt-2 font-medium">
            🎉 픽업 완료! 소비자 앱의 예약 상태가 변경되었습니다
          </p>
        )}
      </div>

      {/* 동기화 상태 */}
      <div className="flex justify-center mb-6">
        <div className={`px-6 py-3 rounded-full flex items-center gap-3 transition-all ${
          syncIndicator
            ? 'bg-[#609966] text-white'
            : 'bg-gray-800 text-gray-400'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            syncIndicator ? 'bg-white animate-ping' : 'bg-gray-500'
          }`} />
          <span className="font-medium">
            {syncIndicator ? '동기화됨!' : '연동 대기중'}
          </span>
          {lastSyncEvent && syncIndicator && (
            <span className="text-sm opacity-80">
              {lastSyncEvent.type === 'new_reservation' && '새 예약'}
              {lastSyncEvent.type === 'pickup_complete' && '픽업 완료'}
              {lastSyncEvent.type === 'status_change' && '상태 변경'}
            </span>
          )}
        </div>
      </div>

      {/* 듀얼 뷰 */}
      <div className="flex gap-4 justify-center items-start">
        {/* 소비자 앱 */}
        <div className="w-[375px] flex-shrink-0">
          <div className="bg-gray-800 rounded-t-xl px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-sm ml-2">소비자 앱</span>
          </div>

          <div className="bg-white rounded-b-xl overflow-hidden max-h-[700px] overflow-y-auto">
            {/* 공구 탭 */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#111827]">공구</h2>
              <p className="text-sm text-[#6B7280]">오늘 공구 {todayGonggu.length}개</p>
            </div>

            {/* 공구 카드 */}
            <div className="p-4 space-y-4">
              {todayGonggu.map((gonggu) => (
                <GongguCard
                  key={gonggu.id}
                  gonggu={gonggu}
                  market={getMarketById(gonggu.marketId)}
                  onReserve={handleReserve}
                />
              ))}
            </div>

            {/* 내 예약 */}
            {activeReservations.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-[#6B7280] mb-3">
                  내 예약 ({activeReservations.length})
                </h3>
                <div className="space-y-3">
                  {activeReservations.map((reservation) => (
                    <QRTicket key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 동기화 화살표 */}
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <div className={`text-4xl transition-transform ${
            syncIndicator ? 'scale-125' : ''
          }`}>
            ⚡
          </div>
          <div className="flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
              lastSyncEvent?.type === 'new_reservation' && syncIndicator
                ? 'bg-[#609966]'
                : 'bg-gray-700'
            }`}>
              →
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
              lastSyncEvent?.type === 'pickup_complete' && syncIndicator
                ? 'bg-[#609966]'
                : 'bg-gray-700'
            }`}>
              ←
            </div>
          </div>
        </div>

        {/* 사장님 앱 */}
        <div className="w-[600px] flex-shrink-0">
          <div className="bg-gray-800 rounded-t-xl px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-sm ml-2">사장님 앱</span>
          </div>

          <div className="bg-[#F8FAF6] rounded-b-xl overflow-hidden max-h-[700px] overflow-y-auto p-6">
            {/* 알림 */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  알림
                  <span className="w-5 h-5 bg-[#FF5C38] text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.filter(a => !a.read).length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-2 p-2 rounded-lg ${
                        !alert.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span>{alert.icon}</span>
                      <div>
                        <p className="text-sm text-[#111827]">{alert.message}</p>
                        <p className="text-xs text-[#6B7280]">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 픽업 대기 */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#111827]">
                  픽업 대기 ({arrivedReservations.length})
                </h3>
                <button
                  onClick={() => {
                    if (arrivedReservations.length > 0) {
                      handleQRScan(arrivedReservations[0].id);
                    }
                  }}
                  className="px-4 py-2 bg-[#609966] text-white text-sm rounded-lg font-medium"
                >
                  QR 스캔
                </button>
              </div>

              {arrivedReservations.length > 0 ? (
                <ReservationTable
                  reservations={arrivedReservations}
                  onPickupComplete={handlePickupComplete}
                  onQRScan={handleQRScan}
                  onNoshow={() => {}}
                  onMarkReady={() => {}}
                />
              ) : (
                <p className="text-center text-[#6B7280] py-8">
                  픽업 대기 중인 예약이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 가이드 */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">데모 시나리오</h3>
          <ol className="space-y-3 text-gray-300 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-[#609966] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>소비자 앱에서 상품을 선택하고 "예약하기" 버튼을 클릭합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-[#609966] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>예약이 완료되면 사장님 앱에 실시간 알림이 표시됩니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-[#609966] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>사장님 앱에서 "QR 스캔" 버튼으로 픽업을 처리합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-[#609966] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>픽업 완료 시 소비자 앱의 예약 상태가 즉시 변경됩니다.</span>
            </li>
          </ol>
        </div>
      </div>

      {/* 예약 바텀시트 */}
      {selectedGonggu && (
        <ReservationSheet
          gonggu={selectedGonggu}
          market={getMarketById(selectedGonggu.marketId)}
          onClose={() => setSelectedGonggu(null)}
          onConfirm={handleConfirmReservation}
        />
      )}

      {/* QR 스캐너 모달 */}
      {showScanner && (
        <QRScanner
          reservation={scanningReservation}
          onClose={() => {
            setShowScanner(false);
            setScanningReservationId(null);
          }}
          onConfirmPickup={handlePickupComplete}
        />
      )}
    </div>
  );
}

export default function DemoPage() {
  return <DemoContent />;
}
