const baseUrl = new URL(process.argv[2] ?? "http://127.0.0.1:8081/");
const failures = [];

function fail(scope, message) {
  failures.push(`${scope}: ${message}`);
}

function header(response, name) {
  return response.headers.get(name)?.trim() ?? "";
}

function expectHeader(response, name, expected, scope) {
  const actual = header(response, name);
  if (typeof expected === "string" ? actual !== expected : !expected.test(actual)) {
    fail(scope, `${name} was ${JSON.stringify(actual)}`);
  }
}

function expectSecurityHeaders(response, scope) {
  expectHeader(response, "x-content-type-options", "nosniff", scope);
  expectHeader(response, "x-frame-options", "SAMEORIGIN", scope);
  expectHeader(response, "referrer-policy", "strict-origin-when-cross-origin", scope);
  expectHeader(
    response,
    "permissions-policy",
    /(?:^|,\s*)camera=\(\).*(?:^|,\s*)microphone=\(\).*(?:^|,\s*)geolocation=\(\)/iu,
    scope,
  );
  if (/\/\d/u.test(header(response, "server"))) {
    fail(scope, "server header exposes a version");
  }
}

async function request(path, options = {}) {
  const url = new URL(path, baseUrl);
  try {
    const response = await fetch(url, {
      method: options.body === false ? "HEAD" : "GET",
      redirect: options.redirect ?? "follow",
    });
    const body = options.body === false ? "" : await response.text();
    const expectedStatus = options.status ?? 200;
    if (response.status !== expectedStatus) {
      fail(path, `expected HTTP ${expectedStatus}, received ${response.status}`);
    }
    return { response, body };
  } catch (error) {
    fail(path, `request failed: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

function expectNoStore(response, scope) {
  const cache = header(response, "cache-control");
  for (const directive of ["private", "no-store", "no-cache", "must-revalidate"]) {
    if (!cache.includes(directive)) fail(scope, `Cache-Control is missing ${directive}`);
  }
}

const homepage = await request("/");
if (homepage) {
  expectSecurityHeaders(homepage.response, "/");
  expectHeader(homepage.response, "cache-control", /(?:^|,\s*)no-cache(?:,|$)/iu, "/");
}

const health = await request("/healthz/");
if (health) {
  expectSecurityHeaders(health.response, "/healthz/");
  expectHeader(health.response, "cache-control", /(?:^|,\s*)no-cache(?:,|$)/iu, "/healthz/");
  if (!health.body.includes("healthy")) fail("/healthz/", "body does not contain healthy");
}

const adminRedirect = await request("/admin", { redirect: "manual", status: 308, body: false });
if (adminRedirect) {
  expectSecurityHeaders(adminRedirect.response, "/admin");
  expectNoStore(adminRedirect.response, "/admin");
  expectHeader(adminRedirect.response, "x-robots-tag", "noindex, nofollow, noarchive", "/admin");
  const location = header(adminRedirect.response, "location");
  if (!location.endsWith("/admin/")) fail("/admin", `unexpected redirect location ${location}`);
}

const admin = await request("/admin/");
if (admin) {
  expectSecurityHeaders(admin.response, "/admin/");
  expectNoStore(admin.response, "/admin/");
  expectHeader(admin.response, "x-robots-tag", "noindex, nofollow, noarchive", "/admin/");
  if (
    !/<meta\s+name=["']robots["']\s+content=["']noindex, nofollow, noarchive["']/iu.test(admin.body)
  ) {
    fail("/admin/", "HTML robots meta is missing");
  }
  if (/unpkg\.com|cdn\.jsdelivr\.net/iu.test(admin.body)) {
    fail("/admin/", "admin references a floating CDN");
  }

  const localAssets = [
    ...new Set(
      [...admin.body.matchAll(/(?:src|href)=["'](\/_astro\/[^"']+\.(?:css|js))["']/giu)].map(
        (match) => match[1],
      ),
    ),
  ];
  if (localAssets.length === 0) {
    fail("/admin/", "no local bundled admin asset was found");
  } else {
    const asset = await request(localAssets[0], { body: false });
    if (asset) {
      expectSecurityHeaders(asset.response, localAssets[0]);
      expectHeader(asset.response, "cache-control", /max-age=2592000/iu, localAssets[0]);
    }
  }
}

const adminConfig = await request("/admin/config.yml");
if (adminConfig) {
  expectSecurityHeaders(adminConfig.response, "/admin/config.yml");
  expectNoStore(adminConfig.response, "/admin/config.yml");
  expectHeader(
    adminConfig.response,
    "x-robots-tag",
    "noindex, nofollow, noarchive",
    "/admin/config.yml",
  );
  expectHeader(adminConfig.response, "content-type", /^text\/yaml(?:;|$)/iu, "/admin/config.yml");
}

const adminPreview = await request("/admin/preview.css", { body: false });
if (adminPreview) {
  expectSecurityHeaders(adminPreview.response, "/admin/preview.css");
  expectNoStore(adminPreview.response, "/admin/preview.css");
  expectHeader(
    adminPreview.response,
    "x-robots-tag",
    "noindex, nofollow, noarchive",
    "/admin/preview.css",
  );
}

const pagefind = await request("/pagefind/pagefind.js", { body: false });
if (pagefind) {
  expectSecurityHeaders(pagefind.response, "/pagefind/pagefind.js");
  expectHeader(pagefind.response, "cache-control", /max-age=600/iu, "/pagefind/pagefind.js");
}

const robots = await request("/robots.txt");
if (robots && !/^Disallow:\s*\/admin\/$/imu.test(robots.body)) {
  fail("/robots.txt", "admin disallow rule is missing");
}

if (failures.length > 0) {
  console.error(
    `Container smoke validation failed:\n${failures.map((item) => `- ${item}`).join("\n")}`,
  );
  process.exit(1);
}

console.log(`Container smoke validation passed at ${baseUrl.origin}.`);
