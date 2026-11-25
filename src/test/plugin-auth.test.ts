import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/database";
import { isPluginLoggedIn } from "@/lib/plugin-auth";
import * as utils from "@/utils";

const plugin = {
  id: "humble",
  manifest: {
    name: "Humble",
    script: "",
    authentication: { loginUrl: "https://www.humblebundle.com/login" },
  },
};

describe("isPluginLoggedIn", () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await db.pluginAuths.clear();
  });

  it("is false until the login flow has stored a row", async () => {
    vi.spyOn(utils, "hasAuthentication").mockResolvedValue(true);
    expect(await isPluginLoggedIn(plugin)).toBe(false);

    await db.pluginAuths.put({ pluginId: "humble", headers: {} });
    expect(await isPluginLoggedIn(plugin)).toBe(true);
  });

  it("is false where the platform has no login flow", async () => {
    vi.spyOn(utils, "hasAuthentication").mockResolvedValue(false);
    await db.pluginAuths.put({ pluginId: "humble", headers: {} });
    expect(await isPluginLoggedIn(plugin)).toBe(false);
  });

  it("is false for a plugin that declares no login", async () => {
    vi.spyOn(utils, "hasAuthentication").mockResolvedValue(true);
    await db.pluginAuths.put({ pluginId: "humble", headers: {} });
    expect(
      await isPluginLoggedIn({ ...plugin, manifest: { name: "x", script: "" } })
    ).toBe(false);
  });
});
