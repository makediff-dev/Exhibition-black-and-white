import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_USERS, SEED_PAYMENTS } from "../../data/mocks/seed.ts";
import { canPayInvoice, getPaymentLifecycleCode, isOpenInvoice } from "../state/payment-machine.ts";
import {
  getFinanceBreakdown,
  getFinanceTradeSideLabel,
  hydrateFinanceRecord,
  inferFinanceKind,
  keepCanonicalInvoiceCopy,
} from "./finance.ts";

test("deal-1 520000 is a paid invoice plus escrow, not an open bill", () => {
  const invoice = SEED_PAYMENTS.find((item) => item.id === "pay-9");
  const escrow = SEED_PAYMENTS.find((item) => item.id === "pay-1");
  assert.ok(invoice && escrow);
  assert.equal(inferFinanceKind(invoice), "invoice");
  assert.equal(inferFinanceKind(escrow), "escrow");
  assert.equal(invoice.status, "paid");
  assert.equal(escrow.status, "reserved");
  assert.equal(invoice.escrowId, "pay-1");
  assert.equal(escrow.invoiceId, "pay-9");
  assert.equal(isOpenInvoice(invoice), false);
  assert.equal(isOpenInvoice(escrow), false);
  assert.equal(canPayInvoice(invoice, DEMO_USERS.customer), false);

  const openSameAmount = SEED_PAYMENTS.filter(
    (item) => item.amount === 520000 && isOpenInvoice(item)
  );
  assert.equal(openSameAmount.length, 0);

  const breakdown = getFinanceBreakdown(SEED_PAYMENTS.filter((item) => item.dealId === "deal-1"));
  assert.equal(breakdown.reserve, 520000);
});

test("issued invoices have number, parties, basis and due date; drafts cannot be paid", () => {
  const issued = SEED_PAYMENTS.find((item) => item.id === "pay-4");
  const draft = SEED_PAYMENTS.find((item) => item.id === "vpay-4");
  assert.ok(issued && draft);

  assert.ok(issued.number);
  assert.ok(issued.payerOrgId);
  assert.ok(issued.payeeOrgId);
  assert.ok(issued.basisType);
  assert.ok(issued.basisId);
  assert.ok(issued.currency);
  assert.equal(getPaymentLifecycleCode(issued), "overdue");
  assert.equal(canPayInvoice(issued, DEMO_USERS.customer), true);

  assert.equal(draft.number, undefined);
  assert.equal(getPaymentLifecycleCode(draft), "draft");
  assert.equal(canPayInvoice(draft, DEMO_USERS.venue), false);
  assert.equal(canPayInvoice(draft, DEMO_USERS.organizer), false);
});

test("one invoice id is kept once in mirrored venue/organizer lists", () => {
  const pair = SEED_PAYMENTS.filter((item) => item.ledgerPairId === "pair-pav-1");
  assert.equal(pair.length, 2);
  const venueCopy = keepCanonicalInvoiceCopy(pair, "venue");
  const organizerCopy = keepCanonicalInvoiceCopy(pair, "organizer");
  assert.equal(venueCopy.length, 1);
  assert.equal(organizerCopy.length, 1);
  assert.equal(venueCopy[0].id, "vpay-1");
  assert.equal(organizerCopy[0].id, "opay-1");
  assert.equal(venueCopy[0].invoiceId, organizerCopy[0].invoiceId);
});

test("payer and payee see opposite sides of the same invoice", () => {
  const invoice = hydrateFinanceRecord({
    id: "pay-4",
    number: "СЧ-015/2026",
    dealId: "deal-3",
    type: "Счёт к оплате",
    amount: 15000,
    status: "pending",
    date: "2026-01-20",
    description: "Аренда мебели — счёт",
    direction: "incoming",
    payerName: "ООО «Вымышленная Мебель»",
    payeeName: "ООО «МебельЭкспо»",
  });

  assert.equal(getFinanceTradeSideLabel(invoice, DEMO_USERS.customer), "К оплате");
  assert.equal(invoice.payerOrgId, "user-customer");
  assert.equal(invoice.payeeOrgId, "ctr-4");
});
