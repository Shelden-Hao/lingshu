// The MCP sheet (owners): the running servers with their status, errors and tools, restart, and signing in and out of
// HTTP servers that use OAuth (signing in again is signing out, then in, as in lingshu). Sign in opens `/mcp/sign-in/<server>` in a new tab (it finds out where the browser runs);
// while a sign-in waits, the final redirect URL can be pasted here, for a browser that cannot reach where it returns.
// Until the servers load it says so; a view that failed or ended shows why, with Retry.

import {
	BACKGROUND_CONTEXT,
	contribute,
	defineFacet,
	type HeldIn,
	keptIn,
	locationText,
	type MessagesOf,
	Translations,
	type Translator,
} from "@p2/app/v1";
import {
	closeLayers,
	errorText,
	SettingsSections,
	Sheet,
	textIn,
	useComposerState,
	useConnected,
	useMessages,
	useObject,
	useOptimisticCall,
	useOwner,
	useReadable,
	useSheet,
} from "@p2/app/v1/web";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Instance, Mcp, type SignIn, signInLink } from "./contract.ts";
import { messages } from "./messages.ts";

type OwnerView = HeldIn<typeof Mcp, "owner">;

/** A change of the instances while its call is in flight: a restart starts it, a sign-out leaves it signed out. */
type InstanceGuess =
	| { readonly kind: "restart"; readonly instance: string }
	| { readonly kind: "signOut"; readonly server: string };

function applyInstance(instances: readonly Instance[], guess: InstanceGuess): readonly Instance[] {
	return instances.map((instance) =>
		guess.kind === "restart"
			? instance.id === guess.instance
				? { ...instance, status: "starting", error: undefined }
				: instance
			: instance.server === guess.server && instance.auth === "oauth"
				? { ...instance, status: "sign-in" }
				: instance,
	);
}

/** What a server's entry does; each shows its effect at once and rolls back with the error in the toast. */
type Actions = {
	readonly restart: (instance: string) => void;
	readonly signOut: (server: string) => void;
	readonly cancelSignIn: (id: string) => void;
};

/** The sheet: the intro, then the servers, held anew when their view ended. */
function McpSheet({ onClose }: { onClose: () => void }) {
	const { t } = useMessages(messages);
	const [hold, setHold] = useState(0);
	const holdAgain = useCallback(() => setHold((count) => count + 1), []);
	return (
		<Sheet title={t("title")} onClose={onClose}>
			<p className="muted small">
				{t("intro")} <span className="mono">mcp.json</span>
				{t("introRun")}
			</p>
			<McpServers key={hold} holdAgain={holdAgain} />
		</Sheet>
	);
}

/**
 * Configuration errors, then each server with its instances and sign-in. A dropped link keeps the last values while
 * the view binds again; before the first values it says "Loading…"; a failed or ended view says why, with Retry, and is
 * retried when the page reconnects (Chord binds loading references again by itself, not failed or ended ones).
 */
function McpServers({ holdAgain }: { holdAgain: () => void }) {
	const { t } = useMessages(messages);
	const ref = useObject(Mcp, {});
	const state = useReadable(ref?.state);
	const view = keptIn(ref, "owner");
	const retry = useCallback(() => {
		if (ref?.state.value.kind === "ended") holdAgain();
		else ref?.retry();
	}, [ref, holdAgain]);
	const connected = useConnected();
	const wasConnected = useRef(connected);
	useEffect(() => {
		const reconnected = connected && !wasConnected.current;
		wasConnected.current = connected;
		const kind = ref?.state.value.kind;
		if (reconnected && (kind === "failed" || kind === "ended")) retry();
	}, [connected, ref, retry]);
	const errors = useReadable(view?.errors) ?? [];
	const { fail } = useComposerState();
	const [instances, changeInstance] = useOptimisticCall(useReadable(view?.instances) ?? [], applyInstance, fail);
	const [signIns, cancel] = useOptimisticCall(
		useReadable(view?.signIns) ?? [],
		(list, id: string) => list.filter((entry) => entry.id !== id),
		fail,
	);
	const servers = [...new Set(instances.map((instance) => instance.server))];
	const actions: Actions | undefined = view && {
		restart: (instance) =>
			changeInstance({ kind: "restart", instance }, () => view.restart({ instance }, BACKGROUND_CONTEXT)),
		signOut: (server) =>
			changeInstance({ kind: "signOut", server }, () => view.signOut({ server }, BACKGROUND_CONTEXT)),
		cancelSignIn: (id) => cancel(id, () => view.cancelSignIn({ id }, BACKGROUND_CONTEXT)),
	};
	if (view === undefined) {
		const failure = state?.kind === "failed" ? state.cause.error : state?.kind === "ended" ? state.error : undefined;
		return failure === undefined ? (
			<p className="empty-note">{t("loading")}</p>
		) : (
			<div className="stack">
				<p className="error small">
					{t("loadFailed")} {errorText(failure)}
				</p>
				<div className="inline-form">
					<button type="button" className="text-action" onClick={retry}>
						{t("retry")}
					</button>
				</div>
			</div>
		);
	}
	return (
		<>
			{errors.map((error) => (
				<p key={error} className="notice error small">
					{error}
				</p>
			))}
			{servers.length === 0 && <p className="empty-note">{t("noServers")}</p>}
			{actions && (
				<div className="list">
					{servers.map((server) => (
						<ServerEntry
							key={server}
							view={view}
							actions={actions}
							server={server}
							instances={instances.filter((instance) => instance.server === server)}
							signIn={signIns.find((entry) => entry.server === server)}
						/>
					))}
				</div>
			)}
		</>
	);
}

/** What an instance's row says of its status. */
function statusText(status: Instance["status"], t: Translator<"mcp", MessagesOf<typeof messages>>): string {
	if (status === "starting") return t("statusStarting");
	if (status === "connected") return t("statusConnected");
	if (status === "sign-in") return t("statusSignIn");
	return t("statusFailed");
}

/** One server: its instances (status, place, tools, error, restart), and signing in or out if it uses OAuth. */
function ServerEntry({
	view,
	actions,
	server,
	instances,
	signIn,
}: {
	view: OwnerView;
	actions: Actions;
	server: string;
	instances: readonly Instance[];
	signIn: SignIn | undefined;
}) {
	const { t } = useMessages(messages);
	const oauth = instances.some((instance) => instance.auth === "oauth");
	const mayNeedSignIn = instances.some((instance) => instance.status === "sign-in" || instance.status === "failed");
	// Signing in again (another account, a grant the server refuses) is signing out, then in, as in lingshu: any instance
	// not waiting for a sign-in may hold credentials (a failed or reconnecting one too), so it offers the sign-out.
	const mayHoldCredentials = instances.some((instance) => instance.status !== "sign-in");
	return (
		<div className="stack mcp-server">
			<strong>{server}</strong>
			{instances.map((instance) => (
				<div key={instance.id} className="stack">
					<p className="small">
						{statusText(instance.status, t)}
						{instance.location && <span className="muted mono"> · {locationText(instance.location)}</span>}
						{instance.runsOn !== "host" && <span className="muted"> · on {instance.runsOn.env}</span>}
						{instance.status === "connected" && (
							<span className="muted">{t("toolsCount", instance.tools.length)}</span>
						)}
					</p>
					{instance.error && instance.status !== "sign-in" && <p className="error small">{instance.error}</p>}
					<div className="inline-form">
						<button type="button" className="text-action" onClick={() => actions.restart(instance.id)}>
							{t("restart")}
						</button>
					</div>
				</div>
			))}
			{oauth && signIn?.status === "waiting" && (
				<PendingSignIn view={view} signIn={signIn} onCancel={() => actions.cancelSignIn(signIn.id)} />
			)}
			{oauth && signIn?.status === "failed" && (
				<div className="stack">
					<p className="error small">{signIn.error ?? t("signInFailed")}</p>
					<button type="button" className="text-action" onClick={() => actions.cancelSignIn(signIn.id)}>
						{t("dismiss")}
					</button>
				</div>
			)}
			{oauth && (
				<div className="inline-form">
					{mayNeedSignIn || signIn !== undefined ? (
						<a className="login-continue" href={signInLink(server)} target="_blank" rel="noreferrer">
							{signIn?.status === "waiting" ? t("signInAgain") : t("signIn")}
						</a>
					) : null}
					{mayHoldCredentials && (
						<button type="button" className="text-action danger" onClick={() => actions.signOut(server)}>
							{t("signOut")}
						</button>
					)}
				</div>
			)}
		</div>
	);
}

/** A sign-in waiting for the browser: paste the final redirect URL, or cancel. */
function PendingSignIn({ view, signIn, onCancel }: { view: OwnerView; signIn: SignIn; onCancel: () => void }) {
	const { t } = useMessages(messages);
	const [value, setValue] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string>();
	return (
		<form
			className="stack"
			onSubmit={(event) => {
				event.preventDefault();
				setSending(true);
				setError(undefined);
				view
					.paste({ id: signIn.id, redirectUrl: value.trim() }, BACKGROUND_CONTEXT)
					.then(() => setValue(""))
					.catch((reason: unknown) => setError(errorText(reason)))
					.finally(() => setSending(false));
			}}
		>
			<p className="muted small">
				{t("waitingIntro")}
				{signIn.via === "loopback" ? t("waitingLoopback") : t("waitingP2")}
				{t("waitingPaste")}
			</p>
			<input
				className="input mono"
				type="text"
				autoComplete="off"
				placeholder={t("redirectUrl")}
				aria-label={t("redirectUrl")}
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
			{error && <p className="error small">{error}</p>}
			<div className="inline-form">
				<button type="submit" className="button" disabled={sending || !value.trim()}>
					{t("continue")}
				</button>
				<button type="button" className="text-action" onClick={onCancel}>
					{t("cancel")}
				</button>
			</div>
		</form>
	);
}

/** The MCP sheet while it is open (any authenticated owner): a page of Settings. */
function McpSheetSlot() {
	const owner = useOwner();
	const open = useSheet("mcp") !== undefined;
	return owner && open ? <McpSheet onClose={closeLayers} /> : null;
}

export default defineFacet((host) => {
	contribute(host, "p2.web-mcp", (self) => {
		self.contribute(SettingsSections, {
			mcp: { label: textIn(messages, "sectionMcp"), order: 20, Sheet: McpSheetSlot },
		});
		self.contribute(Translations, messages.translations);
	});
});
