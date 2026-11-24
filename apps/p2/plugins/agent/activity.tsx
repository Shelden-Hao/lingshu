// How the `agent` tool (a script's one-shot agent) shows in the chat: its label or what it was asked, and from the
// script's call its conversation one tap away.
import {
	activityMessages,
	DetailLink,
	failureOf,
	firstLine,
	type NestedCall,
	OneShotAgents,
	OpenConversation,
	plainText,
	sentence,
	stringOf,
	type ToolActivity,
} from "@p2/app/v1/web";
import { useContext } from "react";
import { messages } from "./messages.ts";

/** A script's call of a one-shot agent: its conversation, once the agent has one. */
function AgentLink({ call }: { call: NestedCall }) {
	const agents = useContext(OneShotAgents);
	const openConversation = useContext(OpenConversation);
	const agent = agents.get(call.id);
	return agent === undefined ? null : (
		<DetailLink testId="nested-open" onClick={() => openConversation(agent)}>
			{activityMessages(messages)("openConversation")}
		</DetailLink>
	);
}

export const agentActivity: ToolActivity = {
	brief: "Asking agent",
	describe(step) {
		const label = stringOf(step.tool.args.label);
		const prompt = plainText(sentence(stringOf(step.tool.args.prompt)));
		const t = activityMessages(messages);
		return {
			label: { kind: "agent", verb: t("askedAgent"), object: label || prompt, style: "file" },
			description: failureOf(step) ?? (label ? prompt : undefined),
		};
	},
	running: (step) => ({
		kind: "agent",
		verb: activityMessages(messages)("askingAgent"),
		object: stringOf(step.tool.args.label) || plainText(sentence(stringOf(step.tool.args.prompt))),
		style: "file",
	}),
	argument: (tool) => stringOf(tool.args.label) || firstLine(stringOf(tool.args.prompt)),
	summary: (count) => activityMessages(messages)("summaryAgent", count),
	CallDetail: AgentLink,
};
