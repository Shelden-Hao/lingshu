/**
 * Redraws Extension
 *
 * Exposes /tui to show TUI redraw stats.
 */

import type { ExtensionAPI } from "@lingshu/coding-agent";
import { Text } from "@lingshu/tui";

export default function (lingshu: ExtensionAPI) {
	lingshu.registerCommand("tui", {
		description: "Show TUI stats",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) return;
			let redraws = 0;
			await ctx.ui.custom<void>((tui, _theme, _keybindings, done) => {
				redraws = tui.fullRedraws;
				done(undefined);
				return new Text("", 0, 0);
			});
			ctx.ui.notify(`TUI full redraws: ${redraws}`, "info");
		},
	});
}
