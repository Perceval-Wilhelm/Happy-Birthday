import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The story is ~70 s of animation; Playwright's fake clock fast-forwards it in well under a second.
const GATE = 3_000;
const TO_THE_CAKE = 55_000;
const TO_THE_END = 20_000;

function collectProblems(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("requestfailed", (request) => problems.push(`Request failed: ${request.url()}`));
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) problems.push(message.text());
  });
  return problems;
}

async function axeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target.join(" ")).join(", ")}`);
}

test("opens the gift, waits for the wish, and plays to the end", async ({ page }) => {
  const problems = collectProblems(page);
  await page.clock.install();
  await page.goto("/");

  const gift = page.getByRole("button", { name: "Mở quà" });
  await expect(gift).toBeVisible();
  await expect(page.getByText("Gửi em Hân 💌")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);

  await gift.click();
  await page.clock.runFor(GATE);
  await expect(gift).toBeHidden();
  await expect(page.getByRole("button", { name: "Nhạc nền" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.clock.runFor(TO_THE_CAKE);
  const cake = page.getByRole("button", { name: "Thổi nến" });
  await expect(cake).toBeVisible();
  await expect(cake).toBeFocused();
  // The story waits for the wish instead of moving on by itself.
  await page.clock.runFor(5_000);
  await expect(cake).toBeVisible();

  await cake.click();
  await page.clock.runFor(TO_THE_END);
  const replay = page.getByRole("button", { name: /xem lại/ });
  await expect(replay).toBeVisible();
  await expect(page.getByRole("heading", { name: "Happy Birthday!!!" })).toBeHidden();
  expect(await axeViolations(page)).toEqual([]);

  await replay.click();
  await page.clock.runFor(1_500);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(replay).toBeHidden();

  expect(problems).toEqual([]);
});

test("keeps the story but drops the movement for reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Motion preferences do not depend on the viewport.");
  const problems = collectProblems(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Mở quà" }).click();
  await page.clock.runFor(GATE + TO_THE_CAKE);
  await expect(page.locator(".balloon")).toHaveCount(0);
  await page.getByRole("button", { name: "Thổi nến" }).click();
  await page.clock.runFor(TO_THE_END);
  await expect(page.getByRole("button", { name: /xem lại/ })).toBeVisible();
  expect(problems).toEqual([]);
});

test("serves security headers, robots rules and the share image", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Server responses do not depend on the viewport.");
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-robots-tag"]).toContain("noindex");
  expect(headers["permissions-policy"]).toContain("microphone=(self)");

  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");

  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const shareImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const image = await request.get(new URL(shareImage!).pathname + new URL(shareImage!).search);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
});

test("accepts error reports and rejects anything else", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Server responses do not depend on the viewport.");
  const report = { type: "error", source: "window", message: "e2e check", path: "/" };
  expect((await request.post("/api/telemetry", { data: report })).status()).toBe(204);
  expect((await request.post("/api/telemetry", { data: { ...report, source: "server" } })).status()).toBe(400);
  expect((await request.post("/api/telemetry", { data: "{not json" })).status()).toBe(400);
});

test("leads lost visitors back to the gift", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "The 404 page has one layout.");
  const response = await page.goto("/khong-co-trang-nay");
  expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Về món quà" }).click();
  await expect(page.getByRole("button", { name: "Mở quà" })).toBeVisible();
});
