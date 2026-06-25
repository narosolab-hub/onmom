"use client";

import { GongguStatus, ReservationStatus } from '@/data/types';
import { getStatusLabel, getStatusColor, getReservationStatusLabel, getReservationStatusColor } from '@/lib/utils';

interface GongguStatusBadgeProps {
  status: GongguStatus;
}

export function GongguStatusBadge({ status }: GongguStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getReservationStatusColor(status)}`}>
      {getReservationStatusLabel(status)}
    </span>
  );
}
