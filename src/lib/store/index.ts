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
  OrganizerEventDraft,
  OrganizerEventService,
  EventRecommendedPartner,
  Participant,
  Payment,
  PortfolioItem,
  ProjectTimelineRow,
  Request,
  Response,
  Service,
  ServiceCatalog,
  UserRole,
  VenueEmployee,
  VenueInquiry,
  CustomerEmployee,
  ContractorEmployee,
  OrganizerEmployee,
  VenueEventMeta,
  VenueProfileMedia,
  VenueService,
} from "@/data/types";
import { DEMO_USERS, DEMO_ACCESSIBLE_ACCOUNTS, SEED_CONTRACTORS, getSeedData } from "@/data/mocks/seed";
import { overlaySeedRecords } from "@/lib/store/seed-overlay";
import {
  canCreateRequest,
  canManageEmployees,
  canMutateDeal,
  canSubmitProposal,
} from "@/lib/auth/authorization";
import { canTransitionBooking } from "@/lib/state/booking-machine";
import { canTransitionDeal } from "@/lib/state/deal-machine";
import { canTransitionInquiry } from "@/lib/state/inquiry-machine";
import { validateProposalPayload } from "@/lib/state/proposal-payload";
import { canPerformRequestAction } from "@/lib/state/request-machine";
import { createBookingsFromInquiry } from "@/lib/utils/bookings-from-inquiry";
import { isHallOccupied } from "@/lib/utils/hall-availability";

interface AuthState {
  isAuthenticated: boolean;
  user: CompanyProfile | null;
  accessibleAccounts: CompanyProfile[];
  showEdoPrompt: boolean;
  showCompanyRegistrationPrompt: boolean;
  pinLoginEnabled: boolean;
  pinCode: string | null;
  login: (role: UserRole) => void;
  logout: () => void;
  switchAccount: (accountId: string) => CompanyProfile | null;
  updateUser: (updates: Partial<CompanyProfile>) => void;
  setShowEdoPrompt: (show: boolean) => void;
  setShowCompanyRegistrationPrompt: (show: boolean) => void;
  setPinLoginSettings: (enabled: boolean, pin?: string) => void;
}

function stripLogoFromProfile(profile: CompanyProfile): CompanyProfile {
  const { logoUrl: _logoUrl, ...rest } = profile;
  return rest;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessibleAccounts: [],
      showEdoPrompt: false,
      showCompanyRegistrationPrompt: false,
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
          showCompanyRegistrationPrompt: false,
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
      setShowCompanyRegistrationPrompt: (show) => set({ showCompanyRegistrationPrompt: show }),
      setPinLoginSettings: (enabled, pin) =>
        set({
          pinLoginEnabled: enabled,
          pinCode: enabled && pin ? pin : null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user ? stripLogoFromProfile(state.user) : null,
        accessibleAccounts: state.accessibleAccounts.map(stripLogoFromProfile),
        showEdoPrompt: state.showEdoPrompt,
        showCompanyRegistrationPrompt: state.showCompanyRegistrationPrompt,
        pinLoginEnabled: state.pinLoginEnabled,
        pinCode: state.pinCode,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        const persisted = persistedState as Partial<AuthState>;
        const user = persisted.user ? stripLogoFromProfile(persisted.user) : null;
        const accessibleAccounts =
          persisted.accessibleAccounts?.length
            ? persisted.accessibleAccounts.map(stripLogoFromProfile)
            : user?.role
              ? DEMO_ACCESSIBLE_ACCOUNTS[user.role] ?? (user ? [user] : [])
              : [];

        return {
          ...currentState,
          ...persisted,
          user,
          accessibleAccounts,
          isAuthenticated: persisted.isAuthenticated ?? Boolean(user),
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
  eventIds: string[];
  contractorIds: string[];
  venueIds: string[];
  toggleFavorite: (serviceId: string) => boolean;
  isFavorite: (serviceId: string) => boolean;
  toggleEventFavorite: (eventId: string) => boolean;
  isEventFavorite: (eventId: string) => boolean;
  toggleContractorFavorite: (contractorId: string) => boolean;
  isContractorFavorite: (contractorId: string) => boolean;
  toggleVenueFavorite: (venueId: string) => boolean;
  isVenueFavorite: (venueId: string) => boolean;
}

function toggleId(list: string[], id: string): { next: string[]; added: boolean } {
  const exists = list.includes(id);
  return {
    next: exists ? list.filter((item) => item !== id) : [...list, id],
    added: !exists,
  };
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      serviceIds: ["svc-2"],
      eventIds: ["evt-1"],
      contractorIds: [],
      venueIds: [],
      toggleFavorite: (serviceId) => {
        const { next, added } = toggleId(get().serviceIds, serviceId);
        set({ serviceIds: next });
        return added;
      },
      isFavorite: (serviceId) => get().serviceIds.includes(serviceId),
      toggleEventFavorite: (eventId) => {
        const { next, added } = toggleId(get().eventIds, eventId);
        set({ eventIds: next });
        return added;
      },
      isEventFavorite: (eventId) => get().eventIds.includes(eventId),
      toggleContractorFavorite: (contractorId) => {
        const { next, added } = toggleId(get().contractorIds, contractorId);
        set({ contractorIds: next });
        return added;
      },
      isContractorFavorite: (contractorId) => get().contractorIds.includes(contractorId),
      toggleVenueFavorite: (venueId) => {
        const { next, added } = toggleId(get().venueIds, venueId);
        set({ venueIds: next });
        return added;
      },
      isVenueFavorite: (venueId) => get().venueIds.includes(venueId),
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
  eventRecommendedPartners: EventRecommendedPartner[];
  venueEmployees: VenueEmployee[];
  organizerEmployees: OrganizerEmployee[];
  customerEmployees: CustomerEmployee[];
  contractorEmployees: ContractorEmployee[];
  venueEventMeta: VenueEventMeta[];
  venueProfileMedia: VenueProfileMedia[];
  selectedCity: string;
  compareResponseIds: string[];
  registrationDraft: Record<string, unknown>;
  requestWizardDraft: Record<string, unknown>;
  organizerEventDraft: OrganizerEventDraft | null;
  venueInquiries: VenueInquiry[];
  companyLogos: Record<string, string>;
  contractorPortfolios: Record<string, PortfolioItem[]>;
  serviceCatalogs: ServiceCatalog[];
  projectTimelineRows: ProjectTimelineRow[];

  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  removeService: (id: string) => void;
  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  addResponse: (response: Response) => boolean;
  updateResponse: (id: string, updates: Partial<Response>) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateDealStatus: (id: string, status: Deal["status"]) => void;
  addPayment: (payment: Payment) => void;
  updateVenueInquiry: (id: string, updates: Partial<VenueInquiry>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addMessage: (threadId: string, message: MessageThread["messages"][0]) => void;
  addThread: (thread: MessageThread) => void;
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
  addEventRecommendedPartner: (partner: EventRecommendedPartner) => void;
  updateEventRecommendedPartner: (id: string, updates: Partial<EventRecommendedPartner>) => void;
  removeEventRecommendedPartner: (id: string) => void;
  addVenueEmployee: (employee: VenueEmployee) => void;
  updateVenueEmployee: (id: string, updates: Partial<VenueEmployee>) => void;
  removeVenueEmployee: (id: string) => void;
  delegateVenueAdmin: (venueId: string, employeeId: string) => void;
  addOrganizerEmployee: (employee: OrganizerEmployee) => void;
  updateOrganizerEmployee: (id: string, updates: Partial<OrganizerEmployee>) => void;
  removeOrganizerEmployee: (id: string) => void;
  delegateOrganizerAdmin: (organizerId: string, employeeId: string) => void;
  addCustomerEmployee: (employee: CustomerEmployee) => void;
  updateCustomerEmployee: (id: string, updates: Partial<CustomerEmployee>) => void;
  removeCustomerEmployee: (id: string) => void;
  delegateCustomerAdmin: (customerId: string, employeeId: string) => void;
  addContractorEmployee: (employee: ContractorEmployee) => void;
  updateContractorEmployee: (id: string, updates: Partial<ContractorEmployee>) => void;
  removeContractorEmployee: (id: string) => void;
  delegateContractorAdmin: (contractorId: string, employeeId: string) => void;
  updateVenueEventMeta: (id: string, updates: Partial<VenueEventMeta>) => void;
  addVenueProfileMedia: (item: VenueProfileMedia) => void;
  removeVenueProfileMedia: (id: string) => void;
  setSelectedCity: (city: string) => void;
  toggleCompareResponse: (id: string) => void;
  clearCompare: () => void;
  setRegistrationDraft: (draft: Record<string, unknown>) => void;
  setRequestWizardDraft: (draft: Record<string, unknown>) => void;
  setOrganizerEventDraft: (draft: OrganizerEventDraft | null) => void;
  addVenueInquiries: (inquiries: VenueInquiry[]) => void;
  selectVenueInquiry: (inquiryId: string) => boolean;
  requestBookingChange: (
    bookingId: string,
    change: NonNullable<Booking["changeRequest"]>
  ) => boolean;
  resolveBookingChange: (bookingId: string, accept: boolean) => boolean;
  setCompanyLogo: (userId: string, logoUrl: string) => void;
  getContractorPortfolio: (contractorId: string) => PortfolioItem[];
  setContractorPortfolio: (contractorId: string, portfolio: PortfolioItem[]) => void;
  upsertContractorPortfolioItem: (contractorId: string, item: PortfolioItem) => void;
  removeContractorPortfolioItem: (contractorId: string, itemId: string) => void;
  getContractorCatalogs: (contractorId: string) => ServiceCatalog[];
  upsertServiceCatalog: (catalog: ServiceCatalog) => void;
  removeServiceCatalog: (id: string) => void;
  addProjectTimelineRow: (row: ProjectTimelineRow) => void;
  updateProjectTimelineRow: (id: string, updates: Partial<ProjectTimelineRow>) => void;
  removeProjectTimelineRow: (id: string) => void;
  resetToSeed: () => void;
}

function getSeedPortfolio(contractorId: string): PortfolioItem[] {
  return SEED_CONTRACTORS.find((contractor) => contractor.id === contractorId)?.portfolio ?? [];
}

function resolveContractorPortfolio(
  contractorId: string,
  overrides: Record<string, PortfolioItem[]>
): PortfolioItem[] {
  return overrides[contractorId] ?? getSeedPortfolio(contractorId);
}

const seed = getSeedData();
const MAX_LOGO_DATA_URL_LENGTH = 120_000;

function sanitizeCompanyLogos(logos: Record<string, string> | undefined): Record<string, string> {
  if (!logos) return {};
  return Object.fromEntries(
    Object.entries(logos).filter(([, url]) => url.length <= MAX_LOGO_DATA_URL_LENGTH)
  );
}

function mergeMessageThreads(
  stored: MessageThread[] | undefined,
  seedItems: MessageThread[]
): MessageThread[] {
  if (!stored?.length) return seedItems;

  const storedMap = new Map(stored.map((thread) => [thread.id, thread]));
  const mergedSeed = seedItems.map((seed) => {
    const existing = storedMap.get(seed.id);
    if (!existing) return seed;

    const seedMessageIds = new Set(seed.messages.map((message) => message.id));
    const extraMessages = existing.messages.filter((message) => !seedMessageIds.has(message.id));
    const messages = extraMessages.length ? [...seed.messages, ...extraMessages] : seed.messages;
    const last = messages[messages.length - 1];

    return {
      ...seed,
      unread: existing.unread,
      messages,
      lastMessage: last?.text ?? seed.lastMessage,
      lastDate: last?.date ?? seed.lastDate,
    };
  });

  const seedIds = new Set(seedItems.map((thread) => thread.id));
  const extras = stored
    .filter((thread) => !seedIds.has(thread.id))
    .map((thread) => ({
      ...thread,
      contextType: thread.contextType || (thread.relatedType as MessageThread["contextType"]),
      contextId: thread.contextId || thread.relatedId,
    }));
  return extras.length ? [...mergedSeed, ...extras] : mergedSeed;
}

function mergeNotificationsById(
  stored: Notification[] | undefined,
  seedItems: Notification[]
): Notification[] {
  if (!stored?.length) return seedItems;

  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const merged = stored.map((item) => {
    const seed = seedMap.get(item.id);
    if (!seed) return item;
    return { ...seed, read: item.read };
  });
  const storedIds = new Set(stored.map((item) => item.id));
  const missing = seedItems.filter((item) => !storedIds.has(item.id));
  return missing.length ? [...merged, ...missing] : merged;
}

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
  return overlaySeedRecords(stored, seedItems, ["status"]);
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
      eventRecommendedPartners: seed.eventRecommendedPartners,
      venueEmployees: seed.venueEmployees,
      organizerEmployees: seed.organizerEmployees,
      customerEmployees: seed.customerEmployees,
      contractorEmployees: seed.contractorEmployees,
      venueEventMeta: seed.venueEventMeta,
      venueProfileMedia: seed.venueProfileMedia,
      selectedCity: "Москва",
      compareResponseIds: [],
      registrationDraft: {},
      requestWizardDraft: {},
      organizerEventDraft: null,
      venueInquiries: seed.venueInquiries,
      companyLogos: {},
      contractorPortfolios: {},
      serviceCatalogs: [],
      projectTimelineRows: [],

      addService: (service) => set((s) => ({ services: [service, ...s.services] })),
      updateService: (id, updates) =>
        set((s) => ({
          services: s.services.map((sv) => (sv.id === id ? { ...sv, ...updates } : sv)),
        })),
      removeService: (id) =>
        set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),
      addRequest: (request) =>
        set((s) => {
          if (!canCreateRequest(useAuthStore.getState().user).allowed) return s;
          return { requests: [...s.requests, request] };
        }),
      updateRequest: (id, updates) =>
        set((s) => {
          const user = useAuthStore.getState().user;
          const request = s.requests.find((item) => item.id === id);
          if (!user || user.role !== "customer" || !request || request.customerId !== user.id) {
            return s;
          }
          if (updates.status && updates.status !== request.status) {
            const action =
              updates.status === "published"
                ? "publish"
                : updates.status === "archived"
                  ? "archive"
                  : updates.status === "cancelled"
                    ? "cancel"
                    : updates.status === "completed"
                      ? "delete"
                      : null;
            if (
              action &&
              !canPerformRequestAction(request, user, action, s.responses, s.deals).allowed
            ) {
              return s;
            }
          }
          if (
            updates.responseDeadlineAt &&
            updates.responseDeadlineAt !== request.responseDeadlineAt &&
            !canPerformRequestAction(request, user, "extend_deadline", s.responses, s.deals).allowed
          ) {
            return s;
          }
          return {
            requests: s.requests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          };
        }),
      addResponse: (response) => {
        let accepted = false;
        set((s) => {
          const request = s.requests.find((item) => item.id === response.requestId);
          if (!canSubmitProposal(useAuthStore.getState().user, request, s.responses, s.deals).allowed) {
            return s;
          }
          if (!validateProposalPayload(response).ok) {
            return s;
          }
          accepted = true;
          return { responses: [...s.responses, response] };
        });
        return accepted;
      },
      updateResponse: (id, updates) =>
        set((s) => ({
          responses: s.responses.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      addDeal: (deal) => set((s) => ({ deals: [...s.deals, deal] })),
      addPayment: (payment) =>
        set((s) =>
          s.payments.some((item) => item.id === payment.id)
            ? s
            : { payments: [...s.payments, payment] }
        ),
      updateDeal: (id, updates) =>
        set((s) => {
          const deal = s.deals.find((item) => item.id === id);
          if (!canMutateDeal(useAuthStore.getState().user, deal).allowed) return s;
          return {
            deals: s.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
          };
        }),
      updateDealStatus: (id, status) =>
        set((s) => {
          const deal = s.deals.find((item) => item.id === id);
          const user = useAuthStore.getState().user;
          if (!canMutateDeal(user, deal).allowed) return s;
          if (!deal || !canTransitionDeal(deal, user, status).allowed) return s;
          return {
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
          };
        }),
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
      addThread: (thread) =>
        set((s) => {
          if (s.messages.some((item) => item.id === thread.id)) return s;
          return { messages: [thread, ...s.messages] };
        }),
      addBooking: (booking) =>
        set((s) => {
          if (booking.status === "confirmed" && booking.hallId) {
            const start = booking.periodStart ?? booking.date;
            const end = booking.periodEnd ?? start;
            if (isHallOccupied(s.bookings, booking.hallId, start, end, booking.id)) {
              return s;
            }
          }
          return { bookings: [...s.bookings, booking] };
        }),
      updateBooking: (id, updates) =>
        set((s) => {
          const booking = s.bookings.find((item) => item.id === id);
          if (!booking) return s;
          if (updates.status && updates.status !== booking.status) {
            const allowed = canTransitionBooking(
              booking,
              useAuthStore.getState().user,
              updates.status,
              { rejectReason: updates.rejectReason ?? booking.rejectReason }
            );
            if (!allowed.allowed) return s;
            if (updates.status === "confirmed") {
              const hallId = updates.hallId ?? booking.hallId;
              const start = updates.periodStart ?? booking.periodStart ?? booking.date;
              const end = updates.periodEnd ?? booking.periodEnd ?? start;
              if (hallId && isHallOccupied(s.bookings, hallId, start, end, booking.id)) {
                return s;
              }
            }
          }
          return {
            bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          };
        }),
      requestBookingChange: (bookingId, change) => {
        let ok = false;
        set((s) => {
          const booking = s.bookings.find((item) => item.id === bookingId);
          const user = useAuthStore.getState().user;
          if (!booking || booking.status !== "confirmed") return s;
          if (booking.changeRequest?.status === "pending") return s;
          if (user?.role !== "organizer" && user?.role !== "venue") return s;
          if (!change.reason.trim() || !change.periodStart || !change.periodEnd) return s;
          ok = true;
          return {
            bookings: s.bookings.map((item) =>
              item.id === bookingId ? { ...item, changeRequest: { ...change, status: "pending" } } : item
            ),
          };
        });
        return ok;
      },
      resolveBookingChange: (bookingId, accept) => {
        let ok = false;
        set((s) => {
          const booking = s.bookings.find((item) => item.id === bookingId);
          const user = useAuthStore.getState().user;
          const request = booking?.changeRequest;
          if (!booking || request?.status !== "pending") return s;
          const waitingVenue = request.actor === "organizer";
          if (waitingVenue && user?.role !== "venue") return s;
          if (!waitingVenue && user?.role !== "organizer") return s;
          if (accept) {
            const hallId = booking.hallId;
            if (
              hallId &&
              isHallOccupied(s.bookings, hallId, request.periodStart, request.periodEnd, booking.id)
            ) {
              return s;
            }
            ok = true;
            return {
              bookings: s.bookings.map((item) =>
                item.id === bookingId
                  ? {
                      ...item,
                      periodStart: request.periodStart,
                      periodEnd: request.periodEnd,
                      date: request.periodStart,
                      changeRequest: { ...request, status: "accepted" },
                    }
                  : item
              ),
            };
          }
          ok = true;
          return {
            bookings: s.bookings.map((item) =>
              item.id === bookingId
                ? { ...item, changeRequest: { ...request, status: "rejected" } }
                : item
            ),
          };
        });
        return ok;
      },
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
      addEventRecommendedPartner: (partner) =>
        set((s) => ({
          eventRecommendedPartners: [...s.eventRecommendedPartners, partner],
        })),
      updateEventRecommendedPartner: (id, updates) =>
        set((s) => ({
          eventRecommendedPartners: s.eventRecommendedPartners.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeEventRecommendedPartner: (id) =>
        set((s) => ({
          eventRecommendedPartners: s.eventRecommendedPartners.filter((item) => item.id !== id),
        })),
      addVenueEmployee: (employee) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "venue").allowed) return s;
          return { venueEmployees: [...s.venueEmployees, employee] };
        }),
      updateVenueEmployee: (id, updates) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "venue").allowed) return s;
          return {
            venueEmployees: s.venueEmployees.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          };
        }),
      removeVenueEmployee: (id) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "venue").allowed) return s;
          return { venueEmployees: s.venueEmployees.filter((item) => item.id !== id) };
        }),
      delegateVenueAdmin: (venueId, employeeId) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "venue").allowed) return s;
          return {
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
          };
        }),
      addOrganizerEmployee: (employee) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "organizer").allowed) return s;
          return { organizerEmployees: [...s.organizerEmployees, employee] };
        }),
      updateOrganizerEmployee: (id, updates) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "organizer").allowed) return s;
          return {
            organizerEmployees: s.organizerEmployees.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          };
        }),
      removeOrganizerEmployee: (id) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "organizer").allowed) return s;
          return {
            organizerEmployees: s.organizerEmployees.filter((item) => item.id !== id),
          };
        }),
      delegateOrganizerAdmin: (organizerId, employeeId) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "organizer").allowed) return s;
          return {
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
          };
        }),
      addCustomerEmployee: (employee) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "customer").allowed) return s;
          return { customerEmployees: [...s.customerEmployees, employee] };
        }),
      updateCustomerEmployee: (id, updates) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "customer").allowed) return s;
          return {
            customerEmployees: s.customerEmployees.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          };
        }),
      removeCustomerEmployee: (id) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "customer").allowed) return s;
          return {
            customerEmployees: s.customerEmployees.filter((item) => item.id !== id),
          };
        }),
      delegateCustomerAdmin: (customerId, employeeId) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "customer").allowed) return s;
          return {
          customerEmployees: s.customerEmployees.map((item) => {
            if (item.customerId !== customerId) return item;
            if (item.id === employeeId) {
              return {
                ...item,
                isAdmin: true,
                status: item.status === "invited" ? "pending_edo" : item.status,
                permissions: [
                  "dashboard",
                  "profile",
                  "legal",
                  "edo",
                  "favorites",
                  "cart",
                  "responses",
                  "active-projects",
                  "completed-projects",
                  "checks",
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
          };
        }),
      addContractorEmployee: (employee) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "contractor").allowed) return s;
          return { contractorEmployees: [...s.contractorEmployees, employee] };
        }),
      updateContractorEmployee: (id, updates) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "contractor").allowed) return s;
          return {
            contractorEmployees: s.contractorEmployees.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          };
        }),
      removeContractorEmployee: (id) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "contractor").allowed) return s;
          return {
            contractorEmployees: s.contractorEmployees.filter((item) => item.id !== id),
          };
        }),
      delegateContractorAdmin: (contractorId, employeeId) =>
        set((s) => {
          if (!canManageEmployees(useAuthStore.getState().user, "contractor").allowed) return s;
          return {
          contractorEmployees: s.contractorEmployees.map((item) => {
            if (item.contractorId !== contractorId) return item;
            if (item.id === employeeId) {
              return {
                ...item,
                isAdmin: true,
                status: item.status === "invited" ? "pending_edo" : item.status,
                permissions: [
                  "dashboard",
                  "profile",
                  "cities",
                  "production",
                  "services",
                  "portfolio",
                  "available-requests",
                  "my-responses",
                  "active-projects",
                  "gantt",
                  "completed-projects",
                  "payouts",
                  "documents",
                  "reviews",
                ],
              };
            }
            if (item.isAdmin) {
              return { ...item, isAdmin: false };
            }
            return item;
          }),
          };
        }),
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
      setOrganizerEventDraft: (draft) => set({ organizerEventDraft: draft }),
      updateVenueInquiry: (id, updates) =>
        set((state) => {
          const inquiry = state.venueInquiries.find((item) => item.id === id);
          if (!inquiry) return state;
          const user = useAuthStore.getState().user;
          if (updates.status && updates.status !== inquiry.status) {
            const allowed = canTransitionInquiry(inquiry, user, updates.status, {
              reason: updates.declineReason ?? updates.changeReason,
              hallId: updates.hallId ?? inquiry.hallId,
            });
            if (!allowed.allowed) return state;
          }
          return {
            venueInquiries: state.venueInquiries.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          };
        }),
      addVenueInquiries: (inquiries) =>
        set((state) => {
          const existingIds = new Set(state.venueInquiries.map((item) => item.id));
          const next = inquiries.filter((item) => !existingIds.has(item.id));
          return next.length ? { venueInquiries: [...state.venueInquiries, ...next] } : state;
        }),
      selectVenueInquiry: (inquiryId) => {
        let accepted = false;
        set((state) => {
          const selected = state.venueInquiries.find((item) => item.id === inquiryId);
          const user = useAuthStore.getState().user;
          if (!selected) return state;
          const allowed = canTransitionInquiry(selected, user, "selected");
          if (!allowed.allowed) return state;

          const nextBookings = createBookingsFromInquiry(selected, user?.id ?? "user-organizer");
          const conflict = nextBookings.some(
            (booking) =>
              booking.hallId &&
              isHallOccupied(
                state.bookings,
                booking.hallId,
                booking.periodStart ?? booking.date,
                booking.periodEnd ?? booking.date
              )
          );
          if (conflict) return state;

          accepted = true;
          return {
            venueInquiries: state.venueInquiries.map((item) => {
              if (item.id === inquiryId) return { ...item, status: "selected" as const };
              if (
                item.eventDraftId === selected.eventDraftId &&
                (item.status === "proposal_received" || item.status === "changes_proposed")
              ) {
                return { ...item, status: "declined" as const, declineReason: "Выбрана другая площадка" };
              }
              return item;
            }),
            bookings: [...state.bookings, ...nextBookings],
            organizerEventDraft: state.organizerEventDraft
              ? {
                  ...state.organizerEventDraft,
                  selectedVenueId: selected.venueId,
                  selectedVenueName: selected.venueName,
                }
              : state.organizerEventDraft,
          };
        });
        return accepted;
      },
      setCompanyLogo: (userId, logoUrl) =>
        set((state) => ({
          companyLogos: { ...state.companyLogos, [userId]: logoUrl },
        })),
      getContractorPortfolio: (contractorId) =>
        resolveContractorPortfolio(contractorId, get().contractorPortfolios),
      setContractorPortfolio: (contractorId, portfolio) =>
        set((state) => ({
          contractorPortfolios: { ...state.contractorPortfolios, [contractorId]: portfolio },
        })),
      upsertContractorPortfolioItem: (contractorId, item) =>
        set((state) => {
          const current = resolveContractorPortfolio(contractorId, state.contractorPortfolios);
          const next = current.some((entry) => entry.id === item.id)
            ? current.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...current];
          return {
            contractorPortfolios: { ...state.contractorPortfolios, [contractorId]: next },
          };
        }),
      removeContractorPortfolioItem: (contractorId, itemId) =>
        set((state) => {
          const current = resolveContractorPortfolio(contractorId, state.contractorPortfolios);
          return {
            contractorPortfolios: {
              ...state.contractorPortfolios,
              [contractorId]: current.filter((entry) => entry.id !== itemId),
            },
          };
        }),
      getContractorCatalogs: (contractorId) =>
        get().serviceCatalogs.filter((catalog) => catalog.contractorId === contractorId),
      upsertServiceCatalog: (catalog) =>
        set((state) => {
          const exists = state.serviceCatalogs.some((entry) => entry.id === catalog.id);
          return {
            serviceCatalogs: exists
              ? state.serviceCatalogs.map((entry) => (entry.id === catalog.id ? catalog : entry))
              : [catalog, ...state.serviceCatalogs],
          };
        }),
      removeServiceCatalog: (id) =>
        set((state) => ({
          serviceCatalogs: state.serviceCatalogs.filter((catalog) => catalog.id !== id),
        })),
      addProjectTimelineRow: (row) =>
        set((state) => ({
          projectTimelineRows: [...state.projectTimelineRows, row],
        })),
      updateProjectTimelineRow: (id, updates) =>
        set((state) => ({
          projectTimelineRows: state.projectTimelineRows.map((row) =>
            row.id === id ? { ...row, ...updates } : row
          ),
        })),
      removeProjectTimelineRow: (id) =>
        set((state) => ({
          projectTimelineRows: state.projectTimelineRows.filter((row) => row.id !== id),
        })),
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
          eventRecommendedPartners: fresh.eventRecommendedPartners,
          venueEmployees: fresh.venueEmployees,
          organizerEmployees: fresh.organizerEmployees,
          customerEmployees: fresh.customerEmployees,
          contractorEmployees: fresh.contractorEmployees,
          venueEventMeta: fresh.venueEventMeta,
          venueProfileMedia: fresh.venueProfileMedia,
          compareResponseIds: [],
          registrationDraft: {},
          requestWizardDraft: {},
          organizerEventDraft: null,
          venueInquiries: fresh.venueInquiries,
          contractorPortfolios: {},
          serviceCatalogs: [],
          projectTimelineRows: [],
        });
      },
    }),
    {
      name: "prototype-storage",
      partialize: (state) => {
        const { registrationDraft: _registrationDraft, ...rest } = state;
        return rest;
      },
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        const persisted = persistedState as Partial<PrototypeState>;
        const fresh = getSeedData();
        return {
          ...currentState,
          ...persisted,
          registrationDraft: {},
          companyLogos: sanitizeCompanyLogos(persisted.companyLogos),
          contractorPortfolios: persisted.contractorPortfolios ?? {},
          requests: mergeRequestsById(persisted.requests, fresh.requests),
          deals: mergeDealsById(persisted.deals, fresh.deals),
          venueServices: mergeById(persisted.venueServices, fresh.venueServices),
          organizerEventServices: mergeOrganizerEventServicesById(
            persisted.organizerEventServices,
            fresh.organizerEventServices
          ),
          eventRecommendedPartners: mergeById(
            persisted.eventRecommendedPartners,
            fresh.eventRecommendedPartners
          ),
          venueEmployees: mergeById(persisted.venueEmployees, fresh.venueEmployees),
          organizerEmployees: mergeById(persisted.organizerEmployees, fresh.organizerEmployees),
          customerEmployees: mergeById(persisted.customerEmployees, fresh.customerEmployees),
          contractorEmployees: mergeById(persisted.contractorEmployees, fresh.contractorEmployees),
          venueEventMeta: mergeById(persisted.venueEventMeta, fresh.venueEventMeta),
          venueProfileMedia: mergeById(persisted.venueProfileMedia, fresh.venueProfileMedia),
          venueInquiries: mergeById(persisted.venueInquiries, fresh.venueInquiries),
          documents: overlaySeedRecords(persisted.documents, fresh.documents, ["status"]),
          payments: overlaySeedRecords(persisted.payments, fresh.payments, ["status"]),
          participants: mergeParticipantsById(persisted.participants, fresh.participants),
          bookings: mergeBookingsById(persisted.bookings, fresh.bookings),
          floorCells: overlaySeedRecords(persisted.floorCells, fresh.floorCells, ["status"]),
          messages: mergeMessageThreads(persisted.messages, fresh.messages),
          notifications: mergeNotificationsById(persisted.notifications, fresh.notifications),
        };
      },
    }
  )
);

export function resetAllStores() {
  usePrototypeStore.getState().resetToSeed();
  useCartStore.getState().clearCart();
  useFavoritesStore.setState({
    serviceIds: [],
    eventIds: [],
    contractorIds: [],
    venueIds: [],
  });
  useAuthStore.getState().logout();
}
