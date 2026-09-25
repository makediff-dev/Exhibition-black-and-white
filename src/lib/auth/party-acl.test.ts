import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_USERS,
  SEED_DEALS,
  SEED_DOCUMENTS,
  SEED_EVENT_ORDERS,
  SEED_EVENTS,
  SEED_PAYMENTS,
} from "../../data/mocks/seed.ts";
import {
  canMutateDeal,
  canMutateEventOrder,
  canReadDeal,
  canReadDocument,
  canReadEventOrder,
  canReadPayment,
} from "./authorization.ts";
import {
  canTransition,
  getAvailableActions,
  getCounterparty,
  getOrderDirection,
  getViewerOrganizationIds,
} from "./parties.ts";

const deal1 = SEED_DEALS.find((item) => item.id === "deal-1");
const stand = SEED_EVENT_ORDERS.find((item) => item.id === "eord-12");
const pavilion = SEED_EVENT_ORDERS.find((item) => item.id === "eord-1");
const exhibitorSpace = SEED_EVENT_ORDERS.find((item) => item.id === "eord-4");
assert.ok(deal1 && stand && pavilion && exhibitorSpace);

test("deal-1 is visible to customer and StandPro, not to venue or organizer as a party", () => {
  assert.equal(canReadDeal(DEMO_USERS.customer, deal1).allowed, true);
  assert.equal(canReadDeal(DEMO_USERS.contractor, deal1).allowed, true);
  assert.equal(canReadDeal(DEMO_USERS.venue, deal1).allowed, false);
  assert.equal(canReadDeal(DEMO_USERS.organizer, deal1).allowed, false);
  assert.equal(canMutateDeal(DEMO_USERS.venue, deal1).allowed, false);
  assert.equal(canMutateDeal(DEMO_USERS.organizer, deal1).allowed, false);
});

test("venue and organizer order lists differ and exclude stand_build deal-1", () => {
  const venueOrders = SEED_EVENT_ORDERS.filter(
    (order) => canReadEventOrder(DEMO_USERS.venue, order, SEED_DEALS, SEED_EVENTS).allowed
  );
  const organizerOrders = SEED_EVENT_ORDERS.filter(
    (order) => canReadEventOrder(DEMO_USERS.organizer, order, SEED_DEALS, SEED_EVENTS).allowed
  );

  assert.equal(venueOrders.some((order) => order.id === "eord-12"), false);
  assert.equal(organizerOrders.some((order) => order.id === "eord-12"), false);
  assert.equal(venueOrders.some((order) => order.id === "eord-1"), true);
  assert.equal(organizerOrders.some((order) => order.id === "eord-1"), true);
  assert.equal(venueOrders.some((order) => order.id === "eord-4"), false);
  assert.equal(organizerOrders.some((order) => order.id === "eord-4"), true);
  assert.notDeepEqual(
    venueOrders.map((order) => order.id).sort(),
    organizerOrders.map((order) => order.id).sort()
  );
});

test("buyer sees seller and seller sees buyer; self-counterparty is impossible", () => {
  assert.equal(getOrderDirection(stand, "user-customer"), "buy");
  assert.equal(getOrderDirection(stand, "ctr-1"), "sell");
  assert.equal(getCounterparty(stand, "user-customer")?.orgId, "ctr-1");
  assert.equal(getCounterparty(stand, "ctr-1")?.orgId, "user-customer");
  assert.notEqual(getCounterparty(stand, "user-customer")?.name, DEMO_USERS.customer.name);
  assert.notEqual(getCounterparty(stand, "ctr-1")?.name, DEMO_USERS.contractor.name);

  assert.equal(canReadEventOrder(DEMO_USERS.customer, stand, SEED_DEALS, SEED_EVENTS).allowed, true);
  assert.equal(canReadEventOrder(DEMO_USERS.contractor, stand, SEED_DEALS, SEED_EVENTS).allowed, true);
  assert.equal(canReadEventOrder(DEMO_USERS.venue, stand, SEED_DEALS, SEED_EVENTS).allowed, false);
  assert.equal(canReadEventOrder(DEMO_USERS.organizer, stand, SEED_DEALS, SEED_EVENTS).allowed, false);
});

test("direct object ACL denies foreign deal, order, document and invoice mutations", () => {
  assert.equal(canReadEventOrder(DEMO_USERS.venue, stand, SEED_DEALS, SEED_EVENTS).code, "forbidden_object");
  assert.equal(canMutateEventOrder(DEMO_USERS.venue, stand, SEED_DEALS, SEED_EVENTS).allowed, false);
  assert.equal(canMutateDeal(DEMO_USERS.venue, deal1).allowed, false);

  const dealDoc = SEED_DOCUMENTS.find((item) => item.id === "doc-1");
  const venueDoc = SEED_DOCUMENTS.find((item) => item.id === "doc-9");
  const dealPay = SEED_PAYMENTS.find((item) => item.id === "pay-1");
  assert.ok(dealDoc && venueDoc && dealPay);

  assert.equal(canReadDocument(dealDoc, DEMO_USERS.customer, SEED_DEALS), true);
  assert.equal(canReadDocument(dealDoc, DEMO_USERS.contractor, SEED_DEALS), true);
  assert.equal(canReadDocument(dealDoc, DEMO_USERS.venue, SEED_DEALS), false);
  assert.equal(canReadDocument(dealDoc, DEMO_USERS.organizer, SEED_DEALS), false);
  assert.equal(canReadDocument(venueDoc, DEMO_USERS.venue, SEED_DEALS), true);
  assert.equal(canReadDocument(venueDoc, DEMO_USERS.customer, SEED_DEALS), false);

  assert.equal(canReadPayment(dealPay, DEMO_USERS.customer, SEED_DEALS), true);
  assert.equal(canReadPayment(dealPay, DEMO_USERS.venue, SEED_DEALS), false);
  assert.equal(canReadPayment(dealPay, DEMO_USERS.organizer, SEED_DEALS), false);
});

test("available actions follow buyer/seller, not the demo role label", () => {
  const organizerIds = getViewerOrganizationIds(DEMO_USERS.organizer);
  const venueIds = getViewerOrganizationIds(DEMO_USERS.venue);
  assert.ok(organizerIds.includes("user-organizer"));
  assert.ok(venueIds.includes("venue-1"));
  assert.deepEqual(getAvailableActions(pavilion, "user-organizer"), ["pay"]);
  assert.deepEqual(getAvailableActions(pavilion, "venue-1"), []);
  assert.equal(canTransition(pavilion, "pay", "user-organizer"), true);
  assert.equal(canTransition(pavilion, "pay", "venue-1"), false);
  assert.equal(getOrderDirection(exhibitorSpace, "user-organizer"), "sell");
  assert.equal(getOrderDirection(exhibitorSpace, "user-customer"), "buy");
});
