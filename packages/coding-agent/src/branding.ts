/**
 * Single source of truth for product branding.
 *
 * Nothing downstream should hardcode the product name, the config directory, the environment
 * variable prefix or the logo: read them from here instead, so a rebrand is a config change
 * rather than a code change.
 *
 * Resolution order (first one wins per field):
 *   1. Environment variables — generic `APP_BRAND_*`, plus `<ENV_PREFIX>_BRAND_*` for convenience
 *   2. `brand` block in the package.json this process started from (legacy `piConfig` is still read)
 *   3. The defaults below
 *
 * The environment names for the brand itself are deliberately brand-neutral (`APP_BRAND_*`) so
 * they keep working even after the product is renamed again.
 */

export interface BrandInputs {
	/** CLI name, `process.title`, and the stem of the config directory when `configDir` is absent. */
	name?: string;
	/** Human readable name for UI surfaces. */
	displayName?: string;
	/** Header title. Defaults to `displayName`. */
	title?: string;
	/** Config directory under the user's home, e.g. `.lingshu`. */
	configDir?: string;
	/** Prefix for this product's environment variables, e.g. `LINGSHU` for `LINGSHU_CODING_AGENT_DIR`. */
	envPrefix?: string;
	/** One line description shown in `--help` and the startup banner. */
	tagline?: string;
	/** Homepage used by `--help` and update messages. */
	homepage?: string;
	/** Base URL of the session share viewer; the gist id is appended as the fragment. */
	shareViewerUrl?: string;
	/** Two lines of half-block logo art, or omitted to use the text wordmark. */
	logo?: { lines?: [string, string]; colors?: [string, string, string] };
}

export interface Brand {
	name: string;
	displayName: string;
	title: string;
	configDir: string;
	envPrefix: string;
	tagline: string;
	homepage: string;
	shareViewerUrl: string;
	logo: { lines?: [string, string]; colors: [string, string, string] };
}

/** Package.json shape this module reads. `piConfig` is the legacy key, kept for compatibility. */
export interface BrandPackageJson {
	name?: string;
	brand?: BrandInputs;
	piConfig?: BrandInputs;
}

export const DEFAULT_BRAND: Brand = {
	name: "lingshu",
	displayName: "Lingshu",
	title: "Lingshu",
	configDir: ".lingshu",
	envPrefix: "LINGSHU",
	tagline: "AI coding agent with read, bash, edit, write tools",
	homepage: "https://lingshu.dev",
	shareViewerUrl: "https://pi.dev/session/",
	logo: { colors: ["#E48A7A", "#4F8EB3", "#EAB65D"] },
};

function envValue(...names: string[]): string | undefined {
	for (const name of names) {
		const value = process.env[name];
		if (value !== undefined && value !== "") return value;
	}
	return undefined;
}

function nonEmpty<T extends string>(value: T | undefined): T | undefined {
	return value && value.trim() !== "" ? value : undefined;
}

/** Reads the brand overrides from the environment. Brand-neutral names first, then prefixed ones. */
function readBrandEnv(prefixHint: string): BrandInputs {
	const prefix = `${prefixHint.toUpperCase()}_BRAND`;
	const pick = (suffix: string) => envValue(`APP_BRAND_${suffix}`, `${prefix}_${suffix}`);
	const logoLines = envValue("APP_BRAND_LOGO_LINE1", `${prefix}_LOGO_LINE1`);
	const logoLine2 = envValue("APP_BRAND_LOGO_LINE2", `${prefix}_LOGO_LINE2`);
	const colors = envValue("APP_BRAND_LOGO_COLORS", `${prefix}_LOGO_COLORS`);

	return {
		name: pick("NAME"),
		displayName: pick("DISPLAY_NAME"),
		title: pick("TITLE"),
		configDir: pick("CONFIG_DIR"),
		envPrefix: pick("ENV_PREFIX"),
		tagline: pick("TAGLINE"),
		homepage: pick("HOMEPAGE"),
		shareViewerUrl: pick("SHARE_VIEWER_URL"),
		logo: {
			lines: logoLines ? [logoLines, logoLine2 ?? ""] : undefined,
			colors: colors ? (colors.split(",").map((c) => c.trim()) as [string, string, string]) : undefined,
		},
	};
}

/** Merges the defined fields of `overrides` over `base`. */
function mergeBrand(base: Brand, ...overrides: (BrandInputs | undefined)[]): Brand {
	const merged: Brand = { ...base, logo: { ...base.logo } };
	for (const override of overrides) {
		if (!override) continue;
		merged.name = nonEmpty(override.name) ?? merged.name;
		merged.displayName = nonEmpty(override.displayName) ?? merged.displayName;
		merged.title = nonEmpty(override.title) ?? merged.title;
		merged.configDir = nonEmpty(override.configDir) ?? merged.configDir;
		merged.envPrefix = nonEmpty(override.envPrefix)?.toUpperCase() ?? merged.envPrefix;
		merged.tagline = nonEmpty(override.tagline) ?? merged.tagline;
		merged.homepage = nonEmpty(override.homepage) ?? merged.homepage;
		merged.shareViewerUrl = nonEmpty(override.shareViewerUrl) ?? merged.shareViewerUrl;
		if (override.logo?.lines) merged.logo.lines = override.logo.lines;
		if (override.logo?.colors) merged.logo.colors = override.logo.colors;
	}
	// `title` and `displayName` follow `name` unless they were set explicitly.
	if (!merged.displayName) merged.displayName = merged.name;
	if (!merged.title) merged.title = merged.displayName;
	return merged;
}

/**
 * Resolves the brand for this process. Call once at startup; everything else imports the result.
 *
 * The env prefix is resolved in two passes so `LINGSHU_BRAND_ENV_PREFIX` can change the prefix
 * used by the *other* prefixed variables without depending on read order.
 */
export function resolveBrand(pkg?: BrandPackageJson): Brand {
	const pkgBrand = pkg?.brand ?? pkg?.piConfig;
	const basePrefix = pkgBrand?.envPrefix ?? DEFAULT_BRAND.envPrefix;
	const env = readBrandEnv(basePrefix);
	const prefix = env.envPrefix?.toUpperCase() ?? basePrefix;

	// Second pass with the final prefix, so `<PREFIX>_BRAND_*` beats the package.json block.
	const resolved = mergeBrand(
		DEFAULT_BRAND,
		pkgBrand,
		prefix === basePrefix.toUpperCase() ? env : readBrandEnv(prefix),
	);
	resolved.envPrefix = prefix;
	return resolved;
}

/**
 * Copies legacy environment variables to their renamed counterparts.
 *
 * `legacyPrefix` defaults to `PI`, the upstream prefix: an existing installation keeps its
 * `LINGSHU_CODING_AGENT_DIR`, `LINGSHU_DEBUG_REDRAW`, ... working after the rebrand without touching any
 * call site. Vars already set under the new prefix always win.
 */
export function inheritLegacyEnv(brand: Brand, legacyPrefix = "PI"): void {
	const from = `${legacyPrefix}_`;
	const to = `${brand.envPrefix}_`;
	if (from === to) return;
	for (const [key, value] of Object.entries(process.env)) {
		if (!key.startsWith(from) || value === undefined) continue;
		const renamed = `${to}${key.slice(from.length)}`;
		if (process.env[renamed] === undefined) process.env[renamed] = value;
	}
}

/** Environment variable name for a brand-scoped setting, e.g. `brandEnv(brand, "DEBUG_REDRAW")`. */
export function brandEnv(brand: Brand, suffix: string): string {
	return `${brand.envPrefix}_${suffix}`;
}
