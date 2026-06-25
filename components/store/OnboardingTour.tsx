"use client";

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-center">
        <div className="text-4xl mb-3">💼</div>
        <h3 className="font-bold text-lg mb-2">사장님 관리 페이지</h3>
        <p className="text-sm text-gray-500">예약 현황을 한눈에 보고 QR로 픽업을 처리하세요.</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stat-cards"]',
    content: (
      <div>
        <p className="font-semibold mb-1">오늘의 현황</p>
        <p className="text-sm text-gray-500">예약 건수, 픽업 대기, 매출, 노쇼를 실시간으로 확인하세요.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="qr-scan-btn"]',
    content: (
      <div>
        <p className="font-semibold mb-1">QR 스캔</p>
        <p className="text-sm text-gray-500">고객이 제시하는 QR을 스캔해 픽업을 처리하세요. 자동으로 상태가 변경됩니다.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="hourly-chart"]',
    content: (
      <div>
        <p className="font-semibold mb-1">시간대별 예약 현황</p>
        <p className="text-sm text-gray-500">언제 예약이 몰리는지 파악해 운영을 최적화하세요.</p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

const storageKey = 'onmom-store-tour-done';

export function StoreOnboardingTour() {
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState(false);

  useEffect(() => {
    setMounted(true);
    const done = localStorage.getItem(storageKey);
    if (!done) {
      const t = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(storageKey, 'true');
      setRun(false);
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      locale={{
        back: '이전',
        close: '닫기',
        last: '완료!',
        next: '다음',
        skip: '건너뛰기',
      }}
      styles={{
        options: {
          primaryColor: '#609966',
          zIndex: 9999,
        },
        tooltip: {
          borderRadius: '16px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#609966',
          borderRadius: '10px',
          padding: '8px 20px',
        },
        buttonBack: {
          color: '#6B7280',
          marginRight: 8,
        },
        buttonSkip: {
          color: '#6B7280',
        },
      }}
    />
  );
}
