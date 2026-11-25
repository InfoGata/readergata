import { describe, expect, it } from "vitest";
import {
  canTrackLogin,
  createLoginTracker,
  matchesCompletionUrl,
} from "@/lib/login-tracker";
import { ManifestAuthentication } from "@/plugintypes";

const humble: ManifestAuthentication = {
  loginUrl: "https://www.humblebundle.com/login",
  cookiesToFind: ["_simpleauth_sess"],
  completionUrl: "https://www.humblebundle.com/home/library?*",
};

describe("matchesCompletionUrl", () => {
  it("matches an exact url", () => {
    expect(
      matchesCompletionUrl("https://a.com/done?x=1", "https://a.com/done?x=1")
    ).toBe(true);
    expect(
      matchesCompletionUrl("https://a.com/done?x=2", "https://a.com/done?x=1")
    ).toBe(false);
  });

  it("reads ?* as any query string, or none", () => {
    const pattern = "https://www.humblebundle.com/home/library?*";
    expect(
      matchesCompletionUrl(
        "https://www.humblebundle.com/home/library?reason=secureArea",
        pattern
      )
    ).toBe(true);
    expect(
      matchesCompletionUrl("https://www.humblebundle.com/home/library", pattern)
    ).toBe(true);
  });

  it("doesn't let ?* stand for a different path or origin", () => {
    const pattern = "https://www.humblebundle.com/home/library?*";
    expect(
      matchesCompletionUrl("https://www.humblebundle.com/login?goto=x", pattern)
    ).toBe(false);
    expect(
      matchesCompletionUrl("https://evil.example/home/library", pattern)
    ).toBe(false);
  });
});

describe("createLoginTracker", () => {
  it("waits for the completion page, not the first page", () => {
    const tracker = createLoginTracker(humble, { checkCookies: false });
    expect(
      tracker.navigated("https://www.humblebundle.com/login")
    ).toBeUndefined();
    expect(
      tracker.navigated(
        "https://www.humblebundle.com/home/library?reason=secureArea"
      )
    ).toEqual({ headers: {}, domainHeaders: {} });
  });

  it("checks cookies only when asked to", () => {
    const tracker = createLoginTracker(humble, { checkCookies: true });
    expect(
      tracker.navigated("https://www.humblebundle.com/home/library")
    ).toBeUndefined();
    expect(
      tracker.requested("https://www.humblebundle.com/api", {
        Cookie: "a=1; _simpleauth_sess=abc",
      })
    ).toBeDefined();
  });

  it("collects headers and per-domain headers, ignoring case", () => {
    const tracker = createLoginTracker(
      {
        loginUrl: "https://accounts.example.com/login",
        headersToFind: ["Authorization"],
        domainHeadersToFind: { ".youtube.com": ["X-Goog-AuthUser"] },
      },
      { checkCookies: false }
    );
    expect(
      tracker.requested("https://accounts.example.com/x", {
        authorization: "Bearer t",
      })
    ).toBeUndefined();
    expect(
      tracker.requested("https://www.youtube.com/y", {
        "x-goog-authuser": "0",
      })
    ).toEqual({
      headers: { Authorization: "Bearer t" },
      domainHeaders: { ".youtube.com": { "X-Goog-AuthUser": "0" } },
    });
  });
});

describe("canTrackLogin", () => {
  it("can finish Humble's login from navigations alone", () => {
    expect(
      canTrackLogin(humble, { canSeeHeaders: false, checkCookies: false })
    ).toBe(true);
  });

  it("refuses a login that needs headers where none can be seen", () => {
    const auth = { loginUrl: "https://a.com", headersToFind: ["X"] };
    expect(
      canTrackLogin(auth, { canSeeHeaders: false, checkCookies: false })
    ).toBe(false);
    expect(
      canTrackLogin(auth, { canSeeHeaders: true, checkCookies: false })
    ).toBe(true);
  });

  it("refuses a login with nothing to wait for", () => {
    expect(
      canTrackLogin(
        { loginUrl: "https://a.com", cookiesToFind: ["s"] },
        { canSeeHeaders: true, checkCookies: false }
      )
    ).toBe(false);
  });
});
