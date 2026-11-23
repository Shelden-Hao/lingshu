// The runtime's built-in header, status lines and footer fallback. The header follows coding-agent's startup header
// (interactive-mode.ts BuiltInHeader, lingshu-logo.ts): logo, then the server origin and role in place of the version, then
// key hints; Ctrl+O (expanded tools) shows the full list.
import {
	type Component,
	foregroundAnsi,
	rgbColor,
	Text,
	TruncatedText,
	truncateToWidth,
	visibleWidth,
} from "@lingshu/tui";
import { lineText, type RenderContext } from "../render-context.ts";

const CORAL = rgbColor(228, 138, 122);

const YELLOW = rgbColor(234, 182, 93);
const RESET = "\x1b[0m";

/** Brand wordmark for the header: the display name in the brand colors, plus an empty second line. */
export function brandLogoLines(ctx: RenderContext): [string, string] {
	const mode = ctx.theme.current.getColorMode();
	const fg = (color: typeof CORAL) => foregroundAnsi(color, mode);
	const name = "Lingshu";
	return [`${fg(CORAL)}${name.slice(0, 1)}${RESET}${fg(YELLOW)}${name.slice(1)}${RESET}`, ""];
}

export type HeaderSource = {
	readonly ctx: RenderContext & {
		hints: { key(id: string, description: string): string; raw(key: string, d: string): string };
	};
	readonly origin: string | undefined;
	readonly role: string | undefined;
	readonly connected: boolean;
	readonly expanded: boolean;
	/** Hints for the compact line, already styled. */
	hints(): string[];
	/** The full list shown when expanded. */
	expandedHints(): string[];
};

export class BuiltInHeader implements Component {
	private source: HeaderSource;
	private text = new Text("", 1, 0);
	private key = "";
	constructor(source: HeaderSource) {
		this.source = source;
	}
	invalidate(): void {
		this.key = "";
		this.text.invalidate();
	}
	render(width: number): string[] {
		const source = this.source;
		const theme = source.ctx.theme.current;
		const hints = source.expanded ? source.expandedHints() : source.hints();
		const key = JSON.stringify([source.ctx.theme.version, source.origin, source.role, source.connected, hints]);
		if (key !== this.key) {
			this.key = key;
			const [top, bottom] = brandLogoLines(source.ctx);
			const where = [source.origin ? lineText(source.origin) : "", source.role ?? ""].filter(Boolean).join(" · ");
			const state = source.connected ? "" : ` ${theme.fg("warning", "reconnecting…")}`;
			const separator = theme.fg("muted", " · ");
			const lines = source.expanded
				? [`${top} ${theme.fg("dim", where)}${state}`, `${bottom}`, ...hints]
				: [
						`${top} ${theme.fg("dim", where)}${state}`,
						`${bottom} ${hints.join(separator)}`,
						theme.fg("dim", `Press ${source.ctx.keyText("app.tools.expand")} to show full startup help.`),
					];
			this.text.setText(lines.join("\n"));
		}
		return ["", ...this.text.render(width)];
	}
}

export type Notice = { kind: "info" | "warning" | "error"; text: string; count: number };

/** Status and error lines (lingshu's showStatus/showError); a repeated message collapses into one line with a count. */
export class StatusLines implements Component {
	private ctx: RenderContext;
	private notices: () => readonly Notice[];
	constructor(ctx: RenderContext, notices: () => readonly Notice[]) {
		this.ctx = ctx;
		this.notices = notices;
	}
	invalidate(): void {}
	render(width: number): string[] {
		const theme = this.ctx.theme.current;
		return this.notices().map((notice) => {
			const color = notice.kind === "error" ? "error" : notice.kind === "warning" ? "warning" : "dim";
			const text = `${notice.kind === "error" ? "Error: " : ""}${lineText(notice.text)}${notice.count > 1 ? ` (×${notice.count})` : ""}`;
			return truncateToWidth(` ${theme.fg(color, text)}`, width);
		});
	}
}

/** Fallback footer when no plugin registers the `footer` slot: one dim line of hints. */
export class BuiltInFooter implements Component {
	private line: () => string;
	constructor(line: () => string) {
		this.line = line;
	}
	invalidate(): void {}
	render(width: number): string[] {
		const line = this.line();
		return line ? [new TruncatedText(line, 1, 0).render(width)[0] ?? ""] : [];
	}
}

/** Pads `left` and `right` onto one line (footer stats left, model right), truncating the right side first. */
export function spread(left: string, right: string, width: number, minPadding = 2): string {
	let leftText = left;
	let leftWidth = visibleWidth(leftText);
	if (leftWidth > width) {
		leftText = truncateToWidth(leftText, width, "...");
		leftWidth = visibleWidth(leftText);
	}
	const rightWidth = visibleWidth(right);
	if (leftWidth + minPadding + rightWidth <= width)
		return leftText + " ".repeat(width - leftWidth - rightWidth) + right;
	const available = width - leftWidth - minPadding;
	if (available <= 0) return leftText;
	const cut = truncateToWidth(right, available, "");
	return leftText + " ".repeat(Math.max(0, width - leftWidth - visibleWidth(cut))) + cut;
}
