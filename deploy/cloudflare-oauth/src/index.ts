interface Env {
  CMS_ORIGIN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

const STATE_TTL_SECONDS = 600;

const textEncoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function signature(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64Url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(value))),
  );
}

async function createState(secret: string): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const nonce = new Uint8Array(18);
  crypto.getRandomValues(nonce);
  const payload = `${issuedAt}.${base64Url(nonce)}`;
  return `${payload}.${await signature(payload, secret)}`;
}

async function validState(state: string, secret: string): Promise<boolean> {
  const [issuedAt, nonce, receivedSignature] = state.split(".");
  if (!issuedAt || !nonce || !receivedSignature) return false;
  const age = Math.floor(Date.now() / 1000) - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > STATE_TTL_SECONDS) return false;
  return timingSafeEqual(receivedSignature, await signature(`${issuedAt}.${nonce}`, secret));
}

function readCookie(request: Request, name: string): string | undefined {
  const value = request.headers.get("Cookie")?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return value?.[1];
}

function responseHtml(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; script-src 'unsafe-inline'",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function jsonForInlineScript(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/gu, (character) => {
    const escapes: Record<string, string> = {
      "<": "\\u003C",
      ">": "\\u003E",
      "&": "\\u0026",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029",
    };
    return escapes[character] ?? character;
  });
}

function failure(message: string, status = 400): Response {
  return responseHtml(
    `<!doctype html><title>OAuth error</title><p>${escapeHtml(message)}</p>`,
    status,
  );
}

function authorizationHandshake(
  provider: string,
  authorizeUrl: string,
  cmsOrigin: string,
): Response {
  const handshake = `authorizing:${provider}`;
  const script = `
const expectedOrigin = ${jsonForInlineScript(cmsOrigin)};
const handshake = ${jsonForInlineScript(handshake)};
const authorizeUrl = ${jsonForInlineScript(authorizeUrl)};
const startAuthorization = () => window.location.replace(authorizeUrl);

if (!window.opener) {
  startAuthorization();
} else {
  const onMessage = (event) => {
    if (event.origin !== expectedOrigin || event.data !== handshake) return;
    window.removeEventListener("message", onMessage);
    startAuthorization();
  };
  window.addEventListener("message", onMessage);
  window.opener.postMessage(handshake, expectedOrigin);
}`;
  return responseHtml(
    `<!doctype html><title>Authorizing</title><script>${script}</script><p>Authorizing with GitHub.</p>`,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const callbackUrl = new URL("/callback", url.origin).toString();

    if (url.pathname === "/auth" && request.method === "GET") {
      const provider = url.searchParams.get("provider") ?? "github";
      if (provider !== "github") return failure("Unsupported OAuth provider.");

      const state = await createState(env.GITHUB_CLIENT_SECRET);
      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
      authorizeUrl.search = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: callbackUrl,
        scope: "repo",
        state,
      }).toString();
      const response = authorizationHandshake(provider, authorizeUrl.toString(), env.CMS_ORIGIN);
      response.headers.set(
        "Set-Cookie",
        `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=${STATE_TTL_SECONDS}`,
      );
      return response;
    }

    if (url.pathname === "/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const cookieState = readCookie(request, "decap_oauth_state");
      if (!code || !state || !cookieState || !timingSafeEqual(state, cookieState)) {
        return failure("The OAuth state could not be verified.");
      }
      if (!(await validState(state, env.GITHUB_CLIENT_SECRET))) {
        return failure("The OAuth state expired or is invalid.");
      }

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: callbackUrl,
        }),
      });
      const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };
      if (!tokenResponse.ok || !tokenData.access_token) {
        return failure(`GitHub authorization failed: ${tokenData.error ?? "unknown error"}`, 502);
      }

      const message = `authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: "github" })}`;
      const script = `window.opener?.postMessage(${jsonForInlineScript(message)}, ${jsonForInlineScript(env.CMS_ORIGIN)});window.close();`;
      return responseHtml(
        `<!doctype html><title>Authorization complete</title><script>${script}</script><p>Authorization complete. You can close this window.</p>`,
      );
    }

    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  },
};
