// The views' part of the command menu, for the open session: Show view… and Hide view… (this device's layout), Add
// changes view and Add Markdown view… (as the Views sheet adds them), and Annotate / Stop annotating (the top bar's
// switch); with their pages.
import { BACKGROUND_CONTEXT, type Host, type Language, liveIn, withHeld } from "@p2/app/v1";
import {
	type Command,
	type CommandContext,
	CommandMenu,
	type CommandPage,
	type CommandTarget,
	DiffIcon,
	EyeIcon,
	EyeOffIcon,
	FileIcon,
	PencilIcon,
	textIn,
	useCommandMatches,
	useCommandMenu,
	useCommandQuery,
	useCommandTarget,
	useComposerState,
	useHost,
	useLanguage,
	useMessages,
	useObject,
	useReadable,
	useRoute,
} from "@p2/app/v1/web";
import type { ReactNode } from "react";
import { type OpenInput, type View, Views } from "./contract.ts";
import { viewsIn } from "./layout.ts";
import { hide, setAnnotateMode, show, useAnnotateMode, useLayout } from "./layout-store.ts";
import { messages } from "./messages.ts";
import { describeIn, markdownPath, openView } from "./sheet.tsx";

/** The commands, by id. Each acts on the session target while it is the open one: views show beside its chat. */
export const VIEW_COMMANDS: Readonly<Record<string, Command>> = {
	"views.show": {
		title: textIn(messages, "cmdShowView"),
		group: textIn(messages, "groupViews"),
		order: 60,
		icon: EyeIcon,
		keywords: [
			textIn(messages, "keywordSwitchView"),
			textIn(messages, "keywordOpenView"),
			textIn(messages, "keywordPane"),
		],
		target: ["session"],
		Shown: HasViews,
		action: { kind: "page", page: "views-show" },
	},
	"views.hide": {
		title: textIn(messages, "cmdHideView"),
		group: textIn(messages, "groupViews"),
		order: 60,
		icon: EyeOffIcon,
		keywords: [textIn(messages, "keywordCloseView"), textIn(messages, "keywordPane")],
		target: ["session"],
		Shown: ShowsViews,
		action: { kind: "page", page: "views-hide" },
	},
	"views.add-changes": {
		title: textIn(messages, "cmdAddChanges"),
		group: textIn(messages, "groupViews"),
		order: 60,
		icon: DiffIcon,
		keywords: [textIn(messages, "keywordDiff"), textIn(messages, "keywordWorkingTree")],
		target: ["session"],
		Shown: CanEdit,
		action: { kind: "run", run: addChanges },
	},
	"views.add-markdown": {
		title: textIn(messages, "cmdAddMarkdown"),
		group: textIn(messages, "groupViews"),
		order: 60,
		icon: FileIcon,
		keywords: [textIn(messages, "keywordOpenFile"), textIn(messages, "keywordDocument")],
		target: ["session"],
		Shown: CanEdit,
		action: { kind: "page", page: "views-markdown" },
	},
	"views.annotate": {
		title: textIn(messages, "cmdAnnotate"),
		group: textIn(messages, "groupViews"),
		order: 60,
		icon: PencilIcon,
		keywords: [
			textIn(messages, "keywordComment"),
			textIn(messages, "keywordDraw"),
			textIn(messages, "keywordMarkRemoval"),
		],
		target: ["session"],
		Shown: NotAnnotating,
		action: { kind: "run", run: (ctx) => annotate(ctx, "text") },
	},
	"views.stop-annotating": {
		title: textIn(messages, "cmdStopAnnotating"),
		group: textIn(messages, "groupViews"),
		order: 60,
		icon: PencilIcon,
		keywords: [textIn(messages, "keywordAnnotate")],
		target: ["session"],
		Shown: Annotating,
		action: { kind: "run", run: (ctx) => annotate(ctx, "off") },
	},
};

/** The pages, by name. */
export const VIEW_PAGES: Readonly<Record<string, CommandPage>> = {
	"views-show": {
		label: textIn(messages, "pageShowView"),
		placeholder: textIn(messages, "pageSearchViews"),
		Body: ShowPage,
	},
	"views-hide": {
		label: textIn(messages, "pageHideView"),
		placeholder: textIn(messages, "pageSearchViews"),
		Body: HidePage,
	},
	"views-markdown": {
		label: textIn(messages, "pageMarkdownView"),
		placeholder: textIn(messages, "pageMarkdownSearch"),
		empty: textIn(messages, "pageMarkdownEmpty"),
		Body: MarkdownPage,
	},
};

/** The session the views commands act on: the target's, while it is the open session. */
const openSession = (target: CommandTarget | undefined, session: string | undefined): string | undefined =>
	target?.type === "session" && target.id === session ? target.id : undefined;

/** Adds the working tree's changes as a view, in front. */
async function addChanges(ctx: CommandContext): Promise<void> {
	const session = openSession(ctx.target, ctx.route.session);
	if (session !== undefined) await open(ctx.host, session, { kind: "changes" });
}

/** Opens a view in `session` for one call, as the Views sheet's Add and Open do. */
const open = (host: Host, session: string, input: OpenInput): Promise<void> =>
	withHeld(host.hold(Views, { session }, BACKGROUND_CONTEXT), "editor", (editor) => openView(editor, session, input));

/** Switches annotation mode on (marking text first, as the top bar's switch does) or off. */
function annotate(ctx: CommandContext, mode: "text" | "off"): void {
	if (openSession(ctx.target, ctx.route.session) !== undefined) setAnnotateMode(mode);
}

/** The open session the menu's target is, if it is one. */
const useSession = (): string | undefined => openSession(useCommandTarget(), useRoute().session);

/** The open session's views (absent until they arrive or without a session target). */
function useViews(session: string | undefined): readonly View[] | undefined {
	return useReadable(useObject(Views, session === undefined ? undefined : { session })?.views);
}

/** The views this device shows: placed in its layout and not hidden (none without a session). */
function useShown(session: string | undefined): ReadonlySet<string> {
	const layout = useLayout(session ?? "");
	const hidden = new Set(layout.hidden);
	return new Set(viewsIn(layout.tree).filter((id) => !hidden.has(id)));
}

/** Renders `children` while the open session has views. */
function HasViews({ children }: { children: ReactNode }) {
	const views = useViews(useSession());
	return views?.length ? children : null;
}

/** Renders `children` while this device shows one of the open session's views. */
function ShowsViews({ children }: { children: ReactNode }) {
	const session = useSession();
	const views = useViews(session);
	const shown = useShown(session);
	return views?.some((view) => shown.has(view.id)) ? children : null;
}

/** Renders `children` while the reader may change the open session's views (the owner, a full guest). */
function CanEdit({ children }: { children: ReactNode }) {
	const session = useSession();
	const editor = liveIn(useObject(Views, session === undefined ? undefined : { session }), "editor");
	return editor ? children : null;
}

/** Renders `children` on the open session while annotation mode is off. */
function NotAnnotating({ children }: { children: ReactNode }) {
	const mode = useAnnotateMode();
	return useSession() !== undefined && mode === "off" ? children : null;
}

/** Renders `children` on the open session while annotation mode is on. */
function Annotating({ children }: { children: ReactNode }) {
	const mode = useAnnotateMode();
	return useSession() !== undefined && mode !== "off" ? children : null;
}

const viewText = (view: View, language: Language | undefined): string => `${view.title} ${describeIn(view, language)}`;

/** Every view of the open session; picking one shows it in front on this device (hidden ones say so). */
function ShowPage() {
	const session = useSession();
	const shown = useShown(session);
	const language = useLanguage();
	const matches = useCommandMatches(useViews(session) ?? NO_VIEWS, (view) => viewText(view, language));
	if (session === undefined) return null;
	return <ViewRows session={session} views={matches} shown={shown} pick={show} />;
}

/** The views this device shows; picking one hides it here (the agent or Show view… shows it again). */
function HidePage() {
	const session = useSession();
	const shown = useShown(session);
	const language = useLanguage();
	const matches = useCommandMatches(useViews(session) ?? NO_VIEWS, (view) => viewText(view, language));
	if (session === undefined) return null;
	const views = matches.filter((view) => shown.has(view.id));
	return <ViewRows session={session} views={views} shown={shown} pick={hide} />;
}

const NO_VIEWS: readonly View[] = [];

/** Rows of views, each saying what it shows, and "Hidden" when this device does not show it. */
function ViewRows({
	session,
	views,
	shown,
	pick,
}: {
	session: string;
	views: readonly View[];
	shown: ReadonlySet<string>;
	pick: (session: string, id: string) => void;
}) {
	const { close } = useCommandMenu();
	const { t } = useMessages(messages);
	const language = useLanguage();
	return (
		<CommandMenu.Group heading={t("groupViews")}>
			{views.map((view) => (
				<CommandMenu.Row
					key={view.id}
					title={view.title}
					suffix={
						shown.has(view.id)
							? describeIn(view, language)
							: `${describeIn(view, language)} · ${t("hiddenSuffix")}`
					}
					onSelect={async () => {
						await close();
						pick(session, view.id);
					}}
				/>
			))}
		</CommandMenu.Group>
	);
}

/** The page's query is the file's path; its one row opens the file as a view. */
function MarkdownPage() {
	const host = useHost();
	const { close } = useCommandMenu();
	const { fail } = useComposerState();
	const { t } = useMessages(messages);
	const session = useSession();
	const path = markdownPath(useCommandQuery());
	if (session === undefined || path === "") return null;
	return (
		<CommandMenu.Group heading={t("groupViews")}>
			<CommandMenu.Row
				title={t("openFile", path)}
				icon={FileIcon}
				onSelect={async () => {
					await close();
					await open(host, session, { kind: "markdown", item: path }).catch(fail);
				}}
			/>
		</CommandMenu.Group>
	);
}
