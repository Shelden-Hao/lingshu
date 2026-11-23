// The owner's Settings window, opened from the gear beside the sidebar's theme switch: a list of sections beside a
// pane (on phones the list, then a section). Its own sections edit settings.json (General also the server's name, which
// the server keeps beside it: src/runtime/server-name-file.ts); the plugins' sections (Providers,
// Envs, ...) are their sheets, shown as pages of the window (`SettingsSections`, src/web/SettingsNav.tsx). Each
// change of settings.json is saved at once (text and number fields when they lose focus or on Enter) and shown before
// the save returns. The command menu opens it at a section (commands.tsx).
import {
	BACKGROUND_CONTEXT,
	contribute,
	defineFacet,
	type Held,
	MAX_SERVER_NAME_LENGTH,
	ServerNameSettings,
	Translations,
} from "@p2/app/v1";
import {
	CommandPages,
	CommandSearches,
	Commands,
	closeLayers,
	localeName,
	ModalSheet,
	openSettings,
	SettingsIcon,
	SettingsNavItem,
	SettingsPane,
	Sheet,
	Slots,
	Switch,
	showSettingsSection,
	showText,
	useLanguage,
	useLocalePick,
	useMessages,
	useObject,
	useOfferedLocales,
	useOptimisticCall,
	useOwner,
	useReadable,
	useSettingsSection,
	useSettingsSections,
	useWide,
} from "@p2/app/v1/web";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { Models } from "../models/contract.ts";
import { SETTINGS_COMMANDS, SETTINGS_PAGES, SETTINGS_SEARCH } from "./commands.tsx";
import { type MobileSettings, Settings } from "./contract.ts";
import { messages, sectionText } from "./messages.ts";
import { OWN_SECTIONS, type OwnSection } from "./sections.ts";
import "./settings.css";

/** A change of top-level settings: each one's new value, `undefined` back to its default (removed from the file). */
type Change = Partial<MobileSettings>;
type Stream = NonNullable<MobileSettings["stream"]>;
type Retry = NonNullable<MobileSettings["retry"]>;
type Compaction = NonNullable<MobileSettings["compaction"]>;

const DETAILS = [1, 2, 3, 4] as const;
const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
const NO_AUTOCORRECT = { autoCapitalize: "off", autoCorrect: "off", spellCheck: false } as const;

/**
 * One setting group (`stream`, `retry`, `compaction`: every field optional) with the fields in `change` replaced;
 * `undefined` when no field is left (the group is removed).
 */
function patched<T extends object>(group: T | undefined, change: T): T | undefined {
	const next = { ...group, ...change };
	return Object.values(next).some((value) => value !== undefined) ? next : undefined;
}

/** A number setting as its field shows it, and the field's text as the setting (empty: the default). */
const numberText = (value: number | undefined) => (value === undefined ? "" : String(value));
const textNumber = (text: string) => (text === "" ? undefined : Number(text));

/**
 * The objects the window's own sections show, held by the gear (mounted from the page's start, for owners) so General
 * and the others open without a round trip: settings.json's values and the server's name, a few hundred bytes.
 */
const HeldSettings = createContext<{
	readonly settings: Held<typeof Settings> | undefined;
	readonly serverName: Held<typeof ServerNameSettings> | undefined;
}>({ settings: undefined, serverName: undefined });

/** Opens Settings on p2-mac's Lingshu > Settings… (Cmd+,): its bridge sends "lingshu-host-menu" (HostBridge.swift). */
function listenForMenuSettings(): () => void {
	const chosen = (event: Event) => {
		// Trust boundary: any script of the page can dispatch the event; only the item's name is read.
		if ((event as CustomEvent<{ item?: unknown } | null>).detail?.item === "settings") openSettings();
	};
	window.addEventListener("lingshu-host-menu", chosen);
	return () => window.removeEventListener("lingshu-host-menu", chosen);
}

function GearButton() {
	const { t } = useMessages(messages);
	const owner = useOwner();
	const open = useSettingsSection() !== undefined;
	const settings = useObject(Settings, owner ? {} : undefined);
	const serverName = useObject(ServerNameSettings, owner ? {} : undefined);
	const held = useMemo(() => ({ settings, serverName }), [settings, serverName]);
	useEffect(() => (owner ? listenForMenuSettings() : undefined), [owner]);
	if (!owner) return null;
	return (
		<HeldSettings.Provider value={held}>
			<button
				type="button"
				className="icon-button settings-open"
				onClick={() => openSettings()}
				aria-label={t("title")}
				title={t("title")}
			>
				<SettingsIcon />
			</button>
			{open && <SettingsWindow />}
		</HeldSettings.Provider>
	);
}

/**
 * The window: the list of sections and the pane. Wide screens show both (General when no section is chosen); phones
 * show the list until a section is chosen, then the section with a Back to the list.
 */
function SettingsWindow() {
	const { t } = useMessages(messages);
	const language = useLanguage();
	const section = useSettingsSection();
	const sections = useSettingsSections();
	const wide = useWide();
	const own: OwnSection | undefined =
		section?.kind === "own"
			? (OWN_SECTIONS.find((entry) => entry === section.locator) ?? (wide ? "general" : undefined))
			: undefined;
	const list = section?.kind === "own" && own === undefined;
	return (
		<ModalSheet title={t("title")} onClose={closeLayers} className={`settings-window ${list ? "shows-list" : ""}`}>
			<nav className="settings-nav" aria-label={t("sections")}>
				{OWN_SECTIONS.map((section) => (
					<button
						key={section}
						type="button"
						className="settings-nav-item"
						aria-current={own === section ? "page" : undefined}
						onClick={() => showSettingsSection({ kind: "own", locator: section }, wide)}
					>
						{showText(sectionText(section), language)}
					</button>
				))}
				<hr className="settings-nav-break" />
				{sections.map(([name, { label, title, Shown }]) => {
					const item = <SettingsNavItem key={name} name={name} label={label} title={title} />;
					return Shown ? <Shown key={name}>{item}</Shown> : item;
				})}
			</nav>
			<SettingsPane />
			{own && <SettingsSection id={own} />}
		</ModalSheet>
	);
}

/** One of the window's own sections: its settings.json fields, as a page of the window. */
function SettingsSection({ id }: { id: OwnSection }) {
	const { t } = useMessages(messages);
	const language = useLanguage();
	const service = useContext(HeldSettings).settings;
	const models = useReadable(useObject(Models, {})?.models);
	const loaded = useReadable(service?.settings);
	const fileError = useReadable(service?.error);
	const [error, setError] = useState<string>();
	const onError = useCallback(
		(reason: unknown) => setError(reason instanceof Error ? reason.message : t("saveFailed")),
		[t],
	);
	const [settings, guess] = useOptimisticCall<MobileSettings | undefined, Change>(
		loaded,
		(value, change) => value && { ...value, ...change },
		onError,
	);
	const save = (change: Change) => {
		if (!service) return;
		setError(undefined);
		const entries = Object.entries(change);
		const set = Object.fromEntries(entries.filter(([, value]) => value !== undefined));
		const unset = entries.filter(([, value]) => value === undefined).map(([key]) => key);
		guess(change, () => service.update({ set, unset }, BACKGROUND_CONTEXT));
	};
	const title = showText(sectionText(id), language);
	if (!settings)
		return (
			<Sheet title={title} onClose={closeLayers}>
				<output className="muted">{t("loading")}</output>
			</Sheet>
		);
	const stream = (change: Stream) => save({ stream: patched(settings.stream, change) });
	const retry = (change: Retry) => save({ retry: patched(settings.retry, change) });
	const compaction = (change: Compaction) => save({ compaction: patched(settings.compaction, change) });
	const defaultModel = settings.defaultModel && `${settings.defaultModel.provider}/${settings.defaultModel.modelId}`;
	const modelOptions = (models ?? []).map((model) => ({
		value: `${model.provider}/${model.modelId}`,
		label: `${model.name} (${model.provider})`,
	}));
	// A default that is not among the signed-in models still shows as chosen.
	if (defaultModel && !modelOptions.some((option) => option.value === defaultModel))
		modelOptions.unshift({ value: defaultModel, label: defaultModel });
	const queueModes = [
		{ value: "one-at-a-time", label: t("oneAtATime") },
		{ value: "all", label: t("allAtOnce") },
	] as const;
	const fields: Record<OwnSection, ReactNode> = {
		general: (
			<>
				<p className="muted small">{t("generalHint")}</p>

				<ServerNameSetting onError={onError} />
				<TextSetting
					label={t("ownerName")}
					value={settings.ownerName ?? ""}
					placeholder={t("ownerNamePlaceholder")}
					maxLength={40}
					onSave={(text) => save({ ownerName: text.trim() ? text : undefined })}
				/>
				<Choice
					label={t("chatDetail")}
					value={settings.detail === undefined ? undefined : String(settings.detail)}
					fallback={t("chatDetailFallback")}
					options={[
						{ value: "1", label: t("chatDetail1") },
						{ value: "2", label: t("chatDetail2") },
						{ value: "3", label: t("chatDetail3") },
						{ value: "4", label: t("chatDetail4") },
					]}
					onChange={(value) => save({ detail: DETAILS.find((detail) => String(detail) === value) })}
				/>
			</>
		),
		models: (
			<>
				<p className="muted small">{t("modelsHint")}</p>

				<Choice
					label={t("defaultModel")}
					value={defaultModel}
					fallback={t("firstSignedInModel")}
					options={modelOptions}
					onChange={(value) => {
						const slash = value?.indexOf("/") ?? -1;
						save({
							defaultModel:
								value === undefined || slash < 0
									? undefined
									: { provider: value.slice(0, slash), modelId: value.slice(slash + 1) },
						});
					}}
				/>
				<Choice
					label={t("thinkingLevel")}
					value={settings.thinkingLevel}
					fallback="high"
					options={THINKING_LEVELS.map((level) => ({ value: level, label: level }))}
					onChange={(value) => save({ thinkingLevel: THINKING_LEVELS.find((level) => level === value) })}
				/>
				<TextSetting
					label={t("cyclingModels")}
					value={(settings.enabledModels ?? []).join("\n")}
					placeholder={t("allModels")}
					rows={3}
					mono
					onSave={(text) => {
						const patterns = text
							.split("\n")
							.map((line) => line.trim())
							.filter(Boolean);
						save({ enabledModels: patterns.length ? patterns : undefined });
					}}
				/>
			</>
		),
		agent: (
			<>
				<Switch
					label={t("codeMode")}
					checked={settings.codemode ?? true}
					onChange={(checked) => save({ codemode: checked ? undefined : false })}
				/>
				<Choice
					label={t("toolCalls")}
					value={settings.toolExecution}
					fallback={t("inParallel")}
					options={[
						{ value: "parallel", label: t("inParallel") },
						{ value: "sequential", label: t("oneAfterAnother") },
					]}
					onChange={(value) =>
						save({ toolExecution: value === "parallel" || value === "sequential" ? value : undefined })
					}
				/>
				<Choice
					label={t("steering")}
					value={settings.steeringMode}
					fallback={t("oneAtATime")}
					options={queueModes}
					onChange={(value) => save({ steeringMode: queueModes.find((mode) => mode.value === value)?.value })}
				/>
				<Choice
					label={t("followUps")}
					value={settings.followUpMode}
					fallback={t("oneAtATime")}
					options={queueModes}
					onChange={(value) => save({ followUpMode: queueModes.find((mode) => mode.value === value)?.value })}
				/>
				<Choice
					label={t("cacheWarming")}
					value={settings.cacheWarming}
					fallback={t("cacheWarmingIdle")}
					options={[
						{ value: "idle", label: t("cacheWarmingIdle") },
						{ value: "streaming", label: t("cacheWarmingStreaming") },
						{ value: "off", label: t("cacheWarmingOff") },
					]}
					onChange={(value) =>
						save({
							cacheWarming: value === "idle" || value === "streaming" || value === "off" ? value : undefined,
						})
					}
				/>
			</>
		),
		requests: (
			<>
				<Choice
					label={t("transport")}
					value={settings.stream?.transport}
					fallback={t("automatic")}
					options={[
						{ value: "auto", label: t("automatic") },
						{ value: "sse", label: "SSE" },
						{ value: "websocket", label: "WebSocket" },
					]}
					onChange={(value) =>
						stream({
							transport: value === "auto" || value === "sse" || value === "websocket" ? value : undefined,
						})
					}
				/>
				<Choice
					label={t("cacheRetention")}
					value={settings.stream?.cacheRetention}
					fallback={t("cacheRetentionDefault")}
					options={[
						{ value: "short", label: t("cacheRetentionShort") },
						{ value: "long", label: t("cacheRetentionLong") },
						{ value: "none", label: t("cacheRetentionNone") },
					]}
					onChange={(value) =>
						stream({
							cacheRetention: value === "none" || value === "short" || value === "long" ? value : undefined,
						})
					}
				/>
				<NumberSetting
					label={t("requestTimeout")}
					value={settings.stream?.timeoutMs}
					placeholder={t("providerDefault")}
					min={1}
					onSave={(timeoutMs) => stream({ timeoutMs })}
				/>
				<NumberSetting
					label={t("providerRetries")}
					value={settings.stream?.maxRetries}
					placeholder={t("providerDefault")}
					onSave={(maxRetries) => stream({ maxRetries })}
				/>
				<NumberSetting
					label={t("longestRetryDelay")}
					value={settings.stream?.maxRetryDelayMs}
					placeholder="60000"
					onSave={(maxRetryDelayMs) => stream({ maxRetryDelayMs })}
				/>

				<Group title={t("retriesGroup")}>
					<Switch
						label={t("retryFailedTurns")}
						checked={settings.retry?.enabled ?? true}
						onChange={(checked) => retry({ enabled: checked ? undefined : false })}
					/>
					<NumberSetting
						label={t("retries")}
						value={settings.retry?.maxRetries}
						placeholder="3"
						onSave={(maxRetries) => retry({ maxRetries })}
					/>
					<NumberSetting
						label={t("firstDelay")}
						value={settings.retry?.baseDelayMs}
						placeholder="2000"
						onSave={(baseDelayMs) => retry({ baseDelayMs })}
					/>
					<NumberSetting
						label={t("longestDelay")}
						value={settings.retry?.maxAgentDelayMs}
						placeholder="60000"
						onSave={(maxAgentDelayMs) => retry({ maxAgentDelayMs })}
					/>
				</Group>
			</>
		),
		compaction: (
			<>
				<Switch
					label={t("compact")}
					checked={settings.compaction?.enabled ?? true}
					onChange={(checked) => compaction({ enabled: checked ? undefined : false })}
				/>
				<NumberSetting
					label={t("reserveTokens")}
					value={settings.compaction?.reserveTokens}
					placeholder="16384"
					min={1}
					onSave={(reserveTokens) => compaction({ reserveTokens })}
				/>
				<NumberSetting
					label={t("keepRecentTokens")}
					value={settings.compaction?.keepRecentTokens}
					placeholder="20000"
					min={1}
					onSave={(keepRecentTokens) => compaction({ keepRecentTokens })}
				/>
				<NumberSetting
					label={t("backgroundTokens")}
					value={settings.compaction?.backgroundTokens}
					placeholder="32768"
					onSave={(backgroundTokens) => compaction({ backgroundTokens })}
				/>
			</>
		),
		language: <LanguageSection />,
	};
	return (
		<Sheet title={title} onClose={closeLayers}>
			<div className="stack settings-fields">
				{fileError && (
					<p className="error" role="alert">
						{t("fileFailed")}
					</p>
				)}
				{error && (
					<p className="error" role="alert">
						{error}
					</p>
				)}
				{fields[id]}
			</div>
		</Sheet>
	);
}

/**
 * The language the app's texts are in: the device's ("System") or one of the locales the plugins' catalogs offer, one
 * per principal on the server, so the choice follows the reader to every page and window. A pick re-renders at once.
 */
function LanguageSection() {
	const { t } = useMessages(messages);
	const offered = useOfferedLocales();
	const { pick, choose } = useLocalePick();
	return (
		<>
			<p className="muted small">{t("languageHint")}</p>
			<Choice
				label={t("language")}
				value={pick ?? undefined}
				fallback={t("languageDevice")}
				options={offered.map((locale) => ({ value: locale, label: localeName(locale) }))}
				onChange={(value) => choose(value ?? null)}
			/>
		</>
	);
}

/**
 * The server's name, as Radius and the other places that show this server name it. Empty is the device's name (the
 * placeholder, as of the server's start).
 */
function ServerNameSetting({ onError }: { onError: (reason: unknown) => void }) {
	const { t } = useMessages(messages);
	const service = useContext(HeldSettings).serverName;
	const loaded = useReadable(service?.chosen);
	const device = useReadable(service?.device);
	const [chosen, guess] = useOptimisticCall<string | null | undefined, string | null>(
		loaded,
		(_value, next) => next,
		onError,
	);
	if (!service || chosen === undefined) return null;
	return (
		<TextSetting
			label={t("serverName")}
			value={chosen ?? ""}
			placeholder={device ?? t("deviceName")}
			maxLength={MAX_SERVER_NAME_LENGTH}
			onSave={(text) => {
				const name = text.trim() ? text.trim() : null;
				guess(name, () => service.rename({ name }, BACKGROUND_CONTEXT));
			}}
		/>
	);
}

function Group({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="settings-group">
			<h3>{title}</h3>
			{children}
		</section>
	);
}

/** A select over `options`; its first option, `fallback`, is the default (the setting removed). */
function Choice({
	label,
	value,
	fallback,
	options,
	onChange,
}: {
	label: string;
	value: string | undefined;
	fallback: string;
	options: readonly { value: string; label: string }[];
	onChange: (value: string | undefined) => void;
}) {
	const { t } = useMessages(messages);
	return (
		<label className="field">
			<span className="label">{label}</span>
			<select
				className="input"
				value={value ?? ""}
				onChange={(event) => onChange(event.target.value === "" ? undefined : event.target.value)}
			>
				<option value="">{t("choiceDefault", fallback)}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

/** A text field holding its own text while edited, saved when it loses focus or on Enter (not in a textarea). */
function TextSetting({
	label,
	value,
	placeholder,
	maxLength,
	rows,
	mono = false,
	numeric = false,
	onSave,
}: {
	label: string;
	value: string;
	placeholder: string;
	maxLength?: number;
	rows?: number;
	mono?: boolean;
	numeric?: boolean;
	onSave: (text: string) => void;
}) {
	// undefined: not being edited, the field shows the setting.
	const [text, setText] = useState<string>();
	const commit = () => {
		if (text !== undefined && text !== value) onSave(text);
		setText(undefined);
	};
	const className = `input ${mono ? "mono" : ""}`;
	const id = useId();
	return (
		<div className="field">
			<label className="label" htmlFor={id}>
				{label}
			</label>
			{rows ? (
				<textarea
					id={id}
					className={className}
					value={text ?? value}
					placeholder={placeholder}
					rows={rows}
					onChange={(event) => setText(event.target.value)}
					onBlur={commit}
					{...NO_AUTOCORRECT}
				/>
			) : (
				<input
					id={id}
					className={className}
					value={text ?? value}
					placeholder={placeholder}
					maxLength={maxLength}
					inputMode={numeric ? "numeric" : undefined}
					onChange={(event) => setText(numeric ? event.target.value.replace(/\D/g, "") : event.target.value)}
					onBlur={commit}
					onKeyDown={(event) => {
						if (event.key === "Enter") event.currentTarget.blur();
					}}
					{...NO_AUTOCORRECT}
				/>
			)}
		</div>
	);
}

/** A whole-number setting; an empty field is the default, a number below `min` is not saved. */
function NumberSetting({
	label,
	value,
	placeholder,
	min = 0,
	onSave,
}: {
	label: string;
	value: number | undefined;
	placeholder: string;
	min?: number;
	onSave: (value: number | undefined) => void;
}) {
	return (
		<TextSetting
			label={label}
			value={numberText(value)}
			placeholder={placeholder}
			maxLength={12}
			numeric
			onSave={(text) => {
				const number = textNumber(text);
				if (number === undefined || number >= min) onSave(number);
			}}
		/>
	);
}

export default defineFacet((host, self) => {
	// The window's texts in every language it offers (messages.ts): a page renders them in its own.
	self.contribute(Translations, messages.translations);
	contribute(host, "p2.web-settings", (self) => {
		self.contribute(Slots, { "sidebar-actions:settings": GearButton });
		self.contribute(Commands, SETTINGS_COMMANDS);
		self.contribute(CommandPages, SETTINGS_PAGES);
		self.contribute(CommandSearches, { settings: SETTINGS_SEARCH });
	});
});
