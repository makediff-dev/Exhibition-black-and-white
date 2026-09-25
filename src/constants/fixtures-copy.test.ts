import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const dir = dirname(fileURLToPath(import.meta.url));

test("catalog copy has no mixed-language typo", () => {
  const venues = readFileSync(join(dir, "venues.ts"), "utf8");
  assert.equal(venues.includes("медиамaterials"), false);
  assert.ok(venues.includes("медиаматериалы"));
});

test("home recommended heading is spelled correctly and venue names are unique across carousels", () => {
  const contractors = readFileSync(join(dir, "../components/home/home-recommended-contractors-section.tsx"), "utf8");
  assert.ok(contractors.includes("Рекомендованные исполнители услуг"));
  assert.equal(contractors.includes("Рекомендованые"), false);

  const home = readFileSync(join(dir, "home-content.ts"), "utf8");
  const names = [...home.matchAll(/name: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(names).size, names.length);
});
