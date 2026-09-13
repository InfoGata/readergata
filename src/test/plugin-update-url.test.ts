import { afterEach, describe, expect, it, vi } from "vitest";
import { getFileTypeFromPluginUrl, getPlugin } from "@/utils";

const INSTALLED_FROM =
  "https://cdn.jsdelivr.net/gh/InfoGata/opds-readergata@latest/manifest.json";

const manifest = (updateUrl?: string) => ({
  id: "tJlCCR6lCfx7XeU_9LQum",
  name: "Opds Catalog",
  version: "1.8.0",
  script: "dist/index.js",
  ...(updateUrl ? { updateUrl } : {}),
});

// getFileText derives every file url from the manifest url, so one stub covers
// both the manifest and the script it names.
const serve = (body: object) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.endsWith("manifest.json")
        ? new Response(JSON.stringify(body))
        : new Response("// plugin script")
    )
  );

afterEach(() => vi.unstubAllGlobals());

describe("fetching plugin files", () => {
  it("revalidates instead of trusting a cached copy", async () => {
    serve(manifest());

    await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    const calls = vi.mocked(globalThis.fetch).mock.calls;
    expect(calls.length).toBeGreaterThan(1);
    // The manifest and the script are separate cache entries; both have to be
    // fresh or a version can be paired with code that isn't it.
    for (const [, init] of calls) {
      expect(init?.cache).toBe("no-cache");
    }
  });
});

describe("where the next update is fetched from", () => {
  it("takes the url the new manifest asks for", async () => {
    // This is what lets a plugin be moved to another host.
    const moved = "https://example.com/opds/manifest.json";
    serve(manifest(moved));

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(plugin?.manifestUrl).toBe(moved);
  });

  it("keeps the url it was fetched from when the manifest names none", async () => {
    // The fallback the update paths rely on to not strand a plugin.
    serve(manifest());

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(plugin?.manifestUrl).toBe(INSTALLED_FROM);
  });
});
