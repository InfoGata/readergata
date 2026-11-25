import { Capacitor } from "@capacitor/core";
import { ManifestAuthentication } from "../plugintypes";

/**
 * Watching a login window until a plugin's `authentication` says the login is
 * done. The extension does this in its own background script; this is the
 * app's copy, for the platforms where the app opens the window itself.
 */

export interface LoginResult {
  headers: Record<string, string>;
  domainHeaders: Record<string, Record<string, string>>;
}

/**
 * Whether `url` is the page a login ends on. A `completionUrl` ending in `?*`
 * matches that origin and path with any query string, or none, which is the
 * same rule the extension applies.
 */
export const matchesCompletionUrl = (
  url: string,
  completionUrl: string
): boolean => {
  if (url === completionUrl) return true;
  if (!completionUrl.endsWith("?*")) return false;
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}` === completionUrl.slice(0, -2);
  } catch {
    return false;
  }
};

const parseCookies = (header: string): Set<string> =>
  new Set(
    header
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter(Boolean)
  );

/** Header names are case-insensitive, and Android reports them as sent. */
const lowerCaseKeys = (headers: Record<string, string>) =>
  new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));

export interface LoginTrackerOptions {
  /**
   * Whether the window can show the request headers it sends at all. Without
   * them only `completionUrl` can be watched for, and a login that needs a
   * header can't be finished.
   */
  canSeeHeaders: boolean;
  /**
   * Whether `cookiesToFind` is checked. The app's own native requests share
   * the login window's cookie store, so the cookies needn't be read to be
   * used, and Android's request interception doesn't report them anyway --
   * the network stack adds `Cookie` after the app is asked.
   */
  checkCookies: boolean;
}

/**
 * Whether a window with these abilities can tell when this login is done.
 * Without that the window would never close by itself, so the app shouldn't
 * offer to open it.
 */
export const canTrackLogin = (
  auth: ManifestAuthentication,
  { canSeeHeaders, checkCookies }: LoginTrackerOptions
): boolean => {
  const needsHeaders =
    !!auth.headersToFind?.length ||
    Object.keys(auth.domainHeadersToFind ?? {}).length > 0 ||
    (checkCookies && !!auth.cookiesToFind?.length);
  if (needsHeaders && !canSeeHeaders) return false;
  // Something has to say the login happened: a page, or a header.
  return needsHeaders || !!auth.completionUrl;
};

/**
 * Fed each page the window navigates to and, where it can see them, each
 * request's headers; answers with what to store once the login is complete.
 */
export const createLoginTracker = (
  auth: ManifestAuthentication,
  { checkCookies }: Pick<LoginTrackerOptions, "checkCookies">
) => {
  const domainsToFind = auth.domainHeadersToFind ?? {};
  let foundCompletionUrl = !auth.completionUrl;
  let foundCookies = !checkCookies || !auth.cookiesToFind?.length;
  let foundHeaders = !auth.headersToFind?.length;
  const headers: Record<string, string> = {};
  const domainHeaders: Record<string, Record<string, string>> = {};
  const foundDomainHeaders = () =>
    Object.keys(domainsToFind).every((d) => domainHeaders[d]);

  const result = (): LoginResult | undefined =>
    foundCompletionUrl && foundCookies && foundHeaders && foundDomainHeaders()
      ? { headers, domainHeaders }
      : undefined;

  return {
    /** A page the window opened. */
    navigated(url: string): LoginResult | undefined {
      if (
        !foundCompletionUrl &&
        auth.completionUrl &&
        matchesCompletionUrl(url, auth.completionUrl)
      ) {
        foundCompletionUrl = true;
      }
      return result();
    },

    /** A request the window sent, with its headers. */
    requested(
      url: string,
      requestHeaders: Record<string, string>
    ): LoginResult | undefined {
      const map = lowerCaseKeys(requestHeaders);

      if (!foundCookies && auth.cookiesToFind) {
        const cookie = map.get("cookie");
        if (cookie) {
          const names = parseCookies(cookie);
          foundCookies = auth.cookiesToFind.every((c) => names.has(c));
        }
      }

      if (!foundHeaders && auth.headersToFind) {
        const values = auth.headersToFind.map((h) => map.get(h.toLowerCase()));
        if (values.every((v) => v !== undefined)) {
          auth.headersToFind.forEach((h, i) => (headers[h] = values[i]!));
          foundHeaders = true;
        }
      }

      let host: string | undefined;
      try {
        host = new URL(url).host;
      } catch {
        host = undefined;
      }
      const domain = host
        ? Object.keys(domainsToFind).find(
            (d) => !domainHeaders[d] && host.endsWith(d)
          )
        : undefined;
      if (domain) {
        const names = domainsToFind[domain];
        const values = names.map((h) => map.get(h.toLowerCase()));
        if (values.every((v) => v !== undefined)) {
          domainHeaders[domain] = Object.fromEntries(
            names.map((h, i) => [h, values[i]!])
          );
        }
      }

      return result();
    },
  };
};

/**
 * What the in-app browser can watch on this device (see `native-login.ts`):
 * request headers on Android only, and never the cookies, which needn't be.
 */
export const nativeTrackerOptions = (): LoginTrackerOptions => ({
  canSeeHeaders: Capacitor.getPlatform() === "android",
  checkCookies: false,
});

/** Whether a login window opened by the app here could ever finish. */
export const canLogInNatively = (auth: ManifestAuthentication): boolean =>
  canTrackLogin(auth, nativeTrackerOptions());
