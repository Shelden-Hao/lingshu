import { BACKGROUND_CONTEXT, contribute, defineFacet, type Held, Translations } from "@p2/app/v1";
import {
	CopyButton,
	closeLayers,
	forgetOwner,
	SettingsSections,
	Sheet,
	textIn,
	useMessages,
	useObject,
	useOwner,
	useReadable,
	useSheet,
} from "@p2/app/v1/web";
import { useEffect, useState } from "react";
import { Devices } from "./contract.ts";
import { messages } from "./messages.ts";

function DevicesSheet({ service }: { service: Held<typeof Devices> | undefined }) {
	const { t } = useMessages(messages);
	const canMint = useReadable(service?.canMint);
	const [token, setToken] = useState<string>();
	const [error, setError] = useState<string>();
	const [generation, setGeneration] = useState(0);
	const [confirmAll, setConfirmAll] = useState(false);
	const [signingOut, setSigningOut] = useState(false);
	const signOut = (all: boolean) => {
		setSigningOut(true);
		setError(undefined);
		void fetch(all ? "/owner/logout-all" : "/owner/logout", { method: "POST", credentials: "same-origin" })
			.then(async (response) => {
				if (!response.ok) throw new Error(t("signOutFailed"));
				// Conversations kept on this device for the owner go with the sign-in.
				await forgetOwner();
				location.replace("/owner");
			})
			.catch((reason: Error) => {
				setError(reason.message);
				setSigningOut(false);
			});
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: generation explicitly requests a fresh token.
	useEffect(() => {
		let current = true;
		setToken(undefined);
		setError(undefined);
		if (service && canMint)
			void service
				.token(BACKGROUND_CONTEXT)
				.then(({ token }) => {
					if (current) setToken(token);
				})
				.catch((reason: unknown) => {
					if (current) setError(reason instanceof Error ? reason.message : t("tokenFailed"));
				});
		return () => {
			current = false;
		};
	}, [service, canMint, generation]);
	return (
		<Sheet title={t("title")} onClose={closeLayers}>
			<div className="stack">
				<p className="small">{t("tokenWarning")}</p>
				<p className="muted small">{t("tokenHow")}</p>
				{canMint === false ? (
					<p className="error" role="alert">
						{t("cannotMint")}
					</p>
				) : error ? (
					<p className="error" role="alert">
						{error}
					</p>
				) : token ? (
					<>
						<label className="label" htmlFor="owner-token">
							{t("tokenLabel")}
						</label>
						<textarea
							id="owner-token"
							className="input mono"
							rows={2}
							readOnly
							value={token}
							onFocus={(event) => event.target.select()}
						/>
						<CopyButton key={token} primary text={token} label={t("copyToken")} />
						<button type="button" className="text-action" onClick={() => setGeneration((value) => value + 1)}>
							{t("newToken")}
						</button>
					</>
				) : (
					<output className="muted">{t("generating")}</output>
				)}
				{canMint === false && error && (
					<p className="error" role="alert">
						{error}
					</p>
				)}
				<div className="list">
					<button type="button" className="text-action" disabled={signingOut} onClick={() => signOut(false)}>
						{t("signOutThis")}
					</button>
					{confirmAll ? (
						<>
							<p className="muted small">{t("signOutAllNote")}</p>
							<button
								type="button"
								className="text-action danger"
								disabled={signingOut}
								onClick={() => signOut(true)}
							>
								{t("confirmSignOutAll")}
							</button>
							<button
								type="button"
								className="text-action"
								disabled={signingOut}
								onClick={() => setConfirmAll(false)}
							>
								{t("cancel")}
							</button>
						</>
					) : (
						<button
							type="button"
							className="text-action danger"
							disabled={signingOut}
							onClick={() => setConfirmAll(true)}
						>
							{t("signOutAll")}
						</button>
					)}
				</div>
			</div>
		</Sheet>
	);
}
/**
 * The Devices sheet while it is open (the owner): a page of Settings. Mounted from the page's start, it holds the
 * owner's `Devices` (a few bytes) all along: the page opens without a round trip for it.
 */
function DevicesSheetSlot() {
	const sheet = useSheet("devices");
	const owner = useOwner();
	const service = useObject(Devices, owner ? {} : undefined);
	return owner && sheet ? <DevicesSheet service={service} /> : null;
}

export default defineFacet((host) => {
	contribute(host, "p2.web-devices", (self) => {
		self.contribute(SettingsSections, {
			devices: {
				label: textIn(messages, "sectionDevices"),
				title: textIn(messages, "sectionTitle"),
				order: 50,
				Sheet: DevicesSheetSlot,
			},
		});
		self.contribute(Translations, messages.translations);
	});
});
