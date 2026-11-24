// The history plugin's texts: how its tools show in the chat (activity.tsx). `en` defines the keys; `zh` fills them.
import { defineMessages, type Translator } from "@p2/app/v1";

export const catalog = {
	en: {
		// history_search
		briefSearch: "Searching history",
		searchedFor: "Searched the history for",
		searchingFor: "Searching the history for",
		hits: (count: number) => `${count} ${count === 1 ? "match" : "matches"}`,
		noHits: "No matches",
		andMore: ", and more",
		// history_read
		briefRead: "Reading history",
		readHistory: "Read the history",
		readingHistory: "Reading the history",
		entries: (count: number) => `${count} ${count === 1 ? "entry" : "entries"}`,
		beforeCompaction: " before the last compaction or handoff",
		cutBudget: ", cut at the output budget",
		// shared summary
		summaryLooked: "looked through the history",
		// the detail
		moreMatches: "More matches",
		cutAtBudget: "Cut at the output budget",
		// history_handoff
		briefHandoff: "Handing off",
		handedOff: "Handed off to a new context",
		handingOff: "Handing off to a new context",
		summaryHandoff: "handed off",
		handoffNote: "New context started; earlier history stays searchable.",
	},
	zh: {
		briefSearch: "搜索历史",
		searchedFor: "在历史中搜索",
		searchingFor: "正在历史中搜索",
		hits: (count: number) => `${count} 个匹配`,
		noHits: "无匹配",
		andMore: "，还有更多",
		briefRead: "读取历史",
		readHistory: "读取了历史",
		readingHistory: "正在读取历史",
		entries: (count: number) => `${count} 条记录`,
		beforeCompaction: "（在最近一次压缩或交接之前）",
		cutBudget: "，已按输出上限截断",
		summaryLooked: "查阅了历史",
		moreMatches: "更多匹配",
		cutAtBudget: "已按输出上限截断",
		briefHandoff: "交接",
		handedOff: "已交接至新上下文",
		handingOff: "正在交接至新上下文",
		summaryHandoff: "已交接",
		handoffNote: "新上下文已开始；更早的历史仍可搜索。",
	},
};

export const messages = defineMessages("history", catalog);

/** A translator of the history plugin's messages, for helpers outside components. */
export type HistoryT = Translator<"history", typeof catalog>;
