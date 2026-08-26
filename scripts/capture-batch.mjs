import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.CAPTURE_BASE_URL ?? "https://exhibition-black-and-white.vercel.app";
const VIEWPORT = { width: 1440, height: 900 };
const CAPTURE_JS_URL = "https://mcp.figma.com/mcp/html-to-design/capture.js";

const ROLE_LABELS = {
  customer: "Заказчик",
  contractor: "Исполнитель",
  venue: "Площадка",
  organizer: "Организатор",
};

const batchPath = process.argv[2] ?? path.join(__dirname, "capture-batch.json");
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));

async function setupCspBypass(page) {
  await page.route("**/*", async (route) => {
    try {
      const response = await route.fetch({ timeout: 15000 });
      const headers = { ...response.headers() };
      delete headers["content-security-policy"];
      delete headers["content-security-policy-report-only"];
      await route.fulfill({ response, headers });
    } catch {
      await route.continue();
    }
  });
}

async function loginAs(page, role) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "load", timeout: 60000 });
  await page.getByRole("button", { name: ROLE_LABELS[role], exact: true }).click();
  await page.waitForURL(new RegExp(`/account/${role}`), { timeout: 30000 });
}

async function injectCaptureScript(page) {
  const response = await page.context().request.get(CAPTURE_JS_URL);
  const scriptText = await response.text();
  await page.evaluate((source) => {
    const el = document.createElement("script");
    el.textContent = source;
    document.head.appendChild(el);
  }, scriptText);
  await page.waitForFunction(() => Boolean(window.figma?.captureForDesign), null, {
    timeout: 20000,
  });
}

async function captureScreen(browser, screen) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  await setupCspBypass(page);

  try {
    if (screen.role) {
      await loginAs(page, screen.role);
    }

    const targetUrl = `${BASE_URL}${screen.path}`;
    console.log(`Capturing [1440]: ${screen.name} -> ${screen.path}`);

    await page.goto(targetUrl, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2500);
    await injectCaptureScript(page);

    const endpoint = `https://mcp.figma.com/mcp/capture/${screen.captureId}/submit?bindVariables=true`;

    await Promise.race([
      page.evaluate(
        ({ captureId, endpointUrl }) =>
          window.figma.captureForDesign({
            captureId,
            endpoint: endpointUrl,
            selector: "body",
          }),
        { captureId: screen.captureId, endpointUrl: endpoint }
      ),
      page.waitForTimeout(30000),
    ]);

    console.log(`Submitted: ${screen.name}`);
  } catch (error) {
    console.error(`Failed: ${screen.name}`, error);
    throw error;
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });

try {
  for (const screen of batch) {
    if (!screen.captureId) {
      throw new Error(`Missing captureId for ${screen.name}`);
    }
    await captureScreen(browser, screen);
  }
} finally {
  await browser.close();
}

console.log(`Captured ${batch.length} screens at ${VIEWPORT.width}px from ${BASE_URL}.`);
