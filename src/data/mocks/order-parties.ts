import type { Deal, Document, Event, EventOrder } from "../types/index.ts";

export const ORG_DISPLAY_NAMES: Record<string, string> = {
  "user-customer": "ООО «Вымышленная Мебель»",
  "ctr-1": "ООО «СтендПро»",
  "ctr-2": "ООО «ДизайнСтенд»",
  "ctr-3": "ООО «МедиаРент»",
  "ctr-4": "ООО «МебельЭкспо»",
  "ctr-6": "ООО «ФлораДекор»",
  "venue-1": "ЭкспоЦентр",
  "user-venue": "АО «ЭкспоЦентр Вымышленный»",
  "user-organizer": "ООО «МебельЭкспо Организатор»",
  "user-organizer-forum": "ООО «IT Forum Организатор»",
  "org-tehnovision": "ООО «ТехноВижн»",
  "org-expogen": "ООО «ЭкспоГенСтрой»",
  "org-lightstroy": "ООО «ЛайтСтрой»",
};

export const EVENT_ORDER_PARTY_SEED: Record<
  string,
  Pick<
    EventOrder,
    | "buyerOrgId"
    | "sellerOrgId"
    | "serviceProviderOrgId"
    | "customerOrgId"
    | "eventOrganizerOrgId"
    | "venueOrgId"
  >
> = {
  "eord-1": {
    buyerOrgId: "user-organizer",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "user-organizer",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-2": {
    buyerOrgId: "user-customer",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "user-customer",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-3": {
    buyerOrgId: "ctr-1",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "ctr-1",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-4": {
    buyerOrgId: "user-customer",
    sellerOrgId: "user-organizer",
    serviceProviderOrgId: "user-organizer",
    customerOrgId: "user-customer",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-5": {
    buyerOrgId: "user-organizer",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "user-organizer",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-6": {
    buyerOrgId: "ctr-2",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "ctr-2",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-7": {
    buyerOrgId: "org-expogen",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "org-expogen",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-8": {
    buyerOrgId: "user-organizer",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "user-organizer",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-9": {
    buyerOrgId: "org-tehnovision",
    sellerOrgId: "user-organizer",
    serviceProviderOrgId: "user-organizer",
    customerOrgId: "org-tehnovision",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-10": {
    buyerOrgId: "ctr-1",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "ctr-1",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-11": {
    buyerOrgId: "org-lightstroy",
    sellerOrgId: "venue-1",
    serviceProviderOrgId: "venue-1",
    customerOrgId: "org-lightstroy",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
  "eord-12": {
    buyerOrgId: "user-customer",
    sellerOrgId: "ctr-1",
    serviceProviderOrgId: "ctr-1",
    customerOrgId: "user-customer",
    eventOrganizerOrgId: "user-organizer",
    venueOrgId: "venue-1",
  },
};

export function hydrateEventOrder(order: EventOrder, event?: Event): EventOrder {
  const seeded = EVENT_ORDER_PARTY_SEED[order.id];
  return {
    ...order,
    ...seeded,
    eventOrganizerOrgId: seeded?.eventOrganizerOrgId ?? event?.organizerId,
    venueOrgId: seeded?.venueOrgId ?? order.venueId ?? event?.venueId,
  };
}

export function hydrateDeal(deal: Deal, event?: Event): Deal {
  return {
    ...deal,
    buyerOrgId: deal.buyerOrgId ?? deal.customerId,
    sellerOrgId: deal.sellerOrgId ?? deal.contractorId,
    serviceProviderOrgId: deal.serviceProviderOrgId ?? deal.contractorId,
    customerOrgId: deal.customerOrgId ?? deal.customerId,
    eventOrganizerOrgId: deal.eventOrganizerOrgId ?? event?.organizerId,
    venueOrgId: deal.venueOrgId ?? event?.venueId,
  };
}

export function hydrateDocument(document: Document, deal?: Deal): Document {
  if (document.buyerOrgId && document.sellerOrgId) return document;
  if (deal) {
    return {
      ...document,
      buyerOrgId: deal.buyerOrgId ?? deal.customerId,
      sellerOrgId: deal.sellerOrgId ?? deal.contractorId,
    };
  }
  if (document.orderId && EVENT_ORDER_PARTY_SEED[document.orderId]) {
    const order = EVENT_ORDER_PARTY_SEED[document.orderId];
    return {
      ...document,
      buyerOrgId: order.buyerOrgId,
      sellerOrgId: order.sellerOrgId,
    };
  }
  return document;
}
