import { afterEach, describe, expect, it, vi } from "vitest";
import { doNotTrackEnabled, shouldCapture } from "@/lib/analytics";

afterEach(() => vi.unstubAllGlobals());

const withDnt = (value: string | null) =>
  vi.stubGlobal("navigator", { ...navigator, doNotTrack: value });

describe("shouldCapture", () => {
  it("captures when the reader hasn't turned it off and the browser doesn't object", () => {
    // Independent of whether a key is configured, so this holds on a machine
    // with no .env -- which is what CI is.
    expect(shouldCapture(false, false)).toBe(true);
  });

  it("doesn't capture when the reader turned it off", () => {
    expect(shouldCapture(true, false)).toBe(false);
  });

  it("lets Do Not Track veto the setting", () => {
    expect(shouldCapture(false, true)).toBe(false);
  });

  it("never lets Do Not Track turn capturing on", () => {
    expect(shouldCapture(true, true)).toBe(false);
  });
});

describe("doNotTrackEnabled", () => {
  it("reads the browser's signal", () => {
    withDnt("1");
    expect(doNotTrackEnabled()).toBe(true);

    // Some browsers historically sent "yes" rather than "1".
    withDnt("yes");
    expect(doNotTrackEnabled()).toBe(true);
  });

  it("treats an explicit opt-in to tracking, or no signal, as no objection", () => {
    withDnt("0");
    expect(doNotTrackEnabled()).toBe(false);

    withDnt(null);
    expect(doNotTrackEnabled()).toBe(false);
  });
});
