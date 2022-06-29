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
import EbookViewer from "./components/EbookViewer";
import Plugins from "./components/Plugins";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import { useDispatch, useSelector } from "react-redux";
import { setIsFullscreen, setNavigationOpen } from "./reducers/uiReducer";
import { RootState } from "./rootReducer";
import { AppDispatch } from "./store";
import screenfull, { Screenfull } from "screenfull";
import FeedList from "./components/FeedList";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigationOpen = useSelector(
    (state: RootState) => state.ui.navigationOpen
  );
  const title = useSelector((state: RootState) => state.ebook.title);
  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));
  const isFullScreen = useSelector((state: RootState) => state.ui.isFullscreen);

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
    <Router>
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
          </Toolbar>
        </AppBar>
        <NavigationMenu />
        <Box component="main">
          <Toolbar />
          <Routes>
            <Route path="/" element={<EbookViewer />} />
            <Route path="/plugins" element={<Plugins />} />
            <Route path="/feed" element={<FeedList />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
