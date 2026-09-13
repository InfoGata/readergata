/**
 * Whether this build has analytics at all. A fork or a self-hoster that never
 * sets a key gets no provider, no script and no switch -- rather than a provider
 * trusted to stay quiet on its own.
 */
export const analyticsConfigured = Boolean(
  import.meta.env.VITE_PUBLIC_POSTHOG_KEY
);

/**
 * Whether the browser is asking not to be tracked.
 *
 * PostHog checks this itself under `respect_dnt`, but the app needs the answer
 * too: the setting has to show as overridden rather than as a switch that
 * appears to do nothing.
 */
export const doNotTrackEnabled = (): boolean => {
  const nav = navigator as Navigator & { msDoNotTrack?: string | null };
  const win = window as Window & { doNotTrack?: string | null };
  return [nav.doNotTrack, nav.msDoNotTrack, win.doNotTrack].some(
    (flag) => flag === "1" || flag === "yes"
  );
};

/**
 * What the app asks PostHog to do: the reader's choice, with Do Not Track able
 * to veto it but never to enable it.
 *
 * Deliberately says nothing about whether a key is configured. That guarantee
 * is structural -- AnalyticsProvider renders no provider without one -- and
 * folding it in here would make the answer depend on whether the machine
 * running the tests has a .env.
 */
export const shouldCapture = (
  disableAnalytics: boolean,
  doNotTrack: boolean
): boolean => !disableAnalytics && !doNotTrack;
