// The Settings window's own sections, over settings.json, in the order its list shows them: shared by the window and
// the command menu's settings page. A section's text is `sectionText` (messages.ts).

/** The own sections; their ids are the window layer's locators. */
export const OWN_SECTIONS = ["general", "models", "agent", "requests", "compaction", "language"] as const;

export type OwnSection = (typeof OWN_SECTIONS)[number];
