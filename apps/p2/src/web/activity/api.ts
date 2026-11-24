// What plugins use to show their tools' calls in the chat (`@p2/app/v1/web`): the contribution's types, words helpers
// and the parts a call's detail is built from. A plugin contributes its tools' `ToolActivity` to `ToolActivities`.
// The language the activities' words render in: the components wrap their helper calls, the closures read the
// snapshot (`activityMessages`), like Chord's `t.in`.

export {
	CommandBlock,
	DetailImages,
	DetailLink,
	DetailNote,
	DetailProse,
	DetailSection,
	FilePath,
	InputOutput,
	Interrupted,
	NestedCalls,
	OutputBlock,
} from "./Detail.tsx";
export { activityMessages, inActivityLanguage } from "./language.ts";
export {
	type Described,
	type Detail,
	detailsOf,
	failureOf,
	fileName,
	firstLine,
	type Kind,
	type Label,
	lastLine,
	parsedArgs,
	plainText,
	type ResultPlacement,
	type Step,
	type StepStatus,
	sentence,
	stringOf,
	type ToolActivity,
} from "./model.ts";
