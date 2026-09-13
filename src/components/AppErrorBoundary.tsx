import React from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import Alert from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { requestAppDataReset } from "@/lib/reset-app-data";

/**
 * The fallback deliberately reads no app context. It renders in place of the
 * tree that just failed, so anything it consumed — the store, the plugin
 * context, the router — is either the thing that broke or unreachable from
 * here. i18next is the one exception: it's a module-level singleton initialized
 * by importing src/i18n, not a provider.
 */
const AppErrorFallback: React.FC<{ error: unknown; onRetry: () => void }> = ({
  error,
  onRetry,
}) => {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
      <TriangleAlert className="size-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">{t("appCrashTitle")}</h1>
      <p className="text-muted-foreground">{t("appCrashDescription")}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRetry}>{t("tryAgain")}</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("reload")}
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          {t("resetAppData")}
        </Button>
      </div>
      <details className="text-muted-foreground text-xs">
        <summary className="cursor-pointer">{t("showDetails")}</summary>
        <p className="mt-2 font-mono break-all">{message}</p>
      </details>
      <Alert
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={t("resetAppData")}
        description={t("resetAppDataConfirm")}
        confirm={requestAppDataReset}
      />
    </div>
  );
};

type Props = { children: React.ReactNode };
type State = { error: unknown | null };

/**
 * The outermost boundary, above every provider in main.tsx.
 *
 * The router renders its error component for anything a route throws, but that
 * only covers the tree below RouterProvider — and src/router.tsx withholds that
 * until plugins have loaded. Plugin loading, Dexie, redux-persist rehydration
 * and theme setup all run above it, on the first-run path, and a throw from any
 * of them would otherwise unmount the app to a blank page with no way back.
 */
class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown) {
    // React 19 only console.errors what a boundary caught, so nothing listening
    // on window — PostHog's exception capture included — would hear about the
    // app's worst failure. Re-raising it puts it back in front of those
    // handlers. jsdom doesn't implement reportError, hence the optional call.
    window.reportError?.(error);
  }

  retry = () => this.setState({ error: null });

  render() {
    if (this.state.error === null) return this.props.children;
    return <AppErrorFallback error={this.state.error} onRetry={this.retry} />;
  }
}

export default AppErrorBoundary;
