import type {
  CompanyProfile,
  Deal,
  Document,
  EventOrder,
  Payment,
} from "../../data/types/index.ts";
import {
  EVENT_ORDER_PARTY_SEED,
  ORG_DISPLAY_NAMES,
  hydrateDeal,
  hydrateDocument,
  hydrateEventOrder,
} from "../../data/mocks/order-parties.ts";
import { getContractorIdForUser, getVenueIdForUser } from "../utils/user-entity-map.ts";
import type { ActionCode } from "../state/types.ts";

export {
  EVENT_ORDER_PARTY_SEED,
  ORG_DISPLAY_NAMES,
  hydrateDeal,
  hydrateDocument,
  hydrateEventOrder,
};

export function getViewerOrganizationIds(user: CompanyProfile | null | undefined): string[] {
  if (!user?.id) return [];
  const ids = new Set<string>([user.id]);
  if (user.role === "venue") ids.add(getVenueIdForUser(user));
  if (user.role === "contractor") {
    const contractorId = getContractorIdForUser(user);
    if (contractorId) ids.add(contractorId);
  }
  return [...ids];
}

export function getOrganizationDisplayName(orgId: string | undefined): string {
  if (!orgId) return "Контрагент";
  return ORG_DISPLAY_NAMES[orgId] ?? orgId;
}

export function getOrderPartyOrgIds(order: EventOrder): string[] {
  return uniqueIds([
    order.buyerOrgId,
    order.sellerOrgId,
    order.serviceProviderOrgId,
    order.customerOrgId,
  ]);
}

export function getDealPartyOrgIds(deal: Deal): string[] {
  return uniqueIds([
    deal.buyerOrgId ?? deal.customerId,
    deal.sellerOrgId ?? deal.contractorId,
    deal.serviceProviderOrgId ?? deal.contractorId,
    deal.customerOrgId ?? deal.customerId,
  ]);
}

export function isViewerOrderParty(order: EventOrder, user: CompanyProfile | null | undefined): boolean {
  return intersects(getViewerOrganizationIds(user), getOrderPartyOrgIds(order));
}

export function isViewerDealParty(deal: Deal, user: CompanyProfile | null | undefined): boolean {
  return intersects(getViewerOrganizationIds(user), getDealPartyOrgIds(deal));
}

export function getOrderDirection(
  order: EventOrder,
  viewerOrgId: string | null | undefined
): "buy" | "sell" | null {
  if (!viewerOrgId) return null;
  if (order.buyerOrgId === viewerOrgId || order.customerOrgId === viewerOrgId) return "buy";
  if (order.sellerOrgId === viewerOrgId || order.serviceProviderOrgId === viewerOrgId) return "sell";
  return null;
}

export function getOrderDirectionForUser(
  order: EventOrder,
  user: CompanyProfile | null | undefined
): "buy" | "sell" | null {
  for (const orgId of getViewerOrganizationIds(user)) {
    const direction = getOrderDirection(order, orgId);
    if (direction) return direction;
  }
  return null;
}

export function getCounterparty(
  order: EventOrder,
  viewerOrgId: string | null | undefined
): { orgId: string; name: string } | null {
  const direction = getOrderDirection(order, viewerOrgId);
  if (!direction) return null;
  const orgId = direction === "buy" ? order.sellerOrgId : order.buyerOrgId;
  if (!orgId || orgId === viewerOrgId) return null;
  return { orgId, name: getOrganizationDisplayName(orgId) };
}

export function getCounterpartyForUser(
  order: EventOrder,
  user: CompanyProfile | null | undefined
): { orgId: string; name: string } | null {
  for (const orgId of getViewerOrganizationIds(user)) {
    const counterparty = getCounterparty(order, orgId);
    if (counterparty && counterparty.name !== user?.name) return counterparty;
  }
  return null;
}

export function getAvailableActions(
  order: EventOrder,
  viewerOrgId: string | null | undefined
): ActionCode[] {
  if (!viewerOrgId || !getOrderDirection(order, viewerOrgId)) return [];
  const direction = getOrderDirection(order, viewerOrgId);
  if (order.status === "pending" && direction === "sell") return ["confirm_booking"];
  if (order.status === "awaiting_payment" && direction === "buy") return ["pay"];
  return [];
}

export function canTransition(
  order: EventOrder,
  action: ActionCode,
  viewerOrgId: string | null | undefined
): boolean {
  return getAvailableActions(order, viewerOrgId).includes(action);
}

export function canViewEntity(
  entity:
    | { type: "order"; order: EventOrder }
    | { type: "deal"; deal: Deal }
    | { type: "document"; document: Document; deal?: Deal }
    | { type: "payment"; payment: Payment; deal?: Deal },
  user: CompanyProfile | null | undefined
): boolean {
  if (!user) return false;
  const viewerIds = getViewerOrganizationIds(user);

  if (entity.type === "order") return isViewerOrderParty(entity.order, user);
  if (entity.type === "deal") return isViewerDealParty(entity.deal, user);

  if (entity.type === "document") {
    const ids = uniqueIds([
      entity.document.buyerOrgId,
      entity.document.sellerOrgId,
      entity.document.organizerId,
      entity.document.venueId,
      ...(entity.deal ? getDealPartyOrgIds(entity.deal) : []),
    ]);
    return intersects(viewerIds, ids);
  }

  const payment = entity.payment;
  const ids = uniqueIds([
    payment.venueId,
    payment.organizerId,
    ...(entity.deal ? getDealPartyOrgIds(entity.deal) : []),
  ]);
  return intersects(viewerIds, ids);
}

function uniqueIds(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function intersects(left: string[], right: string[]): boolean {
  return left.some((id) => right.includes(id));
}
