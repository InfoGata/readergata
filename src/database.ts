import Dexie from "dexie";

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
    this.plugins = this.table("plugins");
    this.documentData = this.table("documentData");
    this.pluginAuths = this.table("pluginAuths");
  }
}

export const db = new ReaderDatabase();
