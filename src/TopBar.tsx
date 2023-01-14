import { AppBar, Grid, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setNavigationOpen } from "./store/reducers/uiReducer";
import SearchButton from "./components/SearchButton";
import TocButton from "./components/TocButton";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const title = useAppSelector((state) => state.ui.title);
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
        <Grid container justifyContent="center">
          <Typography variant="subtitle1" noWrap>
            {title}
          </Typography>
        </Grid>
        <SearchButton />
        <TocButton />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
