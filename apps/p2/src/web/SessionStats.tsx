import type { Usage } from "@lingshu/ai";
import type { ReactNode } from "react";
import { ContextUsage } from "./Chat.tsx";
import { UsersIcon } from "./icons.tsx";
import { useMessages } from "./language.ts";
import { messages } from "./messages.ts";
import { cacheHitRate } from "./transcript.ts";
export function cost(value: number): string {
	return value >= 1 ? `$${value.toFixed(2)}` : value >= 0.01 ? `$${value.toFixed(3)}` : `$${value.toFixed(4)}`;
}

/** Cache hit share of the latest assistant response, independent of session-wide spend. */
export function UsageLine({ usage }: { usage?: Usage }) {
	const { t } = useMessages(messages);
	const hit = usage ? cacheHitRate(usage) : undefined;
	return (
		<span
			className="usage"
			role="img"
			aria-label={t(
				"cacheHitAria",
				hit === undefined ? t("cacheUnavailable") : t("cachePercent", Math.round(hit * 100)),
			)}
			title={usage ? t("usageTitle", usage.input, usage.cacheRead, usage.cacheWrite) : t("noResponseYet")}
		>
			chr {hit === undefined ? "—" : `${Math.round(hit * 100)}%`}
		</span>
	);
}
export function SessionStats({
	usage,
	cacheUsage,
	clients,
	context,
	onCost,
	onClients,
	controls,
}: {
	usage?: Usage;
	cacheUsage?: Usage;
	clients: number;
	/** The context bar's numbers; "pending" while they load (the bar's space stays), undefined for none. */
	context?: { used: number; limit: number } | "pending";
	onCost?: () => void;
	/** Owner only: open the share sheet from the viewer count. */
	onClients?: () => void;
	controls?: ReactNode;
}) {
	const { t } = useMessages(messages);
	return (
		<div className="session-usage">
			{controls && <div className="session-controls">{controls}</div>}
			<div className="session-stats">
				{onClients ? (
					<button
						type="button"
						className="usage footer-action client-count"
						aria-label={t("browsersViewingShare", clients)}
						title={t("viewersWithSharing")}
						onClick={onClients}
					>
						<UsersIcon />
						{clients}
					</button>
				) : (
					<span
						className="usage client-count"
						role="img"
						aria-label={t("browsersViewing", clients)}
						title={t("viewers")}
					>
						<UsersIcon />
						{clients}
					</span>
				)}
				<span className="usage"> · </span>
				<UsageLine usage={cacheUsage} />
				{usage && (
					<>
						<span className="usage"> · </span>
						{onCost ? (
							<button
								type="button"
								className="usage footer-action cost-link"
								title={t("costDetails")}
								onClick={onCost}
							>
								{cost(usage.cost.total)}
							</button>
						) : (
							<span className="usage" title={t("sessionCostTitle")}>
								{cost(usage.cost.total)}
							</span>
						)}
					</>
				)}
			</div>
			{context === "pending" ? (
				<ContextUsage />
			) : (
				context && <ContextUsage used={context.used} limit={context.limit} />
			)}
		</div>
	);
}
