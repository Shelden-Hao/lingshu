// The Settings window's part of the command menu: Open settings… (a page of its sections in the window's order) and
// the sections whose name matches the root's query; each opens the window at that section.

import type { Language } from "@p2/app/v1";
import {
	type Command,
	CommandMenu,
	type CommandPage,
	type CommandSearch,
	type ContributedText,
	openSettings,
	SettingsIcon,
	type SettingsSection,
	type SettingsSectionChoice,
	showText,
	textIn,
	useCommandMatches,
	useCommandMenu,
	useLanguage,
	useMessages,
	useOwner,
	useSettingsSections,
} from "@p2/app/v1/web";
import { type ComponentType, useMemo } from "react";
import { messages, sectionText } from "./messages.ts";
import { OWN_SECTIONS } from "./sections.ts";

/** The commands, by id. */
export const SETTINGS_COMMANDS: Readonly<Record<string, Command>> = {
	"settings.open": {
		title: textIn(messages, "open"),
		group: textIn(messages, "group"),
		order: 80,
		icon: SettingsIcon,
		keywords: [textIn(messages, "keywordPreferences"), textIn(messages, "keywordConfiguration")],
		owner: true,
		action: { kind: "page", page: "settings" },
	},
};

/** The pages, by name. */
export const SETTINGS_PAGES: Readonly<Record<string, CommandPage>> = {
	settings: {
		label: textIn(messages, "page"),
		placeholder: textIn(messages, "pageSearch"),
		Body: SettingsPage,
	},
};

/** The sections the root's query matches, in the Settings group beside Open settings…. */
export const SETTINGS_SEARCH: CommandSearch = {
	group: textIn(messages, "group"),
	order: 80,
	Results: SectionResults,
};

/** A section of the window as the menu lists it: its label, its tooltip (matched too) and where it opens. */
type Entry = {
	readonly key: string;
	readonly label: ContributedText;
	readonly title?: ContributedText;
	readonly section: SettingsSectionChoice;
	readonly Shown?: SettingsSection["Shown"];
};

/** The window's sections in its list's order: its own, then the plugins'. */
function useEntries(): readonly Entry[] {
	const sections = useSettingsSections();
	return useMemo(
		() => [
			...OWN_SECTIONS.map((id) => ({
				key: `own:${id}`,
				label: sectionText(id),
				section: { kind: "own" as const, locator: id },
			})),
			...sections.map(([name, { label, title, Shown }]) => ({
				key: name,
				label,
				title,
				section: { kind: "plugin" as const, layer: { kind: "sheet" as const, name } },
				Shown,
			})),
		],
		[sections],
	);
}

/** What a section matches on: its label and its tooltip, in the reader's language. */
const entryText = (entry: Entry, language: Language | undefined): string => {
	const label = showText(entry.label, language);
	return entry.title === undefined ? label : `${label} ${showText(entry.title, language)}`;
};

/** Every section, the window's order kept while the query is empty. */
function SettingsPage() {
	const { t } = useMessages(messages);
	const language = useLanguage();
	const entries = useEntries();
	const matches = useCommandMatches(entries, (entry) => entryText(entry, language));
	return (
		<CommandMenu.Group heading={t("group")}>
			{matches.map((entry) => (
				<SectionRow key={entry.key} entry={entry} />
			))}
		</CommandMenu.Group>
	);
}

/** How many sections the root's results show: the best matches; the settings page has the rest. */
const SEARCH_ROWS = 5;

/** The sections matching the root's query, for the owner only (the window is the owner's). */
function SectionResults() {
	const owner = useOwner();
	const language = useLanguage();
	const matches = useCommandMatches(useEntries(), (entry) => entryText(entry, language));
	if (!owner) return null;
	return matches
		.slice(0, SEARCH_ROWS)
		.map((entry) => <SectionRow key={entry.key} entry={entry} icon={SettingsIcon} />);
}

/** A section; it opens the window there. At the root it has an icon, as the commands beside it do. */
function SectionRow({ entry, icon }: { entry: Entry; icon?: ComponentType }) {
	const { close } = useCommandMenu();
	const language = useLanguage();
	const row = (
		<CommandMenu.Row
			title={showText(entry.label, language)}
			icon={icon}
			onSelect={async () => {
				await close();
				openSettings(entry.section);
			}}
		/>
	);
	const { Shown } = entry;
	return Shown ? <Shown>{row}</Shown> : row;
}
