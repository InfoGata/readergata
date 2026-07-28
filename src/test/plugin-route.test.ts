import { describe, expect, it, beforeEach } from "vitest";
import { setPluginAliases } from "@/lib/plugin-alias";
import { findPluginByParam } from "@/lib/plugin-route";

const OPDS_ID = "tJlCCR6lCfx7XeU_9LQum";

describe("findPluginByParam", () => {
  beforeEach(() => {
    setPluginAliases([{ id: OPDS_ID, alias: "opds-catalog" }]);
  });

  const plugins = [{ id: OPDS_ID, alias: "opds-catalog" }];

  it("matches on plugin id", () => {
    expect(findPluginByParam(plugins, OPDS_ID)?.id).toBe(OPDS_ID);
  });

  it("matches on the alias in the url", () => {
    expect(findPluginByParam(plugins, "opds-catalog")?.id).toBe(OPDS_ID);
  });

  it("matches a default plugin whose alias deduped differently here", () => {
    // A shared `/s/opds/feed` installs the plugin, which takes the alias this
    // device derives ("opds-catalog"). The url still says "opds", and the route
    // params were parsed before the install, so they never resolve.
    expect(findPluginByParam(plugins, "opds")?.id).toBe(OPDS_ID);
  });

  it("returns nothing for an unrelated segment", () => {
    expect(findPluginByParam(plugins, "gutenberg")).toBeUndefined();
    expect(findPluginByParam(plugins, undefined)).toBeUndefined();
  });
});
