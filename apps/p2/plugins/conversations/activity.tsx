// How the `conversations` tool shows in the chat: whether it listed, messaged, read an answer of, started, stopped,
// archived or restored another conversation; its detail the message sent and the answer read as Markdown.
import {
	activityMessages,
	DetailNote,
	DetailProse,
	DetailSection,
	failureOf,
	OutputBlock,
	plainText,
	type Step,
	sentence,
	stringOf,
	type ToolActivity,
} from "@p2/app/v1/web";
import { messages } from "./messages.ts";

function ConversationsDetail({ step }: { step: Step }) {
	const { tool } = step;
	const action = stringOf(tool.args.action);
	return (
		<>
			<DetailSection label="Input">
				<DetailNote>{[action, stringOf(tool.args.to)].filter(Boolean).join(" · ")}</DetailNote>
				{tool.args.message !== undefined && <DetailProse text={stringOf(tool.args.message)} />}
			</DetailSection>
			{tool.output && (
				<DetailSection label="Output">
					{action === "answer" && tool.status === "done" ? (
						<DetailProse text={tool.output} />
					) : (
						<OutputBlock output={tool.output} failed={step.status === "error"} />
					)}
				</DetailSection>
			)}
		</>
	);
}

/** What each action did, as the step's label says it. */
const VERBS: Record<string, "messaged" | "readAnswer" | "started" | "stopped" | "archived" | "restored"> = {
	send: "messaged",
	answer: "readAnswer",
	create: "started",
	stop: "stopped",
	archive: "archived",
	restore: "restored",
};

export const conversationsActivity: ToolActivity = {
	brief: "Messaging",
	describe(step) {
		const action = stringOf(step.tool.args.action);
		const t = activityMessages(messages);
		const verb = VERBS[action];
		return {
			label: {
				kind: "message",
				verb: verb ? t(verb) : t("listed"),
			},
			description: failureOf(step) ?? (plainText(sentence(stringOf(step.tool.args.message))) || undefined),
		};
	},
	argument: (tool) => [stringOf(tool.args.action), stringOf(tool.args.message)].filter(Boolean).join(" "),
	Detail: ConversationsDetail,
};
