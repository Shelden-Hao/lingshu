// Code mode's web facet: how its scripts show in the chat (activity.tsx).
import { contribute, defineFacet, Translations } from "@p2/app/v1";
import { ToolActivities } from "@p2/app/v1/web";
import { codemodeActivity } from "./activity.tsx";
import { messages } from "./messages.ts";

export default defineFacet((host) => {
	contribute(host, "p2.web-codemode", (self) => {
		self.contribute(ToolActivities, { codemode: codemodeActivity });
		self.contribute(Translations, messages.translations);
	});
});
