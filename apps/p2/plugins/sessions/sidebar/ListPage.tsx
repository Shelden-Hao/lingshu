// A rollup's or a group's list in the main area (`Route.page`): every session, those that fell out of the rollup's
// window after the others and dimmed but still openable (as a to-do app's logbook), in groups for a rollup of groups;
// or the archive: the archived projects (their ⋯ restores or deletes one) and the archived sessions, each restored on a
// click. Its search finds sessions and messages within the list only.

import type { Language } from "@p2/app/v1";
import {
	ErrorToast,
	inPage,
	MenuIcon,
	NavAddIcon,
	NavFolderIcon,
	NavMoreIcon,
	openCommandMenu,
	openPage,
	openSidebar,
	requestReveal,
	SearchIcon,
	SideNavigation,
	Slot,
	SlotList,
	showText,
	useLanguage,
	useLinkHref,
	useScrollMemory,
} from "@p2/app/v1/web";
import { useEffect, useRef, useState } from "react";
import type { ArchivedProject } from "../../projects/contract.ts";
import type { SearchResults } from "../../search/contract.ts";
import { messages, sidebarText } from "../messages.ts";
import { archivedProjectTarget } from "../project-commands.tsx";
import { type ListEntry, type ListPageData, type NewTarget, WINDOWS } from "./model.ts";
import { NavRow } from "./NavRow.tsx";
import { ago, pageRoute, type RowActions, SessionItem } from "./Row.tsx";

/** The messages key of a built-in rollup's name (project and folder names are their own). */
const rollupNameKey = (name: string): string =>
	name === "Folders"
		? "pageFolders"
		: name === "Other sessions"
			? "sidebarOtherSessions"
			: name === "Projects"
				? "groupProjects"
				: name === "Archive"
					? "pageArchive"
					: name;

/** Renders a sessions-plugin message `key` with its `args` in `language` (outside React hooks). */
const showT =
	(key: string, ...args: readonly unknown[]) =>
	(language: Language | undefined): string =>
		(messages.in(language) as unknown as (...a: readonly unknown[]) => string)(key, ...args);

/** What the page says under its title: the window, or what the archive holds. */
function subtitle(data: ListPageData | undefined, language: Language | undefined): string {
	if (!data) return "";
	if (data.archived) return showText(sidebarText("archiveSubtitle"), language);
	if (!data.window || data.window === "forever" || data.window === "none")
		return showText(sidebarText("allSessionsSubtitle"), language);
	const label = WINDOWS.find((each) => each.window === data.window)?.label.toLowerCase();
	return label === undefined ? "" : showT("windowSubtitle", label)(language);
}

const QUERIES_KEY = "p2-list-queries";

/** The search typed on each list page of this tab, so Back to a list shows it as it was left. */
function storedQuery(page: string): string {
	try {
		const value: unknown = JSON.parse(sessionStorage.getItem(QUERIES_KEY) ?? "{}");
		return typeof value === "object" && value !== null && page in value
			? String((value as Record<string, unknown>)[page])
			: "";
	} catch {
		return "";
	}
}

function storeQuery(page: string, query: string): void {
	try {
		const value: unknown = JSON.parse(sessionStorage.getItem(QUERIES_KEY) ?? "{}");
		const queries = typeof value === "object" && value !== null ? { ...value } : {};
		sessionStorage.setItem(QUERIES_KEY, JSON.stringify({ ...queries, [page]: query }));
	} catch {}
}

/** The server's search for `query` within `sessions`, 200 ms after the last keystroke; nothing while offline. */
function useSearch(
	query: string,
	archived: boolean,
	sessions: readonly string[],
	connected: boolean,
	onSearch: ((query: string, archived: boolean, sessions: readonly string[]) => Promise<SearchResults>) | undefined,
): SearchResults | undefined {
	const [results, setResults] = useState<SearchResults>();
	const scope = sessions.join();
	// biome-ignore lint/correctness/useExhaustiveDependencies: `scope` stands for `sessions` by value; a new array of the same sessions must not search again.
	useEffect(() => {
		if (!onSearch || !connected || !query.trim()) {
			setResults(undefined);
			return;
		}
		let current = true;
		const timer = setTimeout(() => {
			// A failed search (the connection dropped) leaves the last results; the next keystroke searches again.
			void onSearch(query, archived, sessions)
				.then((value) => current && setResults(value))
				.catch(() => {});
		}, 200);
		return () => {
			current = false;
			clearTimeout(timer);
		};
	}, [onSearch, query, archived, scope, connected]);
	return results;
}

/** The "+" that starts a session in a group (absent without `onNewIn`). */
function NewIn({ name, target, onNewIn }: { name: string; target?: NewTarget; onNewIn?: (target: NewTarget) => void }) {
	const language = useLanguage();
	return target && onNewIn ? (
		<button
			type="button"
			className="nav-control group-new"
			aria-label={showT("newSessionIn", name)(language)}
			title={showT("newSessionIn", name)(language)}
			onClick={() => onNewIn(target)}
		>
			<NavAddIcon size={16} />
		</button>
	) : null;
}

/**
 * The page of list `page`: a top bar with the list's name, a search, then its list (`data`; undefined: the list is
 * gone). Nothing is listed while the sessions are `loading`.
 */
export function ListPage({
	page,
	data,
	loading,
	connected,
	actions,
	onSearch,
	onNewIn,
	archivedProjects = [],
}: {
	page: string;
	data: ListPageData | undefined;
	loading: boolean;
	connected: boolean;
	actions: RowActions;
	/** Searches titles and messages within the given sessions (absent: no search). */
	onSearch?: (query: string, archived: boolean, sessions: readonly string[]) => Promise<SearchResults>;
	/** Starts a new session in a group (the owner's). */
	onNewIn?: (target: NewTarget) => void;
	/** The archived projects, shown on the archive's page (the owner's). */
	archivedProjects?: readonly ArchivedProject[];
}) {
	const linkHref = useLinkHref();
	const language = useLanguage();
	const archived = data?.archived ?? false;
	const [query, setQuery] = useState(() => storedQuery(page));
	const body = useRef<HTMLDivElement>(null);
	useScrollMemory(body, `list:${page}`);
	const content = data?.content;
	const listed =
		content?.layout === "groups"
			? content.groups.flatMap((group) => group.entries.map(({ row }) => row.id))
			: (content?.entries.map(({ row }) => row.id) ?? []);
	const results = useSearch(query, archived, listed, connected, onSearch);
	const matching = (entries: readonly ListEntry[]) =>
		results ? entries.filter(({ row }) => results.sessions.includes(row.id)) : entries;
	const messages = results?.messages ?? [];
	// The aged sessions follow the others in the secondary colour, as a to-do app's logbook below its open to-dos.
	const rows = (entries: readonly ListEntry[]) => (
		<SideNavigation.List>
			{matching(entries).map(({ row, aged }) => (
				<SessionItem
					key={row.id}
					session={row}
					scope="page"
					listsConversations={false}
					archived={archived}
					aged={aged}
					actions={actions}
				/>
			))}
		</SideNavigation.List>
	);
	const found = results && listed.some((id) => results.sessions.includes(id));
	return (
		<div className="list-page">
			<header className="topbar">
				<button
					type="button"
					className="icon-button menu sidebar-open"
					onClick={openSidebar}
					aria-label={showText(sidebarText("sidebarLabel"), language)}
				>
					<MenuIcon />
					<Slot name="menu-badge" />
				</button>
				<SlotList prefix="topbar-start" />
				<div className="title">
					<h1>
						{data === undefined
							? showText(sidebarText("sidebarLabel"), language)
							: showText(sidebarText(rollupNameKey(data.name)), language)}
					</h1>
					<p className="list-page-subtitle">{subtitle(data, language)}</p>
				</div>
				{data && <NewIn name={data.name} target={data.target} onNewIn={onNewIn} />}
			</header>
			<ErrorToast />
			{/* One scroller across the main area, as the transcript's; the list in the transcript's column. */}
			<div className="scroller list-page-scroller" ref={body}>
				<div className="list-page-body" hidden={loading}>
					{data && onSearch && (
						<label className="search">
							<SearchIcon />
							<input
								type="search"
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
									storeQuery(page, event.target.value);
								}}
								placeholder={
									archived
										? showText(sidebarText("searchArchive"), language)
										: showT("searchList", data.name)(language)
								}
								aria-label={showText(sidebarText("searchSessions"), language)}
							/>
						</label>
					)}
					{archived && !results && archivedProjects.length > 0 && (
						<section className="list-group">
							<h2 className="list-group-label">{showText(sidebarText("groupProjects"), language)}</h2>
							<SideNavigation.List>
								{archivedProjects.map((project) => (
									<SideNavigation.Item key={project.name}>
										<NavRow
											className="group-row archived-project"
											marker={<NavFolderIcon size={16} />}
											label={<span className="session-title">{project.name}</span>}
											details={<span className="item-age">{ago(project.archivedAt, actions.now)}</span>}
											onActivate={() => openCommandMenu(archivedProjectTarget(project.name))}
											controls={
												<button
													type="button"
													className="nav-control group-options"
													aria-label={showT("optionsOf", project.name)(language)}
													title={showText(sidebarText("options"), language)}
													onClick={() => openCommandMenu(archivedProjectTarget(project.name))}
												>
													<NavMoreIcon size={16} />
												</button>
											}
										/>
									</SideNavigation.Item>
								))}
							</SideNavigation.List>
							<h2 className="list-group-label">{showText(sidebarText("pageSessions"), language)}</h2>
						</section>
					)}
					{content?.layout === "sessions" && rows(content.entries)}
					{content?.layout === "groups" &&
						content.groups.map((group) =>
							results && matching(group.entries).length === 0 ? null : (
								<section className="list-group" key={group.key}>
									<h2 className="list-group-label">
										{/* A group's own list: the sidebar's group rows show or hide their sessions instead. */}
										<a
											className="list-group-link"
											href={linkHref(pageRoute(group.key))}
											onClick={inPage(() => openPage(group.key))}
										>
											{group.name}
										</a>
										<NewIn name={group.name} target={group.target} onNewIn={onNewIn} />
									</h2>
									{group.entries.length > 0 ? (
										rows(group.entries)
									) : (
										<p className="empty-note">{showText(sidebarText("noSessions"), language)}</p>
									)}
								</section>
							),
						)}
					{messages.length > 0 && (
						<section className="list-group">
							<h2 className="list-group-label">{showText(sidebarText("groupMessages"), language)}</h2>
							{messages.slice(0, 40).map((hit) => (
								<button
									type="button"
									key={`${hit.session}-${hit.entryId}`}
									className="hit"
									// p2 indexes subagent messages too: a hit opens the conversation it was found in, at the message.
									onClick={() => {
										requestReveal(hit.session, hit.conversationId, hit.entryId);
										if (archived) actions.onRestore(hit.session, hit.conversationId);
										else actions.onOpen(hit.session, hit.conversationId);
									}}
								>
									<strong>{hit.title}</strong>
									<span>{hit.text.slice(0, 160)}</span>
								</button>
							))}
						</section>
					)}
					{data && listed.length === 0 && content?.layout === "sessions" && (
						<p className="empty-note">{showText(sidebarText("noSessions"), language)}</p>
					)}
					{results && !found && messages.length === 0 && (
						<p className="empty-note">{showText(sidebarText("nothingFound"), language)}</p>
					)}
					{!data && <p className="empty-note">{showText(sidebarText("listGone"), language)}</p>}
				</div>
			</div>
		</div>
	);
}
