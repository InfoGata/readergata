import React from "react";
import { CssBaseline, Box, Button } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import TocMenu from "./components/TocMenu";
import { PluginsProvider } from "./PluginsContext";
import Routing from "./components/Routing";
import { QueryClient, QueryClientProvider } from "react-query";
import TopBar from "./TopBar";
import { SnackbarKey, SnackbarProvider } from "notistack";
import { useTranslation } from "react-i18next";
import useFullScreen from "./hooks/useFullScreen";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import useOffline from "./hooks/useOffline";
import SearchMenu from "./components/SearchMenu";
import MatomoRouterProvider from "./components/MatomoRouterProvider";

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
        <Button onClick={() => onClickDismiss(key)}>{t("dismiss")}</Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <MatomoRouterProvider>
            <PluginsProvider>
              <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <TopBar />
                <NavigationMenu />
                <Routing />
                <TocMenu />
                <SearchMenu />
              </Box>
            </PluginsProvider>
          </MatomoRouterProvider>
        </Router>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
