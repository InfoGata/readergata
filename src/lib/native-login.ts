import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser";
import { ManifestAuthentication } from "../plugintypes";
import {
  LoginResult,
  canTrackLogin,
  createLoginTracker,
  nativeTrackerOptions,
} from "./login-tracker";

/**
 * Logging a plugin in on Android and iOS, where there is no extension to open
 * the window: the site's login page opens in an in-app browser, which closes
 * once the plugin's `authentication` says the login is done.
 *
 * Nothing here reads the site's cookies. The in-app browser and the app's
 * native requests share a cookie store -- the global `CookieManager` on
 * Android, and on iOS the default `WKWebsiteDataStore`, which Capacitor copies
 * into the `HTTPCookieStorage` that CapacitorHttp sends from -- so a plugin's
 * requests carry the session as soon as the site sets it.
 *
 * Only InfoGata's fork of cordova-plugin-inappbrowser reports request headers,
 * and only on Android (`message` events of type `intercept`). iOS sees
 * navigations alone, so a login there needs a `completionUrl`.
 *
 * Imported dynamically, so rxjs and the cordova wrapper stay out of the web
 * build's route chunk.
 */

interface InterceptMessage {
  type: "intercept";
  url: string;
  headers: Record<string, string>;
}

const isIntercept = (data: unknown): data is InterceptMessage =>
  !!data &&
  typeof data === "object" &&
  (data as { type?: unknown }).type === "intercept" &&
  typeof (data as { url?: unknown }).url === "string";

export class LoginCancelledError extends Error {
  constructor() {
    super("The login window was closed before the login finished");
    this.name = "LoginCancelledError";
  }
}

/**
 * Resolves with what to store once the login completes, and rejects with a
 * `LoginCancelledError` if the reader closes the window first.
 */
export const nativeLogin = (
  auth: ManifestAuthentication
): Promise<LoginResult> => {
  const options = nativeTrackerOptions();
  if (!canTrackLogin(auth, options)) {
    return Promise.reject(
      new Error("This plugin's login can't be completed on this platform")
    );
  }

  return new Promise((resolve, reject) => {
    const tracker = createLoginTracker(auth, options);
    const browser = InAppBrowser.create(auth.loginUrl, "_blank", {
      location: "yes",
    });
    let settled = false;

    const finish = (result: LoginResult | undefined) => {
      if (!result || settled) return;
      settled = true;
      subscriptions.forEach((s) => s.unsubscribe());
      browser.close();
      resolve(result);
    };

    const subscriptions = [
      // loadstart for each page as it is asked for; loadstop as well, in case
      // a redirect only shows up once it has landed.
      browser
        .on("loadstart")
        .subscribe((e) => finish(tracker.navigated(e.url))),
      browser.on("loadstop").subscribe((e) => finish(tracker.navigated(e.url))),
      browser.on("message").subscribe((e) => {
        if (isIntercept(e.data)) {
          finish(tracker.requested(e.data.url, e.data.headers ?? {}));
        }
      }),
      browser.on("exit").subscribe(() => {
        if (settled) return;
        settled = true;
        subscriptions.forEach((s) => s.unsubscribe());
        reject(new LoginCancelledError());
      }),
    ];
  });
};
