import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import store, { persistor } from "./store/store";
import Router from "./router";
import { QueryClient, QueryClientProvider } from "react-query";
import PluginsProvider from "./providers/PluginsProvider";

Sentry.init({
  dsn: "https://691bc946c63849509dc61a61eaee4a5f@app.glitchtip.com/4800",
});

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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="light">
          <IconContext.Provider value={{ className: "w-5 h-5" }}>
            <QueryClientProvider client={queryClient}>
              <PluginsProvider>
                <Router />
              </PluginsProvider>
            </QueryClientProvider>
          </IconContext.Provider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
