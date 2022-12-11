import React, { useEffect } from "react";
import { CssBaseline, Box } from "@mui/material";
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

  useEffect(() => {
    const sfull = screenfull as Screenfull;
    if (sfull.isEnabled) {
      sfull.on("change", () => {
        dispatch(setIsFullscreen(sfull.isFullscreen));
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if (screenfull.isEnabled) {
      if (isFullScreen) {
        (screenfull as Screenfull).request();
      } else {
        (screenfull as Screenfull).exit();
      }
    }
  }, [isFullScreen]);

  return (
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
  );
};

export default App;
