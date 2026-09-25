import assert from "node:assert/strict";
import { test } from "node:test";
import { createDefaultDescriptionSections } from "../../constants/request-description-sections.ts";
import { getRequestSchema } from "../../constants/request-schemas.ts";
import { collectRequestWizardIssues } from "../../constants/request-schemas.ts";
import { serializeSectionFieldValues } from "../../constants/request-description-sections.ts";
import { collectEventFormIssues } from "./form-validation.ts";

function cateringWithServiceDates(serviceStart: string, serviceEnd: string) {
  const schema = getRequestSchema("Кейтеринг");
  const sections = createDefaultDescriptionSections(schema.descriptionSections);
  return sections.map((section) => {
    if (section.title !== "Место и формат услуги") return section;
    return {
      ...section,
      content: serializeSectionFieldValues({
        serviceLocation: "Павильон 1",
        serviceStart,
        serviceEnd,
        serviceFormat: "Фуршет",
      }),
    };
  });
}

test("service date outside the request period blocks publish", () => {
  const issues = collectRequestWizardIssues(
    {
      format: "open_request",
      category: "Кейтеринг",
      title: "Фуршет",
      description: "Кофе-брейк",
      expectedResult: "Обслуживание 50 гостей",
      descriptionMode: "structured",
      freeformDescription: "",
      torSections: cateringWithServiceDates("2026-10-01", "2026-10-01"),
      executionStart: "2026-09-23",
      executionEnd: "2026-09-24",
      budget: { type: "range", min: 10000, max: 20000 },
      mandatoryFiles: {},
      invitedContractorIds: [],
    },
    "2026-09-23"
  );

  assert.equal(
    issues.some((issue) => issue.message.includes("внутри общего периода")),
    true
  );
});

test("optional files do not block a service request", () => {
  const issues = collectRequestWizardIssues(
    {
      format: "open_request",
      category: "Кейтеринг",
      title: "Фуршет",
      description: "Кофе-брейк",
      expectedResult: "Обслуживание 50 гостей",
      descriptionMode: "freeform",
      freeformDescription: "Нужен фуршет на 50 человек",
      torSections: [],
      executionStart: "2026-09-25",
      executionEnd: "2026-09-26",
      budget: { type: "request_quote" },
      mandatoryFiles: {},
      invitedContractorIds: [],
    },
    "2026-09-23"
  );

  assert.equal(issues.some((issue) => issue.step === 6), false);
});

test("new event rejects past start and assembly after opening day", () => {
  const issues = collectEventFormIssues(
    {
      title: "Форум",
      description: "Отраслевой форум",
      city: "Москва",
      startDate: "2026-09-20",
      endDate: "2026-09-22",
      assemblyStart: "2026-09-21",
      assemblyEnd: "2026-09-21",
      dismantlingStart: "2026-09-21",
      dismantlingEnd: "2026-09-23",
    },
    "2026-09-24",
    "create"
  );

  assert.equal(issues.some((issue) => issue.field === "startDate"), true);
  assert.equal(issues.some((issue) => issue.field === "assemblyEnd"), true);
  assert.equal(issues.some((issue) => issue.field === "dismantlingStart"), true);
});
