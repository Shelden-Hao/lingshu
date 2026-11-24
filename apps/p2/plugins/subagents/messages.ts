// The subagents plugin's texts: the command menu's conversation commands, the conversations page and search, and the
// subagent tool's card (activity.tsx). `en` defines the keys; `zh` fills them.
import { defineMessages, type Translator } from "@p2/app/v1";

export const catalog = {
	en: {
		// the commands
		cmdSwitch: "Switch conversation…",
		cmdMain: "Back to main conversation",
		groupConversation: "Conversation",
		groupConversations: "Conversations",
		keywordAgents: "agents",
		keywordSubagents: "subagents",
		keywordOpenSubagent: "open subagent",
		keywordParent: "parent",
		keywordLeaveSubagent: "leave subagent",
		pageConversations: "Conversations",
		pageConversationsSearch: "Search conversations…",
		mainConversation: "Main conversation",
		archived: "Archived",
		// the subagent tool's card
		briefSubagent: "Asking subagent",
		asking: "Asking",
		verbSpawn: "Started subagent",
		verbSend: "Messaged",
		verbAnswer: "Read the answer of",
		verbStatus: "Checked on",
		verbArchive: "Archived",
		verbRestore: "Restored",
		verbConfigure: "Configured",
		verbStop: "Stopped",
		verbSubagent: "Subagent",
		summaryOne: "used a subagent",
		summaryMany: (count: number) => `used subagents ${count} times`,
		detailInput: "Input",
		detailOutput: "Output",
		openConversation: (name: string) => `Open ${name}`,
		openTheConversation: "Open the conversation",
	},
	zh: {
		cmdSwitch: "切换对话…",
		cmdMain: "回到主对话",
		groupConversation: "对话",
		groupConversations: "对话",
		keywordAgents: "代理",
		keywordSubagents: "子代理",
		keywordOpenSubagent: "打开子代理",
		keywordParent: "父级",
		keywordLeaveSubagent: "离开子代理",
		pageConversations: "对话",
		pageConversationsSearch: "搜索对话…",
		mainConversation: "主对话",
		archived: "已归档",
		briefSubagent: "询问子代理",
		asking: "正在询问",
		verbSpawn: "启动了子代理",
		verbSend: "发消息给",
		verbAnswer: "读取了……的回答",
		verbStatus: "查看了",
		verbArchive: "归档了",
		verbRestore: "恢复了",
		verbConfigure: "配置了",
		verbStop: "停止了",
		verbSubagent: "子代理",
		summaryOne: "使用了一次子代理",
		summaryMany: (count: number) => `使用了 ${count} 次子代理`,
		detailInput: "输入",
		detailOutput: "输出",
		openConversation: (name: string) => `打开 ${name}`,
		openTheConversation: "打开该对话",
	},
};

export const messages = defineMessages("subagents", catalog);

/** A translator of the subagents plugin's messages, for helpers outside components. */
export type SubagentsT = Translator<"subagents", typeof catalog>;
