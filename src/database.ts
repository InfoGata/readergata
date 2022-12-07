import Dexie from "dexie";

import { PluginInfo } from "./plugintypes";

class ReaderDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;

  constructor() {
    super("ReaderDatabase");
    this.version(1).stores({
      plugins: "id",
    });
    this.plugins = this.table("plugins");
  }
}

export const db = new ReaderDatabase();
