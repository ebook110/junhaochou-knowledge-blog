import { expect, test } from "@playwright/test";

for (const path of [
  "/",
  "/articles/",
  "/categories/",
  "/tags/",
  "/series/",
  "/search/",
  "/about/",
  "/admin/",
  "/healthz",
  "/articles/vps-secure-ubuntu/",
  "/articles/ansys-codex-workflow/",
  "/articles/client-subscription-guide/",
]) {
  test(`renders ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(
      /JunhaoChou|全部文章|文章分类|标签|系列教程|搜索|关于|健康检查|Ubuntu|ANSYS/,
    );
  });
}
test("opens search with Ctrl+K and exposes a keyboard accessible input", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.locator("#search-modal")).toBeVisible();
  await expect(page.locator("#search-input")).toBeFocused();
});
test("switches theme", async ({ page }) => {
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("renders a noindex Decap CMS admin shell", async ({ page }) => {
  await page.goto("/admin/");
  await expect(page).toHaveTitle("JunhaoChou Admin");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  await expect(page.locator("script[src*='decap-cms']")).toHaveCount(1);
});

test("renders local cover art with descriptive text alternatives", async ({ page }) => {
  await page.goto("/articles/ansys-codex-workflow/");
  const cover = page.locator("img[src^='/images/covers/']").first();
  await expect(cover).toBeVisible();
  await expect(cover).toHaveAttribute("alt", /工程仿真/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
    "content",
    /ansys-codex-workflow\.webp/,
  );
});

test("opens and closes the mobile article table of contents", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/articles/ansys-codex-workflow/");
  await page.getByRole("button", { name: "目录" }).click();
  const dialog = page.locator("#mobile-toc");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
