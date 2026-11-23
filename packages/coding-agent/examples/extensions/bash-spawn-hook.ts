/**
 * Bash Spawn Hook Example
 *
 * Adjusts command, cwd, and env before execution.
 *
 * Usage:
 *   lingshu -e ./bash-spawn-hook.ts
 */

import type { ExtensionAPI } from "@lingshu/coding-agent";
import { createBashTool } from "@lingshu/coding-agent";

export default function (lingshu: ExtensionAPI) {
	const cwd = process.cwd();

	const bashTool = createBashTool(cwd, {
		spawnHook: ({ command, cwd, env }) => ({
			command: `source ~/.profile\n${command}`,
			cwd,
			env: { ...env, LINGSHU_SPAWN_HOOK: "1" },
		}),
	});

	lingshu.registerTool({
		...bashTool,
		execute: async (id, params, signal, onUpdate, _ctx) => {
			return bashTool.execute(id, params, signal, onUpdate);
		},
	});
}
