// The Settings window's texts, in every language the app offers: the window's own sections over settings.json, the
// command menu's entries for it and the language section. `en` defines the keys and their arguments; `zh` fills them.

import { defineMessages } from "@p2/app/v1";
import { type ContributedText, textIn } from "@p2/app/v1/web";
import type { OwnSection } from "./sections.ts";

export const messages = defineMessages("settings", {
	en: {
		// the window
		title: "Settings",
		sections: "Settings sections",
		loading: "Loading settings…",
		saveFailed: "Could not save the settings",
		fileFailed:
			"settings.json could not be loaded: this shows the last valid settings, and a change here replaces the file with them.",
		choiceDefault: (fallback: string) => `Default: ${fallback}`,
		sectionGeneral: "General",
		sectionModels: "Models",
		sectionAgent: "Agent",
		sectionRequests: "Requests",
		sectionCompaction: "Compaction",
		sectionLanguage: "Language",
		// General
		generalHint:
			"This server's settings.json, used by every conversation. Changes apply at once; a request already running keeps the settings it started with.",
		ownerName: "Your name on your messages",
		ownerNamePlaceholder: "Owner",
		chatDetail: "Chat detail",
		chatDetailFallback: "texts, thinking and calls on wheels (2)",
		chatDetail1: "1: only the answer, the rest on one wheel",
		chatDetail2: "2: texts, thinking and calls on wheels",
		chatDetail3: "3: thinking too (collapsed), calls on wheels",
		chatDetail4: "4: everything, each call as a row",
		serverName: "Server name",
		deviceName: "This device's name",
		// Models
		modelsHint: "What a new session starts with; each session then keeps its own model.",
		defaultModel: "Default model",
		firstSignedInModel: "The first signed-in model",
		thinkingLevel: "Thinking level",
		cyclingModels: "Models for cycling in the TUI (one pattern per line)",
		allModels: "All models",
		// Agent
		codeMode: "Code mode (scripts that call the other tools)",
		toolCalls: "Tool calls",
		inParallel: "In parallel",
		oneAfterAnother: "One after another",
		steering: "Messages sent while it works (steering)",
		followUps: "Follow-up messages",
		oneAtATime: "One at a time",
		allAtOnce: "All at once",
		cacheWarming: "Cache warming",
		cacheWarmingIdle: "While streaming and 30 minutes after",
		cacheWarmingStreaming: "Only while streaming",
		cacheWarmingOff: "Off",
		// Requests
		transport: "Transport",
		automatic: "Automatic",
		cacheRetention: "Prompt cache retention",
		cacheRetentionDefault: "Provider default (short)",
		cacheRetentionShort: "Short (5 minutes)",
		cacheRetentionLong: "Long (1 hour, twice the input price)",
		cacheRetentionNone: "None",
		requestTimeout: "Request timeout (ms)",
		providerDefault: "Provider default",
		providerRetries: "Provider retries",
		longestRetryDelay: "Longest provider retry delay (ms)",
		retriesGroup: "Retries after a failed turn",
		retryFailedTurns: "Retry failed turns",
		retries: "Retries",
		firstDelay: "First delay (ms)",
		longestDelay: "Longest delay (ms)",
		// Compaction
		compact: "Compact long conversations",
		reserveTokens: "Tokens kept free for the answer",
		keepRecentTokens: "Recent tokens kept as they are",
		backgroundTokens: "Tokens before compacting in the background",
		// Language
		language: "Language",
		languageHint: "The language of the app's texts. It changes at once, without reloading the page.",
		languageDevice: "This device's language",
		// the command menu
		open: "Open settings…",
		group: "Settings",
		keywordPreferences: "preferences",
		keywordConfiguration: "configuration",
		page: "Settings",
		pageSearch: "Search settings…",
	},
	zh: {
		// the window
		title: "设置",
		sections: "设置分区",
		loading: "正在加载设置…",
		saveFailed: "无法保存设置",
		fileFailed: "settings.json 读取失败：这里显示最近一次有效的设置，在此修改会用这些设置覆盖该文件。",
		choiceDefault: (fallback: string) => `默认：${fallback}`,
		sectionGeneral: "通用",
		sectionModels: "模型",
		sectionAgent: "Agent",
		sectionRequests: "请求",
		sectionCompaction: "压缩",
		sectionLanguage: "语言",
		// General
		generalHint: "这台服务器的 settings.json，所有会话共用。修改立即生效；已经发出的请求仍沿用启动时的设置。",
		ownerName: "你的消息中显示的名字",
		ownerNamePlaceholder: "所有者",
		chatDetail: "对话详细程度",
		chatDetailFallback: "文本、思考与调用各占折叠条（2）",
		chatDetail1: "1：只显示回答，其余收进一个折叠条",
		chatDetail2: "2：文本、思考与调用各占折叠条",
		chatDetail3: "3：思考也显示（默认折叠），调用收进折叠条",
		chatDetail4: "4：全部展开，每次调用单独一行",
		serverName: "服务器名称",
		deviceName: "本机名称",
		// Models
		modelsHint: "新会话开始时使用的模型；此后每个会话保留自己的模型。",
		defaultModel: "默认模型",
		firstSignedInModel: "第一个已登录的模型",
		thinkingLevel: "思考强度",
		cyclingModels: "TUI 中循环切换的模型（每行一个匹配模式）",
		allModels: "全部模型",
		// Agent
		codeMode: "代码模式（用脚本调用其他工具）",
		toolCalls: "工具调用",
		inParallel: "并行",
		oneAfterAnother: "依次执行",
		steering: "运行中发送的消息（steering）",
		followUps: "后续消息",
		oneAtATime: "一次一条",
		allAtOnce: "一次全部",
		cacheWarming: "缓存预热",
		cacheWarmingIdle: "流式期间及之后 30 分钟",
		cacheWarmingStreaming: "仅流式期间",
		cacheWarmingOff: "关闭",
		// Requests
		transport: "传输方式",
		automatic: "自动",
		cacheRetention: "提示缓存保留时长",
		cacheRetentionDefault: "服务商默认（短）",
		cacheRetentionShort: "短（5 分钟）",
		cacheRetentionLong: "长（1 小时，输入价格翻倍）",
		cacheRetentionNone: "不保留",
		requestTimeout: "请求超时（毫秒）",
		providerDefault: "服务商默认",
		providerRetries: "服务商重试次数",
		longestRetryDelay: "服务商最长重试间隔（毫秒）",
		retriesGroup: "一轮失败后的重试",
		retryFailedTurns: "失败的一轮自动重试",
		retries: "重试次数",
		firstDelay: "首次间隔（毫秒）",
		longestDelay: "最长间隔（毫秒）",
		// Compaction
		compact: "压缩过长的会话",
		reserveTokens: "为回答预留的 token",
		keepRecentTokens: "原样保留的最近 token",
		backgroundTokens: "触发后台压缩的 token 数",
		// Language
		language: "界面语言",
		languageHint: "应用文字使用的语言。切换立即生效，无需刷新页面。",
		languageDevice: "跟随本机语言",
		// the command menu
		open: "打开设置…",
		group: "设置",
		keywordPreferences: "偏好",
		keywordConfiguration: "配置",
		page: "设置",
		pageSearch: "搜索设置…",
	},
});

/** The window's sections' texts, by section id. */
const SECTION_KEYS = {
	general: "sectionGeneral",
	models: "sectionModels",
	agent: "sectionAgent",
	requests: "sectionRequests",
	compaction: "sectionCompaction",
	language: "sectionLanguage",
} as const;

/** The section list's text for `section`, rendered where the window shows it. */
export const sectionText = (section: OwnSection): ContributedText => textIn(messages, SECTION_KEYS[section]);
