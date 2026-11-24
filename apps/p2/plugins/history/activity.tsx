// How the history tools show in the chat: what was searched or read, and the entries found, each opening its message
// in the transcript (loading older history first); a handoff's text.
import {
	activityMessages,
	CodeBlock,
	CommandBlock,
	closeLayers,
	type Described,
	DetailNote,
	DetailProse,
	detailsOf,
	failureOf,
	InputOutput,
	OutputBlock,
	plainText,
	RevealEntry,
	revealInTranscripts,
	type Step,
	sentence,
	stringOf,
	type ToolActivity,
	useMessages,
} from "@p2/app/v1/web";
import { useContext } from "react";
import { messages } from "./messages.ts";

/** The entries a history tool found or read: each opens its message in the transcript, closing the sheet. */
function _HistoryEntries({ rows, field }: { rows: unknown; field: "snippet" | "preview" }) {
	const reveal = useContext(RevealEntry);
	if (!Array.isArray(rows) || !rows.length) return null;
	const show = async (entry: number) => {
		closeLayers();
		if (revealInTranscripts(entry) || !reveal || !(await reveal(entry))) return;
		for (let frame = 0; frame < 60; frame++) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
			if (revealInTranscripts(entry)) return;
		}
	};
	return (
		<ul className="history-entries" data-testid="history-entries">
			{rows.flatMap((row) => {
				const hit = row as {
					entry?: unknown;
					role?: unknown;
					author?: unknown;
					snippet?: unknown;
					preview?: unknown;
				};
				if (typeof hit.entry !== "number") return [];
				const entry = hit.entry;
				return [
					<li key={entry}>
						<button type="button" className="history-entry" onClick={() => void show(entry)}>
							<span className="history-entry-head">
								<span className="history-entry-id">#{entry}</span> {stringOf(hit.author ?? hit.role)}
							</span>
							<span className="history-entry-text">{stringOf(hit[field])}</span>
						</button>
					</li>,
				];
			})}
		</ul>
	);
}

function HistoryDetail({ step }: { step: Step }) {
	const { tool } = step;
	const details = detailsOf(tool);
	const search = tool.name === "history_search";
	const rows = search ? details.hits : details.entries;
	return (
		<InputOutput
			input={
				search ? (
					<CommandBlock command={stringOf(tool.args.query)} />
				) : (
					<CodeBlock code={JSON.stringify(tool.args, null, 2)} language="json" />
				)
			}
			output={
				Array.isArray(rows) && rows.length > 0 ? (
					<HistoryDetailNote details={details} />
				) : (
					<OutputBlock output={tool.output} failed={step.status === "error"} />
				)
			}
		/>
	);
}
/** The entries list's notes: more matches, and a cut at the output budget. */
function HistoryDetailNote({ details }: { details: { more?: unknown; truncated?: unknown } }) {
	const { t } = useMessages(messages);
	return (
		<>
			{details.more === true && <DetailNote>{t("moreMatches")}</DetailNote>}
			{details.truncated === true && <DetailNote>{t("cutAtBudget")}</DetailNote>}
		</>
	);
}

/** The activities' words, in the language the activity components render in (outside one: the first catalog). */
const t = () => activityMessages(messages);

/** history_search and history_read count together in a run's summary: the same function. */
const looked = () => activityMessages(messages)("summaryLooked");

const historySearch: ToolActivity = {
	brief: t()("briefSearch"),
	describe(step) {
		const details = detailsOf(step.tool);
		const hits = Array.isArray(details.hits) ? details.hits.length : 0;
		return {
			label: {
				kind: "search",
				verb: t()("searchedFor"),
				object: stringOf(step.tool.args.query),
				style: "words",
			},
			description:
				failureOf(step) ??
				(step.status === "done"
					? `${hits ? t()("hits", hits) : t()("noHits")}${details.more === true ? t()("andMore") : ""}`
					: undefined),
		};
	},
	running: (step) => ({
		kind: "search",
		verb: t()("searchingFor"),
		object: stringOf(step.tool.args.query),
		style: "words",
	}),
	argument: (tool) => stringOf(tool.args.query),
	summary: (_count) => looked(),
	Detail: HistoryDetail,
};

function describeRead(step: Step): Described {
	const { args } = step.tool;
	const details = detailsOf(step.tool);
	const mode = stringOf(args.mode);
	const entries = Array.isArray(details.entries) ? details.entries.length : 0;
	const count = t()("entries", entries);
	const range =
		mode === "range" ? `#${String(args.from)}${args.to === undefined ? "" : `–#${String(args.to)}`}` : undefined;
	return {
		label: { kind: "read", verb: t()("readHistory"), ...(range ? { object: range, style: "code" as const } : {}) },
		description:
			failureOf(step) ??
			(step.status === "done"
				? mode === "tail"
					? `${count}${t()("beforeCompaction")}`
					: `${count}${details.truncated === true ? t()("cutBudget") : ""}`
				: undefined),
	};
}

const historyRead: ToolActivity = {
	brief: t()("briefRead"),
	describe: describeRead,
	running: (step) => ({ ...describeRead(step).label, verb: t()("readingHistory") }),
	argument: (tool) => stringOf(tool.args.mode),
	summary: (_count) => looked(),
	Detail: HistoryDetail,
};

function HandoffDetail({ step }: { step: Step }) {
	const { t } = useMessages(messages);
	return (
		<>
			<DetailProse text={stringOf(step.tool.args.text)} />
			<DetailNote>{t("handoffNote")}</DetailNote>
		</>
	);
}
const historyHandoff: ToolActivity = {
	brief: t()("briefHandoff"),
	describe: (step) => ({
		label: { kind: "handoff", verb: t()("handedOff") },
		description: failureOf(step) ?? (plainText(sentence(stringOf(step.tool.args.text))) || undefined),
	}),
	running: () => ({ kind: "handoff", verb: t()("handingOff") }),
	argument: (tool) => plainText(sentence(stringOf(tool.args.text))),
	summary: () => t()("summaryHandoff"),
	Detail: HandoffDetail,
};

/** The history tools' contributions, by tool name. */
export const historyActivities: Record<string, ToolActivity> = {
	history_search: historySearch,
	history_read: historyRead,
	history_handoff: historyHandoff,
};
