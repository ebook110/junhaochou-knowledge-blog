import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const requestedPort = Number(process.env.PLAYWRIGHT_PORT ?? "0");
const root = fileURLToPath(new URL("../", import.meta.url));
const serverEntry = fileURLToPath(new URL("./serve-dist.mjs", import.meta.url));
const playwrightEntry = fileURLToPath(
  new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
);

if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65_535) {
  throw new Error(`Invalid PLAYWRIGHT_PORT: ${requestedPort}`);
}

const server = spawn(
  process.execPath,
  [serverEntry, "--host", host, "--port", String(requestedPort)],
  {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe", "ipc"],
    windowsHide: true,
  },
);
server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

let stoppingServer = false;
function waitForExit(timeout) {
  if (server.exitCode !== null) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      server.off("exit", onExit);
      resolve(false);
    }, timeout);
    server.once("exit", onExit);
  });
}

async function stopServer() {
  if (stoppingServer || server.exitCode !== null) return;
  stoppingServer = true;
  const gracefulExit = waitForExit(2_000);
  server.kill("SIGTERM");
  if (!(await gracefulExit) && server.exitCode === null) {
    const forcedExit = waitForExit(2_000);
    server.kill("SIGKILL");
    if (!(await forcedExit)) throw new Error("Unable to stop the static test server.");
  }
}

async function waitForServer() {
  const port = await new Promise((resolve, reject) => {
    if (server.exitCode !== null) {
      reject(new Error(`Static test server exited before readiness with code ${server.exitCode}.`));
      return;
    }
    const cleanup = () => {
      clearTimeout(timer);
      server.off("exit", onExit);
      server.off("message", onMessage);
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`Static test server exited before readiness with code ${code}.`));
    };
    const onMessage = (message) => {
      if (message?.type !== "ready" || !Number.isInteger(message.port)) return;
      cleanup();
      resolve(message.port);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Static test server did not report readiness within six seconds."));
    }, 6_000);
    server.once("exit", onExit);
    server.on("message", onMessage);
  });
  const baseUrl = `http://${host}:${port}`;
  const response = await fetch(`${baseUrl}/healthz/`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Static test server health check failed at ${baseUrl}.`);
  return port;
}

let testProcess;
try {
  const port = await waitForServer();
  testProcess = spawn(process.execPath, [playwrightEntry, "test", ...process.argv.slice(2)], {
    cwd: root,
    env: { ...process.env, PLAYWRIGHT_PORT: String(port) },
    stdio: "inherit",
    windowsHide: true,
  });
  const [code, signal] = await once(testProcess, "exit");
  if (signal) {
    console.error(`Playwright exited after signal ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await stopServer();
}
