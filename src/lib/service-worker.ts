/**
 * The service worker is for the web only; useUpdateServiceWorker registers it
 * there and calls this in the native app instead.
 *
 * The native app already loads everything from the device, so a worker adds
 * nothing there. It also gets in the way of over-the-air updates: Capgo swaps
 * the bundle while the origin stays https://localhost, and a worker would
 * keep answering from its precache of the old one. Installs from before OTA
 * updates have a worker registered, so it is removed along with its caches.
 *
 * Only the worker and the `workbox-*` caches go. The origin and everything
 * else stored under it (IndexedDB, localStorage) are untouched.
 */
export const removeServiceWorker = async (): Promise<void> => {
  // The iOS WebView (capacitor://) has no service workers at all.
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) return;
    await Promise.all(registrations.map((r) => r.unregister()));
    // Workbox names its caches `workbox-precache-v2-<scope>` and
    // `workbox-runtime-...`. The app makes no other caches.
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n.startsWith("workbox-")).map((n) => caches.delete(n))
    );
  } catch {
    // Not fatal: nothing depends on the worker being gone except a later OTA
    // update, and the next launch tries again.
  }
};
