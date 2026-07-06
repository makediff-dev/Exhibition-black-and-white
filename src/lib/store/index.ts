"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Booking,
  CartItem,
  CompanyProfile,
  Deal,
  Document,
  FloorCell,
  MessageThread,
  Notification,
  Participant,
  Payment,
  Request,
  Response,
  UserRole,
} from "@/data/types";
import { DEMO_USERS, getSeedData } from "@/data/mocks/seed";

interface AuthState {
  isAuthenticated: boolean;
  user: CompanyProfile | null;
  showEdoPrompt: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<CompanyProfile>) => void;
  setShowEdoPrompt: (show: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      showEdoPrompt: false,
      login: (role) => {
        if (!role) return;
        const user = DEMO_USERS[role];
        set({
          isAuthenticated: true,
          user,
          showEdoPrompt: user.edoStatus === "not_connected",
        });
      },
      logout: () => set({ isAuthenticated: false, user: null, showEdoPrompt: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setShowEdoPrompt: (show) => set({ showEdoPrompt: show }),
    }),
    { name: "auth-storage" }
  )
);

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (serviceId: string) => void;
  updateItem: (serviceId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.serviceId === item.serviceId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.serviceId === item.serviceId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (serviceId) =>
        set((state) => ({ items: state.items.filter((i) => i.serviceId !== serviceId) })),
      updateItem: (serviceId, updates) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.serviceId === serviceId ? { ...i, ...updates } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);

interface PrototypeState {
  requests: Request[];
  responses: Response[];
  deals: Deal[];
  documents: Document[];
  payments: Payment[];
  notifications: Notification[];
  messages: MessageThread[];
  bookings: Booking[];
  participants: Participant[];
  floorCells: FloorCell[];
  selectedCity: string;
  compareResponseIds: string[];
  registrationDraft: Record<string, unknown>;
  requestWizardDraft: Record<string, unknown>;

  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  addResponse: (response: Response) => void;
  updateResponse: (id: string, updates: Partial<Response>) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateDealStatus: (id: string, status: Deal["status"]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addMessage: (threadId: string, message: MessageThread["messages"][0]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateFloorCell: (id: string, status: FloorCell["status"]) => void;
  setSelectedCity: (city: string) => void;
  toggleCompareResponse: (id: string) => void;
  clearCompare: () => void;
  setRegistrationDraft: (draft: Record<string, unknown>) => void;
  setRequestWizardDraft: (draft: Record<string, unknown>) => void;
  resetToSeed: () => void;
}

const seed = getSeedData();

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      requests: seed.requests,
      responses: seed.responses,
      deals: seed.deals,
      documents: seed.documents,
      payments: seed.payments,
      notifications: seed.notifications,
      messages: seed.messages,
      bookings: seed.bookings,
      participants: seed.participants,
      floorCells: seed.floorCells,
      selectedCity: "Москва",
      compareResponseIds: [],
      registrationDraft: {},
      requestWizardDraft: {},

      addRequest: (request) => set((s) => ({ requests: [...s.requests, request] })),
      updateRequest: (id, updates) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      addResponse: (response) => set((s) => ({ responses: [...s.responses, response] })),
      updateResponse: (id, updates) =>
        set((s) => ({
          responses: s.responses.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      addDeal: (deal) => set((s) => ({ deals: [...s.deals, deal] })),
      updateDeal: (id, updates) =>
        set((s) => ({
          deals: s.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      updateDealStatus: (id, status) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status,
                  history: [
                    ...d.history,
                    {
                      date: new Date().toISOString().split("T")[0],
                      action: `Статус: ${status}`,
                      actor: "Система",
                    },
                  ],
                }
              : d
          ),
        })),
      addNotification: (notification) =>
        set((s) => ({ notifications: [notification, ...s.notifications] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      addMessage: (threadId, message) =>
        set((s) => ({
          messages: s.messages.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, message],
                  lastMessage: message.text,
                  lastDate: message.date,
                }
              : t
          ),
        })),
      addBooking: (booking) =>
        set((s) => ({ bookings: [...s.bookings, booking] })),
      updateBooking: (id, updates) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      updateFloorCell: (id, status) =>
        set((s) => ({
          floorCells: s.floorCells.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
      setSelectedCity: (city) => set({ selectedCity: city }),
      toggleCompareResponse: (id) =>
        set((s) => ({
          compareResponseIds: s.compareResponseIds.includes(id)
            ? s.compareResponseIds.filter((x) => x !== id)
            : [...s.compareResponseIds, id],
        })),
      clearCompare: () => set({ compareResponseIds: [] }),
      setRegistrationDraft: (draft) => set({ registrationDraft: draft }),
      setRequestWizardDraft: (draft) => set({ requestWizardDraft: draft }),
      resetToSeed: () => {
        const fresh = getSeedData();
        set({
          requests: fresh.requests,
          responses: fresh.responses,
          deals: fresh.deals,
          documents: fresh.documents,
          payments: fresh.payments,
          notifications: fresh.notifications,
          messages: fresh.messages,
          bookings: fresh.bookings,
          participants: fresh.participants,
          floorCells: fresh.floorCells,
          compareResponseIds: [],
          registrationDraft: {},
          requestWizardDraft: {},
        });
      },
    }),
    { name: "prototype-storage" }
  )
);

export function resetAllStores() {
  usePrototypeStore.getState().resetToSeed();
  useCartStore.getState().clearCart();
  useAuthStore.getState().logout();
}
