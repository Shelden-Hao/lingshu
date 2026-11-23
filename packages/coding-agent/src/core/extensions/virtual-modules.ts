import * as bundledPiAgentCore from "@lingshu/agent-core";
import * as bundledPiAiModels from "@lingshu/ai/models";
import * as bundledPiAiOauth from "@lingshu/ai/oauth";
import * as bundledPiAiProviders from "@lingshu/ai/providers/all";
import * as bundledPiTui from "@lingshu/tui";
import * as bundledTypebox from "typebox";
import * as bundledTypeboxCompile from "typebox/compile";
import * as bundledTypeboxValue from "typebox/value";
// This import is safe because loader.ts exports are not re-exported from index.ts.
// Extensions can therefore import from @lingshu/coding-agent.
import * as bundledPiCodingAgent from "../../index.ts";
import * as bundledPiAiExtensionView from "./lingshu-ai-extension-view.ts";

/** Modules available to extensions in source and compiled binary runtimes. */
export const VIRTUAL_MODULES: Record<string, unknown> = {
	typebox: bundledTypebox,
	"typebox/compile": bundledTypeboxCompile,
	"typebox/value": bundledTypeboxValue,
	"@sinclair/typebox": bundledTypebox,
	"@sinclair/typebox/compile": bundledTypeboxCompile,
	"@sinclair/typebox/value": bundledTypeboxValue,
	"@lingshu/agent-core": bundledPiAgentCore,
	"@lingshu/tui": bundledPiTui,
	// Extensions resolve the lingshu-ai root to the compat entrypoint (a strict
	// superset of the core entrypoint) plus TypeBox's Type, Static and TSchema:
	// existing extensions using the old global API and lingshu-ai's former TypeBox
	// re-exports keep working.
	"@lingshu/ai": bundledPiAiExtensionView,
	"@lingshu/ai/compat": bundledPiAiExtensionView,
	"@lingshu/ai/models": bundledPiAiModels,
	"@lingshu/ai/oauth": bundledPiAiOauth,
	"@lingshu/ai/providers/all": bundledPiAiProviders,
	"@lingshu/coding-agent": bundledPiCodingAgent,
	"@mariozechner/lingshu-agent-core": bundledPiAgentCore,
	"@mariozechner/lingshu-tui": bundledPiTui,
	"@mariozechner/lingshu-ai": bundledPiAiExtensionView,
	"@mariozechner/lingshu-ai/compat": bundledPiAiExtensionView,
	"@mariozechner/lingshu-ai/models": bundledPiAiModels,
	"@mariozechner/lingshu-ai/oauth": bundledPiAiOauth,
	"@mariozechner/lingshu-ai/providers/all": bundledPiAiProviders,
	"@mariozechner/lingshu-coding-agent": bundledPiCodingAgent,
};
