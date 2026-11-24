// The conversations' texts: how the `conversations` tool shows in the chat (activity.tsx). `en` defines the keys
// and their arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("conversations", {
	en: {
		briefMessaging: "Messaging",
		messaged: "Messaged a conversation",
		readAnswer: "Read an answer",
		started: "Started a session",
		stopped: "Stopped a session",
		archived: "Archived a session",
		restored: "Restored a session",
		listed: "Listed conversations",
	},
	zh: {
		briefMessaging: "发送消息",
		messaged: "给会话发了消息",
		readAnswer: "读取了回答",
		started: "启动了会话",
		stopped: "停止了会话",
		archived: "归档了会话",
		restored: "恢复了会话",
		listed: "列出了会话",
	},
});
