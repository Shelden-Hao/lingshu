// The coding tools' web facet: how their calls show in the chat (activity.tsx).
import { contribute, defineFacet, Translations } from "@p2/app/v1";
import { ToolActivities } from "@p2/app/v1/web";
import { codingToolActivities } from "./activity.tsx";
import { messages } from "./messages.ts";

export default defineFacet((host) => {
	contribute(host, "p2.web-coding-tools", (self) => {
		self.contribute(ToolActivities, codingToolActivities);
		self.contribute(Translations, messages.translations);
	});
});
