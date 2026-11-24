// The logs' texts: the logs sheet and the settings list's label. `en` defines the keys; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("logs", {
	en: {
		logs: "Logs",
		source: "Source",
		devSupervisor: "Dev supervisor",
		terminalHost: "Terminal host",
		server: "Server",
		worker: (id: string) => `Worker ${id}`,
		filterLogs: "Filter logs",
		followTail: "Follow tail",
		copied: "Copied",
		couldNotCopy: "Could not copy logs",
		copy: "Copy",
		logLines: "Log lines",
		noLogLines: "No log lines",
		logsUnavailable: "Logs unavailable",
		loadingLogs: "Loading logs…",
	},
	zh: {
		logs: "日志",
		source: "来源",
		devSupervisor: "开发服务器",
		terminalHost: "终端宿主",
		server: "服务器",
		worker: (id: string) => `工作进程 ${id}`,
		filterLogs: "筛选日志",
		followTail: "跟随末尾",
		copied: "已复制",
		couldNotCopy: "无法复制日志",
		copy: "复制",
		logLines: "日志行",
		noLogLines: "暂无日志行",
		logsUnavailable: "日志不可用",
		loadingLogs: "正在加载日志…",
	},
});
