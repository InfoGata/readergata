import * as Sentry from "@sentry/browser";
import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { routeTree } from "./routeTree.gen";
import store, { persistor } from "./store/store";

Sentry.init({
  dsn: "https://691bc946c63849509dc61a61eaee4a5f@app.glitchtip.com/4800",
});

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="light">
          <IconContext.Provider value={{ className: "w-5 h-5" }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
