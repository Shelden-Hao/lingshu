// How the `terminal` tool shows in the chat: its tmux command line, its output, and the terminal one tap away.
import {
	activityMessages,
	CommandBlock,
	DetailLink,
	detailsOf,
	failureOf,
	firstLine,
	InputOutput,
	lastLine,
	OpenTerminal,
	OutputBlock,
	parsedArgs,
	type Step,
	stringOf,
	type ToolActivity,
	type ToolView,
} from "@p2/app/v1/web";
import { useContext } from "react";
import { messages } from "./messages.ts";

/** A call as its tmux command line: `send-keys -t 1 C-c`. */
const commandLine = (tool: ToolView) =>
	[
		stringOf(tool.args.command),
		...(Array.isArray(tool.args.args)
			? tool.args.args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
			: []),
	]
		.filter(Boolean)
		.join(" ");

function TerminalDetail({ step }: { step: Step }) {
	const { tool } = step;
	const openTerminal = useContext(OpenTerminal);
	const details = detailsOf(tool);
	const terminalId = stringOf(details.terminalId);
	return (
		<>
			<InputOutput
				input={<CommandBlock command={commandLine(tool)} />}
				output={<OutputBlock output={tool.output} failed={step.status === "error"} />}
			/>
			{openTerminal && terminalId && tool.status === "done" && stringOf(tool.args.command) !== "kill-window" && (
				<DetailLink onClick={() => openTerminal(terminalId)}>
					Open terminal{typeof details.window === "number" ? ` ${details.window}` : ""}
				</DetailLink>
			)}
		</>
	);
}

export const terminalActivity: ToolActivity = {
	brief: "Using terminal",
	describe: (step) => ({
		label: { kind: "command", verb: "Terminal", object: commandLine(step.tool), style: "code" },
		description: failureOf(step) ?? lastLine(step.tool.output),
		mono: true,
	}),
	running: (step) => ({ kind: "command", verb: "Terminal", object: firstLine(commandLine(step.tool)), style: "code" }),
	summary: (count) => activityMessages(messages)("toolSummary", count),
	Detail: TerminalDetail,
	// A script's call: the tmux command's name, as a command line.
	CallInput: ({ call }) => <CommandBlock command={stringOf(parsedArgs(call.args).command)} />,
};
