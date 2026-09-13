import React from "react";
import { PostHogProvider } from "posthog-js/react";
import { analyticsConfigured } from "@/lib/analytics";

/**
 * Wraps the app in PostHog only when a key is configured, so a build without
 * one loads no analytics script rather than a provider asked not to do anything.
 */
const AnalyticsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!analyticsConfigured) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: "2025-05-24",
        capture_exceptions: true,
        cookieless_mode: "always",
        // Belt and braces: AnalyticsPreference already opts out under Do Not
        // Track, but nothing should depend on that one component having mounted.
        respect_dnt: true,
      }}
    >
      {children}
    </PostHogProvider>
  );
};

export default AnalyticsProvider;
