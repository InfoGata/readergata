import React from "react";
import { usePostHog } from "posthog-js/react";
import { useAppSelector } from "@/store/hooks";
import { doNotTrackEnabled, shouldCapture } from "@/lib/analytics";

/**
 * Applies the reader's analytics preference to PostHog.
 *
 * The preference lives in the store rather than in PostHog's own opt-out
 * storage, because cookieless mode means the SDK persists nothing client-side
 * and would forget the choice on reload. So the app remembers it and asserts it
 * on every boot.
 *
 * Renders nothing; it has to sit inside both the store and the PostHog
 * provider, which is the only reason it's a component.
 */
const AnalyticsPreference: React.FC = () => {
  const disableAnalytics = useAppSelector(
    (state) => !!state.settings.disableAnalytics
  );
  const posthog = usePostHog();

  React.useEffect(() => {
    if (!posthog) return;

    if (shouldCapture(disableAnalytics, doNotTrackEnabled())) {
      // The opt-in is itself an event by default, which would be a capture the
      // reader didn't ask for on every load.
      posthog.opt_in_capturing({ captureEventName: false });
    } else {
      posthog.opt_out_capturing();
    }
  }, [disableAnalytics, posthog]);

  return null;
};

export default AnalyticsPreference;
