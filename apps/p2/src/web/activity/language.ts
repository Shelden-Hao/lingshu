// The language the activities' words render in, for the plugins' ToolActivity closures: `describe`, `running`,
// `summary` and friends are plain functions the core components call while they render, where no hook can reach.
// The components wrap their calls (`inActivityLanguage`), the closures read the snapshot (`activityMessages`, like
// Chord's `t.in`); a language pick re-renders the components, which re-read it. Outside a wrap (a test) the first
// catalog renders.
import type { Language, Messages, Translator } from "@lingshu/chord";

/** The language the activity components' current helper call renders in; `undefined` outside one. */
let current: Language | undefined;

/** Runs `render` with `language` as the current one (synchronous: the language is gone when it returns). */
export function inActivityLanguage<T>(language: Language | undefined, render: () => T): T {
	const outer = current;
	current = language;
	try {
		return render();
	} finally {
		current = outer;
	}
}

/** `messages` in the language the wrapping activity component renders in; outside one, the first catalog. */
export function activityMessages<N extends string, M>(messages: Messages<N, M>): Translator<N, M> {
	return messages.in(current);
}
