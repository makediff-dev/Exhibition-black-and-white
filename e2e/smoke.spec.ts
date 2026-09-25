import { expect, test, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function loginAs(page: Page, role: "Заказчик" | "Исполнитель" | "Площадка" | "Организатор") {
  await page.goto("/login");
  await page.getByRole("button", { name: role, exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function noPageOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    metrics.scrollWidth,
    `horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`,
  ).toBe(metrics.clientWidth);
}

test("1. completed event cannot be booked", async ({ page }) => {
  await loginAs(page, "Заказчик");
  await page.goto("/events/evt-1/booking");
  await expect(page.getByRole("heading", { name: "Бронирование недоступно" })).toBeVisible();
  await page.goto("/events/evt-1");
  await expect(page.getByRole("heading", { name: /Мебель-2026/ })).toBeVisible();
});

test("2. conflicting service dates block publish with jump links", async ({ page }) => {
  await loginAs(page, "Заказчик");
  await page.goto("/requests/new");
  await page.getByText("Открытый запрос предложений").click();
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByLabel("Категория услуги *").selectOption("Кейтеринг");
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByRole("button", { name: "Далее" }).click();

  await page.getByLabel("Название заявки *").fill("Smoke кейтеринг");
  await page.getByLabel("Краткое описание *").fill("Проверка конфликта дат");
  await page.getByLabel("Ожидаемый результат *").fill("Фуршет без срывов");
  await page.getByLabel("Компания *").fill("ООО «Смок»");
  await page.getByLabel("Краткое описание компании *").fill("Прототип");
  await page.getByLabel("Контактное лицо *").fill("Иван Смок");
  await page.getByLabel("Телефон / E-mail *").fill("smoke@example.com");
  await page.getByLabel("Место оказания *").fill("Павильон 1");
  await page.getByLabel("Начало услуги *").fill("2026-11-01");
  await page.getByLabel("Окончание услуги *").fill("2026-11-02");
  await page.getByLabel("Формат *").fill("Фуршет");
  await page.getByLabel("Количество гостей или объём *").fill("40");
  await page.getByLabel("Состав услуги *").fill("Кофе-брейк");
  await page.getByRole("button", { name: "Далее" }).click();

  await page.getByRole("button", { name: "Выберите период в календаре" }).click();
  await page.getByRole("button", { name: "Следующий месяц" }).click();
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "8", exact: true }).click();
  await page.getByRole("button", { name: "Далее" }).click();

  await page.getByLabel("Тип бюджета").selectOption("request_quote");
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByRole("button", { name: "Далее" }).click();

  await expect(page.getByText("Нельзя опубликовать, пока не исправлены поля")).toBeVisible();
  await expect(page.getByRole("button", { name: /внутри общего периода/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Опубликовать" })).toBeDisabled();
});

test("3. contractor does not see irrelevant request or foreign deal", async ({ page }) => {
  await loginAs(page, "Исполнитель");
  await page.goto("/account/contractor/available-requests");
  await expect(page.getByText("Кейтеринг на ПродЭкспо")).toHaveCount(0);
  await expect(page.getByText("Дизайн-проект для IT Forum")).toHaveCount(0);
  await page.goto("/deals/deal-1");
  await expect(page.getByText("Стенд 36 кв.м на Мебель-2026")).toBeVisible();
  await page.goto("/login");
  await page.getByRole("button", { name: "Площадка", exact: true }).click();
  await page.goto("/deals/deal-1");
  await expect(page.getByText("Сделка недоступна")).toBeVisible();
});

test("4. venue does not treat stand build as its own sale", async ({ page }) => {
  await loginAs(page, "Площадка");
  await page.goto("/account/venue/orders");
  await expect(page.locator("body")).not.toContainText("eord-12");
  const standCards = page.getByText("Стенд 36 кв.м на Мебель-2026");
  await expect(standCards).toHaveCount(0);
});

test("5. organizer sends venue inquiry for an existing upcoming event", async ({ page }) => {
  await loginAs(page, "Организатор");
  await page.goto("/account/organizer/venues?eventId=evt-8");
  await expect(page.getByText(/АвтоСалон Юг · Краснодар/)).toBeVisible();
  await page.getByLabel("Город", { exact: true }).selectOption("");
  await page.getByRole("button", { name: "Сделать запрос" }).first().click();
  await expect(page.getByText(/Запрос отправлен/).first()).toBeVisible();
});

test("6. paid invoice and reserved escrow are not billed twice", async ({ page }) => {
  await loginAs(page, "Заказчик");
  await page.goto("/account/customer/payments");
  await page.getByRole("button", { name: "История платежей" }).click();
  await expect(page.getByText("СЧ-СД-001")).toBeVisible();
  await expect(page.getByText("Оплачен").first()).toBeVisible();
  await page.getByRole("button", { name: "Безопасные сделки" }).click();
  await expect(page.getByText("ПР-СД-001")).toBeVisible();
  await expect(page.getByText("В резерве").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Оплатить" })).toHaveCount(0);
});

test("7. logout and login restore evt-1 bookings tab", async ({ page }) => {
  await loginAs(page, "Организатор");
  await page.goto("/account/organizer/edit-event?id=evt-1&tab=bookings");
  await page.getByRole("complementary").getByRole("button", { name: "Выйти" }).evaluate((el) => {
    (el as HTMLButtonElement).click();
  });
  await expect(page).toHaveURL(/returnUrl=/);
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await expect(page).toHaveURL(/edit-event\?id=evt-1&tab=bookings/);
});

test("8. no document-level horizontal overflow on control widths", async ({ page }) => {
  const widths = [320, 390, 1024, 1100, 1152, 1280];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await noPageOverflow(page);
    await page.goto("/events");
    await noPageOverflow(page);
    await page.goto("/venues");
    await noPageOverflow(page);
  }
});

test("9. keyboard can open cabinet menu and return focus; file input is reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page, "Организатор");
  const menu = page.getByRole("button", { name: "Меню кабинета" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Меню кабинета" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/account/organizer/edit-event?id=evt-8");
  const dummy = join(tmpdir(), "smoke-upload.pdf");
  writeFileSync(dummy, "smoke");
  await page.locator('input[type="file"]').first().setInputFiles(dummy);
});
