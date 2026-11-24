// The scope prompt's part of the command menu: "Prompt anywhere" switches pointing mode on (mode.ts), "Stop prompting
// anywhere" off; the owner's only, as the overlay is.
import { type Command, CommentIcon, textIn } from "@p2/app/v1/web";
import type { ReactNode } from "react";
import { messages } from "./messages.ts";
import { setPointing, usePointing } from "./mode.ts";

/** The commands, by id. */
export const SCOPE_COMMANDS: Readonly<Record<string, Command>> = {
	"scope-prompt.start": {
		title: textIn(messages, "cmdStart"),
		group: textIn(messages, "groupAsk"),
		order: 70,
		icon: CommentIcon,
		keywords: [
			textIn(messages, "keywordPoint"),
			textIn(messages, "keywordScope"),
			textIn(messages, "keywordAsk"),
			textIn(messages, "keywordFamiliar"),
			textIn(messages, "keywordPick"),
		],
		owner: true,
		Shown: NotPointing,
		action: { kind: "run", run: () => setPointing(true) },
	},
	"scope-prompt.stop": {
		title: textIn(messages, "cmdStop"),
		group: textIn(messages, "groupAsk"),
		order: 70,
		icon: CommentIcon,
		keywords: [textIn(messages, "keywordPoint"), textIn(messages, "keywordScope")],
		owner: true,
		Shown: Pointing,
		action: { kind: "run", run: () => setPointing(false) },
	},
};

function NotPointing({ children }: { children: ReactNode }) {
	return usePointing() ? null : children;
}

function Pointing({ children }: { children: ReactNode }) {
	return usePointing() ? children : null;
}
