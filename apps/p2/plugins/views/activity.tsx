// How the view tools show in the chat (nested in code mode's card): what each did with which view ("Opened view
// Notes").
import { activityMessages, detailsOf, failureOf, type Step, stringOf, type ToolActivity } from "@p2/app/v1/web";
import { messages } from "./messages.ts";

/** The view a call names: its title once it answered, else what it asked for. */
const objectOf = (step: Step): string => {
	const details = detailsOf(step.tool);
	const args = step.tool.args;
	return (
		stringOf(details.title) ||
		stringOf(args.title) ||
		stringOf(args.id) ||
		stringOf(args.item) ||
		stringOf(details.id)
	);
};

/** The activity of one view tool: its past and present words, naming the view when `named`. */
type ViewVerb =
	| "verbListed"
	| "verbListing"
	| "verbOpened"
	| "verbOpening"
	| "verbClosed"
	| "verbClosing"
	| "verbArranged"
	| "verbArranging"
	| "verbResolved"
	| "verbResolving";

/** The activity of one view tool: its past and present words, naming the view when `named`. */
function viewTool(done: ViewVerb, doing: ViewVerb, named: boolean, kind: "read" | "artifact"): ToolActivity {
	return {
		brief: "Using views",
		describe(step) {
			const object = named ? objectOf(step) : "";
			return {
				label: {
					kind,
					verb: activityMessages(messages)(done),
					...(object ? { object, style: "words" as const } : {}),
				},
				...(failureOf(step) ? { description: failureOf(step) } : {}),
			};
		},
		running(step) {
			const object = named ? objectOf(step) : "";
			return {
				kind,
				verb: activityMessages(messages)(doing),
				...(object ? { object, style: "words" as const } : {}),
			};
		},
		argument: (tool) =>
			named ? stringOf(tool.args.title) || stringOf(tool.args.id) || stringOf(tool.args.item) : "",
		summary: (count) => activityMessages(messages)("toolSummary", count),
	};
}

/** The view tools' activities, by tool name. */
export const VIEW_ACTIVITIES: Readonly<Record<string, ToolActivity>> = {
	view_list: viewTool("verbListed", "verbListing", false, "read"),
	view_open: viewTool("verbOpened", "verbOpening", true, "artifact"),
	view_close: viewTool("verbClosed", "verbClosing", true, "artifact"),
	view_arrange: viewTool("verbArranged", "verbArranging", false, "artifact"),
	view_resolve: viewTool("verbResolved", "verbResolving", false, "artifact"),
};
