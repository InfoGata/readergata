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
  LibraryBooks,
} from "@mui/icons-material";
import { BookSourceType, PdfSourceType } from "../types";
import { useTranslation } from "react-i18next";
import { setPdf } from "../store/reducers/pdfReducer";

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
  const [urlType, setUrlType] = React.useState("epub");
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onClose = () => dispatch(setNavigationOpen(false));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setBook(undefined);
      setPdf(undefined);
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
      } else if (file.type.includes("application/pdf")) {
        const pdfData = await openFile(file);
        dispatch(setPdf({ source: pdfData, sourceType: PdfSourceType.Binary }));
      } else {
        alert("Unsupported type");
      }
    }
    dispatch(setNavigationOpen(false));
    navigate("/viewer");
  };

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
      </List>
      <Button variant="contained" component="label">
        {t("openFile")}
        <input
          type="file"
          onChange={onFileChange}
          hidden
          accept="application/pdf,application/epub+zip"
        />
      </Button>
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
