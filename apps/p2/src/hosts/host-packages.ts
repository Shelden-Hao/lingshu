// The host packages of p2's facets: the modules a facet shares with its host as instances, by specifier. Apart from
// plugins.ts (the server's plugin component, which builds with esbuild) so the worker entry imports only these: a
// worker loads neither esbuild nor the server's API.
import * as piAi from "@lingshu/ai";
import * as anthropicMessages from "@lingshu/ai/api/anthropic-messages.lazy";
import * as googleGenerativeAi from "@lingshu/ai/api/google-generative-ai.lazy";
import * as openaiCompletions from "@lingshu/ai/api/openai-completions.lazy";
import * as openaiResponses from "@lingshu/ai/api/openai-responses.lazy";
import * as piAiModels from "@lingshu/ai/models";
import * as allProviders from "@lingshu/ai/providers/all";
import * as fauxProvider from "@lingshu/ai/providers/faux";
import * as radiusProvider from "@lingshu/ai/providers/radius";
import * as radiusConfig from "@lingshu/ai/providers/radius-config";
import * as piCodemode from "@lingshu/codemode";
import * as piDurable from "@lingshu/durable";
import * as durableCodemode from "@lingshu/durable/codemode";
import * as durableEnv from "@lingshu/durable/env";
import * as durableEnvNode from "@lingshu/durable/env/node";
import * as durableImagesFit from "@lingshu/durable/images/fit";
import * as durableToolSearch from "@lingshu/durable/tool-search";
import * as durableTools from "@lingshu/durable/tools";
import * as piEnv from "@lingshu/env";
import * as piMcp from "@lingshu/mcp";
import * as piMcpOauth from "@lingshu/mcp/oauth";
import * as piSchema from "@lingshu/schema";
import * as schemaFormats from "@lingshu/schema/formats";
import * as piTui from "@lingshu/tui";
import * as ws from "ws";
import * as yaml from "yaml";
import * as api from "../api/v1/index.ts";
import * as apiNode from "../api/v1/node.ts";
import * as apiWorker from "../api/v1/worker.ts";

/** The packages a facet shares with its host as instances (never bundled into a plugin's script), by specifier. */
export const SHARED_PACKAGES = {
	"@lingshu/ai": piAi,
	"@lingshu/ai/api/anthropic-messages.lazy": anthropicMessages,
	"@lingshu/ai/api/google-generative-ai.lazy": googleGenerativeAi,
	"@lingshu/ai/api/openai-completions.lazy": openaiCompletions,
	"@lingshu/ai/api/openai-responses.lazy": openaiResponses,
	"@lingshu/ai/models": piAiModels,
	"@lingshu/ai/providers/all": allProviders,
	"@lingshu/ai/providers/faux": fauxProvider,
	"@lingshu/ai/providers/radius": radiusProvider,
	"@lingshu/ai/providers/radius-config": radiusConfig,
	"@lingshu/codemode": piCodemode,
	"@lingshu/durable": piDurable,
	"@lingshu/durable/codemode": durableCodemode,
	"@lingshu/durable/env": durableEnv,
	"@lingshu/durable/env/node": durableEnvNode,
	"@lingshu/durable/tool-search": durableToolSearch,
	"@lingshu/durable/tools": durableTools,
	"@lingshu/env": piEnv,
	"@lingshu/mcp": piMcp,
	"@lingshu/mcp/oauth": piMcpOauth,
	"@lingshu/schema": piSchema,
	"@lingshu/schema/formats": schemaFormats,
	ws,
	yaml,
};

/**
 * The host packages of worker facets (lingshu-tui too: file completion ranks as lingshu-tui's autocomplete does; Durable's image
 * fitting, with the worker's processor `WorkerParts.images`).
 */
export const WORKER_PACKAGES = {
	"@p2/app/v1": api,
	"@p2/app/v1/node": apiNode,
	"@p2/app/v1/worker": apiWorker,
	"@lingshu/durable/images/fit": durableImagesFit,
	"@lingshu/tui": piTui,
	...SHARED_PACKAGES,
};
