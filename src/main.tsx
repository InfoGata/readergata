import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import "./index.css";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { runPendingAppDataReset } from "./lib/reset-app-data";

/**
 * The entry is only a bootstrap, so that a pending data reset runs before any of
 * the app's modules are evaluated. Static imports all run before a top-level
 * await, and importing the store starts redux-persist rehydrating -- which opens
 * its IndexedDB connection, and an open connection blocks `deleteDatabase` for
 * as long as the page lives. A no-op unless the boundary's reset button was used.
 */
await runPendingAppDataReset();

try {
  await import("./app");
} catch (error) {
  // A module that throws while being evaluated -- the store, the database, a
  // provider -- never reaches the boundary inside app.tsx, so show the same
  // fallback here rather than a blank page.
  const Rethrow: React.FC = () => {
    throw error;
  };
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <AppErrorBoundary>
      <Rethrow />
    </AppErrorBoundary>
  );
}
