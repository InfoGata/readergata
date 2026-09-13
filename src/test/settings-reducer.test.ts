import { describe, expect, it } from "vitest";
import settingsReducer, {
  toggleDisableAutoUpdatePlugins,
} from "@/store/reducers/settingsReducer";

describe("toggleDisableAutoUpdatePlugins", () => {
  it("flips the flag the plugin provider reads", () => {
    // It used to write `autoUpdatePlugins`, which nothing reads, so the setting
    // never stopped an update.
    const disabled = settingsReducer({}, toggleDisableAutoUpdatePlugins());
    expect(disabled.disableAutoUpdatePlugins).toBe(true);

    const enabled = settingsReducer(disabled, toggleDisableAutoUpdatePlugins());
    expect(enabled.disableAutoUpdatePlugins).toBe(false);
  });
});
