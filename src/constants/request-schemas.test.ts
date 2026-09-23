import assert from "node:assert/strict";
import { test } from "node:test";
import {
  collectRequestWizardIssues,
  getRequestSchema,
  getRequestSchemaKind,
} from "./request-schemas.ts";
import { createDefaultDescriptionSections } from "./request-description-sections.ts";

test("catering schema has no stand area, frieze or past-stand photos", () => {
  const schema = getRequestSchema("Кейтеринг");
  assert.equal(getRequestSchemaKind("Кейтеринг"), "service");
  const fieldIds = schema.descriptionSections.flatMap((section) =>
    section.fields.map((field) => field.id)
  );
  assert.equal(fieldIds.includes("standArea"), false);
  assert.equal(fieldIds.includes("friezeHeight"), false);
  assert.equal(schema.fileItems.some((item) => item.id === "past-stands"), false);
  assert.equal(schema.fileItems.every((item) => !item.required), true);
});

test("stand schema keeps area, frieze and required layout files", () => {
  const schema = getRequestSchema("Комплексное строительство выставочных стендов");
  const fieldIds = schema.descriptionSections.flatMap((section) =>
    section.fields.map((field) => field.id)
  );
  assert.equal(fieldIds.includes("standArea"), true);
  assert.equal(fieldIds.includes("friezeHeight"), true);
  assert.equal(schema.fileItems.some((item) => item.id === "layout" && item.required), true);
  assert.equal(schema.fileItems.some((item) => item.id === "past-stands" && !item.required), true);
});

test("wizard validation rejects past dates and incomplete range budget", () => {
  const issues = collectRequestWizardIssues(
    {
      format: "open_request",
      category: "Кейтеринг",
      title: "Фуршет",
      description: "Кофе-брейк",
      expectedResult: "Обслуживание 50 гостей",
      descriptionMode: "structured",
      freeformDescription: "",
      torSections: createDefaultDescriptionSections(getRequestSchema("Кейтеринг").descriptionSections),
      executionStart: "2026-09-20",
      executionEnd: "2026-09-22",
      budget: { type: "range", min: 10000, max: 5000 },
      mandatoryFiles: {},
      invitedContractorIds: [],
    },
    "2026-09-23"
  );

  assert.equal(issues.some((issue) => issue.step === 4), true);
  assert.equal(issues.some((issue) => issue.step === 5), true);
  assert.equal(issues.some((issue) => issue.step === 6), false);
});
