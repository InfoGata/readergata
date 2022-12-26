import {
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { setBook } from "../store/reducers/ebookReducer";
import {
  setIsFullscreen,
  setNavigationOpen,
} from "../store/reducers/uiReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  Extension,
  Fullscreen,
  FullscreenExit,
  Home,
} from "@mui/icons-material";
import { BookSourceType } from "../types";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const openFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(res.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

const NavigationMenu: React.FC = () => {
  const [inputUrl, setInputUrl] = React.useState("");
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onClose = () => dispatch(setNavigationOpen(false));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { t } = useTranslation();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes("application/epub+zip")) {
        const bookData = await openFile(file);
        if (bookData) {
          dispatch(
            setBook({
              source: bookData,
              sourceType: BookSourceType.Binary,
            })
          );
        }
      } else {
        alert("Unsupported type");
      }
    }
    dispatch(setNavigationOpen(false));
  };

  const onUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputUrl) {
      dispatch(
        setBook({
          source: inputUrl,
          sourceType: BookSourceType.Url,
        })
      );
    }
  };

  const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={navigationOpen}
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
      onClose={onClose}
    >
      <List>
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
          <ListItemButton component={Link} to="/plugins">
            <Tooltip title={t("plugins")} placement="right">
              <ListItemIcon>
                <Extension />
              </ListItemIcon>
            </Tooltip>
            <ListItemText>{t("plugins")}</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <Button variant="contained" component="label">
        {t("openFile")}
        <input type="file" onChange={onFileChange} hidden />
      </Button>
      <IconButton onClick={() => dispatch(setIsFullscreen(!isFullscreen))}>
        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
      <form onSubmit={onUrlSubmit}>
        <TextField
          value={inputUrl}
          onChange={onInputUrlChange}
          placeholder="Epub url"
          name="url"
        />
        <Button variant="contained" type="submit">
          {t("submit")}
        </Button>
      </form>
    </Drawer>
  );
};

export default NavigationMenu;
