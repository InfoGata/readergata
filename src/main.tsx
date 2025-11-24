import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import store, { persistor } from "./store/store";
import Router from "./router";
import { QueryClient, QueryClientProvider } from "react-query";
import PluginsProvider from "./providers/PluginsProvider";
import { ExtensionProvider } from "./contexts/ExtensionContext";
import { PostHogProvider } from "posthog-js/react";

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
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === "development",
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
  </React.StrictMode>
);
