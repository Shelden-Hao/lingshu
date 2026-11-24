// The send_file tool's texts: how its calls show in the chat (activity.tsx). `en` defines the keys and their
// arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("send-file", {
	en: {
		briefSending: "Sending file",
		sent: "Sent",
		sending: "Sending",
		summarySent: (count: number) => (count === 1 ? "sent a file" : `sent ${count} files`),
	},
	zh: {
		briefSending: "正在发送文件",
		sent: "已发送",
		sending: "正在发送",
		summarySent: (count: number) => (count === 1 ? "发送了一个文件" : `发送了 ${count} 个文件`),
	},
});
