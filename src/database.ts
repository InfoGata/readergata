import Dexie from "dexie";

import { aliasFromName, assignAlias } from "./lib/plugin-alias";
import { PluginInfo } from "./plugintypes";
import { DocumentData, PluginAuthentication } from "./types";

class ReaderDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;
  pluginAuths: Dexie.Table<PluginAuthentication, string>;
  documentData: Dexie.Table<DocumentData, string>;

  constructor() {
    super("ReaderDatabase");
    this.version(1).stores({
      plugins: "id",
    });
    this.version(2).stores({
      documentData: "id, url, [xxhash64+fileSize]",
    });
    this.version(3).stores({
      pluginAuths: "pluginId",
    });
    // Aliases are indexed but not unique: they're optional, and uniqueness is
    // enforced when one is assigned (see lib/plugin-alias).
    this.version(4)
      .stores({
        plugins: "id, alias",
      })
      .upgrade(async (tx) => {
        const table = tx.table<PluginInfo, string>("plugins");
        // Give plugins installed before aliases existed one now, deduped the
        // same way a fresh install would be.
        const assigned: PluginInfo[] = [];
        for (const plugin of await table.toArray()) {
          plugin.alias = assignAlias(
            plugin.alias ?? plugin.manifest?.alias ?? aliasFromName(plugin.name),
            assigned,
            plugin.id
          );
          assigned.push(plugin);
          await table.put(plugin);
        }
      });
    this.plugins = this.table("plugins");
    this.documentData = this.table("documentData");
    this.pluginAuths = this.table("pluginAuths");
  }
}

export const db = new ReaderDatabase();
