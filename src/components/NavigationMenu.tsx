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
import { Drawer, IconButton, List } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setIsFullscreen,
  setNavigationOpen,
} from "../store/reducers/uiReducer";
import { NavigationLinkItem } from "../types";
import { drawerWidth } from "../utils";
import NavigationLink from "./NavigationLink";
import OpenFileButton from "./OpenFileButton";
import OpenUrlForm from "./OpenUrlForm";

const NavigationMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onClose = () => dispatch(setNavigationOpen(false));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { t } = useTranslation();

  const listItems: NavigationLinkItem[] = [
    { title: t("home"), link: "/", icon: <Home /> },
    { title: t("reader"), link: "/viewer", icon: <MenuBook /> },
    { title: t("plugins"), link: "/plugins", icon: <Extension /> },
    { title: t("library"), link: "/library", icon: <LibraryBooks /> },
    { title: t("settings"), link: "/settings", icon: <Settings /> },
    { title: t("about"), link: "/about", icon: <Info /> },
  ];

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
        {listItems.map((l) => (
          <NavigationLink key={l.title} item={l} />
        ))}
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
