import { foregroundAnsi, isAppleTerminalSession, rgbColor } from "@lingshu/tui";
import { APP_DISPLAY_NAME, BRAND } from "../../../config.ts";
import { theme } from "../theme/theme.ts";

const RESET = "\x1b[0m";

type Rgb = ReturnType<typeof rgbColor>;

/** Parses `#RRGGBB` (or `RRGGBB`) into the TUI color type; falls back to the brand's first color. */
function parseHex(hex: string): Rgb | undefined {
	const value = hex.replace("#", "").trim();
	if (!/^[0-9a-f]{6}$/i.test(value)) return undefined;
	const int = Number.parseInt(value, 16);
	return rgbColor((int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff);
}

function brandColor(index: number): Rgb {
	const [first, second, third] = BRAND.logo.colors;
	const fallback = (second ?? first) as string;
	const hex = [first, second, third][index] ?? fallback;
	return parseHex(hex) ?? rgbColor(228, 138, 122);
}

/**
 * Whether the terminal renders the half-block logo art correctly. Apple Terminal draws gaps
 * between rows and misaligns the half blocks, so it gets the text wordmark instead.
 */
export function supportsBrandLogo(): boolean {
	return Boolean(BRAND.logo.lines) && !isAppleTerminalSession();
}

/**
 * The startup header: a two-line brand block whose first line carries the version and whose
 * second line carries the first key hints.
 *
 * With `brand.logo.lines` configured (two lines of half-block art) the art is rendered in the
 * brand colors. Otherwise the display name is used as a wordmark, which always renders.
 */
export function brandHeaderLines(version: string, hints: string): string {
	const mode = theme.getColorMode();
	const fg = (index: number) => foregroundAnsi(brandColor(index), mode);
	const dim = (text: string) => theme.fg("dim", text);

	if (BRAND.logo.lines && supportsBrandLogo()) {
		const [top, bottom] = BRAND.logo.lines;
		return `${fg(0)}${top}${RESET} ${dim(`v${version}`)}\n${fg(1)}${bottom}${RESET} ${hints}`;
	}

	const name = APP_DISPLAY_NAME;
	return `${fg(0)}${name.slice(0, 1)}${RESET}${fg(2)}${name.slice(1)}${RESET} ${dim(`v${version}`)}\n${hints}`;
}

/** Text wordmark, used where only the name fits (e.g. inline prompts). */
export function brandWordmark(): string {
	const mode = theme.getColorMode();
	const name = APP_DISPLAY_NAME;
	return `${foregroundAnsi(brandColor(0), mode)}${name.slice(0, 1)}${RESET}${foregroundAnsi(brandColor(2), mode)}${name.slice(1)}${RESET}`;
}
