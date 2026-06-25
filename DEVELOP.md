# 온맘마켓 프로토타입 디벨롭 포인트

> **작성 목적**: Cursor + Claude CLI에서 바로 작업할 수 있도록 구체적인 수정 지침을 정리
> **현재 상태**: 뼈대는 잘 잡혀 있으나 "작동하는 척" 수준. 개발사/투자자에게 보여주기엔 부족
> **목표 상태**: "진짜 작동하는 것처럼 보이는" 인터랙티브 기획서

---

## 진단 요약

### 잘 된 부분
- 파일 구조가 CLAUDE.md 명세와 거의 일치
- Context API 설계가 깔끔하고 소비자↔사장님 상태 공유 구조가 잘 잡혀 있음
- 컴포넌트 분리가 명확 (consumer / store / shared)
- Tailwind 사용이 브랜드 컬러와 일관성 있음
- 예약 → 알림 → 픽업 기본 플로우가 연결되어 있음

### 🔴 Critical - 지금 당장 고쳐야 함
1. **날짜가 하드코딩** → 2024년 3월 11일 고정. 시연일에 "오늘 공구"가 의미 없음
2. **더미 예약 reservedAt도 과거 날짜** → store 대시보드의 "오늘 예약"이 항상 0건, "오늘 매출"이 항상 ₩0. `store/page.tsx:15-19`에서 `new Date().toDateString()`으로 오늘 비교하는데 더미 데이터가 전부 `"2024-03-11T..."`. 사장님 앱 열면 첫 화면부터 빈 대시보드.
3. **"알림 받기" 버튼이 예약 바텀시트를 열어버림** → `GongguCard.tsx:95-111`에서 upcoming 상태 상품도 `onReserve(gonggu)` 호출. 버튼에 "알림 받기"라고 써있는데 클릭하면 수량 선택 시트가 뜸. UX 버그.
4. **공구 상세 페이지 없음** → 카드에서 바로 바텀시트. 커머스 기본 UX 위반
5. **QR 코드가 가짜** → Math.random()으로 점 찍는 수준 + hydration mismatch 유발
6. **Context 격리 문제** → /consumer와 /store가 별도 AppProvider라서 연동 안 됨

### 🟡 Medium - 시연 전에 보강 필요
7. **대시보드 QR 스캔이 페이지 이동임** → `store/page.tsx:55-62`의 "📷 QR 스캔" 버튼이 `<Link href="/store/reservations">`. 모달이어야 하는데 페이지 이동. 개발사가 "QR 스캔은 페이지 전환인가?"라고 잘못 이해할 수 있음.
8. **Landing page가 너무 솔직함** → `app/page.tsx`에 "Mid-Fidelity", "기획 검증용" 배지. 개발사한테는 OK, 투자자한테는 자기 신뢰도를 먼저 깎는 꼴.
9. **상품 등록 폼이 persist 안 됨** → Context에 `addGonggu` 액션이 없어서 등록해도 실제 목록에 안 나옴.
10. **빈 상태(Empty State)가 허전함** → 날짜 필터 결과 없으면 이모지 하나 + 텍스트 한 줄. "다른 날짜 보기" 같은 CTA 없어서 막힌 느낌.
11. **데모 페이지가 약함** → 초기 상태에서 보여줄 게 거의 없음
12. **지도가 CSS 그라데이션** → 실제 지도로 오해할 수 없는 수준

---

## Phase 1: 즉시 수정 (데모 가능 수준으로 올리기)

### 1-1. 날짜 동적화

**현재 문제**: `lib/utils.ts`의 `getDatesForWeek()`가 `new Date(2024, 2, 11)`로 하드코딩. `data/gonggu.ts`의 arrivalDate도 전부 "3/11" ~ "3/17" 고정.

**수정 방법**:

#### `lib/utils.ts` - getDatesForWeek 수정
```typescript
export function getDatesForWeek(): { label: string; value: string; fullDate: string }[] {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    dates.push({
      label: i === 0 ? "오늘" : `${month}/${day}`,
      value: `${month}/${day}`,
      fullDate: date.toISOString().split('T')[0],
    });
  }

  return dates;
}

// 새로 추가: 오늘 기준 날짜 생성 헬퍼
export function getRelativeDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getRelativeDateRange(startDays: number, endDays: number): string {
  return `${getRelativeDate(startDays)}~${getRelativeDate(endDays)}`;
}
```

#### `data/gonggu.ts` - 날짜를 동적으로 변경
```typescript
import { Gonggu } from './types';
import { getRelativeDate, getRelativeDateRange } from '@/lib/utils';

// 오늘 = day 0, 내일 = day 1, ...
export const gongguList: Gonggu[] = [
  {
    id: 1,
    ...
    arrivalDate: getRelativeDate(0),      // 오늘
    pickupDate: getRelativeDateRange(0, 1), // 오늘~내일
    status: "arrived",
    ...
  },
  // 나머지 상품도 동일하게 day offset으로 변경
];
```

**주의**: `gonggu.ts`의 11개 상품 전부 날짜 변경 필요. 현재 매핑:
- 3/11(오늘) → `getRelativeDate(0)` (id: 1,2,3,4)
- 3/12 → `getRelativeDate(1)` (id: 5,6)
- 3/13 → `getRelativeDate(2)` (id: 7)
- 3/14 → `getRelativeDate(3)` (id: 8)
- 3/15 → `getRelativeDate(4)` (id: 9)
- 3/16 → `getRelativeDate(5)` (id: 10)
- 3/17 → `getRelativeDate(6)` (id: 11)

**또한 하드코딩된 "3/11" 참조 전부 수정**:
- `app/consumer/page.tsx` 37행: `g.arrivalDate === '3/11'` → `g.arrivalDate === getRelativeDate(0)`
- `app/consumer/map/page.tsx` 13행: 동일
- `app/store/page.tsx` 43행: 동일
- `app/demo/page.tsx` 64행: 동일

#### `data/reservations.ts` - reservedAt/arrivedAt도 동적으로
```typescript
// 현재: reservedAt: "2024-03-11T09:15:00" (과거 고정)
// 변경: 오늘 날짜 기준 생성

function getTodayISO(hoursAgo: number = 0): string {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

export const initialReservations: Reservation[] = [
  {
    id: "R-1001",
    ...
    reservedAt: getTodayISO(3),    // 3시간 전 예약
    arrivedAt: getTodayISO(1),     // 1시간 전 입고
    ...
  },
  {
    id: "R-1002",
    ...
    reservedAt: getTodayISO(2),    // 2시간 전 예약
    ...
  },
];
```
이렇게 해야 사장님 대시보드의 "오늘 예약", "오늘 매출"이 정상 표시됨.

---

### 1-2. "알림 받기" 버튼 UX 버그 수정

**현재 문제**: `GongguCard.tsx:94-111`에서 모든 상태의 상품이 동일한 `onReserve(gonggu)` 핸들러를 호출. upcoming 상태 상품은 "알림 받기"라고 표시되는데 클릭하면 수량 선택 바텀시트가 뜸.

**수정 방법**:

#### GongguCard.tsx - 버튼 onClick 분기
```typescript
interface GongguCardProps {
  gonggu: Gonggu;
  market?: Market;
  onReserve: (gonggu: Gonggu) => void;
  onNotify?: (gonggu: Gonggu) => void; // 새 prop 추가
}

// 버튼 onClick 수정
<button
  onClick={() => {
    if (gonggu.status === "upcoming") {
      onNotify?.(gonggu); // 알림 등록 핸들러
    } else {
      onReserve(gonggu);
    }
  }}
  ...
>
```

#### consumer/page.tsx - 알림 등록 핸들러 추가
```typescript
const [notifiedGongguIds, setNotifiedGongguIds] = useState<Set<number>>(new Set());

const handleNotify = (gonggu: Gonggu) => {
  setNotifiedGongguIds(prev => new Set([...prev, gonggu.id]));
  // 토스트 알림: "입고 시 알림을 보내드릴게요!"
};

// GongguCard에 전달
<GongguCard
  ...
  onNotify={handleNotify}
/>
```

#### GongguCard.tsx - 버튼 텍스트도 알림 등록 상태 반영
```typescript
// 부모에서 notified 여부 전달
interface GongguCardProps {
  ...
  isNotified?: boolean;
}

// 버튼 텍스트
{gonggu.status === "upcoming"
  ? isNotified ? "✓ 알림 설정됨" : "알림 받기"
  : gonggu.status === "arrived"
  ? "예약하기 (바로픽업)"
  : "예약하기"}
```

---

### 1-3. 공구 상세 페이지 추가

**현재 문제**: `/app/consumer/gonggu/[id]/page.tsx`가 없음. CLAUDE.md 명세에는 있으나 구현 안 됨.

**새 파일 생성**: `/app/consumer/gonggu/[id]/page.tsx`

**포함해야 할 내용**:
```
┌─────────────────────────────────────┐
│ ← 뒤로     온맘마켓 일산점    공유  │
├─────────────────────────────────────┤
│         [이모지 이미지 영역]         │
│         큰 배경 + 큰 이모지          │
│         120px 높이                   │
├─────────────────────────────────────┤
│ 예약중 · 과일                        │
│ 애플청포도 (신선)                    │
│ ₩6,900  ₩12,000  -42%              │
├─────────────────────────────────────┤
│ 상품 설명                            │
│ 칠레산 프리미엄 애플청포도...        │
├─────────────────────────────────────┤
│ 예약 현황                            │
│ [████████████░░░░] 82%              │
│ 33명 예약 / 잔여 7개                 │
├─────────────────────────────────────┤
│ 픽업 안내                            │
│ 📍 온맘마켓 일산점                   │
│ 📅 픽업기간: 오늘~내일               │
│ 💳 현장결제                          │
├─────────────────────────────────────┤
│ 태그: #칠레산 #프리미엄              │
├─────────────────────────────────────┤
│ [        예약하기        ] (sticky)  │
└─────────────────────────────────────┘
```

**구현 포인트**:
- `useParams()`로 id 추출, `getGongguById(Number(id))`로 데이터 조회
- 하단에 sticky 예약 버튼 → 클릭 시 ReservationSheet 열기
- GongguCard에서 카드 클릭 시 `/consumer/gonggu/${id}`로 라우팅 추가 (현재는 없음)
- "예약하기" 버튼만 바텀시트 직접 열기, 카드 전체 클릭은 상세 페이지로

**GongguCard.tsx 수정 필요**:
```typescript
// 현재: 카드 전체에 onReserve 없음, 버튼만 onReserve
// 변경: 카드 클릭 → 상세 페이지, 버튼 클릭 → 바텀시트 (stopPropagation)

import Link from 'next/link';

// 카드를 Link로 감싸기
<Link href={`/consumer/gonggu/${gonggu.id}`}>
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    ...
    <button
      onClick={(e) => {
        e.preventDefault(); // Link 이동 방지
        e.stopPropagation();
        onReserve(gonggu);
      }}
    >
      예약하기
    </button>
  </div>
</Link>
```

---

### 1-3. QR 코드 실제 렌더링

**현재 문제**: `QRTicket.tsx` 53~58행에서 Math.random()으로 흑백 격자를 만드는데, 렌더링할 때마다 패턴이 바뀌고 실제 QR로 보이지 않음.

**해결 방법**: `qrcode` npm 패키지 설치 후 SVG 기반 QR 생성

```bash
npm install qrcode @types/qrcode
```

**새 컴포넌트 생성**: `/components/shared/QRCode.tsx`
```typescript
"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCodeSVG({ value, size = 80 }: QRCodeProps) {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    QRCode.toString(value, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: '#111827', light: '#FFFFFF' },
    }).then(setSvgString);
  }, [value, size]);

  return (
    <div
      className="rounded-lg overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
```

**QRTicket.tsx 수정**: 52~63행의 가짜 QR 블록을 교체
```typescript
import { QRCodeSVG } from '@/components/shared/QRCode';

// 기존 가짜 QR 영역 대신:
<QRCodeSVG value={`onmom://pickup/${reservation.id}`} size={80} />
```

**QRScanner.tsx에도 동일 적용**: 스캔 시뮬레이션에서 실제 QR 이미지 표시

---

### 1-4. Context 격리 문제 해결 (소비자↔사장님 연동)

**현재 문제**:
- `/app/consumer/layout.tsx`에서 `<AppProvider>`로 감쌈
- `/app/store/layout.tsx`에서는 AppProvider가 **없음** (store는 별도 상태)
- `/app/demo/page.tsx`에서만 자체 AppProvider로 연동 작동
- 결과: 소비자 앱에서 예약해도 사장님 웹에서 안 보임

**해결 방법**: 루트 레이아웃에서 AppProvider 한번만 감싸기

#### `app/layout.tsx` 수정
```typescript
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

#### `app/consumer/layout.tsx` 수정
- `<AppProvider>` 제거 (이미 루트에서 감싸므로)

#### `app/demo/page.tsx` 수정
- `<AppProvider>` 제거하고 `DemoContent`를 직접 export
- 이제 `/demo`에서도 `/consumer`, `/store`와 같은 상태를 공유

**주의**: demo 페이지가 독립 AppProvider를 가진 이유가 있었을 수 있음 (초기화 용도). 루트 통합 시 데모 초기 상태 관리 방법을 별도로 고려해야 함. 예: 데모 페이지에 "초기화" 버튼 추가.

---

### 1-5. 데모 페이지 대폭 강화

**현재 문제**:
- 소비자 앱에 공구 2개만 표시
- 사장님 앱에 알림/픽업대기만 표시
- 시나리오 가이드가 텍스트로만 존재
- 처음 접속하면 거의 빈 화면

**수정 방향**:

#### A. 시나리오 단계별 하이라이트
```typescript
const [currentStep, setCurrentStep] = useState(0);

// 단계:
// 0: 초기 - "소비자 앱에서 상품을 예약해보세요" 안내
// 1: 예약 완료 후 - "사장님 앱에 알림이 도착했습니다" 하이라이트
// 2: QR 스캔 안내 - "QR 스캔으로 픽업을 처리하세요"
// 3: 완료 - "소비자 앱에서 상태가 변경되었습니다"

// lastSyncEvent 감지해서 자동으로 단계 전환
useEffect(() => {
  if (lastSyncEvent?.type === 'new_reservation') setCurrentStep(1);
  if (lastSyncEvent?.type === 'pickup_complete') setCurrentStep(3);
}, [lastSyncEvent]);
```

#### B. 소비자 앱 영역에 내 예약 탭 추가
현재 공구 목록만 보여주는데, 예약 후 "내 예약" 섹션에 QRTicket이 나타나야 사장님 앱과의 연동이 시각적으로 보임.

#### C. 가이드 패널을 상단으로 이동
현재 하단에 있어서 스크롤해야 보임. 상단에 단계별 진행 바 형태로 변경:
```
[1. 상품 예약 ✅] → [2. 알림 확인] → [3. QR 픽업] → [4. 완료]
```

#### D. 초기 데이터 보강
arrived 상태 예약이 초기에 존재하도록 `data/reservations.ts`에 데이터 추가. 그래야 데모 시작 시 사장님 앱에 "픽업 대기 1건"이 이미 보이고, QR 스캔 시연이 바로 가능함.

---

### 1-6. 지도 페이지 개선

**현재 문제**: CSS 그라데이션 배경에 핀 2개. 누가 봐도 "이건 지도가 아니다".

**해결 방법 (패키지 설치 가능한 경우)**: Kakao Maps 또는 Naver Maps API 연동
```bash
npm install react-kakao-maps-sdk
```

```typescript
// .env.local에 NEXT_PUBLIC_KAKAO_MAP_KEY 추가 필요
import { Map, MapMarker } from 'react-kakao-maps-sdk';

<Map
  center={{ lat: 37.6584, lng: 126.8320 }} // 일산
  style={{ width: "100%", height: "400px" }}
  level={5}
>
  {markets.map(market => (
    <MapMarker
      key={market.id}
      position={{ lat: market.coordinates.lat, lng: market.coordinates.lng }}
      onClick={() => setSelectedMarket(market)}
    />
  ))}
</Map>
```

**해결 방법 (패키지 없이)**: 스태틱 맵 이미지 사용
- Kakao Static Map API나 Google Static Maps API로 이미지 URL 생성
- 또는 일산/인천 지역 지도 스크린샷을 `/public/map-bg.png`에 저장 후 배경으로 사용
- 최소한 실제 지역의 형태가 보여야 함

---

### 1-7. 대시보드 QR 스캔 → 모달로 변경

**현재 문제**: `store/page.tsx:55-62`의 "📷 QR 스캔" 빠른 액션 버튼이 `<Link href="/store/reservations">`로 구현. 페이지 이동하는데 개발사가 "QR 스캔이 페이지 전환 방식인 건가?"라고 잘못 이해할 수 있음.

**수정 방법**:

#### `store/page.tsx` - QR 스캔을 모달로 변경
```typescript
import { QRScanner } from '@/components/store/QRScanner';

const [showScanner, setShowScanner] = useState(false);

// 기존 Link를 button으로 교체
<button
  onClick={() => setShowScanner(true)}
  className="px-4 py-2 bg-[#E8F5E9] text-[#609966] rounded-xl font-medium hover:bg-[#C8E6C9] transition-colors flex items-center gap-2"
>
  📷 QR 스캔
</button>

// 페이지 하단에 모달 추가
{showScanner && (
  <QRScanner
    reservation={null} // arrived 상태 예약 중 첫 번째 자동 선택 로직 추가 가능
    onClose={() => setShowScanner(false)}
    onConfirmPickup={(id) => {
      completePickup(id);
      setShowScanner(false);
    }}
  />
)}
```

---

### 1-8. Landing Page 문구 조정

**현재 문제**: `app/page.tsx`에 "Mid-Fidelity", "기획 검증용" 배지가 박혀 있음. 투자자한테 보여주면 스스로 신뢰를 깎는 꼴.

**수정 방법**: 대상에 따라 표현 조정
```typescript
// 현재 (너무 솔직)
"이 프로토타입은 기획서를 대체하는 인터랙티브 프로토타입입니다"

// 변경안 (투자자/개발사 공용)
"온맘마켓의 핵심 사용자 경험을 직접 체험해보세요"

// "Mid-Fidelity", "기획 검증용" 배지 제거
// 대신 "소비자 앱", "사장님 웹", "연동 데모" 카드에 각각 한 줄 설명 추가
```

---

### 1-9. Empty State에 CTA 추가

**현재 문제**: `consumer/page.tsx:96-99`에서 필터 결과 없으면 이모지 + 텍스트만. 유저가 막힘.

**수정 방법**:
```typescript
// 기존
<div className="text-center py-12">
  <div className="text-4xl mb-4">📭</div>
  <p className="text-[#6B7280]">해당 조건의 공구가 없습니다.</p>
</div>

// 변경
<div className="text-center py-12">
  <div className="text-4xl mb-4">📭</div>
  <p className="text-[#6B7280] mb-4">해당 조건의 공구가 없습니다.</p>
  <button
    onClick={() => { setSelectedDate('all'); setSelectedCategory('all'); }}
    className="px-4 py-2 bg-[#E8F5E9] text-[#609966] rounded-xl text-sm font-medium"
  >
    전체 공구 보기
  </button>
</div>
```

---

## Phase 2: 신뢰도 올리기

### 2-1. 예약 완료 후 현장결제 안내 화면

**현재**: ReservationSheet의 complete 단계가 "예약번호 + 간단 안내"로 끝남

**추가 필요**:
```
┌─────────────────────────────────────┐
│ ✅ 예약이 완료되었습니다!            │
│                                      │
│ 📋 예약 요약                         │
│ ├ 상품: 애플청포도 2개               │
│ ├ 금액: ₩13,800 (현장결제)          │
│ └ 픽업: 온맘마켓 일산점              │
│                                      │
│ ⚠️ 결제 안내                         │
│ • 현장에서 카드/현금 결제            │
│ • 입고 완료 시 앱 알림 발송          │
│ • 픽업 기간 내 미방문 시 자동 취소   │
│                                      │
│ [내 예약에서 확인하기]               │
│ [확인]                               │
└─────────────────────────────────────┘
```

`ReservationSheet.tsx`의 `step === 'complete'` 섹션에 결제 안내 블록과 "내 예약에서 확인하기" 버튼(Link to /consumer/reservations) 추가.

---

### 2-2. 사장님 대시보드에 시간대별 차트

**현재**: StatCard 4개 + 최근예약 + 오늘공구. 시각적으로 밋밋함.

**추가**: recharts 라이브러리로 시간대별 예약 현황 바 차트

```bash
npm install recharts
```

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// 더미 데이터 (시간대별)
const hourlyData = [
  { hour: '9시', reservations: 3 },
  { hour: '10시', reservations: 7 },
  { hour: '11시', reservations: 12 },
  { hour: '12시', reservations: 8 },
  { hour: '13시', reservations: 5 },
  { hour: '14시', reservations: 9 },
  { hour: '15시', reservations: 6 },
];

<ResponsiveContainer width="100%" height={200}>
  <BarChart data={hourlyData}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="hour" fontSize={12} />
    <YAxis fontSize={12} />
    <Bar dataKey="reservations" fill="#609966" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

대시보드 레이아웃: 현재 3-column grid에서 차트를 col-span-2로 넣거나, 통계 카드 아래 full-width로 배치.

---

### 2-3. 사장님 알림 센터 페이지

**현재**: 알림이 대시보드 사이드바와 데모에서만 보임. 별도 페이지 없음.

**새 파일**: `/app/store/alerts/page.tsx`

**내용**:
- 전체 알림 타임라인 (날짜별 그룹핑)
- 읽음/안읽음 필터
- 클릭 시 해당 예약으로 이동
- Sidebar.tsx에 알림 메뉴 추가 + 미읽음 뱃지 표시

---

### 2-4. 소비자 알림 시스템

**현재**: 소비자 앱에 알림 기능이 없음. 헤더에 🔔 버튼은 있지만 동작 안 함.

**추가 필요**:
- `data/types.ts`에 ConsumerAlert 타입 추가
- AppContext에 consumerAlerts 상태 추가
- 입고 완료 시 소비자 알림 생성: "예약하신 애플청포도가 입고되었습니다! 픽업해주세요"
- 🔔 클릭 시 알림 목록 드롭다운/바텀시트

---

### 2-5. 사장님 공구 등록 → 실제 데이터 반영

**현재**: `/store/products/new/page.tsx`의 handleSubmit이 `alert('상품이 등록되었습니다! (프로토타입)')` 후 리다이렉트만 함. 실제로 gongguList에 추가 안 됨.

**수정**:
```typescript
// AppContext에 addGonggu 액션 추가
const addGonggu = useCallback((gongguData: Omit<Gonggu, 'id' | 'reserved'>) => {
  const newGonggu: Gonggu = {
    ...gongguData,
    id: gongguList.length + 1,
    reserved: 0,
  };
  setGongguList(prev => [...prev, newGonggu]);
  return newGonggu;
}, [gongguList]);

// NewProductPage에서 useApp()으로 addGonggu 호출
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  addGonggu({
    marketId: 1,
    title: formData.title,
    // ... form data를 Gonggu 타입으로 매핑
  });
  router.push('/store/products');
};
```

---

### 2-6. 예약 취소 기능 (소비자)

**현재**: AppContext에 `cancelReservation` 함수는 있지만, UI에서 호출하는 곳이 없음.

**추가 위치**: QRTicket.tsx에서 pending/arrived 상태일 때 "예약 취소" 버튼 추가
```typescript
{(reservation.status === 'pending' || reservation.status === 'arrived') && (
  <button
    onClick={() => onCancel?.(reservation.id)}
    className="w-full mt-2 py-2 text-red-500 text-sm font-medium"
  >
    예약 취소
  </button>
)}
```

취소 전 확인 모달 필요 (window.confirm이라도).

---

## Phase 3: 감동 주기

### 3-1. 온보딩/투어 오버레이

첫 방문 시 핵심 UI 요소를 하이라이트하며 설명하는 투어 오버레이.

```bash
npm install react-joyride
```

소비자 앱:
1. "이곳에서 오늘의 공구 상품을 확인할 수 있어요"
2. "날짜와 카테고리로 필터링해보세요"
3. "예약하기 버튼으로 간편 예약!"

사장님 앱:
1. "대시보드에서 오늘 현황을 확인하세요"
2. "QR 스캔으로 빠른 픽업 처리"

---

### 3-2. 자동 시연 모드 (데모 페이지)

**목적**: 투자자 미팅에서 직접 조작하지 않아도 플로우가 자동으로 재생되는 모드.

```typescript
const [autoPlay, setAutoPlay] = useState(false);

const runAutoDemo = async () => {
  setAutoPlay(true);

  // Step 1: 소비자가 상품 예약 (2초 후)
  await delay(2000);
  addReservation(gongguList[0], 2);

  // Step 2: 사장님이 알림 확인 (3초 후)
  await delay(3000);
  // 알림 하이라이트 애니메이션

  // Step 3: QR 스캔 → 픽업 완료 (3초 후)
  await delay(3000);
  completePickup(reservations[reservations.length - 1].id);

  setAutoPlay(false);
};
```

---

### 3-3. 매출 분석 페이지 (사장님)

**현재**: Sidebar에 "📊 매출 분석" 메뉴가 있지만 페이지 없음.

**새 파일**: `/app/store/analytics/page.tsx`

**내용 (전부 더미 데이터)**:
- 주간/월간 매출 추이 (Line Chart)
- 카테고리별 매출 비중 (Pie Chart)
- 인기 상품 Top 5
- 고객 통계 (신규/재방문, 노쇼율)
- KPI: 평균 객단가, 예약 전환율, 픽업 완료율

---

## 코드 품질 개선 사항

### 버그 수정

1. **AppContext `addAlert` 순환 참조 경고**
   - `addReservation` 내부에서 `addAlert`를 호출하는데, `addAlert`가 dependency에 없음
   - useCallback deps에 `addAlert` 추가하면 순환 발생 가능
   - 해결: addAlert를 ref로 관리하거나, useReducer로 전환

2. **cancelReservation의 stale closure**
   - 107~128행에서 `reservations`를 직접 참조하는데, setState의 이전 값(`prev`)을 쓰고 있지 않음
   - `const reservation = reservations.find(...)` → 이 시점의 reservations가 오래된 값일 수 있음
   - 해결: setReservations 내부에서 prev를 활용하거나, reservation 정보를 별도로 관리

3. **QRTicket의 Math.random()이 hydration mismatch 유발**
   - SSR과 CSR에서 랜덤값이 달라 hydration 에러 발생
   - QR 라이브러리로 교체하면 해결됨

### 타입 안전성

1. **`data/types.ts`의 `oderId` 오타** → `orderId`로 수정 (CLAUDE.md 명세에 `oderId`로 되어있지만 실제 코드에서는 `orderId`로 구현됨 - 명세 오타)

2. **`SyncEvent.data`가 `unknown` 타입** → discriminated union으로 강화
```typescript
export type SyncEvent =
  | { type: "new_reservation"; data: Reservation; timestamp: number }
  | { type: "pickup_complete"; data: { reservationId: string }; timestamp: number }
  | { type: "status_change"; data: { reservationId?: string; gongguId?: number; status: string }; timestamp: number };
```

### 성능

1. **AppContext 리렌더링 최적화**: 현재 모든 상태가 하나의 Context에 있어서 하나만 바뀌어도 전체 리렌더링. 실제 개발에서는 분리 필요하지만, 프로토타입에서는 우선순위 낮음.

---

## Vercel 배포 체크리스트

1. `package.json`에서 Next.js 버전 확인 (16.2.0 → Vercel 호환 확인)
2. `.env.local` 파일 생성 (지도 API 키 등)
3. `vercel.json` 설정 (필요 시)
4. `npm run build` 로컬에서 성공 확인
5. GitHub 연동 → Vercel 자동 배포 설정
6. 배포 URL 확인 후 모바일/데스크톱 테스트

---

## 작업 순서 권장

> Phase 1 전체를 순서대로 하면 약 5~6시간. 🔴 Critical 먼저, 🟡 Medium 순.

```
── 🔴 Critical (첫 시연 전 필수) ──────────────────────────────

1-1 날짜 동적화 + reservedAt fix  (30분) ← 이거 안 하면 대시보드 전부 0
1-2 "알림 받기" UX 버그 수정       (15분) ← 5줄 수정으로 끝
1-5 Context 격리 해결              (20분) ← 이게 안 되면 연동 데모 의미 없음
1-4 QR 코드 실제 렌더링            (20분) ← npm install 한번이면 끝
1-3 공구 상세 페이지               (1시간) ← 새 페이지 + GongguCard 수정

── 🟡 Medium (시연 전 보강) ───────────────────────────────────

1-6 데모 페이지 강화               (1시간) ← 연동 시연의 핵심
1-7 대시보드 QR 스캔 → 모달        (20분) ← store/page.tsx만 수정
1-8 Landing 문구 조정              (10분) ← 텍스트 교체
1-9 Empty State CTA                (10분) ← consumer/page.tsx만 수정
1-10 지도 개선                     (30분~1시간) ← API 키 필요

── Phase 2 (신뢰도 올리기) ────────────────────────────────────

2-5 공구 등록 persist              (30분) ← addGonggu 액션 추가
2-1 현장결제 안내                  (20분) ← 텍스트 추가 수준
2-2 차트 추가                      (30분) ← recharts 설치 후
2-6 예약 취소 UI                   (20분)
```

---

## Claude CLI 프롬프트 예시

각 태스크를 Claude CLI에서 실행할 때 아래처럼 구체적으로 지시하면 효율적입니다.
**팁**: DEVELOP.md를 먼저 읽게 한 뒤 해당 섹션 번호를 지정하면 정확도가 올라갑니다.

### 1-1 날짜 동적화 + reservedAt fix
```
DEVELOP.md의 1-1 섹션을 읽고 그대로 실행해줘.
1) lib/utils.ts의 getDatesForWeek()를 현재 날짜 기준으로 수정
2) getRelativeDate, getRelativeDateRange 헬퍼 추가
3) data/gonggu.ts의 모든 arrivalDate/pickupDate를 헬퍼로 교체
4) data/reservations.ts의 reservedAt/arrivedAt을 오늘 기준 동적 생성으로 변경
5) 프로젝트 전체에서 '3/11' 하드코딩 참조를 getRelativeDate(0)으로 교체
수정 후 TypeScript 에러 없는지 확인해줘.
```

### 1-2 "알림 받기" UX 버그 수정
```
DEVELOP.md 1-2 섹션을 읽고 실행해줘.
GongguCard.tsx에 onNotify prop 추가하고, upcoming 상태일 때는 onReserve 대신 onNotify 호출.
consumer/page.tsx에서 notifiedGongguIds 상태 관리하고 GongguCard에 isNotified 전달.
알림 등록 시 토스트 형태로 "입고 시 알림을 보내드릴게요!" 메시지 표시.
```

### 1-5 Context 격리 해결
```
DEVELOP.md 1-5 섹션을 읽고 실행해줘.
app/layout.tsx에서 한번만 AppProvider로 감싸고, consumer/layout.tsx와 demo/page.tsx에서는 AppProvider를 제거해줘.
store 쪽에서도 useApp()이 작동하는지 확인해줘.
데모 페이지에 "상태 초기화" 버튼을 추가해서 데모 리셋이 가능하게 해줘.
```

### 1-3 공구 상세 페이지
```
DEVELOP.md 1-3 섹션의 와이어프레임을 참고해서 /app/consumer/gonggu/[id]/page.tsx를 만들어줘.
상품 이미지 영역(큰 이모지), 상세 정보, 예약 현황 프로그레스바, 픽업 안내(장소/기간/결제방법), 태그, sticky 예약 버튼 포함.
GongguCard.tsx는 카드 전체를 Link로 감싸서 상세 페이지로 이동하게 하고, "예약하기" 버튼은 e.preventDefault()로 바텀시트만 열게 수정해줘.
```

### 1-4 QR 코드 실제 렌더링
```
npm install qrcode @types/qrcode 실행 후,
DEVELOP.md 1-4 섹션대로 /components/shared/QRCode.tsx 컴포넌트를 만들어줘.
QRTicket.tsx의 52~63행 가짜 QR 영역을 QRCodeSVG 컴포넌트로 교체.
QRScanner.tsx의 스캔 확인 화면에서도 실제 QR 이미지가 보이게 적용해줘.
```

### 1-6 데모 페이지 강화
```
DEVELOP.md 1-6 섹션을 읽고 실행해줘.
1) 상단에 단계별 진행 바 추가 (4단계: 상품 예약 → 알림 확인 → QR 픽업 → 완료)
2) lastSyncEvent 감지해서 자동 단계 전환
3) 소비자 앱 영역에 "내 예약" 섹션 추가 (예약 후 QRTicket 표시)
4) 초기 데이터에 arrived 상태 예약 포함해서 QR 스캔 시연이 바로 가능하게
```

### 1-7 대시보드 QR 스캔 → 모달
```
DEVELOP.md 1-7 섹션대로 store/page.tsx의 "📷 QR 스캔" Link를 button+QRScanner 모달로 변경해줘.
completePickup도 useApp에서 가져와서 연결해줘.
```
