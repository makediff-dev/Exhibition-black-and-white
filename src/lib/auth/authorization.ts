/**
 * Demo authorization adapter (frontend-only).
 * Not a production security boundary: there is no server enforcement.
 */
import type {
  CompanyProfile,
  Deal,
  Document,
  Event,
  EventOrder,
  Payment,
  Request,
  Response,
  UserRole,
} from "../../data/types/index.ts";
import { canPerformRequestAction, getRequestLifecycleCode } from "../state/request-machine.ts";
import {
  contractorMatchesRequestCategory,
  contractorMatchesRequestCity,
  isContractorInvitedToRequest,
} from "./contractor-fit.ts";
import { canViewEntity, getViewerOrganizationIds, hydrateEventOrder, isViewerDealParty } from "./parties.ts";
import { canonicalizeEntityId } from "../domain/entity-ref.ts";
import {
  getContractorIdForUser,
  getVenueIdForUser,
  isDealForUser,
} from "../utils/user-entity-map.ts";

export const AUTH_PRODUCTION_LIMITATION =
  "Authorization is a client-side demo adapter. Production requires server checks on route, read, and mutation.";

export type AccessCode =
  | "ok"
  | "unauthenticated"
  | "forbidden_role"
  | "forbidden_object"
  | "forbidden_path"
  | "forbidden_action";

export interface AccessDecision {
  allowed: boolean;
  code: AccessCode;
  reason: string;
}

export const ACCOUNT_ROLES: Exclude<UserRole, null>[] = [
  "customer",
  "contractor",
  "venue",
  "organizer",
];

const CABINET_PATHS: Record<string, string[]> = {
  customer: [
    "profile",
    "messages",
    "edo",
    "requests",
    "my-events",
    "favorites",
    "cart",
    "checkout",
    "legal",
    "repeat-order",
    "completed-projects",
    "reminders",
    "closing-docs",
    "responses",
    "active-projects",
    "checks",
    "payments",
    "settings",
  ],
  contractor: [
    "profile",
    "messages",
    "services",
    "available-requests",
    "my-responses",
    "active-projects",
    "payouts",
    "documents",
    "settings",
    "cities",
    "production",
    "portfolio",
    "reviews",
    "gantt",
    "completed-projects",
    "bookings",
  ],
  venue: [
    "profile",
    "messages",
    "halls",
    "events",
    "venue-services",
    "bookings",
    "orders",
    "payments",
    "documents",
    "settings",
    "spaces",
    "floor-plan",
  ],
  organizer: [
    "profile",
    "messages",
    "events",
    "venues",
    "orders",
    "payments",
    "documents",
    "settings",
    "create-event",
    "edit-event",
    "participants",
    "services",
    "bookings",
  ],
};

const ok = (): AccessDecision => ({ allowed: true, code: "ok", reason: "" });

function deny(code: AccessCode, reason: string): AccessDecision {
  return { allowed: false, code, reason };
}

export function getActiveOrganizationId(user: CompanyProfile | null | undefined): string | null {
  if (!user?.role) return null;
  if (user.role === "venue") return getVenueIdForUser(user);
  if (user.role === "contractor") return getContractorIdForUser(user) ?? user.id;
  return user.id;
}

export function isAccountRole(role: string | null | undefined): role is Exclude<UserRole, null> {
  return Boolean(role && ACCOUNT_ROLES.includes(role as Exclude<UserRole, null>));
}

export function canAccessCabinet(
  user: CompanyProfile | null | undefined,
  routeRole: string
): AccessDecision {
  if (!user?.role) {
    return deny("unauthenticated", "Войдите, чтобы открыть кабинет.");
  }
  if (!isAccountRole(routeRole)) {
    return deny("forbidden_path", "Такого кабинета нет.");
  }
  if (user.role !== routeRole) {
    return deny(
      "forbidden_role",
      "Этот кабинет относится к другой роли. В сессии может быть только одна рабочая роль."
    );
  }
  return ok();
}

export function isAllowedCabinetPath(role: string, slug: string): boolean {
  const base = slug.split("/")[0] ?? "";
  if (!base) return true;
  return (CABINET_PATHS[role] ?? []).includes(base);
}

export function canAccessCabinetPath(
  user: CompanyProfile | null | undefined,
  routeRole: string,
  slug: string
): AccessDecision {
  const cabinet = canAccessCabinet(user, routeRole);
  if (!cabinet.allowed) return cabinet;
  if (!isAllowedCabinetPath(routeRole, slug)) {
    return deny("forbidden_path", "В вашем кабинете нет этого раздела.");
  }
  return ok();
}

function parsePartyRoles(parties: string): {
  customer: boolean;
  contractor: boolean;
  venue: boolean;
  organizer: boolean;
} {
  const text = parties.toLowerCase();
  return {
    customer: text.includes("заказчик") || text.includes("экспонент"),
    contractor: text.includes("исполнитель") || text.includes("застройщик"),
    venue: text.includes("площадка"),
    organizer: text.includes("организатор"),
  };
}

export function canReadEventOrder(
  user: CompanyProfile | null | undefined,
  order: EventOrder | undefined,
  deals: Deal[],
  events: Event[]
): AccessDecision {
  if (!user?.role) return deny("unauthenticated", "Войдите, чтобы открыть заказ.");
  if (!order) return deny("forbidden_object", "Заказ не найден.");

  const event = events.find((item) => item.id === order.eventId);
  const hydrated = hydrateEventOrder(order, event);
  if (canViewEntity({ type: "order", order: hydrated }, user)) return ok();

  if (hydrated.dealId) {
    const deal = deals.find((item) => item.id === hydrated.dealId);
    if (deal && canReadDeal(user, deal).allowed && isViewerDealParty(deal, user)) {
      return ok();
    }
  }

  return deny("forbidden_object", "Заказ доступен только организациям, которые являются его сторонами.");
}

export function canMutateEventOrder(
  user: CompanyProfile | null | undefined,
  order: EventOrder | undefined,
  deals: Deal[],
  events: Event[]
): AccessDecision {
  const readable = canReadEventOrder(user, order, deals, events);
  if (!readable.allowed) {
    return deny("forbidden_action", readable.reason || "Нельзя изменить чужой заказ.");
  }
  return ok();
}

export function canReadDeal(
  user: CompanyProfile | null | undefined,
  deal: Deal | undefined
): AccessDecision {
  if (!user?.role) return deny("unauthenticated", "Войдите, чтобы открыть сделку.");
  if (!deal) return deny("forbidden_object", "Сделка не найдена.");
  if (!isDealForUser(deal, user) && !isViewerDealParty(deal, user)) {
    return deny("forbidden_object", "Сделка доступна только её сторонам.");
  }
  return ok();
}

export function canMutateDeal(
  user: CompanyProfile | null | undefined,
  deal: Deal | undefined
): AccessDecision {
  const readable = canReadDeal(user, deal);
  if (!readable.allowed) {
    return deny("forbidden_action", readable.reason || "Нельзя изменить чужую сделку.");
  }
  return ok();
}

export function canReadDocument(
  document: Document,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): boolean {
  return inspectDocumentAccess(document, user, deals, "read").allowed;
}

export function canMutateDocument(
  document: Document,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): AccessDecision {
  return inspectDocumentAccess(document, user, deals, "mutate");
}

function inspectDocumentAccess(
  document: Document,
  user: CompanyProfile | null | undefined,
  deals: Deal[],
  mode: "read" | "mutate"
): AccessDecision {
  if (!user?.role) {
    return deny("unauthenticated", "Войдите, чтобы работать с документами.");
  }

  const deal = document.dealId ? deals.find((item) => item.id === document.dealId) : undefined;
  if (canViewEntity({ type: "document", document, deal }, user)) {
    return ok();
  }

  const sides = parsePartyRoles(document.parties);
  const dealParty = Boolean(deal && isDealForUser(deal, user));

  if (user.role === "customer") {
    const allowed = sides.customer && dealParty;
    return allowed
      ? ok()
      : deny("forbidden_object", "Документ доступен только сторонам.");
  }

  if (user.role === "contractor") {
    const allowed = sides.contractor && dealParty;
    return allowed
      ? ok()
      : deny("forbidden_object", "Документ доступен только сторонам.");
  }

  if (user.role === "venue") {
    const allowed = sides.venue && document.venueId === getVenueIdForUser(user);
    return allowed
      ? ok()
      : deny("forbidden_object", "Площадка видит только документы, где она сторона.");
  }

  if (user.role === "organizer") {
    const allowed = sides.organizer && document.organizerId === user.id;
    return allowed
      ? ok()
      : deny("forbidden_object", "Организатор видит только документы, где он сторона.");
  }

  return mode === "mutate"
    ? deny("forbidden_action", "Недостаточно прав для изменения документа.")
    : deny("forbidden_object", "Нет доступа к документу.");
}

export function canReadPayment(
  payment: Payment,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): boolean {
  if (!user?.role) return false;

  const viewerOrgs = getViewerOrganizationIds(user);
  if (
    (payment.payerOrgId && viewerOrgs.includes(payment.payerOrgId)) ||
    (payment.payeeOrgId && viewerOrgs.includes(payment.payeeOrgId))
  ) {
    return true;
  }

  if (user.role === "venue") {
    return payment.venueId === getVenueIdForUser(user);
  }

  if (user.role === "organizer") {
    return payment.organizerId === user.id;
  }

  if (payment.venueId || payment.organizerId) {
    return false;
  }

  const deal = payment.dealId ? deals.find((item) => item.id === payment.dealId) : undefined;
  return Boolean(deal && isDealForUser(deal, user));
}

export function canMutatePayment(
  payment: Payment,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): AccessDecision {
  if (!canReadPayment(payment, user, deals)) {
    return deny("forbidden_action", "Нельзя изменить чужой платёж или счёт.");
  }
  return ok();
}

export function isRequestVisibleToContractor(
  request: Request,
  user: CompanyProfile | null | undefined,
  responses: Response[] = [],
  deals: Deal[] = []
): boolean {
  if (!user || user.role !== "contractor") return false;
  if (request.status !== "published") return false;
  if (getRequestLifecycleCode(request, responses, deals) === "expired") return false;

  if (request.format === "closed_request") {
    return isContractorInvitedToRequest(request, user);
  }

  return contractorMatchesRequestCategory(request, user) && contractorMatchesRequestCity(request, user);
}

export function canCreateRequest(user: CompanyProfile | null | undefined): AccessDecision {
  if (!user?.role) return deny("unauthenticated", "Войдите, чтобы создать заявку.");
  if (user.role !== "customer") {
    return deny("forbidden_role", "Заявку размещает заказчик. Сейчас активна другая роль.");
  }
  return ok();
}

export function canSubmitProposal(
  user: CompanyProfile | null | undefined,
  request: Request | undefined,
  responses: Response[] = [],
  deals: Deal[] = []
): AccessDecision {
  if (!user?.role) return deny("unauthenticated", "Войдите, чтобы отправить отклик.");
  if (!request) return deny("forbidden_object", "Заявка не найдена.");
  if (!isRequestVisibleToContractor(request, user, responses, deals)) {
    return deny("forbidden_action", "Эта заявка недоступна вашему профилю.");
  }
  if (!contractorMatchesRequestCategory(request, user)) {
    return deny(
      "forbidden_action",
      "Категория заявки не входит в вашу специализацию. Сначала расширьте профиль."
    );
  }
  const timeline = canPerformRequestAction(request, user, "submit_proposal", responses, deals);
  if (!timeline.allowed) {
    return deny("forbidden_action", timeline.reason);
  }
  return ok();
}

export function canManageEmployees(
  user: CompanyProfile | null | undefined,
  organizationRole: Exclude<UserRole, null>
): AccessDecision {
  if (!user?.role) return deny("unauthenticated", "Войдите, чтобы управлять сотрудниками.");
  if (user.role !== organizationRole) {
    return deny("forbidden_action", "Сотрудниками управляет только администратор своей организации.");
  }
  return ok();
}

export function canContactVenue(
  user: CompanyProfile | null | undefined,
  venueId: string
): AccessDecision {
  if (!user?.role) {
    return deny("unauthenticated", "Войдите, чтобы связаться с площадкой.");
  }
  if (
    user.role === "venue" &&
    canonicalizeEntityId("venue", getVenueIdForUser(user)) === canonicalizeEntityId("venue", venueId)
  ) {
    return deny("forbidden_role", "Это ваша площадка.");
  }
  if (user.role === "customer" || user.role === "organizer") {
    return ok();
  }
  return deny(
    "forbidden_role",
    "С площадкой связывается заказчик или организатор. Добавление второй роли в этой сессии недоступно."
  );
}
