import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import store, { persistor } from "./store/store";
import * as Sentry from "@sentry/browser";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ThemeProvider as ShadThemeProvider } from "./providers/ThemeProvider";
import { IconContext } from "react-icons";

Sentry.init({
  dsn: "https://691bc946c63849509dc61a61eaee4a5f@app.glitchtip.com/4800",
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ShadThemeProvider defaultTheme="light">
          <IconContext.Provider value={{ className: "w-5 h-5" }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </ShadThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
