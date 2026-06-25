// 마켓
export interface Market {
  id: number;
  name: string;
  emoji: string;
  area: string;
  address: string;
  followers: number;
  coordinates: { lat: number; lng: number };
}

// ─── 공구 ────────────────────────────────────────────────

export type GongguType = 'product' | 'service';

export type GongguStatus =
  | 'upcoming'   // 오픈 예정
  | 'open'       // 예약 중
  | 'closing'    // 마감 임박
  | 'arrived'    // 상품 입고 완료 / 서비스 제공 준비
  | 'done';      // 마감

// 상품 카테고리
export type ProductCategory =
  | '과일' | '식품' | '건강식품' | '생활용품' | '베이커리' | '정육';

// 서비스 카테고리
export type ServiceCategory =
  | '가전수리' | '청소/방역' | '교육' | '건강/미용' | '기타서비스';

export type GongguCategory = ProductCategory | ServiceCategory;

export interface Gonggu {
  id: number;
  marketId: number;
  type: GongguType;               // 상품 | 서비스
  title: string;
  emoji: string;
  description: string;
  category: GongguCategory;
  originalPrice: number;
  price: number;
  arrivalDate: string;            // 상품: 입고일 / 서비스: 서비스 시작 가능일
  pickupDate: string;             // 상품: 픽업 기간 / 서비스: 제공 기간
  status: GongguStatus;
  reserved: number;
  total: number;
  tags: string[];
  imageColor: string;
  specs?: { label: string; value: string }[];
  deliveryAvailable: boolean;     // 배달 가능 여부 (서비스는 false)
}

// ─── 예약 ────────────────────────────────────────────────

// 수령 방식: 픽업(현장결제) | 배달(온라인결제)
export type ReceiveMethod = 'pickup' | 'delivery';

// 결제 방식
export type PaymentMethod = 'onsite' | 'online';

export type ReservationStatus =
  | 'pending'    // 예약 완료 (준비 대기)
  | 'ready'      // 준비 완료 — 카카오 알림톡 발송됨 (픽업/배달/서비스 가능)
  | 'completed'  // 완료 (픽업 or 배달 or 서비스 완료)
  | 'cancelled'  // 취소
  | 'noshow';    // 노쇼

export interface Reservation {
  id: string;
  orderId: string;
  gongguId: number;
  marketId: number;
  userId: string;
  userName: string;
  userPhone: string;

  // 상품/서비스 스냅샷
  productTitle: string;
  productEmoji: string;
  productType: GongguType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // 수령 / 결제
  receiveMethod: ReceiveMethod;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;   // 배달 주문 시 배달 주소
  deliveryFee?: number;       // 배달비
  serviceDate?: string;       // 서비스 예약 희망일

  // 상태
  status: ReservationStatus;
  reservedAt: string;
  readyAt?: string;           // 준비완료 처리 + 알림톡 발송 시각
  completedAt?: string;       // 픽업/배달/서비스 완료 시각
  cancelledAt?: string;

  // 픽업/서비스 정보
  pickupDate: string;
  marketName: string;
  marketAddress: string;

  // 기타
  notes?: string;             // 요청사항
}

// ─── 알림 (사장님) ───────────────────────────────────────

export interface Alert {
  id: number;
  type: 'reservation' | 'pickup' | 'delivery' | 'noshow' | 'closing' | 'system';
  icon: string;
  message: string;
  time: string;
  read: boolean;
  reservationId?: string;
}

// ─── 장바구니 ─────────────────────────────────────────────

export interface CartItem {
  gonggu: Gonggu;
  quantity: number;
}

// ─── 동기화 이벤트 ────────────────────────────────────────

export interface SyncEvent {
  type: 'new_reservation' | 'pickup_complete' | 'status_change';
  data: unknown;
  timestamp: number;
}

// ─── 예약 생성 옵션 ───────────────────────────────────────

export interface ReservationOptions {
  receiveMethod?: ReceiveMethod;
  deliveryAddress?: string;
  deliveryFee?: number;
  serviceDate?: string;
  notes?: string;
  userName?: string;
  userPhone?: string;
}
