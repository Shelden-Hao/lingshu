// The chat's texts (web.tsx): the composer's sends and placeholders, the top bar, the dock's bars and queues, the
// footer's model controls, the sheets, the new-session screen and the command menu's model commands and pages.
// `en` defines the keys and their arguments; `zh` fills them.

import { defineMessages } from "@p2/app/v1";
import { type ContributedText, textIn } from "@p2/app/v1/web";

export const messages = defineMessages("chat", {
	en: {
		// the footer's model controls
		chooseModel: "Choose model",
		model: "Model",
		thinkingLevel: "Thinking level",
		thinkingTitle: (level: string) => `Thinking: ${level}`,
		makeDefault: "Make default for new sessions",
		makeDefaultTitle: (described: string) => `Make ${described} the default for new sessions`,
		guestModel: (name: string) => `${name} · guest`,
		// the composer
		send: "Send",
		steer: "Steer",
		followUp: "Follow up",
		sendInNewBranch: "Send in a new branch",
		placeholderIdle: "Message Lingshu…",
		placeholderBusy: "Steer the current run…",
		cancelReply: "Cancel reply",
		attachFiles: "Attach files",
		stop: "Stop",
		waysToSend: "Ways to send",
		sendTitle: (label: string, verb: string) => `${label} (${verb} for more)`,
		// the dock's bars
		oneShotBar: "One-shot agent of a script · read-only",
		sessionUnavailable: "Session unavailable",
		joinedAs: (name: string) => `Joined as ${name} · read-only`,
		connecting: "Connecting…",
		scrollToBottom: "Scroll to bottom",
		// the queue
		queued: "Queued",
		moveBackToEditor: "Move back to editor",
		removeFromQueue: "Remove from queue",
		replyingTo: (name: string) => `Replying to ${name}`,
		// the top bar
		sessions: "Sessions",
		agent: "agent",
		subagent: "subagent",
		newSession: "New session",
		sandboxTitle: (env: string) => `Sandbox ${env}: tools run in its VM`,
		moving: "Moving…",
		offline: "Offline",
		subagentOptions: "Subagent options",
		// the running agents bar
		agentsRunning: (count: number) => `${count} agents running: `,
		running: "Running: ",
		// the failure screen
		retry: "Retry",
		retrying: "Retrying…",
		showLogs: "Show logs",
		askOwnerRetry: "Ask the owner to retry this session.",
		// the subagent sheet
		subagentSheet: "Subagent",
		restore: "Restore",
		archive: "Archive",
		// the toasts
		sessionArchived: "Session is archived",
		sessionNotFound: "Session not found",
		shareEnded: "This share has ended.",
		// the new-session screen
		emptyTranscript: "Send a message to start.",
		hero: "What should Lingshu do?",
		noProject: "No project",
		projectLabel: (label: string) => `Project: ${label}`,
		signInProvider: "Sign in to a provider",
		// the command menu
		changeModel: "Change model…",
		thinkingLevelCommand: "Thinking level…",
		setCurrentDefault: "Set current model as default",
		setDefaultModel: "Set default model…",
		groupModel: "Model",
		keywordSwitchModel: "switch model",
		keywordReasoning: "reasoning",
		keywordEffort: "effort",
		keywordMakeDefault: "make default",
		keywordDefaultSessions: "default for new sessions",
		keywordThinkingLevel: "thinking level",
		noModels: "No models match. Only signed-in providers are listed.",
		pageModels: "Models",
		pageThinking: "Thinking level",
		pageDefaultModel: "Default model",
		searchModels: "Search models…",
		searchLevels: "Search levels…",
	},
	zh: {
		// the footer's model controls
		chooseModel: "选择模型",
		model: "模型",
		thinkingLevel: "思考等级",
		thinkingTitle: (level: string) => `思考：${level}`,
		makeDefault: "设为新会话默认",
		makeDefaultTitle: (described: string) => `将 ${described} 设为新会话默认`,
		guestModel: (name: string) => `${name} · 访客`,
		// the composer
		send: "发送",
		steer: "引导",
		followUp: "追问",
		sendInNewBranch: "在新分支中发送",
		placeholderIdle: "向 Lingshu 发消息…",
		placeholderBusy: "引导当前运行…",
		cancelReply: "取消回复",
		attachFiles: "附加文件",
		stop: "停止",
		waysToSend: "发送方式",
		sendTitle: (label: string, verb: string) => `${label}（${verb}查看更多）`,
		// the dock's bars
		oneShotBar: "脚本的一次性智能体 · 只读",
		sessionUnavailable: "会话不可用",
		joinedAs: (name: string) => `以 ${name} 加入 · 只读`,
		connecting: "连接中…",
		scrollToBottom: "滚动到底部",
		// the queue
		queued: "已排队",
		moveBackToEditor: "移回编辑器",
		removeFromQueue: "从队列移除",
		// the reply line
		replyingTo: (name: string) => `正在回复 ${name}`,
		// the top bar
		sessions: "会话",
		agent: "智能体",
		subagent: "子智能体",
		newSession: "新会话",
		sandboxTitle: (env: string) => `沙盒 ${env}：工具在其虚拟机中运行`,
		moving: "移动中…",
		offline: "离线",
		subagentOptions: "子智能体选项",
		// the running agents bar
		agentsRunning: (count: number) => `${count} 个智能体运行中：`,
		running: "运行中：",
		// the failure screen
		retry: "重试",
		retrying: "重试中…",
		showLogs: "查看日志",
		askOwnerRetry: "请所有者重试此会话。",
		subagentSheet: "子智能体",
		restore: "恢复",
		archive: "归档",
		// the toasts
		sessionArchived: "会话已归档",
		sessionNotFound: "未找到会话",
		shareEnded: "该分享已结束。",
		emptyTranscript: "发送一条消息开始。",
		// the new-session screen
		hero: "要让 Lingshu 做什么？",
		noProject: "无项目",
		projectLabel: (label: string) => `项目：${label}`,
		signInProvider: "登录提供商",
		// the command menu
		changeModel: "切换模型…",
		thinkingLevelCommand: "思考等级…",
		setCurrentDefault: "将当前模型设为默认",
		setDefaultModel: "设置默认模型…",
		groupModel: "模型",
		keywordSwitchModel: "切换模型",
		keywordReasoning: "推理",
		keywordEffort: "力度",
		keywordMakeDefault: "设为默认",
		keywordDefaultSessions: "新会话默认",
		keywordThinkingLevel: "思考等级",
		noModels: "没有匹配的模型。仅列出已登录的提供商。",
		pageModels: "模型",
		pageThinking: "思考等级",
		pageDefaultModel: "默认模型",
		searchModels: "搜索模型…",
		searchLevels: "搜索等级…",
	},
});

/** The pages' texts, by name. */
const PAGE_KEYS = {
	models: "pageModels",
	thinking: "pageThinking",
	"default-model": "pageDefaultModel",
} as const;

/** A command menu page's text for `page`, rendered where the menu shows it. */
export const pageText = (page: keyof typeof PAGE_KEYS): ContributedText => textIn(messages, PAGE_KEYS[page]);
