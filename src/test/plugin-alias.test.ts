import { describe, expect, it, beforeEach } from "vitest";
import {
  aliasForId,
  aliasFromName,
  assignAlias,
  normalizeAlias,
  resolvePluginParam,
  setPluginAliases,
  validateAlias,
} from "@/lib/plugin-alias";
import { findDefaultPlugin } from "@/default-plugins";

describe("normalizeAlias", () => {
  it("slugifies plugin names", () => {
    expect(normalizeAlias("Opds Catalog")).toBe("opds-catalog");
    expect(normalizeAlias("  Humble_Bundle  ")).toBe("humble-bundle");
    expect(normalizeAlias("4chan!!")).toBe("4chan");
  });

  it("never produces a leading or trailing dash", () => {
    expect(normalizeAlias("--opds--")).toBe("opds");
    expect(normalizeAlias("!!!")).toBe("");
    // Clamping must not leave the dash the cut lands on.
    expect(normalizeAlias(`${"a".repeat(31)}-bcdef`)).toBe("a".repeat(31));
  });
});

describe("aliasFromName", () => {
  it("drops the boilerplate readergata plugins are named with", () => {
    // Prefix form, which is what readergata's plugins actually use.
    expect(aliasFromName("Plugin for HumbleBundle")).toBe("humblebundle");
    // Suffix form, as used by the sibling apps.
    expect(aliasFromName("HumbleBundle Plugin for ReaderGata")).toBe(
      "humblebundle"
    );
    expect(aliasFromName("Opds Catalog Plugin")).toBe("opds-catalog");
  });

  it("leaves a name without boilerplate alone", () => {
    expect(aliasFromName("Opds Catalog")).toBe("opds-catalog");
  });

  it("keeps the whole name when stripping would leave nothing", () => {
    expect(aliasFromName("Plugin for ReaderGata")).toBe(
      "plugin-for-readergata"
    );
  });
});

describe("validateAlias", () => {
  const plugins = [
    { id: "abc123", alias: "opds" },
    { id: "humble-id", alias: "humblebundle" },
  ];

  it("accepts a free, normalized alias", () => {
    expect(validateAlias("gutenberg", plugins)).toBeNull();
  });

  it("rejects unnormalized input", () => {
    expect(validateAlias("Opds Two", plugins)).toBe("invalid");
  });

  it("rejects one character aliases", () => {
    expect(validateAlias("o", plugins)).toBe("tooShort");
  });

  it("rejects an alias that is some plugin's id", () => {
    expect(validateAlias("abc123", plugins)).toBe("isPluginId");
  });

  it("rejects an alias another plugin holds", () => {
    expect(validateAlias("opds", plugins)).toBe("taken");
  });

  it("allows a plugin to keep its own alias", () => {
    expect(validateAlias("opds", plugins, "abc123")).toBeNull();
  });
});

describe("assignAlias", () => {
  it("hands out the requested alias when free", () => {
    expect(assignAlias("opds", [])).toBe("opds");
  });

  it("suffixes rather than failing when taken", () => {
    const plugins = [{ id: "a", alias: "opds" }];
    expect(assignAlias("opds", plugins)).toBe("opds-2");

    plugins.push({ id: "b", alias: "opds-2" });
    expect(assignAlias("opds", plugins)).toBe("opds-3");
  });

  it("derives one from a plugin name", () => {
    expect(assignAlias(aliasFromName("Plugin for HumbleBundle"), [])).toBe(
      "humblebundle"
    );
  });

  it("gives up when nothing usable is left", () => {
    expect(assignAlias("!", [])).toBeUndefined();
  });
});

describe("the alias registry", () => {
  beforeEach(() => {
    setPluginAliases([
      { id: "opds-plugin-id", alias: "opds" },
      { id: "old-opds-id", alias: "opds-2" },
      { id: "no-alias-id" },
    ]);
  });

  it("resolves an alias to its plugin id", () => {
    expect(resolvePluginParam("opds")).toBe("opds-plugin-id");
    expect(resolvePluginParam("opds-2")).toBe("old-opds-id");
  });

  it("passes plugin ids through, so old urls keep working", () => {
    expect(resolvePluginParam("no-alias-id")).toBe("no-alias-id");
    expect(resolvePluginParam("opds-plugin-id")).toBe("opds-plugin-id");
  });

  it("passes unknown segments through for the install prompt to handle", () => {
    expect(resolvePluginParam("gutenberg")).toBe("gutenberg");
  });

  it("falls back to the base alias when a shared url deduped elsewhere", () => {
    setPluginAliases([{ id: "only-one", alias: "opds-2" }]);
    // Shared as `/s/opds/...` by someone whose install got the plain name.
    expect(resolvePluginParam("opds")).toBe("only-one");
  });

  it("prefers the lowest suffix among base alias matches", () => {
    setPluginAliases([
      { id: "tenth", alias: "opds-10" },
      { id: "second", alias: "opds-2" },
    ]);
    expect(resolvePluginParam("opds")).toBe("second");
  });

  it("maps ids back to aliases, unchanged when there is none", () => {
    expect(aliasForId("opds-plugin-id")).toBe("opds");
    expect(aliasForId("no-alias-id")).toBe("no-alias-id");
    // Keeps stringify a fixed point for values already in url form.
    expect(aliasForId("opds")).toBe("opds");
  });
});

describe("findDefaultPlugin", () => {
  it("resolves a plugin id", () => {
    expect(findDefaultPlugin("tJlCCR6lCfx7XeU_9LQum")?.alias).toBe("opds");
  });

  it("resolves the manifest alias a shared url carries", () => {
    expect(findDefaultPlugin("opds")?.id).toBe("tJlCCR6lCfx7XeU_9LQum");
    expect(findDefaultPlugin("humblebundle")?.id).toBe("P5oPcz76xlHWUtp5AzLzg");
  });

  it("resolves the alias a device would derive from the name", () => {
    expect(findDefaultPlugin("opds-catalog")?.id).toBe("tJlCCR6lCfx7XeU_9LQum");
  });

  it("resolves an alias that deduped on the sharing device", () => {
    expect(findDefaultPlugin("opds-2")?.id).toBe("tJlCCR6lCfx7XeU_9LQum");
  });

  it("returns nothing for a plugin it does not know", () => {
    expect(findDefaultPlugin("gutenberg")).toBeUndefined();
  });
});
