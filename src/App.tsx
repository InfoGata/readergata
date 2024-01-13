import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "react-query";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { Button } from "./components/ui/button";
import useFullScreen from "./hooks/useFullScreen";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import BookmarksMenu from "./layouts/BookmarksMenu";
import MainContainer from "./layouts/MainContainer";
import NavigationMenu from "./layouts/NavigationMenu";
import SearchMenu from "./layouts/SearchMenu";
import TocMenu from "./layouts/TocMenu";
import TopBar from "./layouts/TopBar";
import PluginsProvider from "./providers/PluginsProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const { t } = useTranslation();

  const onClickDismiss = (key: SnackbarKey) => {
    notistackRef?.current?.closeSnackbar(key);
  };

  useFullScreen();
  useUpdateServiceWorker(notistackRef.current?.enqueueSnackbar, onClickDismiss);
  useOffline(notistackRef.current?.enqueueSnackbar, onClickDismiss);

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => (
        <Button variant="ghost" onClick={() => onClickDismiss(key)}>
          {t("dismiss")}
        </Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <MatomoRouterProvider>
          <PluginsProvider>
            <div className="flex">
              <TopBar />
              <NavigationMenu />
              <MainContainer />
              <TocMenu />
              <SearchMenu />
              <BookmarksMenu />
            </div>
          </PluginsProvider>
        </MatomoRouterProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
