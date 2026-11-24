// Code mode's texts: how the `codemode` tool shows in the chat (activity.tsx). `en` defines the keys and their
// arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("codemode", {
	en: {
		briefScript: "Running script",
		ranScript: "Ran a script",
		runningScript: "Running a script",
		calls: (count: number) => `${count} ${count === 1 ? "call" : "calls"}`,
		failed: (count: number) => `, ${count} failed`,
		summaryScript: (count: number) => (count === 1 ? "ran a script" : `ran ${count} scripts`),
		// nested.ts
		repeatedRuns: (count: number, failed: number) => `${count} runs${failed ? `, ${failed} failed` : ""}`,
	},
	zh: {
		briefScript: "正在运行脚本",
		ranScript: "运行了脚本",
		runningScript: "正在运行脚本",
		calls: (count: number) => `${count} 次调用`,
		failed: (count: number) => `，${count} 次失败`,
		summaryScript: (count: number) => (count === 1 ? "运行了一个脚本" : `运行了 ${count} 个脚本`),
		// nested.ts
		repeatedRuns: (count: number, failed: number) => `${count} 次运行${failed ? `，${failed} 次失败` : ""}`,
	},
});
