// The tree plugin's texts (web): the tree panel and the top bar's button. `en` defines the keys; `zh` fills them.

import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("tree", {
	en: {
		panelTitle: "Tree",
		branchCount: (count: number) => `${count} branches`,
		loading: "Loading…",
		noMessages: "No messages yet.",
		tocLabel: "Conversation tree, oldest first",
		detached: "Started before the first message",
		switchBranch: "Switch the session to this branch and show this message",
		current: "Current: ",
		openPanel: "Conversation tree",
	},
	zh: {
		panelTitle: "树",
		branchCount: (count: number) => `${count} 个分支`,
		loading: "正在加载…",
		noMessages: "还没有消息。",
		tocLabel: "会话树（由旧到新）",
		detached: "始于第一条消息之前",
		switchBranch: "把会话切到该分支并显示这条消息",
		current: "当前：",
		openPanel: "会话树",
	},
});
