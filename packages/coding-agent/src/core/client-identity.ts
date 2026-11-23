import { type ClientIdentity, LINGSHU_ATTRIBUTION } from "@lingshu/ai";
import { VERSION } from "../config.ts";
import type { SettingsManager } from "./settings-manager.ts";
import { isInstallTelemetryEnabled } from "./telemetry.ts";

/**
 * How lingshu's requests identify it to providers: a detailed `User-Agent` with lingshu's version, and attribution to lingshu as a
 * CLI agent while install telemetry is enabled.
 */
export function getClientIdentity(settingsManager: SettingsManager): ClientIdentity {
	return {
		userAgent: "detailed",
		version: VERSION,
		attribution: isInstallTelemetryEnabled(settingsManager) ? LINGSHU_ATTRIBUTION : null,
	};
}
