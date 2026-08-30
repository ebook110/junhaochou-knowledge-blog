import { chromium } from "@playwright/test";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4321";
const routes = ["/", "/articles/ansys-codex-workflow/"];
const failures = [];
const browser = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });

try {
  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: "light",
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: "cellular3g",
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__junhaoVitals = { cls: 0, inp: 0, lcp: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const latest = entries.at(-1);
        if (latest) window.__junhaoVitals.lcp = latest.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__junhaoVitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      if (PerformanceObserver.supportedEntryTypes.includes("event")) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.interactionId) {
              window.__junhaoVitals.inp = Math.max(window.__junhaoVitals.inp, entry.duration);
            }
          }
        }).observe({ type: "event", buffered: true, durationThreshold: 16 });
      }
    });

    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.locator("#theme-toggle").click();
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => ({
      ...window.__junhaoVitals,
      transferredBytes: performance
        .getEntriesByType("resource")
        .reduce((total, entry) => total + (entry.transferSize ?? 0), 0),
    }));
    console.log(
      `${route} LCP=${Math.round(metrics.lcp)}ms CLS=${metrics.cls.toFixed(3)} INP=${Math.round(metrics.inp)}ms transferred=${(metrics.transferredBytes / 1024).toFixed(1)}KiB`,
    );
    if (metrics.lcp <= 0 || metrics.lcp >= 2500) failures.push(`${route} LCP ${metrics.lcp}ms`);
    if (metrics.cls >= 0.1) failures.push(`${route} CLS ${metrics.cls}`);
    if (metrics.inp >= 200) failures.push(`${route} INP ${metrics.inp}ms`);
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`Web-vitals budget failed:\n${failures.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}

console.log(
  "Representative mobile web-vitals budgets passed under throttled local lab conditions.",
);
