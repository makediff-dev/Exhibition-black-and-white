import assert from "node:assert/strict";
import { test } from "node:test";
import { validateProposalPayload } from "./proposal-payload.ts";
import { isStandardizedPricedService } from "../catalog/standardized-service.ts";

test("proposal action layer rejects empty price and empty approach", () => {
  assert.equal(validateProposalPayload({ price: 0, approach: "Монтаж за 3 дня" }).ok, false);
  assert.equal(validateProposalPayload({ price: 120000, approach: "   " }).ok, false);
  assert.equal(validateProposalPayload({ price: 120000, approach: "Монтаж за 3 дня" }).ok, true);
});

test("cart stays on standardized priced items only", () => {
  assert.equal(
    isStandardizedPricedService({
      id: "svc-7",
      title: "Вода",
      city: "Москва",
      contractorId: "ctr-8",
      contractorName: "Кейтер",
      category: "Доставка воды",
      price: 3500,
      priceFormat: "фиксированная",
      description: "",
      terms: "",
      deadline: "",
      rating: 4,
      reviewCount: 1,
    }),
    true
  );
  assert.equal(
    isStandardizedPricedService({
      id: "svc-5",
      title: "Кейтеринг",
      city: "Москва",
      contractorId: "ctr-8",
      contractorName: "Кейтер",
      category: "Кейтеринг",
      price: 50000,
      priceFormat: "от / за услугу",
      description: "",
      terms: "",
      deadline: "",
      rating: 4,
      reviewCount: 1,
    }),
    false
  );
});
