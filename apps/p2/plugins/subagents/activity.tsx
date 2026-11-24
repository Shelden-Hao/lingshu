// How the `subagent` tool shows in the chat: what it asked which subagent, and for an answer or a spawn how it went,
// with the subagent's conversation one tap away.
import {
	activityMessages,
	DetailLink,
	DetailNote,
	DetailProse,
	DetailSection,
	detailsOf,
	failureOf,
	OpenConversation,
	OutputBlock,
	plainText,
	relativePath,
	type Step,
	sentence,
	stringOf,
	type ToolActivity,
	type ToolView,
	useMessages,
	WorkingDirectory,
} from "@p2/app/v1/web";
import { useContext } from "react";
import { messages } from "./messages.ts";

/** Each action's verb in the catalog (`verbSpawn`, `verbSend`, …). */
const VERBS: Record<
	string,
	"verbSpawn" | "verbSend" | "verbAnswer" | "verbStatus" | "verbArchive" | "verbRestore" | "verbConfigure" | "verbStop"
> = {
	spawn: "verbSpawn",
	send: "verbSend",
	answer: "verbAnswer",
	status: "verbStatus",
	archive: "verbArchive",
	restore: "verbRestore",
	configure: "verbConfigure",
	stop: "verbStop",
};

const nameOf = (tool: ToolView) => stringOf(tool.args.name) || stringOf(detailsOf(tool).name);

function SubagentDetail({ step }: { step: Step }) {
	const { t } = useMessages(messages);
	const { tool } = step;
	const openConversation = useContext(OpenConversation);
	const cwd = useContext(WorkingDirectory)?.replace(/\/+$/, "");
	const details = detailsOf(tool);
	const action = stringOf(tool.args.action);
	const target = typeof details.conversationId === "number" ? details.conversationId : undefined;
	const config = [
		details.model,
		details.thinkingLevel && `thinking ${stringOf(details.thinkingLevel)}`,
		Array.isArray(details.tools) && `tools ${details.tools.join(", ") || "none"}`,
		typeof details.cwd === "string" &&
			`cwd ${typeof details.env === "string" ? `${details.env}:${details.cwd}` : relativePath(cwd, details.cwd)}`,
	]
		.filter(Boolean)
		.join(" · ");
	return (
		<>
			<DetailSection label={t("detailInput")}>
				<DetailNote>{[action, nameOf(tool)].filter(Boolean).join(" · ")}</DetailNote>
				{tool.args.message !== undefined && <DetailProse text={stringOf(tool.args.message)} />}
				{config && <DetailNote testId="tool-config">{config}</DetailNote>}
			</DetailSection>
			{tool.output && (
				<DetailSection label={t("detailOutput")}>
					{action === "answer" && tool.status === "done" ? (
						<DetailProse text={tool.output} />
					) : (
						<OutputBlock output={tool.output} failed={step.status === "error"} />
					)}
				</DetailSection>
			)}
			{target !== undefined && (
				<DetailLink onClick={() => openConversation(target)}>
					{t("openConversation", nameOf(tool) || t("openTheConversation"))}
				</DetailLink>
			)}
		</>
	);
}

export const subagentActivity: ToolActivity = {
	brief: "Asking subagent",
	describe: (step) => {
		const t = activityMessages(messages);
		const key = VERBS[stringOf(step.tool.args.action)];
		return {
			label: {
				kind: "agent",
				...(key ? { verb: t(key) } : { verb: t("verbSubagent") }),
				object: nameOf(step.tool),
				style: "file",
			},
			description: failureOf(step) ?? (plainText(sentence(stringOf(step.tool.args.message))) || undefined),
		};
	},
	running: (step) => ({
		kind: "agent",
		verb: activityMessages(messages)("asking"),
		object: stringOf(step.tool.args.name),
		style: "file",
	}),
	argument: (tool) => [stringOf(tool.args.action), nameOf(tool)].filter(Boolean).join(" "),
	summary: (count) =>
		count === 1 ? activityMessages(messages)("summaryOne") : activityMessages(messages)("summaryMany", count),
	Detail: SubagentDetail,
};
