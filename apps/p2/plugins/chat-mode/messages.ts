// The chat-mode plugin's texts: the composer's Chat chip, its tooltip and the agent-name sheet. `en` defines the
// keys; `zh` fills them.
import { defineMessages, type Translator } from "@p2/app/v1";

export const catalog = {
	en: {
		chip: "Chat",
		chipWaiting: (waiting: number) => `Chat · ${waiting}`,
		hint: (name: string, mention: string) =>
			`Chat mode: messages go to the people in this session, not to ${name}. Mention ${mention} (or say "${name}") to ask ${name}; it then reads the chat since its last answer.`,
		// the name sheet
		nameTitle: "Agent name",
		nameLabel: "Name in this conversation",
		nameHint: (mention: string) =>
			`People mention it as ${mention}, and in voice mode its name anywhere in what they say counts. One word: letters, digits, - and _.`,
		save: "Save",
		resetName: (name: string) => `Reset to ${name}`,
		renameTitle: (_name: string, mention: string) => `Mentioned as ${mention}: rename`,
		renameAria: (name: string) => `Agent name ${name}. Rename`,
	},
	zh: {
		chip: "对话",
		chipWaiting: (waiting: number) => `对话 · ${waiting}`,
		hint: (name: string, mention: string) =>
			`对话模式：消息发送给本会话中的人，而不是 ${name}。用 ${mention} 提及（或说出“${name}”）即可询问 ${name}；它会读取上次回答之后的对话。`,
		nameTitle: "代理名称",
		nameLabel: "在此对话中的名称",
		nameHint: (mention: string) =>
			`人们用 ${mention} 提及它；在语音模式中，说出其名称的任意位置都算提及。只能一个词：字母、数字、- 和 _。`,
		save: "保存",
		resetName: (name: string) => `重置为 ${name}`,
		renameTitle: (_name: string, mention: string) => `以 ${mention} 提及：重命名`,
		renameAria: (name: string) => `代理名称 ${name}。重命名`,
	},
};

export const messages = defineMessages("chat-mode", catalog);

/** A translator of the chat-mode plugin's messages, for helpers outside components. */
export type ChatModeT = Translator<"chat-mode", typeof catalog>;
