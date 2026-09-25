import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PLATFORM_SEARCH_LABEL } from "../../constants/search.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("global search is named as platform search", () => {
  assert.equal(PLATFORM_SEARCH_LABEL, "Поиск по платформе");
  const header = readFileSync(join(root, "components/layout/header-search.tsx"), "utf8");
  const hero = readFileSync(join(root, "components/home/home-hero.tsx"), "utf8");
  assert.ok(header.includes("PLATFORM_SEARCH_LABEL"));
  assert.ok(hero.includes("PLATFORM_SEARCH_LABEL"));
});

test("header uses a compact 1024–1279 layout and full nav from 1280", () => {
  const css = readFileSync(join(root, "components/layout/public-header.module.css"), "utf8");
  assert.ok(css.includes("@media (min-width: 1280px)"));
  assert.ok(css.includes("flex-wrap: wrap"));
  assert.ok(css.includes("min-width: 0"));
});

test("cabinet menu and city picker keep accessible openers", () => {
  const shell = readFileSync(join(root, "components/layout/app-shell.tsx"), "utf8");
  const city = readFileSync(join(root, "components/layout/city-location-button.tsx"), "utf8");
  assert.ok(shell.includes("Меню кабинета"));
  assert.ok(city.includes("Выбрать город"));
});
