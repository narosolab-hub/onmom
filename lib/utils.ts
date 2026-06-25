import { GongguStatus, ReservationStatus, ReceiveMethod, GongguType } from '@/data/types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export function getDiscountRate(originalPrice: number, price: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function getProgressPercent(reserved: number, total: number): number {
  return Math.round((reserved / total) * 100);
}

export function getStatusLabel(status: GongguStatus): string {
  const labels: Record<GongguStatus, string> = {
    upcoming: '오픈예정',
    open: '예약중',
    closing: '마감임박',
    arrived: '입고완료',
    done: '마감',
  };
  return labels[status];
}

export function getStatusColor(status: GongguStatus): string {
  const colors: Record<GongguStatus, string> = {
    upcoming: 'bg-gray-100 text-gray-600',
    open: 'bg-primary-light text-primary-dark',
    closing: 'bg-orange-100 text-orange-600',
    arrived: 'bg-blue-100 text-blue-600',
    done: 'bg-gray-200 text-gray-500',
  };
  return colors[status];
}

export function getReservationStatusLabel(status: ReservationStatus): string {
  const labels: Record<ReservationStatus, string> = {
    pending: '예약완료',
    ready: '준비완료',
    completed: '완료',
    cancelled: '취소됨',
    noshow: '노쇼',
  };
  return labels[status];
}

export function getReservationStatusColor(status: ReservationStatus): string {
  const colors: Record<ReservationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-[#E8F5E9] text-[#4A7A50]',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
    noshow: 'bg-red-100 text-red-600',
  };
  return colors[status];
}

export function getReceiveMethodLabel(method: ReceiveMethod): string {
  return method === 'pickup' ? '픽업' : '배달';
}

export function getReceiveMethodColor(method: ReceiveMethod): string {
  return method === 'pickup'
    ? 'bg-[#E8F5E9] text-[#609966]'
    : 'bg-blue-100 text-blue-700';
}

export function getGongguTypeLabel(type: GongguType): string {
  return type === 'product' ? '상품' : '서비스';
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function getDatesForWeek(): { label: string; value: string; fullDate: string }[] {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    dates.push({
      label: i === 0 ? '오늘' : `${month}/${day}`,
      value: `${month}/${day}`,
      fullDate: date.toISOString().split('T')[0],
    });
  }

  return dates;
}

export function getRelativeDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getRelativeDateRange(startDays: number, endDays: number): string {
  return `${getRelativeDate(startDays)}~${getRelativeDate(endDays)}`;
}

export const productCategories = [
  { label: '전체', value: 'all' },
  { label: '과일', value: '과일' },
  { label: '식품', value: '식품' },
  { label: '건강식품', value: '건강식품' },
  { label: '생활용품', value: '생활용품' },
  { label: '베이커리', value: '베이커리' },
  { label: '정육', value: '정육' },
];

export const serviceCategories = [
  { label: '전체', value: 'all' },
  { label: '가전수리', value: '가전수리' },
  { label: '청소/방역', value: '청소/방역' },
  { label: '교육', value: '교육' },
  { label: '건강/미용', value: '건강/미용' },
  { label: '기타서비스', value: '기타서비스' },
];

// 기존 호환성 유지
export const categories = productCategories;
