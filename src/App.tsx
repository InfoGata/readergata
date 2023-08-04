import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router } from "react-router-dom";
import TopBar from "./TopBar";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import NavigationMenu from "./components/NavigationMenu";
import Routing from "./components/Routing";
import SearchMenu from "./components/SearchMenu";
import TocMenu from "./components/TocMenu";
import useFullScreen from "./hooks/useFullScreen";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
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
