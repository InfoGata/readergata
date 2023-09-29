import {
  Extension,
  Fullscreen,
  FullscreenExit,
  Home,
  Info,
  LibraryBooks,
  MenuBook,
  Settings,
} from "@mui/icons-material";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OpenUrlForm from "./OpenUrlForm";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setIsFullscreen,
  setNavigationOpen,
} from "../store/reducers/uiReducer";
import { drawerWidth } from "../utils";
import OpenFileButton from "./OpenFileButton";

const NavigationMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onClose = () => dispatch(setNavigationOpen(false));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { t } = useTranslation();

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={navigationOpen}
      sx={{
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
      onClose={onClose}
    >
      <List onClick={onClose}>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <Tooltip title={t("home")} placement="right">
                <Home />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>{t("home")}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/viewer">
            <ListItemIcon>
              <Tooltip title={t("reader")} placement="right">
                <MenuBook />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>{t("reader")}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/plugins">
            <Tooltip title={t("plugins")} placement="right">
              <ListItemIcon>
                <Extension />
              </ListItemIcon>
            </Tooltip>
            <ListItemText>{t("plugins")}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/library">
            <Tooltip title={t("library")} placement="right">
              <ListItemIcon>
                <LibraryBooks />
              </ListItemIcon>
            </Tooltip>
            <ListItemText>{t("library")}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/settings">
            <Tooltip title={t("settings")} placement="right">
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
            </Tooltip>
            <ListItemText>{t("settings")}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/about">
            <Tooltip title={t("about")} placement="right">
              <ListItemIcon>
                <Info />
              </ListItemIcon>
            </Tooltip>
            <ListItemText>{t("about")}</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <OpenFileButton />
      <IconButton onClick={() => dispatch(setIsFullscreen(!isFullscreen))}>
        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
      <OpenUrlForm />
    </Drawer>
  );
};

export default NavigationMenu;
