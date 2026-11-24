import { contribute, defineFacet, Translations } from "@p2/app/v1";
import {
	ChevronIcon,
	closeLayers,
	openLayer,
	SettingsSections,
	Slots,
	ToolActivities,
	textIn,
	useOwner,
	useSheet,
} from "@p2/app/v1/web";
import { showText } from "../../src/runtime/web-core.ts";
import { useLanguage } from "../../src/web/language.ts";
import { portsActivity } from "./activity.tsx";
import { messages } from "./messages.ts";
import { PortsPanel } from "./PortsPanel.tsx";

function PortsButton() {
	const language = useLanguage();
	return (
		<button className="row-button" type="button" onClick={() => openLayer({ kind: "sheet", name: "ports" })}>
			<span>{showText(textIn(messages, "ports"), language)}</span>
			<small className="row-value">{showText(textIn(messages, "portsHint"), language)}</small>
			<ChevronIcon />
		</button>
	);
}
function PortsSheet() {
	const sheet = useSheet("ports");
	return useOwner() && sheet ? <PortsPanel onClose={closeLayers} /> : null;
}
export default defineFacet((host) => {
	contribute(host, "p2.web-ports", (self) => {
		self.contribute(SettingsSections, {
			ports: {
				label: textIn(messages, "ports"),
				title: textIn(messages, "portsHint"),
				order: 40,
				Sheet: PortsSheet,
			},
		});
		self.contribute(Slots, {
			"envs-actions:ports": PortsButton,
		});
		self.contribute(ToolActivities, { ports: portsActivity });
		self.contribute(Translations, messages.translations);
	});
});
