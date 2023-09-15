import Dexie from "dexie";

import { PluginInfo } from "./plugintypes";
import { DocumentData } from "./types";

class ReaderDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;
  documentData: Dexie.Table<DocumentData, number>;

  constructor() {
    super("ReaderDatabase");
    this.version(1).stores({
      plugins: "id",
    });
    this.version(2).stores({
      documentData: "id, url, [xxhash64+fileSize]",
    });
    this.plugins = this.table("plugins");
    this.documentData = this.table("documentData");
  }
}

export const db = new ReaderDatabase();
