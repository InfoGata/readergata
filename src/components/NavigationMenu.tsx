import {
  Button,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { setBook } from "../store/reducers/documentReducer";
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
  Info,
  LibraryBooks,
  MenuBook,
  Settings,
} from "@mui/icons-material";
import { BookSourceType, PdfSourceType } from "../types";
import { useTranslation } from "react-i18next";
import { setPdf } from "../store/reducers/documentReducer";
import OpenFileButton from "./OpenFileButton";

const drawerWidth = 240;

const NavigationMenu: React.FC = () => {
  const [inputUrl, setInputUrl] = React.useState("");
  const dispatch = useAppDispatch();
  const [urlType, setUrlType] = React.useState("epub");
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onClose = () => dispatch(setNavigationOpen(false));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputUrl) {
      if (urlType === "epub") {
        dispatch(
          setBook({
            source: inputUrl,
            sourceType: BookSourceType.Url,
          })
        );
      } else if (urlType === "pdf") {
        dispatch(setPdf({ source: inputUrl, sourceType: PdfSourceType.Url }));
      }
      navigate("/viewer");
    }
  };

  const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
    try {
      const url = new URL(value);
      const ext = url.pathname.split(".").pop();
      switch (ext) {
        case "epub":
          setUrlType("epub");
          break;
        case "pdf":
          setUrlType("pdf");
          break;
      }
    } catch {}
  };

  const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlType((event.target as HTMLInputElement).value);
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
      <form onSubmit={onUrlSubmit}>
        <FormControl>
          <TextField
            value={inputUrl}
            onChange={onInputUrlChange}
            placeholder="URL"
            name="url"
          />
          <RadioGroup
            row
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={urlType}
            onChange={onRadioChange}
          >
            <FormControlLabel value="epub" control={<Radio />} label="Epub" />
            <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
          </RadioGroup>
        </FormControl>
        <Button variant="contained" type="submit">
          {t("submit")}
        </Button>
      </form>
    </Drawer>
  );
};

export default NavigationMenu;
