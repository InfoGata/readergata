import { Capacitor } from "@capacitor/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";
import { removeServiceWorker } from "@/lib/service-worker";

const useRegisterServiceWorker = () => {
  const { t } = useTranslation();

  // onNeedReload is registered once, so read t() through a ref to keep the toast
  // in the current language after a language switch.
  const tRef = React.useRef(t);
  React.useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Under registerType "autoUpdate" the new worker activates itself, which means
  // needRefresh never fires and updateServiceWorker() is a no-op. Supplying
  // onNeedReload replaces the plugin's default window.location.reload(), so an
  // update never interrupts the user mid-session — they choose when to reload.
  useRegisterSW({
    onNeedReload() {
      toast(tRef.current("newVersion"), {
        action: {
          label: tRef.current("reload"),
          onClick: () => window.location.reload(),
        },
      });
    },
  });
};

// In the native app the worker would keep serving the old bundle after an
// over-the-air update, so it is never registered there and any worker left
// from an older install is removed (src/lib/service-worker.ts). Electron is
// unchanged: its production build loads from file://, where registration
// fails quietly.
const useRemoveServiceWorker = () => {
  React.useEffect(() => {
    void removeServiceWorker();
  }, []);
};

// Picked once at load, so each platform always calls the same hooks.
const useUpdateServiceWorker = Capacitor.isNativePlatform()
  ? useRemoveServiceWorker
  : useRegisterServiceWorker;

export default useUpdateServiceWorker;
