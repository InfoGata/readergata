import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "@infogata/shadcn-vite-theme-provider";
import store, { persistor } from "./store/store";
import Router from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PluginsProvider } from "./contexts/PluginsContext";
import { ExtensionProvider } from "./contexts/ExtensionContext";
import { PostHogProvider } from "posthog-js/react";
import AppErrorBoundary from "./components/AppErrorBoundary";

// Only ever imported by main.tsx, after any pending data reset has run — see
// there for why this can't be the entry module itself.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* Outermost on purpose: everything below can throw during first render,
        and the router's own error component only covers routes. */}
    <AppErrorBoundary>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: '2025-05-24',
          capture_exceptions: true,
          cookieless_mode: "always",
        }}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider defaultTheme="light">
              <ExtensionProvider>
                <IconContext.Provider value={{ className: "size-5" }}>
                  <QueryClientProvider client={queryClient}>
                    <PluginsProvider>
                      <Router />
                    </PluginsProvider>
                  </QueryClientProvider>
                </IconContext.Provider>
              </ExtensionProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </PostHogProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
