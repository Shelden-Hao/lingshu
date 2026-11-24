// The history tools' web facet: how their calls show in the chat (activity.tsx), and the tools' texts.
import { contribute, defineFacet, Translations } from "@p2/app/v1";
import { ToolActivities } from "@p2/app/v1/web";
import { historyActivities } from "./activity.tsx";
import { messages } from "./messages.ts";

export default defineFacet((host, self) => {
	// The tools' words in every language the app offers (messages.ts).
	self.contribute(Translations, messages.translations);
	contribute(host, "p2.web-history", (self) => {
		self.contribute(ToolActivities, historyActivities);
	});
});
