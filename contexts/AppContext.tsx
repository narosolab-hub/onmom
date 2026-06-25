"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Market, Gonggu, Reservation, Alert, SyncEvent,
  GongguStatus, ReservationStatus, CartItem, ReservationOptions,
} from '@/data/types';
import { markets as initialMarkets } from '@/data/markets';
import { gongguList as initialGongguList } from '@/data/gonggu';
import { initialReservations } from '@/data/reservations';

interface AppState {
  markets: Market[];
  gongguList: Gonggu[];
  reservations: Reservation[];
  alerts: Alert[];
  lastSyncEvent: SyncEvent | null;
  cart: CartItem[];
}

interface AppActions {
  addReservation: (gonggu: Gonggu, quantity: number, options?: ReservationOptions) => Reservation;
  checkoutCart: (options?: ReservationOptions) => Reservation[];
  addToCart: (gonggu: Gonggu, quantity: number) => void;
  removeFromCart: (gongguId: number) => void;
  updateCartQuantity: (gongguId: number, quantity: number) => void;
  clearCart: () => void;
  cancelReservation: (reservationId: string) => void;
  completePickup: (reservationId: string) => void;
  markReady: (reservationId: string) => void;       // 준비완료 + 알림톡 발송
  markNoshow: (reservationId: string) => void;
  updateGongguStatus: (gongguId: number, status: GongguStatus) => void;
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  markAlertRead: (alertId: number) => void;
  getMarketById: (marketId: number) => Market | undefined;
  getGongguById: (gongguId: number) => Gonggu | undefined;
  addGonggu: (gongguData: Omit<Gonggu, 'id' | 'reserved'>) => Gonggu;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

let reservationCounter = 1004;
let alertCounter = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [markets] = useState<Market[]>(initialMarkets);
  const [gongguList, setGongguList] = useState<Gonggu[]>(initialGongguList);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastSyncEvent, setLastSyncEvent] = useState<SyncEvent | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const triggerSync = useCallback((type: SyncEvent['type'], data: unknown) => {
    setLastSyncEvent({ type, data, timestamp: Date.now() });
  }, []);

  const getMarketById = useCallback((marketId: number) =>
    markets.find(m => m.id === marketId), [markets]);

  const getGongguById = useCallback((gongguId: number) =>
    gongguList.find(g => g.id === gongguId), [gongguList]);

  const addAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    setAlerts(prev => [{ ...alert, id: alertCounter++ }, ...prev]);
  }, []);

  const addReservation = useCallback((
    gonggu: Gonggu,
    quantity: number,
    options?: ReservationOptions,
  ): Reservation => {
    const market = getMarketById(gonggu.marketId);
    const receiveMethod = options?.receiveMethod ?? 'pickup';

    const newReservation: Reservation = {
      id: `R-${reservationCounter++}`,
      orderId: `OMM-${Date.now()}`,
      gongguId: gonggu.id,
      marketId: gonggu.marketId,
      userId: 'user-001',
      userName: options?.userName ?? '김지연',
      userPhone: options?.userPhone ?? '010-****-5678',
      productTitle: gonggu.title,
      productEmoji: gonggu.emoji,
      productType: gonggu.type,
      quantity,
      unitPrice: gonggu.price,
      totalPrice: gonggu.price * quantity,
      receiveMethod,
      paymentMethod: receiveMethod === 'delivery' ? 'online' : 'onsite',
      deliveryAddress: options?.deliveryAddress,
      deliveryFee: options?.deliveryFee,
      serviceDate: options?.serviceDate,
      notes: options?.notes ?? '',
      status: 'pending',
      reservedAt: new Date().toISOString(),
      pickupDate: gonggu.pickupDate,
      marketName: market?.name ?? '',
      marketAddress: market?.address ?? '',
    };

    setReservations(prev => [...prev, newReservation]);

    setGongguList(prev =>
      prev.map(g =>
        g.id === gonggu.id ? { ...g, reserved: g.reserved + quantity } : g
      )
    );

    addAlert({
      type: 'reservation',
      icon: gonggu.type === 'service' ? '🛠️' : '🛒',
      message: `새 예약: ${gonggu.title} ${quantity}${gonggu.type === 'service' ? '건' : '개'} — ${newReservation.userName}님`,
      time: '방금',
      read: false,
      reservationId: newReservation.id,
    });

    triggerSync('new_reservation', newReservation);
    return newReservation;
  }, [getMarketById, addAlert, triggerSync]);

  const addToCart = useCallback((gonggu: Gonggu, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.gonggu.id === gonggu.id);
      if (existing) {
        return prev.map(item =>
          item.gonggu.id === gonggu.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, gonggu.total - gonggu.reserved) }
            : item
        );
      }
      return [...prev, { gonggu, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((gongguId: number) => {
    setCart(prev => prev.filter(item => item.gonggu.id !== gongguId));
  }, []);

  const updateCartQuantity = useCallback((gongguId: number, quantity: number) => {
    setCart(prev =>
      quantity <= 0
        ? prev.filter(item => item.gonggu.id !== gongguId)
        : prev.map(item => item.gonggu.id === gongguId ? { ...item, quantity } : item)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkoutCart = useCallback((options?: ReservationOptions): Reservation[] => {
    const newReservations = cart.map(item => addReservation(item.gonggu, item.quantity, options));
    setCart([]);
    return newReservations;
  }, [cart, addReservation]);

  const cancelReservation = useCallback((reservationId: string) => {
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, status: 'cancelled' as ReservationStatus, cancelledAt: new Date().toISOString() }
          : r
      )
    );
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      setGongguList(prev =>
        prev.map(g =>
          g.id === reservation.gongguId
            ? { ...g, reserved: Math.max(0, g.reserved - reservation.quantity) }
            : g
        )
      );
    }
    triggerSync('status_change', { reservationId, status: 'cancelled' });
  }, [reservations, triggerSync]);

  // 준비완료 처리 (카카오 알림톡 발송 시점)
  const markReady = useCallback((reservationId: string) => {
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, status: 'ready' as ReservationStatus, readyAt: new Date().toISOString() }
          : r
      )
    );
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      addAlert({
        type: reservation.receiveMethod === 'delivery' ? 'delivery' : 'pickup',
        icon: reservation.receiveMethod === 'delivery' ? '🚚' : '📦',
        message: `알림톡 발송: ${reservation.productTitle} — ${reservation.userName}님`,
        time: '방금',
        read: false,
        reservationId,
      });
    }
    triggerSync('status_change', { reservationId, status: 'ready' });
  }, [reservations, addAlert, triggerSync]);

  const completePickup = useCallback((reservationId: string) => {
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, status: 'completed' as ReservationStatus, completedAt: new Date().toISOString() }
          : r
      )
    );
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      addAlert({
        type: 'pickup',
        icon: '✅',
        message: `완료: ${reservation.productTitle} — ${reservation.userName}님`,
        time: '방금',
        read: false,
        reservationId,
      });
    }
    triggerSync('pickup_complete', { reservationId });
  }, [reservations, addAlert, triggerSync]);

  const markNoshow = useCallback((reservationId: string) => {
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, status: 'noshow' as ReservationStatus }
          : r
      )
    );
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      addAlert({
        type: 'noshow',
        icon: '⚠️',
        message: `노쇼: ${reservation.productTitle} — ${reservation.userName}님`,
        time: '방금',
        read: false,
        reservationId,
      });
    }
    triggerSync('status_change', { reservationId, status: 'noshow' });
  }, [reservations, addAlert, triggerSync]);

  const updateGongguStatus = useCallback((gongguId: number, status: GongguStatus) => {
    setGongguList(prev =>
      prev.map(g => g.id === gongguId ? { ...g, status } : g)
    );
    triggerSync('status_change', { gongguId, status });
  }, [triggerSync]);

  const updateReservationStatus = useCallback((reservationId: string, status: ReservationStatus) => {
    setReservations(prev =>
      prev.map(r => r.id === reservationId ? { ...r, status } : r)
    );
    triggerSync('status_change', { reservationId, status });
  }, [triggerSync]);

  const markAlertRead = useCallback((alertId: number) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  }, []);

  const addGonggu = useCallback((gongguData: Omit<Gonggu, 'id' | 'reserved'>): Gonggu => {
    const newGonggu: Gonggu = { ...gongguData, id: Date.now(), reserved: 0 };
    setGongguList(prev => [...prev, newGonggu]);
    return newGonggu;
  }, []);

  const value: AppState & AppActions = {
    markets, gongguList, reservations, alerts, lastSyncEvent, cart,
    addReservation, checkoutCart, addToCart, removeFromCart,
    updateCartQuantity, clearCart, cancelReservation, completePickup,
    markReady, markNoshow, updateGongguStatus, updateReservationStatus,
    addAlert, markAlertRead, getMarketById, getGongguById, addGonggu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
