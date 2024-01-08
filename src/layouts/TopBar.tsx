import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import BookmarksButton from "./BookmarksButton";
import SearchButton from "./SearchButton";
import Title from "./Title";
import TocButton from "./TocButton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setNavigationOpen } from "../store/reducers/uiReducer";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));
  const location = useLocation();

  return (
    <AppBar color="default" position="fixed" sx={{ zIndex: 40 }}>
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
        {location.pathname === "/viewer" ? (
          <>
            <Title />
            <SearchButton />
            <BookmarksButton />
            <TocButton />
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
