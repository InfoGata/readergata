import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import React from "react";
import i18n from "../i18n";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import {
  APP_DATABASES,
  requestAppDataReset,
  runPendingAppDataReset,
} from "@/lib/reset-app-data";

afterEach(cleanup);

const APP_TEXT = "the app";
const FIX_TEXT = "fix it";

const Boom: React.FC<{ throws: boolean }> = ({ throws }) => {
  if (throws) throw new Error("rehydration failed");
  return <p>{APP_TEXT}</p>;
};

// The boundary is above every provider in app.tsx; i18next is the only thing
// it reads, and that's a singleton rather than context.
const renderBoundary = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe("AppErrorBoundary", () => {
  const reportError = vi.fn();

  // React logs every caught error, and componentDidCatch re-reports it on
  // purpose. `reportError` is stubbed rather than spied because jsdom doesn't
  // implement it.
  beforeEach(() => {
    reportError.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("reportError", reportError);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the children when nothing throws", () => {
    renderBoundary(
      <AppErrorBoundary>
        <Boom throws={false} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("the app")).toBeInTheDocument();
  });

  it("shows a recoverable fallback instead of unmounting the app", async () => {
    renderBoundary(
      <AppErrorBoundary>
        <Boom throws={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("ReaderGata couldn't start")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

    // The message is what makes a bug report actionable, so it has to reach
    // the page rather than only the console.
    await userEvent.click(screen.getByText("Details"));
    expect(screen.getByText("rehydration failed")).toBeInTheDocument();
  });

  it("re-raises the error so window-level exception capture still sees it", () => {
    renderBoundary(
      <AppErrorBoundary>
        <Boom throws={true} />
      </AppErrorBoundary>
    );

    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "rehydration failed" })
    );
  });

  it("renders the children again after a retry that succeeds", async () => {
    // The state lives above the throwing child so retry has something to
    // recover to; a boundary reset alone would just re-throw.
    const Harness: React.FC = () => {
      const [broken, setBroken] = React.useState(true);
      return (
        <>
          <button onClick={() => setBroken(false)}>{FIX_TEXT}</button>
          <AppErrorBoundary>
            <Boom throws={broken} />
          </AppErrorBoundary>
        </>
      );
    };

    renderBoundary(<Harness />);
    expect(screen.getByText("ReaderGata couldn't start")).toBeInTheDocument();

    await userEvent.click(screen.getByText("fix it"));
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("the app")).toBeInTheDocument();
  });
});

/** Resolves with whether the database existed before this call opened it. */
const openAndClose = (name: string, seed = false) =>
  new Promise<boolean>((resolve, reject) => {
    let existed = true;
    const request = indexedDB.open(name);
    request.onupgradeneeded = () => {
      existed = false;
      if (seed) request.result.createObjectStore("seed");
    };
    request.onsuccess = () => {
      // Closed to stand in for the reload: on a real boot nothing holds it.
      request.result.close();
      resolve(existed);
    };
    request.onerror = () => reject(request.error);
  });

describe("app data reset", () => {
  const reload = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    reload.mockClear();
    // jsdom's location.reload isn't writable, so it's replaced wholesale.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });
  });

  it("does nothing at startup unless a reset was requested", async () => {
    await openAndClose("keyval-store", true);

    await runPendingAppDataReset();

    expect(await openAndClose("keyval-store")).toBe(true);
  });

  it("defers the deletion to the next boot, because the databases are still open", () => {
    requestAppDataReset();

    expect(window.localStorage.getItem("readergata:reset-app-data")).toBe("1");
    expect(reload).toHaveBeenCalled();
  });

  it("deletes every app database on the next boot", async () => {
    for (const name of APP_DATABASES) await openAndClose(name, true);
    window.localStorage.setItem("vite-ui-theme", "dark");

    requestAppDataReset();
    await runPendingAppDataReset();

    for (const name of APP_DATABASES) {
      expect(await openAndClose(name)).toBe(false);
    }
    // The flag is cleared first, so a hung deletion can't loop the reset.
    expect(window.localStorage.getItem("readergata:reset-app-data")).toBeNull();
    // Untouched: a theme preference can't be what's stopping the app booting.
    expect(window.localStorage.getItem("vite-ui-theme")).toBe("dark");
  });
});
