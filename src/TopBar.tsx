import { AppBar, Grid, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setNavigationOpen, setTocOpen } from "./store/reducers/uiReducer";
import { Toc } from "@mui/icons-material";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const title = useAppSelector((state) => state.ebook.title);
  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));
  const onTocToggle = () => dispatch(setTocOpen(!tocOpen));

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
  );
};

export default TopBar;
