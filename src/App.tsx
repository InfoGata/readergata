import React, { useEffect } from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Grid,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import {
  setIsFullscreen,
  setNavigationOpen,
  setTocOpen,
} from "./store/reducers/uiReducer";
import screenfull, { Screenfull } from "screenfull";
import { Toc } from "@mui/icons-material";
import TocMenu from "./components/TocMenu";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { PluginsProvider } from "./PluginsContext";
import Routing from "./components/Routing";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const title = useAppSelector((state) => state.ebook.title);
  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));
  const onTocToggle = () => dispatch(setTocOpen(!tocOpen));
  const isFullScreen = useAppSelector((state) => state.ui.isFullscreen);

  useEffect(() => {
    const sfull = screenfull as Screenfull;
    if (sfull.isEnabled) {
      sfull.on("change", () => {
        dispatch(setIsFullscreen(sfull.isFullscreen));
      });
    }
  });

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
            <AppBar color="transparent" position="fixed">
              <Toolbar variant="dense">
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  edge="start"
                  onClick={onNavigationToggle}
                  sx={{ mr: 2 }}
                  size="small"
                >
                  <MenuIcon />
                </IconButton>
                <Grid container justifyContent="center">
                  <Typography variant="subtitle1" noWrap>
                    {title}
                  </Typography>
                </Grid>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  edge="start"
                  onClick={onTocToggle}
                  sx={{ mr: 2 }}
                  size="small"
                >
                  <Toc />
                </IconButton>
              </Toolbar>
            </AppBar>
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
