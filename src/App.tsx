import React from "react";
import { CssBaseline, Box, Button } from "@mui/material";
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import { setIsFullscreen } from "./store/reducers/uiReducer";
import screenfull, { Screenfull } from "screenfull";
import TocMenu from "./components/TocMenu";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { PluginsProvider } from "./PluginsContext";
import Routing from "./components/Routing";
import { QueryClient, QueryClientProvider } from "react-query";
import TopBar from "./TopBar";
import { SnackbarKey, SnackbarProvider } from "notistack";
import { useTranslation } from "react-i18next";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isFullScreen = useAppSelector((state) => state.ui.isFullscreen);
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const waitingServiceWorker = useAppSelector(
    (state) => state.ui.waitingServiceWorker
  );
  const { t } = useTranslation();

  React.useEffect(() => {
    const sfull = screenfull as Screenfull;
    if (sfull.isEnabled) {
      sfull.on("change", () => {
        dispatch(setIsFullscreen(sfull.isFullscreen));
      });
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (screenfull.isEnabled) {
      if (isFullScreen) {
        (screenfull as Screenfull).request();
      } else {
        (screenfull as Screenfull).exit();
      }
    }
  }, [isFullScreen]);

  React.useEffect(() => {
    const updateServiceWorker = () => {
      if (waitingServiceWorker) {
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });

        waitingServiceWorker.addEventListener("statechange", (e) => {
          const sw = e?.target as ServiceWorker;
          if (sw.state === "activated") {
            window.location.reload();
          }
        });
      }
    };

    if (waitingServiceWorker) {
      notistackRef?.current?.enqueueSnackbar(t("newVersion"), {
        action: (key) => (
          <>
            <Button onClick={updateServiceWorker}>{t("reload")}</Button>
          </>
        ),
      });
    }
  }, [waitingServiceWorker, t]);

  const onClickDismiss = (key: SnackbarKey) => () => {
    notistackRef?.current?.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => (
        <Button onClick={onClickDismiss(key)}>{t("dismiss")}</Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <PluginsProvider>
            <Box sx={{ display: "flex" }}>
              <CssBaseline />
              <TopBar />
              <NavigationMenu />
              <Routing />
              <TocMenu />
            </Box>
          </PluginsProvider>
        </Router>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
