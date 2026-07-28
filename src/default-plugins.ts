import { aliasFromName, stripSuffix } from "./lib/plugin-alias";

export interface PluginDescription {
  id: string;
  /**
   * The alias these plugins ship in their manifests, and so what a shared url
   * names them by on a device that already has them installed.
   */
  alias: string;
  name: string;
  url: string;
  description: string;
  preinstall?: boolean;
  requiresCorsDisabled?: boolean;
}

export const defaultPlugins: PluginDescription[] = [
  {
    id: "P5oPcz76xlHWUtp5AzLzg",
    alias: "humblebundle",
    name: "Plugin for HumbleBundle",
    description: "Get books from Humble Bundle",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/humblebundle-readergata@latest/manifest.json",
  },
  {
    id: "tJlCCR6lCfx7XeU_9LQum",
    alias: "opds",
    name: "Opds Catalog",
    description: "Get books from opds catalogs.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/opds-readergata@latest/manifest.json",
  },
];

export const defaultPluginMap = new Map(defaultPlugins.map((p) => [p.id, p]));

// Both the alias the manifest asks for and the one a device would derive from
// the name, since a shared url may carry either.
const byAlias = new Map(
  defaultPlugins.flatMap((p) => [
    [p.alias, p] as const,
    [aliasFromName(p.name), p] as const,
  ])
);

/**
 * Resolves a url segment that may be a plugin id, an alias, or an alias that
 * deduped to `-N` on the device that shared it. Used to offer the install
 * prompt for a plugin this device doesn't have yet.
 */
export const findDefaultPlugin = (
  param: string
): PluginDescription | undefined =>
  defaultPluginMap.get(param) ??
  byAlias.get(param) ??
  byAlias.get(stripSuffix(param));
