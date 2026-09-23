import { SEED_CONTRACTORS } from "../../data/mocks/seed.ts";
import type { CompanyProfile, Deal, Response } from "../../data/types/index.ts";

const USER_TO_CONTRACTOR_ID: Record<string, string> = {
  "user-contractor": "ctr-1",
  "user-contractor-media": "ctr-3",
};

const USER_TO_VENUE_ID: Record<string, string> = {
  "user-venue": "venue-1",
};

export function getContractorIdForUser(user: CompanyProfile | null | undefined): string | null {
  if (!user || user.role !== "contractor") return null;
  if (USER_TO_CONTRACTOR_ID[user.id]) return USER_TO_CONTRACTOR_ID[user.id];
  const byName = SEED_CONTRACTORS.find((contractor) => contractor.name === user.name);
  return byName?.id ?? null;
}

export function getVenueIdForUser(user: CompanyProfile | null | undefined): string {
  if (!user || user.role !== "venue") return "venue-1";
  return USER_TO_VENUE_ID[user.id] ?? "venue-1";
}

export function findContractorForUser(user: CompanyProfile | null | undefined) {
  const contractorId = getContractorIdForUser(user);
  if (contractorId) {
    return SEED_CONTRACTORS.find((contractor) => contractor.id === contractorId) ?? null;
  }
  if (!user?.name) return null;
  return SEED_CONTRACTORS.find((contractor) => contractor.name === user.name) ?? null;
}

export function isDealForUser(deal: Deal, user: CompanyProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "customer") return deal.customerId === user.id;
  if (user.role === "contractor") {
    const contractorId = getContractorIdForUser(user);
    return (
      (contractorId !== null && deal.contractorId === contractorId) ||
      deal.contractorName === user.name
    );
  }
  return false;
}

export function isResponseForUser(response: Response, user: CompanyProfile | null | undefined): boolean {
  if (!user || user.role !== "contractor") return false;
  const contractorId = getContractorIdForUser(user);
  return (
    (contractorId !== null && response.contractorId === contractorId) ||
    response.contractorName === user.name
  );
}
