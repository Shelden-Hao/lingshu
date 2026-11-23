// Electron main process: manages the p2 server lifecycle and hosts its web UI in a window.
import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { app, BrowserWindow, ipcMain, shell } from "electron";

// The host environment injects a dead HTTP proxy. Local loopback traffic must never use it,
// and main-process fetch would otherwise obey it too.
for (const key of ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"]) {
	delete process.env[key];
}
process.env.NO_PROXY = "127.0.0.1,localhost,::1";

const PORT = 8788;
const APP_URL = `http://127.0.0.1:${PORT}`;
const HERE = __dirname;

// In source layout the built main.js sits in apps/desktop/dist and p2 is a sibling app.
// In a packaged app the p2 sources are unpacked next to the app, so several roots are tried.
// LINGSHU_P2_DIR overrides all of them for custom installs.
const CANDIDATES = [
	process.env.LINGSHU_P2_DIR,
	resolve(HERE, "../../p2"),
	resolve(HERE, "../p2"),
	resolve(app.getAppPath(), "../p2"),
	resolve(process.resourcesPath ?? ".", "app/p2"),
].filter((dir): dir is string => Boolean(dir));
const P2_DIR = CANDIDATES.find((dir) => existsSync(resolve(dir, "src/hosts/server.ts")));

let serverProcess: ChildProcess | undefined;
let proxyProcess: ChildProcess | undefined;
let isQuitting = false;

/** Probe whether the p2 server is already listening on the loopback port. */
function isPortOpen(): Promise<boolean> {
	return new Promise((resolveReady) => {
		const socket = createConnection({ host: "127.0.0.1", port: PORT });
		const finish = (open: boolean) => {
			socket.destroy();
			resolveReady(open);
		};
		socket.setTimeout(1000);
		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
		socket.once("timeout", () => finish(false));
	});
}

/** Wait until the server accepts connections, with a bounded timeout. */
async function waitForServer(timeoutMs = 30_000): Promise<boolean> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (await isPortOpen()) return true;
		await new Promise((r) => setTimeout(r, 300));
	}
	return false;
}

/**
 * Read the KCoder API key from the host's WorkBuddy model list, so models.json's
 * `$KCODER_API_KEY` reference resolves without the key ever living in a repo file.
 */
function readKCoderKey(): string | undefined {
	const candidates = [
		process.env.LINGSHU_KCODER_KEY_FILE,
		resolve(app.getPath("home"), ".workbuddy/models.json"),
		resolve(app.getPath("appData"), "models.json"),
	].filter((path): path is string => Boolean(path));
	for (const file of candidates) {
		if (!existsSync(file)) continue;
		try {
			const entries: unknown = JSON.parse(readFileSync(file, "utf8"));
			if (!Array.isArray(entries)) continue;
			const entry = entries.find((item): item is { apiKey?: unknown } =>
				Boolean(item && typeof item === "object" && "apiKey" in item),
			);
			if (entry && typeof entry.apiKey === "string") return entry.apiKey;
		} catch {}
	}
	return undefined;
}

/** Strip the broken ambient proxy so the local server and KCoder link are never proxied. */
function cleanEnv(): NodeJS.ProcessEnv {
	const env = { ...process.env };
	for (const key of [
		"HTTP_PROXY",
		"HTTPS_PROXY",
		"http_proxy",
		"https_proxy",
		"ALL_PROXY",
		"all_proxy",
		"ELECTRON_RUN_AS_NODE",
	]) {
		delete env[key];
	}
	env.NO_PROXY = "127.0.0.1,localhost,::1";
	// p2's models.json references $KCODER_API_KEY; supply it so the custom provider signs in.
	const kcoderKey = env.KCODER_API_KEY ?? readKCoderKey();
	if (kcoderKey) env.KCODER_API_KEY = kcoderKey;
	return env;
}

/** The KCoder models the desktop ships with, keyed by environment reference so no secret is stored. */
const KCODER_PROVIDER = {
	name: "KCoder (同方知网)",
	baseUrl: "http://127.0.0.1:8899/v1",
	api: "openai-completions",
	apiKey: "$KCODER_API_KEY",
	models: [
		{
			id: "glm",
			name: "GLM-5.3-FP8 (300K)",
			reasoning: true,
			input: ["text", "image"],
			contextWindow: 300000,
			maxTokens: 131072,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		},
		{
			id: "glm-flash",
			name: "GLM-5.3-Flash (1M)",
			reasoning: true,
			input: ["text", "image"],
			contextWindow: 1000000,
			maxTokens: 131072,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		},
		{
			id: "KCoder",
			name: "KCoder 四模型随机调度 (300K)",
			reasoning: true,
			input: ["text", "image"],
			contextWindow: 300000,
			maxTokens: 131072,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		},
		{
			id: "deepseek",
			name: "DeepSeek-V4-Flash-0731 (1M)",
			reasoning: true,
			input: ["text", "image"],
			contextWindow: 1000000,
			maxTokens: 131072,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		},
	],
} as const;

/** Read a JSON object file, or an empty object when it is missing or unparseable. */
function readJsonObject(path: string): Record<string, unknown> {
	try {
		const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
	} catch {
		return {};
	}
}

/**
 * Add the KCoder provider and its credential to p2's data directory.
 * p2 lists a provider only once auth.json holds a credential for it, so both files are needed.
 * Only the `kcoder` entries are added; the user's other providers, defaults and edits are preserved.
 */
function seedModelConfig(): void {
	const dataDir = process.env.P2_DATA_DIR ?? resolve(app.getPath("home"), ".lingshu", "p2");
	const modelsPath = resolve(dataDir, "models.json");
	const authPath = resolve(dataDir, "auth.json");
	try {
		mkdirSync(dataDir, { recursive: true });

		const models = readJsonObject(modelsPath);
		const providers = (models.providers ?? {}) as Record<string, unknown>;
		if (!providers.kcoder) {
			models.$schema ??= "https://pi.dev/schemas/models.schema.json";
			models.providers = { ...providers, kcoder: KCODER_PROVIDER };
			writeFileSync(modelsPath, `${JSON.stringify(models, null, "\t")}\n`, "utf8");
			console.log("[desktop] added the KCoder provider to models.json");
		}

		// A credential entry is what makes p2 list the provider; an empty {} needs it added.
		const auth = readJsonObject(authPath);
		if (!auth.kcoder) {
			auth.kcoder = { type: "api_key", key: "$KCODER_API_KEY" };
			writeFileSync(authPath, `${JSON.stringify(auth, null, "\t")}\n`, "utf8");
			console.log("[desktop] added the KCoder credential to auth.json");
		}
	} catch (error) {
		console.error("[desktop] could not seed model config:", error instanceof Error ? error.message : error);
	}
}

/** Start the protocol proxy that maps Pi's OpenAI path onto KCoder's private endpoint. */
function startProxy(): void {
	const candidates = [
		process.env.LINGSHU_PROXY_SCRIPT,
		resolve(HERE, "../../../scripts/kcoder_proxy.py"),
		resolve(app.getAppPath(), "../../scripts/kcoder_proxy.py"),
	].filter((path): path is string => Boolean(path));
	const proxyScript = candidates.find((path) => existsSync(path));
	if (!proxyScript) return;
	proxyProcess = spawn("python", [proxyScript], { env: cleanEnv(), stdio: "ignore" });
	proxyProcess.on("error", (err) => console.error("[desktop] proxy spawn failed:", err.message));
}

/** The one-time sign-in token the p2 server prints on startup, captured for automatic sign-in. */
let signInToken: string | undefined;
let tokenWaiter: ((token: string | undefined) => void) | undefined;

/** Scan one line of server output for the startup sign-in token. */
function scanForToken(line: string): void {
	if (signInToken) return;
	const match = line.match(/sign-in token[^:]*:\s*([0-9a-f]{32,})/i);
	if (!match) return;
	signInToken = match[1];
	tokenWaiter?.(signInToken);
	tokenWaiter = undefined;
}

/** Start the p2 server from its TypeScript sources using the repo's source resolver. */
function startServer(): void {
	if (!P2_DIR) throw new Error("Cannot locate apps/p2 (server sources not found)");
	const source = resolve(P2_DIR, "src/source.ts");
	const entry = resolve(P2_DIR, "src/hosts/server.ts");
	// Node's ESM loader requires file:// URLs for absolute --import paths on Windows.
	const sourceUrl = pathToFileURL(source).href;
	// process.execPath is electron.exe inside the main process; spawn the system node instead.
	const nodeBin = process.env.LINGSHU_NODE_BIN ?? "node";
	serverProcess = spawn(nodeBin, ["--import", sourceUrl, entry], {
		cwd: P2_DIR,
		env: cleanEnv(),
		stdio: ["ignore", "pipe", "pipe"],
	});
	// Forward server output to the console and watch for the sign-in token.
	for (const stream of [serverProcess.stdout, serverProcess.stderr]) {
		stream?.setEncoding("utf8");
		stream?.on("data", (chunk: string) => {
			process.stdout.write(chunk);
			for (const line of chunk.split(/\r?\n/)) scanForToken(line);
		});
	}
	serverProcess.on("error", (err) => console.error("[desktop] p2 server spawn failed:", err.message));
	serverProcess.on("exit", (code) => console.error(`[desktop] p2 server exited with ${code}`));
}

/** Wait for the sign-in token to appear in server output, bounded by `timeoutMs`. */
function waitForToken(timeoutMs = 20_000): Promise<string | undefined> {
	if (signInToken) return Promise.resolve(signInToken);
	return new Promise((resolveToken) => {
		const timer = setTimeout(() => {
			tokenWaiter = undefined;
			resolveToken(undefined);
		}, timeoutMs);
		tokenWaiter = (token) => {
			clearTimeout(timer);
			resolveToken(token);
		};
	});
}

/**
 * Sign in automatically: exchange the startup token for the owner cookie and put it in the
 * session the window uses, so the app opens signed in instead of on the sign-in page.
 */
async function signIn(win: BrowserWindow): Promise<void> {
	const token = await waitForToken();
	if (!token) return;
	try {
		const response = await fetch(new URL("/owner/claim", APP_URL), {
			method: "POST",
			headers: { Origin: APP_URL, "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
			redirect: "error",
		});
		if (!response.ok) return;
		for (const header of response.headers.getSetCookie()) {
			const [pair] = header.split(";", 1);
			const index = pair.indexOf("=");
			if (index <= 0) continue;
			await win.webContents.session.cookies.set({
				url: APP_URL,
				name: pair.slice(0, index),
				value: pair.slice(index + 1),
			});
		}
	} catch (error) {
		console.error("[desktop] automatic sign-in failed:", error instanceof Error ? error.message : error);
	}
}

/** Terminate a child process tree without leaving orphans. */
function stopChild(child: ChildProcess | undefined): void {
	if (!child || child.exitCode !== null || !child.pid) return;
	child.kill("SIGTERM");
	if (process.platform === "win32") {
		spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
	}
}

function createWindow(): BrowserWindow {
	const win = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		title: "Lingshu",
		webPreferences: {
			preload: resolve(HERE, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	ipcMain.on("window:minimize", () => win.minimize());
	ipcMain.on("window:maximize", () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
	ipcMain.on("window:close", () => win.close());

	// Only local app pages may navigate in-window; everything else opens in the system browser.
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (!url.startsWith(APP_URL)) shell.openExternal(url);
		return { action: "deny" };
	});
	win.webContents.on("will-navigate", (event, url) => {
		if (!url.startsWith(APP_URL) && !url.startsWith("devtools://")) event.preventDefault();
	});

	return win;
}

async function bootstrap(): Promise<void> {
	const alreadyRunning = await isPortOpen();
	if (!alreadyRunning) {
		seedModelConfig();
		startProxy();
		startServer();
	}
	const ready = await waitForServer();
	if (!ready) {
		app.quit();
		return;
	}
	const win = createWindow();
	// Sign in before the first load so the app opens on the home screen, not the sign-in page.
	if (!alreadyRunning) await signIn(win);
	void win.loadURL(APP_URL);
}

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
	if (isQuitting) return;
	isQuitting = true;
	stopChild(serverProcess);
	stopChild(proxyProcess);
});
