// The one-shot agents' texts: how the `agent` tool shows in the chat (activity.tsx). `en` defines the keys and
// their arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("agent", {
	en: {
		briefAgent: "Asking agent",
		askedAgent: "Asked an agent",
		askingAgent: "Asking an agent",
		summaryAgent: (count: number) => (count === 1 ? "asked an agent" : `asked ${count} agents`),
		openConversation: "Open the agent's conversation",
	},
	zh: {
		briefAgent: "询问智能体",
		askedAgent: "询问了智能体",
		askingAgent: "正在询问智能体",
		summaryAgent: (count: number) => (count === 1 ? "询问了一次智能体" : `询问了 ${count} 次智能体`),
		openConversation: "打开该智能体的对话",
	},
});
