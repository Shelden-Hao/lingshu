import { formatUserAgent } from "@lingshu/ai";

/** lingshu's `User-Agent` for its own network requests; the same detailed form lingshu-ai sends to providers. */
export function getPiUserAgent(version: string): string {
	return formatUserAgent({ userAgent: "detailed", version });
}
