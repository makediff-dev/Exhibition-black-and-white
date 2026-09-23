import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_USERS,
  SEED_DEALS,
  SEED_DOCUMENTS,
  SEED_REQUESTS,
} from "../../data/mocks/seed.ts";
import {
  canAccessCabinet,
  canAccessCabinetPath,
  canCreateRequest,
  canManageEmployees,
  canMutateDeal,
  canMutateDocument,
  canReadDeal,
  canReadDocument,
  canReadPayment,
  canSubmitProposal,
  isRequestVisibleToContractor,
} from "./authorization.ts";

const roles = ["customer", "contractor", "venue", "organizer"] as const;

test("foreign cabinets are denied for every role pair", () => {
  for (const active of roles) {
    const user = DEMO_USERS[active];
    for (const route of roles) {
      const decision = canAccessCabinet(user, route);
      if (active === route) {
        assert.equal(decision.allowed, true, `${active} should open own cabinet`);
      } else {
        assert.equal(decision.allowed, false, `${active} must not open ${route}`);
        assert.equal(decision.code, "forbidden_role");
      }
    }
  }
});

test("unknown cabinet path is denied without rendering it as allowed", () => {
  const decision = canAccessCabinetPath(DEMO_USERS.organizer, "organizer", "employees-admin-secret");
  assert.equal(decision.allowed, false);
  assert.equal(decision.code, "forbidden_path");
});

test("deal-1 is only readable and mutable by its parties", () => {
  const deal = SEED_DEALS.find((item) => item.id === "deal-1");
  assert.ok(deal);

  assert.equal(canReadDeal(DEMO_USERS.customer, deal).allowed, true);
  assert.equal(canReadDeal(DEMO_USERS.contractor, deal).allowed, true);
  assert.equal(canReadDeal(DEMO_USERS.venue, deal).allowed, false);
  assert.equal(canReadDeal(DEMO_USERS.organizer, deal).allowed, false);
  assert.equal(canMutateDeal(DEMO_USERS.organizer, deal).allowed, false);
  assert.equal(canMutateDeal(null, deal).allowed, false);
});

test("customer-contractor documents are hidden from venue and organizer", () => {
  const doc = SEED_DOCUMENTS.find((item) => item.id === "doc-1");
  assert.ok(doc);
  assert.match(doc.parties, /Заказчик/);

  assert.equal(canReadDocument(doc, DEMO_USERS.customer, SEED_DEALS), true);
  assert.equal(canReadDocument(doc, DEMO_USERS.contractor, SEED_DEALS), true);
  assert.equal(canReadDocument(doc, DEMO_USERS.venue, SEED_DEALS), false);
  assert.equal(canReadDocument(doc, DEMO_USERS.organizer, SEED_DEALS), false);
  assert.equal(canMutateDocument(doc, DEMO_USERS.venue, SEED_DEALS).allowed, false);
});

test("venue-organizer documents stay visible to those parties only", () => {
  const doc = SEED_DOCUMENTS.find((item) => item.id === "doc-9");
  assert.ok(doc);

  assert.equal(canReadDocument(doc, DEMO_USERS.venue, SEED_DEALS), true);
  assert.equal(canReadDocument(doc, DEMO_USERS.organizer, SEED_DEALS), true);
  assert.equal(canReadDocument(doc, DEMO_USERS.customer, SEED_DEALS), false);
  assert.equal(canReadDocument(doc, DEMO_USERS.contractor, SEED_DEALS), false);
});

test("organizer-owned payments are hidden from customer and contractor", () => {
  const payment = {
    id: "opay-7",
    organizerId: "user-organizer",
    dealId: "deal-1",
    type: "Резерв",
    amount: 520000,
    status: "reserved" as const,
    date: "2026-01-13",
    description: "mirror",
  };

  assert.equal(canReadPayment(payment, DEMO_USERS.organizer, SEED_DEALS), true);
  assert.equal(canReadPayment(payment, DEMO_USERS.customer, SEED_DEALS), false);
  assert.equal(canReadPayment(payment, DEMO_USERS.contractor, SEED_DEALS), false);
});

test("catering request is hidden from stand contractor; invited closed request is visible", () => {
  const catering = SEED_REQUESTS.find((item) => item.id === "req-4");
  const invited = SEED_REQUESTS.find((item) => item.id === "req-2");
  assert.ok(catering);
  assert.ok(invited);

  assert.equal(isRequestVisibleToContractor(catering, DEMO_USERS.contractor), false);
  assert.equal(isRequestVisibleToContractor(invited, DEMO_USERS.contractor), true);
  assert.equal(canSubmitProposal(DEMO_USERS.contractor, catering).allowed, false);
});

test("only customer can create a request; only matching org can manage employees", () => {
  assert.equal(canCreateRequest(DEMO_USERS.customer).allowed, true);
  assert.equal(canCreateRequest(DEMO_USERS.contractor).allowed, false);
  assert.equal(canCreateRequest(DEMO_USERS.venue).allowed, false);

  assert.equal(canManageEmployees(DEMO_USERS.venue, "venue").allowed, true);
  assert.equal(canManageEmployees(DEMO_USERS.customer, "venue").allowed, false);
  assert.equal(canManageEmployees(DEMO_USERS.organizer, "customer").allowed, false);
});
