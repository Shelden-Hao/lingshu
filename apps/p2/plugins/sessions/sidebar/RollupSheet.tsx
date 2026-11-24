// A rollup's options sheet: how long the sidebar shows a session nothing else keeps in view, and the rollup's place;
// for a rollup made from code, when it refreshes, when it was last checked, why its last run failed, and Refresh now.

import type { Language } from "@p2/app/v1";
import { CheckIcon, Sheet, showText, useLanguage, useMessages } from "@p2/app/v1/web";
import type { Refresh } from "../../rollups/contract.ts";
import type { SidebarWindow } from "../contract.ts";
import { messages, sidebarText } from "../messages.ts";

/** Renders a sessions-plugin message `key` with its `args` in `language` (outside React hooks). */
const _showT =
	(key: string, ...args: readonly unknown[]) =>
	(language: Language | undefined): string =>
		(messages.in(language) as unknown as (...a: readonly unknown[]) => string)(key, ...args);

/** The messages key of a built-in rollup's name (project names are their own). */
const rollupNameKey = (name: string): string =>
	name === "Folders"
		? "pageFolders"
		: name === "Other sessions"
			? "sidebarOtherSessions"
			: name === "Projects"
				? "groupProjects"
				: name === "Archive"
					? "pageArchive"
					: name;

import { type Section, WINDOWS } from "./model.ts";
import { ago } from "./Row.tsx";

/** The windows' labels' keys in the messages catalog (`WINDOWS`' labels in the reader's language). */
const WINDOW_KEYS = {
	"1d": "window24h",
	"3d": "window3d",
	"1w": "window1w",
	forever: "windowForever",
} as const;

/** A rollup made from code as its options show it, and refreshing it (absent while offline). */
export type CodeSource = {
	readonly refresh: Refresh;
	readonly checkedAt: number | null;
	readonly error: string | null;
	readonly refreshing: boolean;
	readonly onRefresh?: () => void;
};

/**
 * The options of rollup `section`: New project for the projects', its window (not for a rollup shown only as a link)
 * and moving it up or down.
 */
export function RollupSheet({
	section,
	code,
	now,
	onNewProject,
	onWindow,
	onMove,
	onClose,
}: {
	section: Section;
	/** Present for a rollup made from code. */
	code?: CodeSource;
	now: number;
	/** Present for the projects rollup: picks a folder, then names the project. */
	onNewProject?: () => void;
	onWindow: (window: SidebarWindow) => void;
	/** Moves the rollup up or down; absent: it cannot move that way. */
	onMove: { up?: () => void; down?: () => void };
	onClose: () => void;
}) {
	const { t } = useMessages(messages);
	const language = useLanguage();
	return (
		<Sheet title={showText(sidebarText(rollupNameKey(section.name)), language)} onClose={onClose}>
			<div className="list">
				{onNewProject && (
					<button type="button" className="row-button" onClick={onNewProject}>
						<span>{t("newProjectAction")}</span>
					</button>
				)}
				{code && <CodeOptions code={code} now={now} />}
				{section.layout !== "link" && section.window !== "none" && (
					<>
						<h3 className="label">{t("showSessionsWithin")}</h3>
						{WINDOWS.map(({ window }) => (
							<button
								type="button"
								key={window}
								className="row-button"
								aria-pressed={section.window === window}
								onClick={() => onWindow(window)}
							>
								<span>{t(WINDOW_KEYS[window])}</span>
								{section.window === window && <CheckIcon />}
							</button>
						))}
						<p className="muted small">{t("pinnedAlwaysShow")}</p>
					</>
				)}
				{onMove.up && (
					<button type="button" className="row-button" onClick={onMove.up}>
						<span>{t("moveUp")}</span>
					</button>
				)}
				{onMove.down && (
					<button type="button" className="row-button" onClick={onMove.down}>
						<span>{t("moveDown")}</span>
					</button>
				)}
			</div>
		</Sheet>
	);
}

/** When a rollup made from code refreshes, its last check or failure, and Refresh now unless it refreshes itself. */
function CodeOptions({ code, now }: { code: CodeSource; now: number }) {
	const { t } = useMessages(messages);
	const when =
		code.refresh.kind === "auto"
			? t("refreshOnChange")
			: code.refresh.kind === "every"
				? t("refreshEvery", code.refresh.minutes)
				: t("refreshByHand");
	const since = code.checkedAt === null ? undefined : ago(code.checkedAt, now);
	// `ago` says "now", "5m" or "3h" up to a week, then a date.
	const checked =
		since === undefined
			? t("notRunYet")
			: since === "now"
				? t("checkedJustNow")
				: /^\d/.test(since)
					? t("checkedAgo", since)
					: t("checkedOn", since);
	return (
		<>
			<h3 className="label">{t("madeFromCode")}</h3>
			<p className="muted small">
				{when}. {checked}.
			</p>
			{code.error && <p className="small rollup-error">{code.error}</p>}
			{code.refresh.kind !== "auto" && (
				<button
					type="button"
					className="row-button"
					disabled={!code.onRefresh || code.refreshing}
					onClick={code.onRefresh}
				>
					<span>{code.refreshing ? t("refreshing") : t("refreshNow")}</span>
				</button>
			)}
		</>
	);
}
