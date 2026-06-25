"use client";

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-center">
        <div className="text-4xl mb-3">🥬</div>
        <h3 className="font-bold text-lg mb-2">온맘마켓에 오신 걸 환영해요!</h3>
        <p className="text-sm text-gray-500">동네 마켓의 신선식품을 공동구매로 저렴하게 만나보세요.</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="date-filter"]',
    content: (
      <div>
        <p className="font-semibold mb-1">날짜 필터</p>
        <p className="text-sm text-gray-500">날짜별로 공구 일정을 확인할 수 있어요.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="category-filter"]',
    content: (
      <div>
        <p className="font-semibold mb-1">카테고리 필터</p>
        <p className="text-sm text-gray-500">과일, 식품, 베이커리 등 원하는 카테고리만 볼 수 있어요.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="first-gonggu-card"]',
    content: (
      <div>
        <p className="font-semibold mb-1">공구 카드</p>
        <p className="text-sm text-gray-500">카드를 클릭하면 상세 정보를, <br/>"예약하기" 버튼으로 바로 예약할 수 있어요.</p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

const storageKey = 'onmom-tour-done';

export function OnboardingTour() {
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
        last: '시작하기!',
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
