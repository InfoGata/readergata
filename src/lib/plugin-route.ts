import { findDefaultPlugin } from "@/default-plugins";
import { aliasForId, resolvePluginParam } from "@/lib/plugin-alias";
import { redirect } from "@tanstack/react-router";

/**
 * Shared route options for every route under `/s/$pluginId` and
 * `/plugins/$pluginId`. They translate between the alias in the url and the
 * plugin id the app uses everywhere else, so route bodies and every `<Link
 * params={{ pluginId }}>` keep dealing in ids only.
 */

/**
 * `TExtra` names the route's other path params so they survive the round trip
 * with their types intact, e.g. `pluginIdParams<{ apiId: string }>()`.
 */
export const pluginIdParams = <
  TExtra extends Record<string, string> = Record<never, string>,
>() => ({
  parse: (raw: TExtra & { pluginId: string }) => ({
    ...raw,
    pluginId: resolvePluginParam(raw.pluginId),
  }),
  stringify: (params: TExtra & { pluginId: string }) => ({
    ...params,
    pluginId: aliasForId(params.pluginId),
  }),
});

type PluginBeforeLoadContext = {
  params: { pluginId: string };
  location: { pathname: string; search: Record<string, unknown> };
};

/**
 * Rewrites a url that named the plugin some other way (its id, or an alias that
 * deduped differently on the device that shared it) to the canonical alias, so
 * whatever the user copies out of the address bar is the readable form.
 *
 * Reads the module alias registry rather than router context: `params.parse`
 * has already resolved `pluginId` to an id by the time this runs, so context
 * would add nothing but a re-render of the whole router on every plugin change.
 */
export const canonicalizePluginUrl = ({
  params,
  location,
}: PluginBeforeLoadContext) => {
  let alias = aliasForId(params.pluginId);

  if (alias === params.pluginId) {
    // Nothing resolved the segment. It may name a plugin that is installed
    // under a different alias — the user renamed it, so the url they saved no
    // longer matches. Default plugins are recognisable by name, so route them
    // to their current alias rather than offering to install them again.
    const id = findDefaultPlugin(params.pluginId)?.id;
    if (!id) return;
    alias = aliasForId(id);
    if (alias === id) return; // that plugin isn't installed here either
  }

  // "/s/opds/feed" and "/plugins/opds/options" both hold it at index 2.
  const segments = location.pathname.split("/");
  if (segments[2] === alias) return;

  segments[2] = alias;
  throw redirect({
    to: segments.join("/"),
    search: location.search,
    replace: true,
  });
};

/**
 * Plugin lookup tolerant of a url segment that is still an alias. TanStack only
 * parses a given url once, so a plugin installed *after* its route matched —
 * the shared-link install prompt — is unknowable to `params.parse` and the
 * segment stays an alias for the life of the page.
 */
export const findPluginByParam = <T extends { id?: string; alias?: string }>(
  plugins: T[],
  param: string | undefined
): T | undefined => {
  if (!param) return undefined;
  const match = plugins.find((p) => p.id === param || p.alias === param);
  if (match) return match;

  // A default plugin installed from this very url gets whatever alias is free
  // here, which need not be the one the url carries. Fall back to its id so the
  // page comes alive as soon as the install finishes.
  const defaultId = findDefaultPlugin(param)?.id;
  return defaultId ? plugins.find((p) => p.id === defaultId) : undefined;
};
