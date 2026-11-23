// Dev launcher: compile the shell, then start Electron with a clean environment.
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const build = spawnSync("npm", ["run", "build"], { cwd: appDir, stdio: "inherit", shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

// Electron must not run in Node mode. Some host environments inject ELECTRON_RUN_AS_NODE=1.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronBin = resolve(appDir, "node_modules/electron/dist/electron.exe");
const electron = spawnSync(electronBin, ["."], {
	cwd: appDir,
	env,
	stdio: "inherit",
	shell: true,
});
process.exit(electron.status ?? 1);
