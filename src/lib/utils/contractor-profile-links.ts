import type { UserRole } from "@/data/types";

const ACCOUNT_ROLES = new Set<UserRole>(["customer", "contractor", "venue", "organizer"]);

interface ContractorProfileLinkOptions {
  role?: UserRole | null;
  from?: string;
  requestId?: string;
  responseId?: string;
}

function buildQuery(options?: ContractorProfileLinkOptions) {
  const params = new URLSearchParams();
  if (options?.from) params.set("from", options.from);
  if (options?.requestId) params.set("requestId", options.requestId);
  if (options?.responseId) params.set("responseId", options.responseId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getContractorProfileHref(
  contractorId: string,
  options?: ContractorProfileLinkOptions
) {
  const suffix = buildQuery(options);

  if (options?.role && ACCOUNT_ROLES.has(options.role)) {
    return `/account/${options.role}/contractors/${contractorId}${suffix}`;
  }

  return `/contractors/${contractorId}${suffix}`;
}

export function getContractorPortfolioHref(
  contractorId: string,
  itemId: string,
  role?: UserRole | null
) {
  if (role && ACCOUNT_ROLES.has(role)) {
    return `/account/${role}/contractors/${contractorId}/portfolio/${itemId}`;
  }

  return `/contractors/${contractorId}/portfolio/${itemId}`;
}

export function getContractorCheckHref(
  contractorId: string,
  options?: Pick<ContractorProfileLinkOptions, "role">
) {
  if (options?.role && ACCOUNT_ROLES.has(options.role)) {
    return `/account/${options.role}/contractors/${contractorId}/check`;
  }

  return `/contractors/${contractorId}/check`;
}

export function getContractorCheckSubscribeHref(
  contractorId: string,
  options?: ContractorProfileLinkOptions
) {
  const suffix = buildQuery(options);

  if (options?.role && ACCOUNT_ROLES.has(options.role)) {
    return `/account/${options.role}/contractors/${contractorId}/check/subscribe${suffix}`;
  }

  return `/contractors/${contractorId}/check/subscribe${suffix}`;
}

export function parseContractorAccountSlug(slug: string) {
  const parts = slug.split("/");

  if (parts[0] !== "contractors" || !parts[1]) {
    return null;
  }

  if (parts[2] === "check" && parts[3] === "subscribe") {
    return {
      type: "checkSubscribe" as const,
      contractorId: parts[1],
    };
  }

  if (parts[2] === "check") {
    return {
      type: "check" as const,
      contractorId: parts[1],
    };
  }

  if (parts[2] === "portfolio" && parts[3]) {
    return {
      type: "portfolio" as const,
      contractorId: parts[1],
      itemId: parts[3],
    };
  }

  if (parts.length === 2) {
    return {
      type: "profile" as const,
      contractorId: parts[1],
    };
  }

  return null;
}
