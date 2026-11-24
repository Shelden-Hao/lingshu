// The coding tools' texts: how their calls show in the chat (activity.tsx). `en` defines the keys and their
// arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("coding-tools", {
	en: {
		// bash
		searched: "Searched",
		ran: "Ran",
		searching: "Searching",
		running: "Running",
		summaryRan: (count: number) => (count === 1 ? "ran a command" : `ran ${count} commands`),
		// read
		read: "Read",
		reading: "Reading",
		summaryRead: (count: number) => (count === 1 ? "read a file" : `read ${count} files`),
		// write and edit
		wrote: "Wrote",
		writing: "Writing",
		edited: "Edited",
		editing: "Editing",
		summaryEdited: (count: number) => (count === 1 ? "edited a file" : `edited ${count} files`),
	},
	zh: {
		// bash
		searched: "已搜索",
		ran: "已运行",
		searching: "正在搜索",
		running: "正在运行",
		summaryRan: (count: number) => (count === 1 ? "运行了一条命令" : `运行了 ${count} 条命令`),
		// read
		read: "已读取",
		reading: "正在读取",
		summaryRead: (count: number) => (count === 1 ? "读取了一个文件" : `读取了 ${count} 个文件`),
		// write and edit
		wrote: "已写入",
		writing: "正在写入",
		edited: "已编辑",
		editing: "正在编辑",
		summaryEdited: (count: number) => (count === 1 ? "编辑了一个文件" : `编辑了 ${count} 个文件`),
	},
});
