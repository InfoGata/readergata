import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Grid, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";
import SearchButton from "./components/SearchButton";
import TocButton from "./components/TocButton";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setNavigationOpen } from "./store/reducers/uiReducer";
import BookmarksButton from "./components/BookmarksButton";
import Title from "./components/Title";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));

  return (
    <AppBar color="default" position="fixed">
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
        <Title />
        <SearchButton />
        <BookmarksButton />
        <TocButton />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
