// The scope-prompt plugin's texts: the pointing-mode hint pill, the prompt composer, the sent note, the toggle button
// and the command menu's entries. `en` defines the keys; `zh` fills them.
import { defineMessages, type Translator } from "@p2/app/v1";

export const catalog = {
	en: {
		// the mode pill
		hintTouch: "Tap to see the scope, tap it again to ask",
		hintMouse: "Click what to ask about",
		hintBoth: "Click what to ask about, or tap it twice",
		escStops: "Esc to stop",
		stop: "Stop",
		// the composer
		scope: "Scope",
		close: "Close",
		sendTo: "Send to",
		to: "To",
		chat: "Chat",
		placeholder: (target: string) => `Ask about ${target}…`,
		sending: "Sending…",
		send: "Send",
		// the sent note
		sentTo: (to: string) => `Sent to ${to}`,
		open: "Open",
		// the toggle
		toggleOn: "Prompt anywhere",
		toggleOff: "Stop prompting anywhere",
		// the commands
		cmdStart: "Prompt anywhere",
		cmdStop: "Stop prompting anywhere",
		groupAsk: "Ask Lingshu",
		keywordPoint: "point",
		keywordScope: "scope",
		keywordAsk: "ask lingshu",
		keywordFamiliar: "familiar",
		keywordPick: "pick",
	},
	zh: {
		hintTouch: "点按查看范围，再次点按即可提问",
		hintMouse: "点击要询问的内容",
		hintBoth: "点击要询问的内容，或连续点按两次",
		escStops: "按 Esc 退出",
		stop: "停止",
		scope: "范围",
		close: "关闭",
		sendTo: "发送到",
		to: "发给",
		chat: "对话",
		placeholder: (target: string) => `就${target}提问…`,
		sending: "正在发送…",
		send: "发送",
		sentTo: (to: string) => `已发送到${to}`,
		open: "打开",
		toggleOn: "随处提问",
		toggleOff: "停止随处提问",
		cmdStart: "随处提问",
		cmdStop: "停止随处提问",
		groupAsk: "问 Lingshu",
		keywordPoint: "指向",
		keywordScope: "范围",
		keywordAsk: "问 lingshu",
		keywordFamiliar: "familiar",
		keywordPick: "选取",
	},
};

export const messages = defineMessages("scope-prompt", catalog);

/** A translator of the scope-prompt plugin's messages, for helpers outside components. */
export type ScopePromptT = Translator<"scope-prompt", typeof catalog>;
