export function areExperimentalFeaturesEnabled(): boolean {
	return process.env.LINGSHU_EXPERIMENTAL === "1";
}
