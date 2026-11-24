// The workspace's commands for the command menu: Browse files, Show changes and Search files on a session or a
// subagent's conversation, each showing its workspace on that tab, for whoever the top bar's workspace button is for.
import {
	type Command,
	type CommandContext,
	type ContributedText,
	DiffIcon,
	FileIcon,
	getNavigation,
	SearchIcon,
	textIn,
	useCanWrite,
	useCommandTarget,
	useRoute,
	type WorkspaceTab,
} from "@p2/app/v1/web";
import type { ComponentType, ReactNode } from "react";
import { commandSession, NotArchived, openPanelIn } from "../sessions/contract.web.tsx";
import { messages } from "./messages.ts";
import { showWorkspaceTab, withWorkspace } from "./tabs.ts";

/** The commands, by id. */
export const WORKSPACE_COMMANDS: Readonly<Record<string, Command>> = {
	"workspace.files": tabCommand(textIn(messages, "cmdFiles"), FileIcon, "files", [
		textIn(messages, "keywordOpenFiles"),
		textIn(messages, "keywordWorkspace"),
		textIn(messages, "keywordFileTree"),
	]),
	"workspace.changes": tabCommand(textIn(messages, "cmdChanges"), DiffIcon, "changes", [
		textIn(messages, "keywordDiff"),
		textIn(messages, "keywordWorkingTree"),
		textIn(messages, "keywordGit"),
	]),
	"workspace.search": tabCommand(textIn(messages, "cmdSearch"), SearchIcon, "search", [
		textIn(messages, "keywordGrep"),
		textIn(messages, "keywordFindInFiles"),
	]),
};

/** A command showing the workspace on `tab`; the workspace shows the viewed conversation's working tree. */
function tabCommand(
	title: ContributedText,
	icon: ComponentType,
	tab: WorkspaceTab,
	keywords: readonly ContributedText[],
): Command {
	return {
		title,
		group: textIn(messages, "group"),
		order: 30,
		icon,
		keywords,
		target: ["session", "conversation"],
		Shown: Writable,
		action: { kind: "run", run: (ctx) => showTab(ctx, tab) },
	};
}

/**
 * Shows the command's session's workspace on `tab`: in the open session as its tab buttons do (or its top bar button,
 * when it is closed), in another session by opening the session with it.
 */
function showTab(ctx: CommandContext, tab: WorkspaceTab): void {
	const id = commandSession(ctx.target, ctx.route);
	if (id === ctx.route.session) showWorkspaceTab(getNavigation(), tab);
	else if (id !== undefined) openPanelIn(id, (route) => withWorkspace(route, tab));
}

/** Renders `children` while the reader may open the session's workspace (the owner, or a guest who may write). */
function Writable({ children }: { children: ReactNode }) {
	const writer = useCanWrite(commandSession(useCommandTarget(), useRoute()));
	return writer ? <NotArchived>{children}</NotArchived> : null;
}
