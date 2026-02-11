import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GroupSession, Order, OrderItem, Group } from './types';

interface AppState {
  // Session
  session: GroupSession | null;
  setSession: (session: GroupSession | null) => void;
  
  // Current group
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  
  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  
  // Order items
  orderItems: OrderItem[];
  setOrderItems: (items: OrderItem[]) => void;
  addOrderItem: (item: OrderItem) => void;
  updateOrderItem: (itemId: string, updates: Partial<OrderItem>) => void;
  deleteOrderItem: (itemId: string) => void;
  
  // Helpers
  getOrderWithItems: (orderId: string) => { order: Order; items: OrderItem[] } | null;
  getOrdersWithItems: () => Array<{ order: Order; items: OrderItem[] }>;
  clearSession: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Session
      session: null,
      setSession: (session) => set({ session }),
      
      // Current group
      currentGroup: null,
      setCurrentGroup: (group) => set({ currentGroup: group }),
      
      // Orders
      orders: [],
      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, ...updates } : order
          ),
        })),
      deleteOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
          orderItems: state.orderItems.filter((item) => item.order_id !== orderId),
        })),
      
      // Order items
      orderItems: [],
      setOrderItems: (items) => set({ orderItems: items }),
      addOrderItem: (item) =>
        set((state) => ({ orderItems: [...state.orderItems, item] })),
      updateOrderItem: (itemId, updates) =>
        set((state) => ({
          orderItems: state.orderItems.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        })),
      deleteOrderItem: (itemId) =>
        set((state) => ({
          orderItems: state.orderItems.filter((item) => item.id !== itemId),
        })),
      
      // Helpers
      getOrderWithItems: (orderId) => {
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return null;
        const items = state.orderItems.filter((item) => item.order_id === orderId);
        return { order, items };
      },
      
      getOrdersWithItems: () => {
        const state = get();
        return state.orders.map((order) => ({
          order,
          items: state.orderItems.filter((item) => item.order_id === order.id),
        }));
      },
      
      clearSession: () =>
        set({
          session: null,
          currentGroup: null,
          orders: [],
          orderItems: [],
        }),
    }),
    {
      name: 'burgerrun-storage',
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);
