import { PluginInfo } from "@/plugintypes";

/**
 * Plugin ids are stable and shareable but unreadable (`/s/a7f3e9b2c1d4/feed`).
 * An alias is a short readable name assigned locally, so no plugin author can
 * squat a name and two plugins for the same site can coexist (`opds`,
 * `opds-2`). Ids remain the identity everywhere in the app; the alias only ever
 * exists in the url.
 */

export const MIN_ALIAS_LENGTH = 2;
export const MAX_ALIAS_LENGTH = 32;

export const normalizeAlias = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_ALIAS_LENGTH)
    .replace(/-$/, "");

// ReaderGata names plugins "Plugin for HumbleBundle" (prefix), where socialgata
// uses "Reddit Plugin for SocialGata" (suffix). Strip either shape, plus a bare
// app name, so the alias is what actually names the site.
const PLUGIN_PREFIX = /^\s*plugins?\s+for\s+/i;
const PLUGIN_SUFFIX = /\s*\bplugins?\b.*$/i;
const APP_NAME = /\breader\s*gata\b/i;

/**
 * Derives an alias from a plugin name. Falls back to the whole name when
 * stripping the boilerplate would leave nothing usable.
 */
export const aliasFromName = (name: string): string => {
  const stripped = name
    .replace(PLUGIN_PREFIX, "")
    .replace(PLUGIN_SUFFIX, "")
    .replace(APP_NAME, "");
  const trimmed = normalizeAlias(stripped);
  return trimmed.length >= MIN_ALIAS_LENGTH ? trimmed : normalizeAlias(name);
};

export type AliasError = "invalid" | "tooShort" | "isPluginId" | "taken";

type AliasHolder = Pick<PluginInfo, "id" | "alias">;

/**
 * Validates an alias the user typed. `selfId` is excluded from the taken check
 * so re-saving a plugin's own alias isn't a conflict with itself.
 */
export const validateAlias = (
  alias: string,
  plugins: AliasHolder[],
  selfId?: string
): AliasError | null => {
  if (alias !== normalizeAlias(alias)) return "invalid";
  if (alias.length < MIN_ALIAS_LENGTH) return "tooShort";
  // An alias that matches some plugin's id would make that plugin's own id url
  // resolve to the wrong plugin.
  if (plugins.some((p) => p.id === alias && p.id !== selfId))
    return "isPluginId";
  if (plugins.some((p) => p.alias === alias && p.id !== selfId)) return "taken";
  return null;
};

/**
 * Picks the alias a plugin actually gets: the requested one, or the first free
 * `-N` variant. Never fails, so installing a plugin can't be blocked by a name
 * another plugin already claimed.
 */
export const assignAlias = (
  requested: string,
  plugins: AliasHolder[],
  selfId?: string
): string | undefined => {
  const base = normalizeAlias(requested);
  if (base.length < MIN_ALIAS_LENGTH) return undefined;

  if (!validateAlias(base, plugins, selfId)) return base;

  for (let suffix = 2; suffix < 1000; suffix++) {
    const candidate = `${base.slice(
      0,
      MAX_ALIAS_LENGTH - `-${suffix}`.length
    )}-${suffix}`;
    if (!validateAlias(candidate, plugins, selfId)) return candidate;
  }
  return undefined;
};

// Module level rather than React state: TanStack's params.parse/stringify are
// plain functions called by the router with no access to context. The registry
// is refreshed whenever plugins are published, which happens before
// pluginsLoaded flips true, and the router does not render until then (see
// src/router.tsx).
let aliasToId = new Map<string, string>();
let idToAlias = new Map<string, string>();

export const setPluginAliases = (plugins: AliasHolder[]) => {
  aliasToId = new Map();
  idToAlias = new Map();
  for (const plugin of plugins) {
    if (!plugin.id || !plugin.alias) continue;
    aliasToId.set(plugin.alias, plugin.id);
    idToAlias.set(plugin.id, plugin.alias);
  }
};

export const stripSuffix = (alias: string) => alias.replace(/-\d+$/, "");

const suffixOf = (alias: string) => Number(alias.match(/-(\d+)$/)?.[1] ?? 0);

/**
 * Url segment -> plugin id. Falls through to the input unchanged when nothing
 * matches, so plugin id urls keep working and an unknown alias reaches the
 * install prompt rather than silently resolving to something else.
 */
export const resolvePluginParam = (param: string): string => {
  const exact = aliasToId.get(param);
  if (exact) return exact;

  // A shared url may carry an alias that deduped differently here: someone with
  // one opds plugin shares `/s/opds/...`, but this device has it as `opds-2`.
  // Match on the base name, lowest suffix first.
  const base = stripSuffix(param);
  const candidates = [...aliasToId.keys()]
    .filter((alias) => stripSuffix(alias) === base)
    .sort((a, b) => suffixOf(a) - suffixOf(b));
  const fallback = candidates[0];
  if (fallback) return aliasToId.get(fallback)!;

  return param;
};

/** Plugin id -> url segment. Unchanged when the plugin has no alias. */
export const aliasForId = (id: string): string => idToAlias.get(id) ?? id;
