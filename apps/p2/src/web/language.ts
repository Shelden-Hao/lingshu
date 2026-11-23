// The page's language for React: the language the page renders in, a plugin's texts rendered in it, the locales the
// app offers and the reader's pick (Chord's app kit, packages/chord/docs/i18n/book.md). A pick re-renders every
// component that reads these (no reload); the page's `lang` and `dir` follow it through Chord's `followLanguage`.
import {
	hostLanguage,
	type Language,
	LocaleChoice,
	type Messages,
	Translations,
	type Translator,
} from "@lingshu/chord";
import { BACKGROUND_CONTEXT } from "@lingshu/chord/context";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { followRegistry, knownRegistry } from "../runtime/refs.ts";
import { useHost, useObject, useReadable } from "../runtime/web.tsx";

/** The language the page renders in; `undefined` until the page follows one (its first frame, a server render). */
export function useLanguage(): Language | undefined {
	const state = hostLanguage(useHost());
	return useSyncExternalStore(state.subscribe, state.read, state.read);
}

/**
 * `messages` in the page's language, with its locale: what a component renders its texts with. Re-renders when the
 * reader picks another language or a translation contribution arrives.
 */
export function useMessages<N extends string, M>(
	messages: Messages<N, M>,
): { readonly t: Translator<N, M>; readonly locale: string | undefined } {
	const language = useLanguage();
	return useMemo(() => ({ t: messages.in(language), locale: language?.locale }), [messages, language]);
}

/** No catalog: what the page offers before the plugins' web facets contributed theirs (the first frames). */
const NO_LOCALES: readonly string[] = [];

/** Every locale some catalog offers, canonical and sorted (`en`, `zh`): the languages the reader may pick. */
export function useOfferedLocales(): readonly string[] {
	const host = useHost();
	// The value followed already, at once: a picker mounted with an empty list would show it a render before the real one.
	const [locales, setLocales] = useState<readonly string[]>(
		() => knownRegistry(host, Translations)?.locales ?? NO_LOCALES,
	);
	useEffect(() => followRegistry(host, Translations, (index) => setLocales(index.locales)), [host]);
	return locales;
}

/** The reader's language pick (`null`: the device's languages decide) and how to change it. */
export function useLocalePick(): {
	readonly pick: string | null | undefined;
	readonly choose: (locale: string | null) => void;
} {
	const choice = useObject(LocaleChoice, {});
	const pick = useReadable(choice?.pick);
	const choose = useCallback(
		(locale: string | null) => {
			if (choice !== undefined) void choice.choose(locale, BACKGROUND_CONTEXT);
		},
		[choice],
	);
	return { pick, choose };
}

/** A locale's name in itself, for a picker's entry ("中文", "English"): the platform's, else the tag. */
export function localeName(locale: string): string {
	try {
		const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
		if (name === undefined) return locale;
		return name[0]!.toUpperCase() + name.slice(1);
	} catch {
		return locale;
	}
}
