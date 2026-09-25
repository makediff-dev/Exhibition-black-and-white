import type { CompanyProfile, Deal, Payment, Request, Response } from "../../data/types/index.ts";
import { isDealForUser } from "../utils/user-entity-map.ts";
import { getDealLifecycleCode } from "./deal-machine.ts";
import { isOpenInvoice } from "./payment-machine.ts";
import { getRequestLifecycleCode } from "./request-machine.ts";
import { isRequestVisibleToContractor } from "../auth/authorization.ts";
import { contractorMatchesRequestCategory } from "../auth/contractor-fit.ts";

export function isActiveCustomerRequest(
  request: Request,
  responses: Response[],
  deals: Deal[]
): boolean {
  return getRequestLifecycleCode(request, responses, deals) === "collecting_proposals";
}

export function countDashboardRequests(
  requests: Request[],
  responses: Response[],
  deals: Deal[],
  user: CompanyProfile | null | undefined
): number {
  if (user?.role === "contractor") {
    return requests.filter(
      (request) =>
        isRequestVisibleToContractor(request, user, responses, deals) &&
        contractorMatchesRequestCategory(request, user)
    ).length;
  }
  return requests.filter(
    (request) => request.customerId === user?.id && isActiveCustomerRequest(request, responses, deals)
  ).length;
}

export function isOpenDeal(deal: Deal): boolean {
  const code = getDealLifecycleCode(deal);
  return code !== "completed";
}

export function countDashboardDeals(deals: Deal[], user: CompanyProfile | null | undefined): number {
  return deals.filter((deal) => isDealForUser(deal, user) && isOpenDeal(deal)).length;
}

export function countOpenInvoices(
  payments: Payment[],
  direction: "incoming" | "outgoing"
): number {
  return payments.filter((payment) => isOpenInvoice(payment) && payment.direction === direction).length;
}

export function requestListTab(request: Request, responses: Response[], deals: Deal[]): string {
  const code = getRequestLifecycleCode(request, responses, deals);
  if (code === "draft") return "draft";
  if (code === "collecting_proposals") return "published";
  if (code === "expired") return "expired";
  if (code === "contractor_selected" || code === "converted_to_order") return "in_progress";
  return "completed";
}
