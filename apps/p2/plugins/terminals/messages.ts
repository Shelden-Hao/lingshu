// The terminals' texts: the terminal view's controls, its notices and the command menu's entries. `en` defines the
// keys and their arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("terminals", {
	en: {
		// the command menu
		openTerminal: "Open terminal",
		newTerminal: "New terminal",
		groupTerminal: "Terminal",
		keywordShowTerminal: "show terminal",
		keywordShell: "shell",
		keywordStartTerminal: "start terminal",
		// the terminal button
		terminal: "Terminal",
		// the view
		newTerminalLabel: "New terminal",
		paste: "Paste",
		pasteIntoTerminal: "Paste into terminal",
		extraKeys: "Extra keys",
		hideExtraKeys: "Hide extra keys",
		showExtraKeys: "Show extra keys",
		moveToBottom: "Move terminal to the bottom",
		moveToSide: "Move terminal to the side",
		moveToBottomTitle: "Move to the bottom",
		moveToSideTitle: "Move to the side",
		removeTerminal: "Remove terminal",
		closeTerminal: "Close terminal",
		remove: "Remove",
		closeKills: "Close (kills the program)",
		hideTerminal: "Hide terminal",
		hideKeepsRunning: "Hide (keeps running)",
		openedByAgent: " (opened by the agent)",
		terminalNumber: (index: number) => `Terminal ${index}`,
		exited: (name: string) => `${name} (exited)`,
		terminalInput: "Terminal input",
		resizeTerminal: "Drag to resize terminal",
		// paste hints
		pasteHintTouch: "Long-press the terminal to paste.",
		pasteHintKey: (key: string) => `Press ${key} in the terminal to paste.`,
		pasteHintBoth: (key: string) => `Long-press the terminal or press ${key} to paste.`,
		pasteClipboardUnavailable: "Clipboard unavailable.",
		// statuses
		connecting: "Connecting…",
		exitedWithCode: (code: number) => `Exited with code ${code}`,
		// the close confirm
		programRunning: (program: string | undefined) =>
			`${program ?? "A program"} is running in this terminal. Close it anyway?`,
		close: "Close",
		cancel: "Cancel",
		// the outdated host
		hostOlder: "The terminal host runs older code. ",
		hostRestartEndsAll: "Restarting it ends its terminals.",
		hostRestartEnds: (count: number) => `Restarting it ends ${count} running terminal${count === 1 ? "" : "s"}.`,
		restart: "Restart",
		// the start button
		startNewTerminal: "New terminal",
		// the tool's words in the chat (activity.tsx)
		toolSummary: (count: number) => (count === 1 ? "used the terminal" : `used the terminal ${count} times`),
	},
	zh: {
		// the command menu
		openTerminal: "打开终端",
		newTerminal: "新增终端",
		groupTerminal: "终端",
		keywordShowTerminal: "显示终端",
		keywordShell: "shell",
		keywordStartTerminal: "启动终端",
		// the terminal button
		terminal: "终端",
		// the view
		newTerminalLabel: "新增终端",
		paste: "粘贴",
		pasteIntoTerminal: "粘贴到终端",
		extraKeys: "扩展按键",
		hideExtraKeys: "隐藏扩展按键",
		showExtraKeys: "显示扩展按键",
		moveToBottom: "将终端移到底部",
		moveToSide: "将终端移到侧边",
		moveToBottomTitle: "移到底部",
		moveToSideTitle: "移到侧边",
		removeTerminal: "移除终端",
		closeTerminal: "关闭终端",
		remove: "移除",
		closeKills: "关闭（会终止程序）",
		hideTerminal: "隐藏终端",
		hideKeepsRunning: "隐藏（保持运行）",
		openedByAgent: "（由智能体打开）",
		terminalNumber: (index: number) => `终端 ${index}`,
		exited: (name: string) => `${name}（已退出）`,
		terminalInput: "终端输入",
		resizeTerminal: "拖动以调整终端大小",
		// paste hints
		pasteHintTouch: "长按终端以粘贴。",
		pasteHintKey: (key: string) => `在终端中按 ${key} 粘贴。`,
		pasteHintBoth: (key: string) => `长按终端或按 ${key} 粘贴。`,
		pasteClipboardUnavailable: "剪贴板不可用。",
		// statuses
		connecting: "连接中…",
		exitedWithCode: (code: number) => `已退出，退出码 ${code}`,
		// the close confirm
		programRunning: (program: string | undefined) => `终端中正在运行 ${program ?? "一个程序"}。仍要关闭吗？`,
		close: "关闭",
		cancel: "取消",
		// the outdated host
		hostOlder: "终端宿主运行的代码较旧。",
		hostRestartEndsAll: "重启它会结束其中的终端。",
		hostRestartEnds: (count: number) => `重启它会结束 ${count} 个运行中的终端。`,
		restart: "重启",
		// the start button
		startNewTerminal: "新增终端",
		// the tool's words in the chat (activity.tsx)
		toolSummary: (count: number) => (count === 1 ? "使用了一次终端" : `使用了 ${count} 次终端`),
	},
});
