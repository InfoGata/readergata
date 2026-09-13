/**
 * The escape hatch behind AppErrorBoundary. When the app can't get far enough to
 * render anything, the cause is almost always local state rather than the code:
 * a plugin script that now throws on load, a persisted redux slice written in an
 * older shape, a half-applied Dexie upgrade.
 *
 * The deletion runs on the *next* boot rather than on the click. IndexedDB only
 * completes a `deleteDatabase` once every connection to that database is closed,
 * and by the time the boundary renders, Dexie and redux-persist are both holding
 * one that nothing reachable from the fallback can close. So the click records
 * the intent and reloads, and the work happens at the top of main.tsx, before a
 * connection has been opened.
 */

const RESET_FLAG = "readergata:reset-app-data";

/**
 * Keep in sync with src/database.ts (Dexie) and the idb storage in
 * store/store.ts, which keeps redux-persist's default database name.
 */
export const APP_DATABASES = ["ReaderDatabase", "keyval-store"];

/** localStorage throws outright when site data is blocked, so every use is guarded. */
const readFlag = (): boolean => {
  try {
    return window.localStorage.getItem(RESET_FLAG) === "1";
  } catch {
    return false;
  }
};

/**
 * Records the request and reloads. Nothing is deleted here — see the note above
 * on why that has to wait for the next boot.
 */
export const requestAppDataReset = () => {
  try {
    window.localStorage.setItem(RESET_FLAG, "1");
  } catch {
    // Without storage there is nothing persisted to reset either, so a plain
    // reload is already the whole operation.
  }
  window.location.reload();
};

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    // Every outcome resolves, including `blocked`: a reset that can't finish
    // must not be able to stop the app from booting.
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });

/**
 * Called once at startup, before any provider mounts. A no-op unless a reset was
 * requested.
 */
export const runPendingAppDataReset = async (): Promise<void> => {
  if (!readFlag()) return;

  // Cleared before the deletions: if one hangs or the tab is closed mid-reset,
  // the next boot should start the app rather than sit in a reset loop.
  try {
    window.localStorage.removeItem(RESET_FLAG);
  } catch {
    // See readFlag.
  }

  await Promise.all(APP_DATABASES.map(deleteDatabase));
};
