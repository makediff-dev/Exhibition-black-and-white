import type { CompanyProfile, Request } from "../../data/types/index.ts";
import { findContractorForUser, getContractorIdForUser } from "../utils/user-entity-map.ts";

export function getContractorConfirmedCategories(user: CompanyProfile | null | undefined): Set<string> {
  const contractor = findContractorForUser(user);
  const fromCard = contractor?.categories ?? [];
  const fromUser = user?.categories ?? [];
  return new Set([...fromCard, ...fromUser].map((item) => item.trim()).filter(Boolean));
}

export function contractorMatchesRequestCategory(
  request: Request,
  user: CompanyProfile | null | undefined
): boolean {
  if (!user || !request.category) return false;
  return getContractorConfirmedCategories(user).has(request.category.trim());
}

export function contractorMatchesRequestCity(
  request: Request,
  user: CompanyProfile | null | undefined
): boolean {
  const contractor = findContractorForUser(user);
  const cities = new Set([...(user?.cities ?? []), ...(contractor?.city ? [contractor.city] : [])]);
  if (cities.size === 0) return false;
  return [request.city, ...(request.cities ?? [])].some((city) => city && cities.has(city));
}

export function isContractorInvitedToRequest(
  request: Request,
  user: CompanyProfile | null | undefined
): boolean {
  const contractorId = getContractorIdForUser(user);
  return Boolean(contractorId && request.invitedContractorIds.includes(contractorId));
}
