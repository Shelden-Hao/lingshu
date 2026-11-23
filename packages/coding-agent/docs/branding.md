# Branding

Every product-visible identifier — the CLI name, the config directory, the environment variable
prefix, the header logo — comes from one place: [`src/branding.ts`](../src/branding.ts). Nothing
else should hardcode `lingshu`, `.lingshu` or `LINGSHU_`.

## Resolution order

Each field resolves independently, first match wins:

1. **Environment variables** — `APP_BRAND_<FIELD>` (brand-neutral), then `<ENV_PREFIX>_BRAND_<FIELD>`
2. **`brand` block** in the `package.json` this process started from (`piConfig` is still read as a legacy alias)
3. **Defaults** in `DEFAULT_BRAND`

The brand-neutral `APP_BRAND_*` names keep working after a future rename, which is why they are
preferred over the prefixed ones.

## Fields

| Field | `brand` key | Env override | Default |
|---|---|---|---|
| CLI name, `process.title` | `name` | `APP_BRAND_NAME` | `lingshu` |
| Name shown in UI | `displayName` | `APP_BRAND_DISPLAY_NAME` | `Lingshu` |
| Header title | `title` | `APP_BRAND_TITLE` | `Lingshu` |
| Config directory under `$HOME` | `configDir` | `APP_BRAND_CONFIG_DIR` | `.lingshu` |
| Env var prefix | `envPrefix` | `APP_BRAND_ENV_PREFIX` | `LINGSHU` |
| `--help` description | `tagline` | `APP_BRAND_TAGLINE` | — |
| Homepage in help/update text | `homepage` | `APP_BRAND_HOMEPAGE` | `https://lingshu.dev` |
| Share viewer base URL | `shareViewerUrl` | `APP_BRAND_SHARE_VIEWER_URL` | — |
| Logo art (two lines of half blocks) | `logo.lines` | `APP_BRAND_LOGO_LINE1` / `_LINE2` | none → wordmark |
| Logo colors (`#RRGGBB,...`) | `logo.colors` | `APP_BRAND_LOGO_COLORS` | coral, blue, yellow |

Without `logo.lines` the header renders the display name as a colored wordmark, which works in
every terminal. Configuring art restores the half-block logo; Apple Terminal always falls back to
the wordmark because it misaligns half blocks.

## Renaming again

Change the `brand` block in `packages/coding-agent/package.json` (and the `bin` key, which npm uses
for the executable name), then move the config directory. No source edits:

```jsonc
"brand": {
  "name": "newcli",
  "configDir": ".newcli",
  "envPrefix": "NEWCLI"
},
"bin": { "newcli": "dist/bundle/cli.js" }
```

For a one-off run without touching files:

```bash
APP_BRAND_NAME=acme APP_BRAND_CONFIG_DIR=.acme APP_BRAND_ENV_PREFIX=ACME ./lingshu-test.sh --help
```

## Environment prefix migration

`inheritLegacyEnv()` runs at startup and copies `PI_*` to `<ENV_PREFIX>_*` when the new name is not
already set, so an installation configured for the upstream prefix keeps working. Variables set
under the new prefix always win.

## What is deliberately not branded

Upstream service endpoints stay on their real hosts, because they are live services rather than
product identity: the Radius gateway (`radius.pi.dev`), the model catalog (`pi.dev/api/models`),
version checks, install scripts, OAuth client registration and the JSON schemas. Point them at your
own infrastructure first, then rename them here.
