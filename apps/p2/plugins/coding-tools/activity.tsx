// How Durable's coding tools (bash, read, write, edit) show in the chat: their words on the wheel and in the sheet,
// and their details (a command and its output as a terminal, a file's numbered lines or image, an edit's diff).
import {
	activityMessages,
	CodeBlock,
	type CodeLine,
	CommandBlock,
	DetailImages,
	DiffBlock,
	detailsOf,
	FilePath,
	failureOf,
	fileName,
	firstLine,
	InputOutput,
	Interrupted,
	LinesBlock,
	lastLine,
	OutputBlock,
	parsedArgs,
	relativePath,
	type Step,
	stringOf,
	type ToolActivity,
} from "@p2/app/v1/web";
import { messages } from "./messages.ts";

/** Commands that search: they read as "Searched". */
const SEARCH = /^\s*(rg|grep|egrep|fgrep|find|fd|ag|ack)\b/;
const extension = (path: string) => /\.([a-z0-9]+)$/i.exec(path)?.[1];
const pathOf = (step: Step) => stringOf(step.tool.args.path);

function BashDetail({ step }: { step: Step }) {
	return (
		<>
			<InputOutput
				input={<CommandBlock command={stringOf(step.tool.args.command)} />}
				output={<OutputBlock output={step.tool.output} failed={step.status === "error"} />}
			/>
			<Interrupted step={step} />
		</>
	);
}

const bash: ToolActivity = {
	describe(step) {
		const command = stringOf(step.tool.args.command);
		const search = SEARCH.test(command);
		const t = activityMessages(messages);
		return {
			label: {
				kind: search ? "search" : "command",
				verb: search ? t("searched") : t("ran"),
				object: command,
				style: "code",
			},
			// A failure's first line says what went wrong; a success's last line is its result.
			description: failureOf(step) ?? lastLine(step.tool.output),
			mono: true,
		};
	},
	running(step) {
		const command = firstLine(stringOf(step.tool.args.command));
		const search = SEARCH.test(command);
		const t = activityMessages(messages);
		return {
			kind: search ? "search" : "command",
			verb: search ? t("searching") : t("running"),
			object: command,
			style: "code",
		};
	},
	brief: "Running",
	argument: (tool) => firstLine(stringOf(tool.args.command)),
	failure: (tool) => {
		const code = /exited with code (\d+)/.exec(tool.output)?.[1];
		return code ? `exit ${code}` : undefined;
	},
	summary: (count) => activityMessages(messages)("summaryRan", count),
	Detail: BashDetail,
	CallInput: ({ call }) => <CommandBlock command={stringOf(parsedArgs(call.args).command)} />,
};

/** A read's output ("40\tcode" per line) as the file's lines, numbered from where the read started. */
function readLines(output: string): CodeLine[] {
	return output.split("\n").map((line, index) => {
		const numbered = /^\s*(\d+)\t(.*)$/.exec(line);
		return numbered
			? { kind: "", number: Number(numbered[1]), text: numbered[2] ?? "" }
			: { kind: "", number: index + 1, text: line };
	});
}

const range = (step: Step) => {
	const { offset, limit } = step.tool.args;
	return typeof offset === "number"
		? { offset, end: offset + (typeof limit === "number" ? limit : 1) - 1 }
		: undefined;
};

function ReadDetail({ step }: { step: Step }) {
	const { tool } = step;
	const lines = range(step);
	return (
		<InputOutput
			input={
				<FilePath
					path={pathOf(step)}
					{...(lines ? { line: lines.offset, range: ` · lines ${lines.offset}–${lines.end}` } : {})}
				/>
			}
			output={
				tool.images.length ? (
					<DetailImages images={tool.images} />
				) : step.status === "error" ? (
					<OutputBlock output={tool.output} failed />
				) : (
					<LinesBlock lines={readLines(tool.output.trimEnd())} language={extension(pathOf(step))} />
				)
			}
		/>
	);
}

const read: ToolActivity = {
	describe(step) {
		const lines = range(step);
		const t = activityMessages(messages);
		return {
			label: { kind: "read", verb: t("read"), object: fileName(pathOf(step)), style: "file" },
			description:
				failureOf(step) ??
				(step.tool.images.length ? "Image" : lines ? `Lines ${lines.offset}–${lines.end}` : pathOf(step)),
		};
	},
	running: (step) => ({
		kind: "read",
		verb: activityMessages(messages)("reading"),
		object: fileName(pathOf(step)),
		style: "file",
	}),
	brief: "Reading",
	argument: (tool, cwd) => relativePath(cwd, stringOf(tool.args.path)),
	summary: (count) => activityMessages(messages)("summaryRead", count),
	Detail: ReadDetail,
};

/** A write's or an edit's detail: the file (at the diff's first line), then the diff or the content written. */
function ChangeDetail({ step }: { step: Step }) {
	const { tool } = step;
	const path = pathOf(step);
	const diff = stringOf(detailsOf(tool).diff) || undefined;
	const first = diff ? /^[+-]\s*(\d+) /m.exec(diff)?.[1] : undefined;
	return (
		<InputOutput
			input={<FilePath path={path} {...(first ? { line: Number(first) } : {})} />}
			output={
				step.status === "error" ? (
					<OutputBlock output={tool.output} failed />
				) : diff ? (
					<DiffBlock diff={diff} language={path} />
				) : (
					<CodeBlock code={stringOf(tool.args.content) || tool.output} language={extension(path)} />
				)
			}
		/>
	);
}

/** write and edit count together in a run's summary: the same function. */
const edited = (count: number) => activityMessages(messages)("summaryEdited", count);

/** write and edit: the same look, their own verbs. */
const change = (done: "wrote" | "edited", doing: "writing" | "editing"): ToolActivity => ({
	describe: (step) => ({
		label: { kind: "edit", verb: activityMessages(messages)(done), object: fileName(pathOf(step)), style: "file" },
		description: failureOf(step) ?? pathOf(step),
	}),
	running: (step) => ({
		kind: "edit",
		verb: activityMessages(messages)(doing),
		object: fileName(pathOf(step)),
		style: "file",
	}),
	brief: doing === "writing" ? "Writing" : "Editing",
	argument: (tool, cwd) => relativePath(cwd, stringOf(tool.args.path)),
	summary: edited,
	Detail: ChangeDetail,
});

/** The coding tools' contributions, by tool name. */
export const codingToolActivities: Record<string, ToolActivity> = {
	bash,
	read,
	write: change("wrote", "writing"),
	edit: change("edited", "editing"),
};
