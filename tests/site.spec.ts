import { expect, test, type Page } from "@playwright/test";

const canonicalOrigin = "https://junhaochou.com";
const canonicalNavigation = [
  { label: "首页", href: "/" },
  { label: "研究", href: "/research/" },
  { label: "项目", href: "/projects/" },
  { label: "文章", href: "/articles/" },
  { label: "关于", href: "/about/" },
] as const;

const publicRoutes: ReadonlyArray<{ path: string; heading: string | RegExp }> = [
  { path: "/", heading: /材料研究、\s*计算方法与工程实践/ },
  { path: "/research/", heading: "研究方向" },
  {
    path: "/research/vnbtatizr-molecular-dynamics/",
    heading: "VNbTaTiZr 难熔高熵合金的分子动力学研究",
  },
  {
    path: "/research/uts-machine-learning-interpretation/",
    heading: "面向极限抗拉强度的机器学习预测与解释",
  },
  { path: "/projects/", heading: "项目记录" },
  { path: "/projects/vnbtatizr-md/", heading: "VNbTaTiZr 拉伸分子动力学工作流" },
  {
    path: "/projects/uts-machine-learning/",
    heading: "VNbTaTiZr 极限抗拉强度机器学习项目",
  },
  { path: "/projects/knowledge-blog/", heading: "JunhaoChou 工程知识库" },
  { path: "/articles/", heading: "文章" },
  { path: "/categories/", heading: "文章分类" },
  { path: "/tags/", heading: "标签" },
  { path: "/series/", heading: "系列教程" },
  { path: "/search/", heading: "搜索知识库" },
  { path: "/about/", heading: "关于 JunhaoChou" },
  { path: "/healthz", heading: "ok" },
  { path: "/articles/vps-secure-ubuntu/", heading: /Ubuntu/ },
  { path: "/articles/ansys-codex-workflow/", heading: /ANSYS/ },
];

async function expectNavigationContract(page: Page, selector: string) {
  const links = page.locator(`${selector} a`);
  await expect(links).toHaveCount(canonicalNavigation.length);

  const labels = (await links.allTextContents()).map((label) => label.trim());
  const hrefs = await links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("href")),
  );

  expect(labels).toEqual(canonicalNavigation.map((item) => item.label));
  expect(hrefs).toEqual(canonicalNavigation.map((item) => item.href));
  await expect(links.nth(1)).toHaveAttribute("aria-current", "page");
}

async function inspectHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > viewportWidth + 1;
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className,
        rect: element.getBoundingClientRect().toJSON(),
      }));

    return { documentWidth, viewportWidth, offenders };
  });
}

test("renders the public route inventory with its canonical heading", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "The mobile project audits representative routes.",
  );

  for (const route of publicRoutes) {
    const response = await page.goto(route.path);
    expect(response?.ok(), `${route.path} should return a successful response`).toBeTruthy();
    await expect(page.locator("h1").first()).toHaveText(route.heading);
    await expect(page).toHaveTitle(/JunhaoChou|健康检查/);
  }
});

test("exposes exactly the approved five-item navigation and active route", async ({
  page,
}, testInfo) => {
  await page.goto("/research/vnbtatizr-molecular-dynamics/");

  if (testInfo.project.name === "mobile") {
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeHidden();
    await page.locator("#mobile-menu-button").click();
    await expect(menu).toBeVisible();
    await expectNavigationContract(page, "#mobile-menu");
    return;
  }

  await expect(page.locator(".desktop-navigation")).toBeVisible();
  await expectNavigationContract(page, ".desktop-navigation");
});

test("keeps the article context, body, and sticky TOC as three desktop columns", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This is the wide-screen article contract.");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/articles/ansys-codex-workflow/");

  const context = page.locator(".article-context");
  const article = page.locator(".article-main");
  const toc = page.locator(".article-toc");
  await expect(context).toBeVisible();
  await expect(article).toBeVisible();
  await expect(toc).toBeVisible();

  const [contextBox, articleBox, tocBox] = await Promise.all([
    context.boundingBox(),
    article.boundingBox(),
    toc.boundingBox(),
  ]);
  expect(contextBox).not.toBeNull();
  expect(articleBox).not.toBeNull();
  expect(tocBox).not.toBeNull();
  expect(contextBox!.x + contextBox!.width).toBeLessThan(articleBox!.x);
  expect(articleBox!.x + articleBox!.width).toBeLessThan(tocBox!.x);
  expect(articleBox!.width).toBeGreaterThanOrEqual(700);

  for (const sticky of [
    page.locator(".article-context > .sticky"),
    page.locator(".article-toc > .sticky"),
  ]) {
    await expect(sticky).toHaveCSS("position", "sticky");
    await expect(sticky).toHaveCSS("top", "96px");
  }

  const tocNavigation = page.getByRole("navigation", { name: "文章目录", exact: true });
  await expect(tocNavigation).toBeVisible();
  expect(await tocNavigation.getByRole("link").count()).toBeGreaterThan(0);
});

test("opens and closes the enabled article TOC on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "The desktop TOC is covered by the column test.");
  await page.goto("/articles/ansys-codex-workflow/");

  const trigger = page.getByRole("button", { name: "目录", exact: true });
  const dialog = page.locator("#mobile-toc");
  await expect(trigger).toBeVisible();
  await expect(dialog).toBeHidden();
  await trigger.click();
  await expect(dialog).toBeVisible();
  expect(
    await page
      .getByRole("navigation", { name: "移动文章目录", exact: true })
      .getByRole("link")
      .count(),
  ).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("builds series navigation and cross-collection backlinks", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Build-time relations are viewport-independent.");
  await page.goto("/articles/ansys-codex-workflow/");

  await expect(page.locator(".article-pager a")).not.toHaveCount(0);
  const backlinks = page.locator(".article-backlinks");
  await expect(backlinks.getByRole("heading", { name: "被引用于" })).toBeVisible();
  await expect(
    backlinks.locator("a[href='/research/vnbtatizr-molecular-dynamics/']"),
  ).toBeVisible();
  await expect(backlinks.locator("a[href='/projects/vnbtatizr-md/']")).toBeVisible();
});

test("honours toc:false even when the article contains section headings", async ({ page }) => {
  await page.goto("/articles/u-card-risk-basics/");

  expect(await page.locator(".prose-article h2").count()).toBeGreaterThan(0);
  await expect(page.getByRole("navigation", { name: "文章目录", exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "移动文章目录", exact: true })).toHaveCount(0);
  await expect(page.locator(".mobile-toc-trigger")).toHaveCount(0);
});

test("keeps representative public pages within a 390px viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "This contract targets the 390px project.");
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of [
    "/",
    "/research/",
    "/research/vnbtatizr-molecular-dynamics/",
    "/projects/",
    "/projects/knowledge-blog/",
    "/articles/ansys-codex-workflow/",
    "/articles/u-card-risk-basics/",
    "/search/",
  ]) {
    await page.goto(path);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const audit = await inspectHorizontalOverflow(page);
    expect(
      audit.documentWidth,
      `${path} overflows at 390px: ${JSON.stringify(audit.offenders)}`,
    ).toBeLessThanOrEqual(audit.viewportWidth + 1);
    expect(audit.viewportWidth).toBe(390);
  }
});

test("deduplicates Ubuntu search results and prioritizes the canonical detail page", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser is sufficient for the static index.");
  await page.goto("/search/");

  await page.locator("#search-page-input").fill("Ubuntu");
  await expect(page.locator("#search-page-status")).toContainText(/找到 \d+ 条结果/, {
    timeout: 15_000,
  });

  const results = page.locator("#search-page-results a.pagefind-result");
  expect(await results.count()).toBeGreaterThan(0);
  const hrefs = await results.evaluateAll((links) =>
    links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
  );

  expect(hrefs[0]).toBe("/articles/vps-secure-ubuntu/");
  expect(new Set(hrefs).size).toBe(hrefs.length);
  expect(hrefs.filter((href) => href === "/articles/vps-secure-ubuntu/")).toHaveLength(1);
  for (const href of hrefs) {
    expect(href).toMatch(/^\/(articles|research|projects)\/[^/]+\/$/);
  }
});

test("supports keyboard search and restores focus after Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This is the hardware-keyboard interaction.");
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "搜索站点内容" });
  await trigger.focus();
  await page.keyboard.press("Control+k");

  const modal = page.locator("#search-modal");
  const input = page.locator("#search-modal-control-input");
  await expect(modal).toBeVisible();
  await expect(input).toBeFocused();
  await input.fill("Ubuntu");
  await expect(page.locator("#search-modal-control-status")).toContainText(/找到 \d+ 条结果/, {
    timeout: 15_000,
  });
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /-option-0$/);
  await expect(page.locator("#search-modal-control-results a[aria-selected='true']")).toHaveCount(
    1,
  );
  await input.press("Escape");
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("persists a keyboard-selected theme across reloads", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This is the hardware-keyboard interaction.");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("junhao-theme"));
  await page.reload();

  const html = page.locator("html");
  const toggle = page.locator("#theme-toggle");
  await expect(html).toHaveAttribute("data-theme", "light");
  await toggle.focus();
  await toggle.press("Space");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("junhao-theme"))).toBe("dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await toggle.focus();
  await toggle.press("Enter");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => localStorage.getItem("junhao-theme"))).toBe("light");
});

test("keeps the admin noindex and loads Decap from the local build", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser is sufficient for the admin shell.");
  const scriptRequests = new Set<string>();
  page.on("request", (request) => {
    if (request.resourceType() === "script") scriptRequests.add(request.url());
  });

  const response = await page.goto("/admin/");
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle("JunhaoChou Admin");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute(
    "content",
    "noindex, nofollow, noarchive",
  );
  await expect(page.locator("[data-admin-status]")).toHaveCount(0, { timeout: 20_000 });
  await expect(page.locator("body")).not.toContainText("后台加载失败");
  await expect(page.getByRole("button", { name: "Login with GitHub" })).toBeVisible();

  const scriptSources = await page
    .locator("script[src]")
    .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src));
  const adminOrigin = new URL(page.url()).origin;
  expect(scriptSources.length).toBeGreaterThan(0);
  expect(scriptSources.every((source) => new URL(source).origin === adminOrigin)).toBeTruthy();
  expect(
    Array.from(scriptRequests).some((source) => new URL(source).pathname.startsWith("/_astro/")),
  ).toBeTruthy();
  expect(
    Array.from(scriptRequests).every((source) => new URL(source).origin === adminOrigin),
  ).toBeTruthy();
  expect(
    Array.from(scriptRequests).every(
      (source) => !/unpkg|jsdelivr|cdnjs|decap-cms\.netlify\.app/i.test(source),
    ),
  ).toBeTruthy();
});

test("publishes canonical, Open Graph, and JSON-LD metadata on every detail type", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Metadata is build output, independent of viewport.",
  );
  const detailPages = [
    {
      path: "/articles/ansys-codex-workflow/",
      types: ["Article", "BreadcrumbList"],
    },
    {
      path: "/research/vnbtatizr-molecular-dynamics/",
      types: ["ScholarlyArticle", "BreadcrumbList"],
    },
    {
      path: "/projects/knowledge-blog/",
      types: ["CreativeWork", "BreadcrumbList"],
    },
  ] as const;

  for (const detail of detailPages) {
    await page.goto(detail.path);
    const canonicalUrl = `${canonicalOrigin}${detail.path}`;
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", canonicalUrl);
    await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", canonicalUrl);
    await expect(page.locator("meta[property='og:type']")).toHaveAttribute("content", "article");
    await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
      "content",
      /^https:\/\/junhaochou\.com\//,
    );
    const imageAlt = await page.locator("meta[property='og:image:alt']").getAttribute("content");
    expect(imageAlt?.trim()).toBeTruthy();
    await expect(page.locator("[data-pagefind-body]")).toHaveCount(1);
    expect(await page.locator("html").getAttribute("data-pagefind-ignore")).toBeNull();

    const schemaTypes = await page
      .locator("script[type='application/ld+json']")
      .evaluateAll((scripts) =>
        scripts.flatMap((script) => {
          const schema = JSON.parse(script.textContent ?? "{}") as {
            "@type"?: string | string[];
          };
          return Array.isArray(schema["@type"]) ? schema["@type"] : [schema["@type"]];
        }),
      );
    for (const schemaType of detail.types) expect(schemaTypes).toContain(schemaType);
  }
});
