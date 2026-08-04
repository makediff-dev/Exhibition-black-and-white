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
  OrganizerEventService,
  Participant,
  Payment,
  Request,
  Response,
  Service,
  UserRole,
  VenueEmployee,
  OrganizerEmployee,
  VenueEventMeta,
  VenueProfileMedia,
  VenueService,
} from "@/data/types";
import { DEMO_USERS, DEMO_ACCESSIBLE_ACCOUNTS, getSeedData } from "@/data/mocks/seed";

interface AuthState {
  isAuthenticated: boolean;
  user: CompanyProfile | null;
  accessibleAccounts: CompanyProfile[];
  showEdoPrompt: boolean;
  pinLoginEnabled: boolean;
  pinCode: string | null;
  login: (role: UserRole) => void;
  logout: () => void;
  switchAccount: (accountId: string) => CompanyProfile | null;
  updateUser: (updates: Partial<CompanyProfile>) => void;
  setShowEdoPrompt: (show: boolean) => void;
  setPinLoginSettings: (enabled: boolean, pin?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessibleAccounts: [],
      showEdoPrompt: false,
      pinLoginEnabled: false,
      pinCode: null,
      login: (role) => {
        if (!role) return;
        const accessibleAccounts = DEMO_ACCESSIBLE_ACCOUNTS[role] ?? [DEMO_USERS[role]];
        const user = accessibleAccounts[0];
        set({
          isAuthenticated: true,
          user,
          accessibleAccounts,
          showEdoPrompt: user.edoStatus === "not_connected",
        });
      },
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          accessibleAccounts: [],
          showEdoPrompt: false,
        }),
      switchAccount: (accountId) => {
        let nextUser: CompanyProfile | null = null;
        set((state) => {
          const account = state.accessibleAccounts.find((item) => item.id === accountId);
          if (!account) return state;
          nextUser = account;
          return {
            user: account,
            showEdoPrompt: account.edoStatus === "not_connected",
          };
        });
        return nextUser;
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setShowEdoPrompt: (show) => set({ showEdoPrompt: show }),
      setPinLoginSettings: (enabled, pin) =>
        set({
          pinLoginEnabled: enabled,
          pinCode: enabled && pin ? pin : null,
        }),
    }),
    {
      name: "auth-storage",
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        const persisted = persistedState as Partial<AuthState>;
        const user = persisted.user ?? null;
        const accessibleAccounts =
          persisted.accessibleAccounts?.length
            ? persisted.accessibleAccounts
            : user?.role
              ? DEMO_ACCESSIBLE_ACCOUNTS[user.role] ?? (user ? [user] : [])
              : [];

        return {
          ...currentState,
          ...persisted,
          accessibleAccounts,
        };
      },
    }
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

interface FavoritesState {
  serviceIds: string[];
  toggleFavorite: (serviceId: string) => boolean;
  isFavorite: (serviceId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      serviceIds: [],
      toggleFavorite: (serviceId) => {
        const exists = get().serviceIds.includes(serviceId);
        set((state) => ({
          serviceIds: exists
            ? state.serviceIds.filter((id) => id !== serviceId)
            : [...state.serviceIds, serviceId],
        }));
        return !exists;
      },
      isFavorite: (serviceId) => get().serviceIds.includes(serviceId),
    }),
    { name: "favorites-storage" }
  )
);

interface PrototypeState {
  services: Service[];
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
  venueServices: VenueService[];
  organizerEventServices: OrganizerEventService[];
  venueEmployees: VenueEmployee[];
  organizerEmployees: OrganizerEmployee[];
  venueEventMeta: VenueEventMeta[];
  venueProfileMedia: VenueProfileMedia[];
  selectedCity: string;
  compareResponseIds: string[];
  registrationDraft: Record<string, unknown>;
  requestWizardDraft: Record<string, unknown>;

  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  removeService: (id: string) => void;
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
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  updateFloorCell: (id: string, status: FloorCell["status"]) => void;
  addVenueService: (service: VenueService) => void;
  updateVenueService: (id: string, updates: Partial<VenueService>) => void;
  removeVenueService: (id: string) => void;
  addOrganizerEventService: (service: OrganizerEventService) => void;
  updateOrganizerEventService: (id: string, updates: Partial<OrganizerEventService>) => void;
  removeOrganizerEventService: (id: string) => void;
  addVenueEmployee: (employee: VenueEmployee) => void;
  updateVenueEmployee: (id: string, updates: Partial<VenueEmployee>) => void;
  removeVenueEmployee: (id: string) => void;
  delegateVenueAdmin: (venueId: string, employeeId: string) => void;
  addOrganizerEmployee: (employee: OrganizerEmployee) => void;
  updateOrganizerEmployee: (id: string, updates: Partial<OrganizerEmployee>) => void;
  removeOrganizerEmployee: (id: string) => void;
  delegateOrganizerAdmin: (organizerId: string, employeeId: string) => void;
  updateVenueEventMeta: (id: string, updates: Partial<VenueEventMeta>) => void;
  addVenueProfileMedia: (item: VenueProfileMedia) => void;
  removeVenueProfileMedia: (id: string) => void;
  setSelectedCity: (city: string) => void;
  toggleCompareResponse: (id: string) => void;
  clearCompare: () => void;
  setRegistrationDraft: (draft: Record<string, unknown>) => void;
  setRequestWizardDraft: (draft: Record<string, unknown>) => void;
  resetToSeed: () => void;
}

const seed = getSeedData();

function mergeById<T extends { id: string }>(stored: T[] | undefined, seedItems: T[]): T[] {
  if (!stored?.length) return seedItems;
  const ids = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !ids.has(item.id));
  return missing.length ? [...stored, ...missing] : stored;
}

function mergeParticipantsById(
  stored: Participant[] | undefined,
  seedItems: Participant[]
): Participant[] {
  if (!stored?.length) return seedItems;

  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const merged = stored.map((item) => seedMap.get(item.id) ?? item);
  const storedIds = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !storedIds.has(item.id));

  return missing.length ? [...merged, ...missing] : merged;
}

function mergeOrganizerEventServicesById(
  stored: OrganizerEventService[] | undefined,
  seedItems: OrganizerEventService[]
): OrganizerEventService[] {
  if (!stored?.length) return seedItems;

  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const merged = stored.map((item) => seedMap.get(item.id) ?? item);
  const storedIds = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !storedIds.has(item.id));

  return missing.length ? [...merged, ...missing] : merged;
}

function mergeRequestsById(stored: Request[] | undefined, seedItems: Request[]): Request[] {
  if (!stored?.length) return seedItems;

  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const merged = stored.map((item) => {
    const seed = seedMap.get(item.id);
    if (!seed) return item;

    return {
      ...item,
      responseDeadlineAt: item.responseDeadlineAt ?? seed.responseDeadlineAt,
      customerName: item.customerName ?? seed.customerName,
    };
  });

  const storedIds = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !storedIds.has(item.id));
  return missing.length ? [...merged, ...missing] : merged;
}

function mergeDealsById(stored: Deal[] | undefined, seedItems: Deal[]): Deal[] {
  if (!stored?.length) return seedItems;

  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const merged = stored.map((item) => {
    const seed = seedMap.get(item.id);
    if (!seed) return item;

    return {
      ...item,
      review: item.review ?? seed.review,
      projectPhotos: item.projectPhotos ?? seed.projectPhotos,
      reviewRequested: item.reviewRequested ?? seed.reviewRequested,
      reviewRequestedAt: item.reviewRequestedAt ?? seed.reviewRequestedAt,
    };
  });

  const storedIds = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !storedIds.has(item.id));
  return missing.length ? [...merged, ...missing] : merged;
}

function mergeBookingsById(stored: Booking[] | undefined, seedItems: Booking[]): Booking[] {
  if (!stored?.length) return seedItems;

  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const merged = stored.map((item) => {
    const seed = seedMap.get(item.id);
    if (!seed) return item;

    if (!item.hallId || !item.periodType) {
      return { ...seed, status: item.status };
    }

    return {
      ...item,
      hallId: item.hallId ?? seed.hallId,
      organizerId: item.organizerId ?? seed.organizerId,
      organizerName: item.organizerName ?? seed.organizerName,
      periodType: item.periodType ?? seed.periodType,
      periodStart: item.periodStart ?? seed.periodStart,
      periodEnd: item.periodEnd ?? seed.periodEnd,
    };
  });

  const storedIds = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !storedIds.has(item.id));
  return missing.length ? [...merged, ...missing] : merged;
}

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      services: seed.services,
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
      venueServices: seed.venueServices,
      organizerEventServices: seed.organizerEventServices,
      venueEmployees: seed.venueEmployees,
      organizerEmployees: seed.organizerEmployees,
      venueEventMeta: seed.venueEventMeta,
      venueProfileMedia: seed.venueProfileMedia,
      selectedCity: "Москва",
      compareResponseIds: [],
      registrationDraft: {},
      requestWizardDraft: {},

      addService: (service) => set((s) => ({ services: [service, ...s.services] })),
      updateService: (id, updates) =>
        set((s) => ({
          services: s.services.map((sv) => (sv.id === id ? { ...sv, ...updates } : sv)),
        })),
      removeService: (id) =>
        set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),
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
      updateParticipant: (id, updates) =>
        set((s) => ({
          participants: s.participants.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      updateFloorCell: (id, status) =>
        set((s) => ({
          floorCells: s.floorCells.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
      addVenueService: (service) =>
        set((s) => ({ venueServices: [service, ...s.venueServices] })),
      updateVenueService: (id, updates) =>
        set((s) => ({
          venueServices: s.venueServices.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeVenueService: (id) =>
        set((s) => ({ venueServices: s.venueServices.filter((item) => item.id !== id) })),
      addOrganizerEventService: (service) =>
        set((s) => ({ organizerEventServices: [service, ...s.organizerEventServices] })),
      updateOrganizerEventService: (id, updates) =>
        set((s) => ({
          organizerEventServices: s.organizerEventServices.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeOrganizerEventService: (id) =>
        set((s) => ({
          organizerEventServices: s.organizerEventServices.filter((item) => item.id !== id),
        })),
      addVenueEmployee: (employee) =>
        set((s) => ({ venueEmployees: [...s.venueEmployees, employee] })),
      updateVenueEmployee: (id, updates) =>
        set((s) => ({
          venueEmployees: s.venueEmployees.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeVenueEmployee: (id) =>
        set((s) => ({ venueEmployees: s.venueEmployees.filter((item) => item.id !== id) })),
      delegateVenueAdmin: (venueId, employeeId) =>
        set((s) => ({
          venueEmployees: s.venueEmployees.map((item) => {
            if (item.venueId !== venueId) return item;
            if (item.id === employeeId) {
              return {
                ...item,
                isAdmin: true,
                status: item.status === "invited" ? "pending_edo" : item.status,
                permissions: [
                  "dashboard",
                  "profile",
                  "halls",
                  "spaces",
                  "floor-plan",
                  "events",
                  "venue-services",
                  "bookings",
                  "orders",
                  "payments",
                  "documents",
                ],
              };
            }
            if (item.isAdmin) {
              return { ...item, isAdmin: false };
            }
            return item;
          }),
        })),
      addOrganizerEmployee: (employee) =>
        set((s) => ({ organizerEmployees: [...s.organizerEmployees, employee] })),
      updateOrganizerEmployee: (id, updates) =>
        set((s) => ({
          organizerEmployees: s.organizerEmployees.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeOrganizerEmployee: (id) =>
        set((s) => ({
          organizerEmployees: s.organizerEmployees.filter((item) => item.id !== id),
        })),
      delegateOrganizerAdmin: (organizerId, employeeId) =>
        set((s) => ({
          organizerEmployees: s.organizerEmployees.map((item) => {
            if (item.organizerId !== organizerId) return item;
            if (item.id === employeeId) {
              return {
                ...item,
                isAdmin: true,
                status: item.status === "invited" ? "pending_edo" : item.status,
                permissions: [
                  "dashboard",
                  "profile",
                  "events",
                  "venues",
                  "orders",
                  "payments",
                  "documents",
                ],
              };
            }
            if (item.isAdmin) {
              return { ...item, isAdmin: false };
            }
            return item;
          }),
        })),
      updateVenueEventMeta: (id, updates) =>
        set((s) => ({
          venueEventMeta: s.venueEventMeta.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      addVenueProfileMedia: (item) =>
        set((s) => ({ venueProfileMedia: [...s.venueProfileMedia, item] })),
      removeVenueProfileMedia: (id) =>
        set((s) => ({
          venueProfileMedia: s.venueProfileMedia.filter((item) => item.id !== id),
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
          services: fresh.services,
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
          venueServices: fresh.venueServices,
          organizerEventServices: fresh.organizerEventServices,
          venueEmployees: fresh.venueEmployees,
          organizerEmployees: fresh.organizerEmployees,
          venueEventMeta: fresh.venueEventMeta,
          venueProfileMedia: fresh.venueProfileMedia,
          compareResponseIds: [],
          registrationDraft: {},
          requestWizardDraft: {},
        });
      },
    }),
    {
      name: "prototype-storage",
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        const persisted = persistedState as Partial<PrototypeState>;
        const fresh = getSeedData();
        return {
          ...currentState,
          ...persisted,
          requests: mergeRequestsById(persisted.requests, fresh.requests),
          deals: mergeDealsById(persisted.deals, fresh.deals),
          venueServices: mergeById(persisted.venueServices, fresh.venueServices),
          organizerEventServices: mergeOrganizerEventServicesById(
            persisted.organizerEventServices,
            fresh.organizerEventServices
          ),
          venueEmployees: mergeById(persisted.venueEmployees, fresh.venueEmployees),
          organizerEmployees: mergeById(persisted.organizerEmployees, fresh.organizerEmployees),
          venueEventMeta: mergeById(persisted.venueEventMeta, fresh.venueEventMeta),
          venueProfileMedia: mergeById(persisted.venueProfileMedia, fresh.venueProfileMedia),
          payments: mergeById(persisted.payments, fresh.payments),
          participants: mergeParticipantsById(persisted.participants, fresh.participants),
          bookings: mergeBookingsById(persisted.bookings, fresh.bookings),
        };
      },
    }
  )
);

export function resetAllStores() {
  usePrototypeStore.getState().resetToSeed();
  useCartStore.getState().clearCart();
  useFavoritesStore.setState({ serviceIds: [] });
  useAuthStore.getState().logout();
}
