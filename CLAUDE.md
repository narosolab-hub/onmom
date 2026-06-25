# CLAUDE.md - 온맘마켓 프로토타입 가이드

## 1. 프로젝트 개요

### 프로토타입의 목적
이 프로토타입은 **기획서를 대체하는 인터랙티브 프로토타입**이다.
1인 PM/기획자가 개발사와 이해관계자에게 프로젝트를 효율적으로 설명하기 위한 용도로 사용된다.

- **목표**: "이렇게 작동합니다"를 직접 보여주는 것
- **대상**: 개발사, 투자자, 이해관계자
- **수준**: Mid-Fidelity (작동하는 프로토타입, 실제 개발 코드 X)

### 서비스 개요
**온맘마켓**은 O2O 신선식품 공동구매 플랫폼이다.

**기존 문제 (AS-IS)**:
- 사장님: 카카오톡 단톡방에서 공구 공지 → 댓글로 예약 접수 → 엑셀/수기로 관리
- 소비자: 단톡방 스크롤해서 공지 확인 → 댓글로 "상품명 2개요" 예약 → 입고 알림 놓치기 쉬움

**해결 (TO-BE)**:
- 사장님: 앱에서 공구 등록 → 예약 자동 집계 → QR 스캔으로 픽업 처리
- 소비자: 앱에서 공구 탐색 → 원터치 예약 → 입고 알림 → QR로 픽업

### 핵심 플로우
```
[소비자]                              [사장님]
공구 피드 탐색                         공구 상품 등록
    ↓                                     ↓
상품 선택 → 수량 입력 → 예약    ←→    예약 알림 수신
    ↓                                     ↓
입고 완료 알림 수신              ←←    입고 완료 처리
    ↓                                     ↓
매장 방문 → QR 제시             →→    QR 스캔 → 픽업 완료
    ↓                                     ↓
현장 결제 → 상품 수령                  매출 집계
```

---

## 2. 기술 스택 및 설계 원칙

### 기술 스택
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API (전역 상태 공유)
- **Deployment**: Vercel
- **Data**: 더미 데이터 (JSON)

### 디자인 원칙

#### 브랜드 컬러
```
Primary (온맘그린): #609966
Primary Dark: #4A7A50
Primary Light: #E8F5E9
Accent (강조/할인): #FF5C38
Background: #F8FAF6 (따뜻한 틴트)
Card: #FFFFFF
Text Dark: #111827
Text Gray: #6B7280
```

#### UI 원칙
1. **담백하고 트렌디한 커머스** 느낌 (핀테크 느낌 X)
2. 여백과 면 분할로 구조를 잡음
3. 모서리는 둥글게 (`rounded-2xl`, `rounded-full`)
4. 테두리선 최소화, 부드러운 그림자(`shadow-sm`) 활용
5. Typography Hierarchy로 정보 위계 표현

#### Mid-fi 원칙
- 과한 애니메이션/장식 배제
- 텍스트 크기, 여백, 컴포넌트 위계에 집중
- 디자이너가 보고 정보 중요도를 파악할 수 있게

---

## 3. 프로젝트 구조

```
/app
  /consumer                 # 소비자 앱 (모바일 웹)
    /layout.tsx            # 모바일 컨테이너 + 하단 네비게이션
    /page.tsx              # 공구 피드 (메인)
    /map/page.tsx          # 지도 탭
    /reservations/page.tsx # 내 예약 탭
    /mypage/page.tsx       # MY 탭
    /gonggu/[id]/page.tsx  # 공구 상세 → 예약

  /store                    # 사장님 웹
    /layout.tsx            # PC 레이아웃 + 사이드바
    /page.tsx              # 대시보드
    /reservations/page.tsx # 예약 관리
    /products/page.tsx     # 상품(공구) 관리
    /products/new/page.tsx # 공구 등록

  /demo                     # 연동 데모 (옵션)
    /page.tsx              # 소비자↔사장님 듀얼뷰

/components
  /consumer                # 소비자용 컴포넌트
    /GongguCard.tsx       # 공구 상품 카드
    /BottomNav.tsx        # 하단 네비게이션
    /ReservationSheet.tsx # 예약 바텀시트
    /QRTicket.tsx         # QR 픽업권

  /store                   # 사장님용 컴포넌트
    /Sidebar.tsx          # 좌측 사이드바
    /StatCard.tsx         # 통계 카드
    /ReservationTable.tsx # 예약 목록 테이블
    /QRScanner.tsx        # QR 스캔 모달

  /shared                  # 공용 컴포넌트
    /StatusBadge.tsx      # 상태 뱃지
    /ProgressBar.tsx      # 달성률 바

/contexts
  /AppContext.tsx          # 전역 상태 (공구, 예약, 알림)

/data
  /markets.json            # 마켓 더미 데이터
  /gonggu.json             # 공구 상품 더미 데이터
  /reservations.json       # 초기 예약 데이터

/lib
  /utils.ts                # 유틸 함수
```

---

## 4. 데이터 구조

### 마켓 (Market)
```typescript
interface Market {
  id: number;
  name: string;           // "온맘마켓 일산점"
  emoji: string;          // "🥬"
  area: string;           // "일산동구"
  address: string;        // 상세 주소
  followers: number;      // 구독자 수
  coordinates: {
    lat: number;
    lng: number;
  };
}
```

### 공구 상품 (Gonggu)
```typescript
interface Gonggu {
  id: number;
  marketId: number;
  title: string;          // "애플청포도 (신선)"
  emoji: string;          // "🍇"
  description: string;    // 간단 설명
  category: string;       // "과일" | "식품" | "건강식품" | "생활용품" | "베이커리" | "정육"
  originalPrice: number;  // 정가
  price: number;          // 할인가
  arrivalDate: string;    // "3/11" (입고 예정일)
  pickupDate: string;     // "3/11~3/12" (픽업 기간)
  status: GongguStatus;
  reserved: number;       // 현재 예약 수량
  total: number;          // 총 수량
  tags: string[];         // ["국내산", "유기농"]
  imageColor: string;     // 이미지 배경색 (이모지 대체)
}

type GongguStatus =
  | "upcoming"   // 입고 예정 (예약 가능, 알림 받기)
  | "open"       // 예약 중
  | "closing"    // 마감 임박
  | "arrived"    // 입고 완료 (픽업 가능)
  | "done";      // 마감
```

### 예약 (Reservation)
```typescript
interface Reservation {
  id: string;             // "R-1001"
  oderId: string;         // "OMM-2024031101"
  gongguId: number;
  marketId: number;
  userId: string;
  userName: string;       // "김지연"
  userPhone: string;      // "010-1234-5678" (마스킹)

  // 상품 정보 (스냅샷)
  productTitle: string;
  productEmoji: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // 상태
  status: ReservationStatus;
  reservedAt: string;     // "2024-03-11T09:15:00"
  arrivedAt?: string;     // 입고 완료 시점
  pickedUpAt?: string;    // 픽업 완료 시점
  cancelledAt?: string;   // 취소 시점

  // 픽업 정보
  pickupDate: string;
  marketName: string;
  marketAddress: string;
}

type ReservationStatus =
  | "pending"     // 예약 완료 (입고 대기)
  | "arrived"     // 입고 완료 (픽업 대기)
  | "completed"   // 픽업 완료
  | "cancelled"   // 취소
  | "noshow";     // 노쇼
```

### 알림 (Alert) - 사장님용
```typescript
interface Alert {
  id: number;
  type: "reservation" | "pickup" | "noshow" | "closing" | "system";
  icon: string;
  message: string;
  time: string;
  read: boolean;
  reservationId?: string;
}
```

---

## 5. 화면별 기능 명세

### 5.1 소비자 앱 (`/consumer`)

#### 5.1.1 공구 피드 (메인)
**목적**: 오늘/이번주 공구 상품을 날짜별, 카테고리별로 탐색

**구성요소**:
- 헤더: "공구" 타이틀 + 오늘 공구 개수
- 날짜 필터 탭: 전체 / 3월 11일 / 12일 / 13일 ... (7일치)
- 카테고리 필터: 전체 / 과일 / 식품 / 건강식품 / 생활용품 / 베이커리 / 정육
- 입고완료 배너: 오늘 입고 완료된 상품 하이라이트
- 공구 카드 리스트

**공구 카드 구성**:
```
┌─────────────────────────────────────┐
│ 🥬 온맘마켓 일산점        [예약중] │
├─────────────────────────────────────┤
│ [🍇]  애플청포도 (신선)            │
│  72px  과일 · 픽업 3/11~3/12        │
│        ₩6,900  ₩12,000  -42%       │
├─────────────────────────────────────┤
│ 👥 33명 예약          잔여 7개     │
│ [████████████░░░░] 82%             │
│                                     │
│ [        예약하기        ]          │
└─────────────────────────────────────┘
```

**인터랙션**:
- 날짜 탭 클릭 → 해당 날짜 공구만 필터링
- 카테고리 클릭 → 해당 카테고리만 필터링
- 카드 클릭 → 공구 상세 페이지 이동
- 예약하기 클릭 → 예약 바텀시트 오픈

#### 5.1.2 지도 탭
**목적**: 주변 마켓 위치 확인 및 탐색

**구성요소**:
- 지도 영역 (실제 지도 API 연동 X, 시각적 표현만)
- 마켓 핀 마커
- 내 위치 표시
- 하단 마켓 카드 (선택 시)

**인터랙션**:
- 핀 클릭 → 해당 마켓 카드 표시
- 마켓 카드 → "오늘 공구 N개" 버튼

#### 5.1.3 내 예약 탭
**목적**: 내 예약 내역 확인 및 QR 픽업권 조회

**구성요소**:
- 진행 중 예약 (pending, arrived)
- 완료된 예약 (completed, cancelled)

**예약 카드 구성**:
```
┌─────────────────────────────────────┐
│ R-1001                [입고완료]   │
├─────────────────────────────────────┤
│ [🍇]  애플청포도 (신선)            │
│       온맘마켓 일산점 · 수량 2개    │
│       ₩13,800                       │
├─────────────────────────────────────┤
│  ┌─────────────┐                    │
│  │   QR CODE   │  R-1001           │
│  │             │  픽업 시 제시      │
│  └─────────────┘                    │
└─────────────────────────────────────┘
```

**상태별 표시**:
- `pending`: "⏳ 입고 대기 중" + 예상 입고일
- `arrived`: QR 코드 표시 + "픽업 가능"
- `completed`: 영수증 스타일 (픽업 완료 시각)
- `cancelled`: 취소 안내

#### 5.1.4 MY 탭
**목적**: 내 정보 및 설정

**구성요소**:
- 프로필 헤더 (이름, 등급, 통계)
- 통계: 총 구매 / 총 절약 / 노쇼 횟수
- 메뉴: 구독 마켓 / 알림 설정 / 내 동네 설정 / 문의하기

#### 5.1.5 예약 플로우 (바텀시트)
**트리거**: 공구 카드에서 "예약하기" 클릭

**구성요소**:
- 상품 요약 (이미지, 이름, 가격)
- 수량 선택 (-/+)
- 예약 안내 (입고 알림, 현장 결제, 픽업 기간)
- 예상 결제금액
- [예약 확정하기] 버튼

**완료 시**:
- 전역 상태에 예약 추가
- 완료 시트 표시 (예약번호 + 안내)
- 사장님 앱에 실시간 반영

---

### 5.2 사장님 웹 (`/store`)

#### 5.2.1 레이아웃
**구성**:
- 좌측 사이드바 (LNB) 고정, width: 240px
- 우측 메인 컨텐츠 영역

**사이드바 메뉴**:
- 🏠 대시보드
- 📋 예약 관리
- 📦 상품 관리
- 📊 매출 분석
- ⚙️ 설정

#### 5.2.2 대시보드
**목적**: 오늘의 현황 한눈에 파악

**구성요소**:
- 상단 통계 카드 (4열)
  - 오늘 예약: N건
  - 픽업 대기: N건
  - 오늘 매출: ₩N
  - 노쇼: N건

- 최근 예약 타임라인
- 시간대별 예약 현황 차트
- 빠른 액션: QR 스캔 / 공지 발송 / 상품 등록

#### 5.2.3 예약 관리
**목적**: 예약 목록 조회 및 픽업 처리

**구성요소**:
- 상단 KPI (대기/완료/노쇼)
- 필터: 전체 / 픽업대기 / 완료 / 노쇼
- 검색: 예약번호, 고객명
- 예약 테이블

**테이블 컬럼**:
| 예약번호 | 고객명 | 상품 | 수량 | 금액 | 예약시간 | 상태 | 액션 |

**액션 버튼**:
- 픽업대기 → [QR 스캔] [픽업 완료]
- 완료 → (없음)
- 노쇼 → [예약 복구]

#### 5.2.4 상품(공구) 관리
**목적**: 공구 상품 등록/수정/관리

**목록 화면**:
- 상품 카드 그리드
- 상태 필터: 전체 / 예약중 / 입고완료 / 마감
- [+ 새 공구 등록] 버튼

**등록 화면** (`/store/products/new`):
- 기본 정보: 상품명, 카테고리, 설명
- 가격: 정가, 판매가
- 수량: 총 수량
- 일정: 입고 예정일, 픽업 기간
- 이미지: 이모지 선택 (프로토타입)
- [등록하기] 버튼

#### 5.2.5 QR 스캔 (모달)
**트리거**: 예약 관리에서 [QR 스캔] 클릭, 또는 대시보드 빠른 액션

**플로우**:
1. 카메라 영역 표시 (프로토타입: 탭하면 스캔 시뮬레이션)
2. 스캔 성공 → 예약 정보 확인 화면
3. [픽업 완료 처리] 버튼
4. 완료 → 예약 상태 변경 + 소비자 앱 반영

---

### 5.3 연동 데모 (`/demo`)

**목적**: 소비자↔사장님 실시간 연동 시연

**구성**:
- 좌측: 소비자 앱 (iframe 또는 컴포넌트)
- 중앙: 동기화 상태 표시
- 우측: 사장님 앱 (iframe 또는 컴포넌트)

**시연 시나리오**:
1. 소비자가 상품 예약 → 사장님 앱에 알림 + 예약 목록 추가
2. 사장님이 QR 스캔 → 소비자 앱 예약 상태 "픽업완료"로 변경

---

## 6. 전역 상태 관리 (Context API)

```typescript
interface AppState {
  // 마켓
  markets: Market[];

  // 공구 상품
  gongguList: Gonggu[];

  // 예약 (소비자 + 사장님 공유)
  reservations: Reservation[];

  // 알림 (사장님용)
  alerts: Alert[];

  // 동기화 이벤트 (연동 데모용)
  lastSyncEvent: SyncEvent | null;
}

interface SyncEvent {
  type: "new_reservation" | "pickup_complete" | "status_change";
  data: any;
  timestamp: number;
}

interface AppActions {
  // 예약
  addReservation: (gonggu: Gonggu, quantity: number) => Reservation;
  cancelReservation: (reservationId: string) => void;

  // 픽업 처리 (사장님)
  completePickup: (reservationId: string) => void;
  markNoshow: (reservationId: string) => void;

  // 공구 상태 변경
  updateGongguStatus: (gongguId: number, status: GongguStatus) => void;

  // 알림
  addAlert: (alert: Omit<Alert, "id">) => void;
  markAlertRead: (alertId: number) => void;
}
```

---

## 7. 더미 데이터 가이드

### 날짜 기준
- 오늘: 3월 11일 (화)
- 7일간: 3/11 ~ 3/17

### 공구 상품 (11개)
| 날짜 | 상품 | 카테고리 | 상태 |
|------|------|----------|------|
| 3/11 | 애플청포도 | 과일 | arrived |
| 3/11 | 노트북파우치 | 생활용품 | arrived |
| 3/11 | 유기농 레몬즙 | 건강식품 | open |
| 3/11 | 다이어트쾌변 | 건강식품 | closing |
| 3/12 | 참기름 300ml | 식품 | open |
| 3/12 | 들기름 300ml | 식품 | open |
| 3/13 | 제주 감귤 3kg | 과일 | open |
| 3/14 | 크림볼 12개입 | 베이커리 | upcoming |
| 3/15 | 국산 콩나물 | 식품 | upcoming |
| 3/16 | 수제 쿠키세트 | 베이커리 | upcoming |
| 3/17 | 한우 불고기 | 정육 | upcoming |

### 마켓 (2개)
| 이름 | 지역 | 구독자 |
|------|------|--------|
| 온맘마켓 일산점 | 일산동구 | 142명 |
| 소도몰 인하대역점 | 인천 미추홀구 | 89명 |

### 초기 예약 (2개)
- R-1001: 애플청포도 2개, 입고완료 상태
- R-1002: 참기름 1개, 예약완료 상태

---

## 8. 개발 우선순위

### Phase 1: 핵심 플로우
1. ✅ 프로젝트 세팅 (Next.js + Tailwind + Context)
2. ✅ 더미 데이터 구조
3. 소비자: 공구 피드 (날짜/카테고리 필터)
4. 소비자: 예약 플로우 (바텀시트)
5. 소비자: 내 예약 (QR 표시)
6. 사장님: 예약 관리 (목록 + 픽업 완료)

### Phase 2: 보조 기능
7. 소비자: 지도 탭
8. 소비자: MY 탭
9. 사장님: 대시보드
10. 사장님: 상품 등록

### Phase 3: 연동 데모
11. 듀얼뷰 데모 페이지
12. 실시간 동기화 시각화

---

## 9. 참고 파일

이 프로젝트 폴더에 포함된 `reference_prototype.html` 파일은 기존에 만든 HTML 프로토타입이다.
- UI 스타일, 컴포넌트 구조, 인터랙션 참고용
- 이 파일의 React 코드를 Next.js 컴포넌트로 마이그레이션

---

## 10. 코드 컨벤션

### 파일명
- 컴포넌트: PascalCase (`GongguCard.tsx`)
- 페이지: 소문자 (`page.tsx`)
- 유틸: camelCase (`formatPrice.ts`)

### 컴포넌트
- 함수형 컴포넌트 사용
- Props 타입 명시
- 클라이언트 컴포넌트는 `"use client"` 명시

### Tailwind
- 인라인 스타일 지양, Tailwind 클래스 사용
- 반복되는 스타일은 컴포넌트로 추출
- 색상은 정의된 브랜드 컬러 사용

```tsx
// Good
<div className="bg-[#609966] text-white rounded-2xl p-4">

// Bad
<div style={{ backgroundColor: '#609966', color: 'white' }}>
```

---

## 요약

이 문서를 참고하여 **온맘마켓 프로토타입**을 구축한다.
핵심은:

1. **소비자↔사장님 연동**이 실시간으로 보여야 함
2. **Mid-fi 수준** 유지 (과한 장식 X, 구조와 플로우에 집중)
3. **기획서 대체** 목적 (개발사가 보고 이해할 수 있게)

질문이 있으면 물어봐.
