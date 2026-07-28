import Dexie from "dexie";
import { describe, expect, it } from "vitest";
import { PluginInfo } from "@/plugintypes";

/**
 * The v4 upgrade backfills an alias for every plugin installed before aliases
 * existed. It runs once and there is no second chance to get it right, so
 * exercise it against a real (fake-indexeddb) v3 database.
 */
describe("plugins alias migration", () => {
  it("backfills aliases for plugins installed before v4, deduping collisions", async () => {
    // A v3 database, matching src/database.ts's schema history.
    const old = new Dexie("ReaderDatabase");
    old.version(1).stores({ plugins: "id" });
    old.version(2).stores({ documentData: "id, url, [xxhash64+fileSize]" });
    old.version(3).stores({ pluginAuths: "pluginId" });
    await old.open();
    await old.table<PluginInfo, string>("plugins").bulkAdd([
      { id: "id-1", name: "Plugin for HumbleBundle", script: "" },
      { id: "id-2", name: "Opds Catalog", script: "" },
      // Two plugins for the same site: the second has to take a -N variant.
      { id: "id-3", name: "Opds Catalog", script: "" },
      // A manifest that asked for a specific alias wins over the name.
      {
        id: "id-4",
        name: "Some Other Reader",
        script: "",
        manifest: { name: "Some Other Reader", script: "", alias: "gutenberg" },
      },
    ]);
    old.close();

    // Importing the app's database triggers the v4 upgrade on open.
    const { db } = await import("@/database");
    const plugins = await db.plugins.toArray();
    const aliases = Object.fromEntries(
      plugins.map((p) => [p.id, p.alias])
    ) as Record<string, string>;

    expect(aliases["id-1"]).toBe("humblebundle");
    expect(aliases["id-2"]).toBe("opds-catalog");
    expect(aliases["id-3"]).toBe("opds-catalog-2");
    expect(aliases["id-4"]).toBe("gutenberg");

    // The alias index the lookups rely on must exist too.
    await expect(
      db.plugins.where("alias").equals("humblebundle").first()
    ).resolves.toMatchObject({ id: "id-1" });

    db.close();
  });
});
