import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 767, height: 600 },
  { width: 768, height: 600 },
  { width: 1024, height: 600 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
] as const;

async function loginAs(page: Page, role: "Заказчик" | "Организатор") {
  await page.goto("/login");
  await page.getByRole("button", { name: role, exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function overflowMetrics(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    return {
      html: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
      main: main ? main.scrollWidth - main.clientWidth : 0,
      dialogs: document.querySelectorAll('[role="dialog"][aria-modal="true"]').length,
    };
  });
}

async function expectNoPageOverflow(page: Page) {
  const metrics = await overflowMetrics(page);
  expect(metrics.html, "html overflow").toBeLessThanOrEqual(1);
  expect(metrics.body, "body overflow").toBeLessThanOrEqual(1);
  expect(metrics.dialogs, "modal dialogs").toBeLessThanOrEqual(1);
}

async function dismissDialogs(page: Page) {
  const cityPrompt = page.getByRole("dialog", { name: "Определение города" });
  await cityPrompt.waitFor({ state: "visible", timeout: 2500 }).catch(() => undefined);
  if (await cityPrompt.isVisible().catch(() => false)) {
    await cityPrompt.getByRole("button", { name: "Пропустить" }).click();
    await expect(cityPrompt).toBeHidden();
    return;
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const dialog = page.getByRole("dialog").first();
    if (!(await dialog.isVisible().catch(() => false))) return;
    await page.keyboard.press("Escape");
  }
}

test.describe("responsive audit viewports", () => {
  for (const viewport of VIEWPORTS) {
    test(`home and catalogs ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const path of ["/", "/events", "/services", "/venues", "/contractors"]) {
        await page.goto(path);
        await expectNoPageOverflow(page);
      }
    });
  }

  test("demo control is a compact FAB on short mobile", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const fab = page.getByRole("button", { name: "Инструмент прототипа: смена демо-роли" });
    await expect(fab).toBeVisible();
    const box = await fab.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeLessThan(80);
  });

  test("cabinet sidebar appears from 768", async ({ page }) => {
    await loginAs(page, "Заказчик");
    await page.setViewportSize({ width: 767, height: 600 });
    await page.goto("/account/customer");
    await expect(page.getByRole("button", { name: "Меню кабинета" })).toBeVisible();
    await expect(page.locator("aside")).toBeHidden();

    await page.setViewportSize({ width: 768, height: 600 });
    await page.goto("/account/customer");
    await expect(page.locator("aside").getByText("Дашборд").first()).toBeVisible();
  });

  test("organizer create CTA stays in viewport at 320", async ({ page }) => {
    await loginAs(page, "Организатор");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/account/organizer/events");
    const cta = page.getByRole("button", { name: "Создать мероприятие" });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box).toBeTruthy();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320 + 1);
    await expectNoPageOverflow(page);
  });

  test("filter drawer keeps apply visible on short landscape", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/events");
    await dismissDialogs(page);
    await page.getByRole("button", { name: "Фильтры" }).click();
    const dialog = page.getByRole("dialog", { name: "Фильтры" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Применить" })).toBeVisible();
    const metrics = await overflowMetrics(page);
    expect(metrics.dialogs).toBe(1);
  });

  test("login toast is not a modal dialog", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, "Заказчик");
    await expect(page.getByRole("status")).toBeVisible();
    const metrics = await overflowMetrics(page);
    expect(metrics.dialogs).toBe(0);
  });

  test("hero title stays within two lines at 320", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const lines = await heading.evaluate((element) => {
      const style = window.getComputedStyle(element);
      const lineHeight = Number.parseFloat(style.lineHeight);
      if (!lineHeight) return 99;
      return Math.round(element.getBoundingClientRect().height / lineHeight);
    });
    expect(lines).toBeLessThanOrEqual(2);
  });

  test("public menu last action is reachable at 844x390", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");
    await page.getByRole("button", { name: "Меню" }).click();
    const dialog = page.getByRole("dialog", { name: "Меню" });
    await expect(dialog).toBeVisible();
    const login = dialog.getByRole("button", { name: "Вход" });
    await login.scrollIntoViewIfNeeded();
    await expect(login).toBeVisible();
    const box = await login.boundingBox();
    expect(box?.y ?? 0).toBeGreaterThanOrEqual(0);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(390 + 1);
  });

  test("demo layer stays below drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/events");
    await dismissDialogs(page);
    await page.getByRole("button", { name: "Фильтры" }).click();
    const filters = page.getByRole("dialog", { name: "Фильтры" });
    await expect(filters).toBeVisible();
    await expect(page.getByRole("button", { name: "Закрыть фильтры" })).toBeVisible();
    await expect(filters.getByRole("button", { name: "Применить" })).toBeVisible();
    await filters.getByRole("button", { name: "Применить" }).click();
    await expect(filters).toBeHidden();
  });

  test("customer payments tabs keep active item in view", async ({ page }) => {
    await loginAs(page, "Заказчик");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/account/customer/payments");
    await expectNoPageOverflow(page);
    const activeTab = page.locator('[role="tab"][aria-selected="true"]').first();
    if (await activeTab.count()) {
      const box = await activeTab.boundingBox();
      expect(box).toBeTruthy();
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320 + 8);
    }
  });
});
