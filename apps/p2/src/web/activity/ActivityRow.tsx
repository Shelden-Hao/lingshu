// A block's compact activity wheel in the transcript. While active, its latest thought shows below it (ThoughtSlot).
// The wheel opens this block's steps in the right-hand panel.

import { type MouseEvent, type ReactNode, useContext } from "react";
import { useRoute } from "../../runtime/web.tsx";
import { ToolActivityContext } from "../chat-context.ts";
import { Ticker } from "../elanor-extra/ticker.tsx";
import { tick } from "../haptics.ts";
import { useLanguage, useMessages } from "../language.ts";
import { messages } from "../messages.ts";
import { StepList, toggleActivity, useElapsed } from "./ActivitySheet.tsx";
import { CheckIcon, ChevronIcon, CommentIcon, SparkIcon } from "./icons.tsx";
import { KindIcon, LabelText } from "./Label.tsx";
import { inActivityLanguage } from "./language.ts";
import { live, plain, plainText, type Step, sentence, summary, type WheelEntry, wheelThought } from "./model.ts";
import { ThoughtSlot } from "./ThoughtSlot.tsx";
import "./activity.css";

/** A step on the wheel: what it shows, its plain words for screen readers, and whether it failed. */
type Face = { key: string; label: string; content: ReactNode; failed?: boolean };

/** How long the run has taken: counting while the agent works, the total once it is done. */
export function Elapsed({ startedAt, endedAt, working }: { startedAt?: number; endedAt?: number; working: boolean }) {
	const time = useElapsed(startedAt, endedAt, working);
	if (time === undefined) return null;
	return (
		<span className="activity-time" data-testid="activity-time">
			{time}
		</span>
	);
}

export function ActivityRow({
	rowKey,
	steps,
	entries = steps.map((step) => ({ kind: "call", step })),
	rows = false,
	working,
	startedAt,
	endedAt,
}: {
	/** The row's key: the panel's route names it. */
	rowKey: string;
	/** At detail 4 (settings.json): the calls as rows, one each, each opening its detail; no wheel. */
	rows?: boolean;
	steps: readonly Step[];
	/** Everything on the wheel in order: thinking and, at detail 1, texts among the calls. */
	entries?: readonly WheelEntry[];
	working: boolean;
	startedAt?: number;
	endedAt?: number;
}) {
	const tools = useContext(ToolActivityContext);
	const language = useLanguage();
	const { t } = useMessages(messages);
	const route = useRoute();
	const selected = !route.workspace && route.activity?.row === rowKey;
	// At detail 4 each call opens the same panel with that step expanded; a wheel only before the first call.
	if (rows && steps.length)
		return (
			<div className="activity-rows" data-testid="activity" data-state={working ? "working" : "done"}>
				<StepList entries={entries} onStep={(id) => toggleActivity(rowKey, id)} />
			</div>
		);
	const thought = entries.some((entry) => entry.kind === "thought");
	// "Thought, read 3 files": with thinking on the wheel, its summary says so first.
	const calls = steps.length ? inActivityLanguage(language, () => summary(steps, tools, { failures: false })) : "";
	const done = thought
		? [t("thought"), calls.charAt(0).toLowerCase() + calls.slice(1)].filter(Boolean).join(", ")
		: calls || inActivityLanguage(language, () => summary(steps, tools));
	const idOf = (entry: WheelEntry) => (entry.kind === "call" ? entry.step.id : entry.id);
	/** Opens this block's panel, expanding the step selected on the wheel; the same tap again closes it. */
	const show = (step?: string) =>
		toggleActivity(rowKey, entries.some((each) => idOf(each) === step) ? step : undefined);
	/** A tap beside the wheel; the wheel's own tap (its button) is `onActivate`. */
	const tap = (event: MouseEvent) => {
		if (!(event.target instanceof Element && event.target.closest(".activity-ticker"))) show();
	};
	const faces: Face[] = entries.map((entry) => {
		if (entry.kind !== "call") {
			const words =
				entry.kind === "thought" ? (entry.live ? t("thinking") : t("thought")) : plainText(sentence(entry.text));
			return {
				key: entry.id,
				label: words,
				content: (
					<>
						{entry.kind === "thought" ? <SparkIcon /> : <CommentIcon />}
						<span className="label-text">{words}</span>
					</>
				),
			};
		}
		const { step } = entry;
		const label = inActivityLanguage(language, () => live(step, tools));
		return {
			key: step.id,
			label: plain(label),
			failed: step.status === "error",
			content: (
				<>
					<KindIcon kind={label.kind} />
					<LabelText label={label} />
				</>
			),
		};
	});
	if (!entries.length)
		faces.push({
			key: "waiting",
			label: t("working"),
			content: (
				<>
					<SparkIcon />
					<span className="label-text">{t("workingEllipsis")}</span>
				</>
			),
		});
	if (!working)
		faces.push({
			key: "done",
			label: done,
			content: (
				<>
					<CheckIcon />
					<span className="label-text">
						{done}
						<span className="label-extra"> · {t("stepsCount", entries.length)}</span>
					</span>
				</>
			),
		});
	return (
		<div className={`activity-block${selected ? " selected" : ""}`}>
			{/* The row: the wheel is the button (a tap opens the calls, a drag rolls it); the rest of the row opens them
		    too, for a pointer. */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the wheel inside is the keyboard's control. */}
			<div
				className="activity activity-turn"
				data-testid="activity"
				data-state={working ? "working" : "done"}
				onClick={tap}
			>
				<Ticker.Root
					className="activity-ticker"
					active={working}
					// The face in front opens: a step expanded (the newest too: the Ticker leaves its key out), the summary or
					// "Working…" the block.
					onActivate={(key) => show(key ?? faces.at(-1)?.key)}
					// A very slight tick at each detent: rolled by the reader or by a new step rolling in.
					onTurn={tick}
					aria-label={t("showSteps", faces.at(-1)?.label ?? t("working"))}
					aria-expanded={selected}
				>
					{faces.map((face) => (
						<Ticker.Item key={face.key} label={face.label} negative={face.failed}>
							{face.content}
						</Ticker.Item>
					))}
				</Ticker.Root>
				<Elapsed startedAt={startedAt} endedAt={endedAt} working={working} />
				<span className="activity-chevron" aria-hidden="true">
					<ChevronIcon />
				</span>
			</div>
			<ThoughtSlot rowKey={rowKey} thought={wheelThought(entries, working)} working={working} />
		</div>
	);
}
