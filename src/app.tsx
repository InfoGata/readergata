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
import AnalyticsProvider from "./components/AnalyticsProvider";
import AnalyticsPreference from "./components/AnalyticsPreference";
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
      <AnalyticsProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {/* Inside PersistGate so it acts on the remembered choice rather
                than the default, and inside the provider so there is a client. */}
            <AnalyticsPreference />
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
      </AnalyticsProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
