import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = option("--host", "127.0.0.1");
const port = Number(option("--port", "4321"));
const root = resolve(option("--root", fileURLToPath(new URL("../dist/", import.meta.url))));
const rootPrefix = `${root}${sep}`;

if (!Number.isInteger(port) || port < 0 || port > 65_535) {
  throw new Error(`Invalid port: ${port}`);
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".ttf", "font/ttf"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
  [".yml", "text/yaml; charset=utf-8"],
]);

async function findFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decoded.replace(/^[/\\]+/u, "");
  const candidates = decoded.endsWith("/")
    ? [`${relativePath}index.html`]
    : [relativePath, `${relativePath}/index.html`, `${relativePath}.html`];

  for (const candidate of candidates) {
    const path = resolve(root, candidate);
    if (path !== root && !path.startsWith(rootPrefix)) continue;
    try {
      if ((await stat(path)).isFile()) return path;
    } catch {
      // Try the next static-route candidate.
    }
  }
  return null;
}

async function handle(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);
  const file = await findFile(url.pathname);
  if (!file) {
    const fallback = resolve(root, "404.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (request.method === "HEAD") response.end();
    else createReadStream(fallback).pipe(response);
    return;
  }

  const metadata = await stat(file);
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": metadata.size,
    "Content-Type": contentTypes.get(extname(file).toLowerCase()) ?? "application/octet-stream",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(file).pipe(response);
}

const server = createServer((request, response) => {
  void handle(request, response).catch((error) => {
    console.error(error);
    if (!response.headersSent) response.writeHead(500);
    response.end();
  });
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => process.exit(0));
  server.closeAllConnections();
  setTimeout(() => process.exit(0), 1_000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
server.listen(port, host, () => {
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  process.send?.({ type: "ready", port: actualPort });
  console.log(`Static test server ready at http://${host}:${actualPort}`);
});
