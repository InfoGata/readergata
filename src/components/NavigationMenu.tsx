import {
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { setBook } from "../store/reducers/ebookReducer";
import { BookSourceType } from "../models";
import {
  setIsFullscreen,
  setNavigationOpen,
} from "../store/reducers/uiReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Extension, Home } from "@mui/icons-material";

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
  // const [inputUrl, setInputUrl] = React.useState("");
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onClose = () => dispatch(setNavigationOpen(false));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes("application/epub+zip")) {
        const bookData = await openFile(file);
        if (bookData) {
          dispatch(
            setBook({
              bookSource: bookData,
              bookSourceType: BookSourceType.Binary,
            })
          );
        }
      } else {
        alert("Unsupported type");
      }
    }
    dispatch(setNavigationOpen(false));
  };

  // const onUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (inputUrl) {
  //     dispatch(setBook({
  //       bookSource: inputUrl,
  //       bookSourceType: BookSourceType.Url
  //     }));
  //   }
  // };

  // const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setInputUrl(value);
  // };

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
      <Button variant="contained" component="label">
        Open File
        <input type="file" onChange={onFileChange} hidden />
      </Button>
      {/*<form onSubmit={onUrlSubmit}>
        <input type="text" value={inputUrl} onChange={onInputUrlChange} />
        <input type="submit" value="submit" />
      </form> */}
      <button onClick={() => dispatch(setIsFullscreen(!isFullscreen))}>
        Toggle Full Screen
      </button>
      <List>
        <ListItem button={true} component={Link} to="/" key="Home">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText>Home</ListItemText>
        </ListItem>
        <ListItem button={true} component={Link} to="/plugins" key="Plugins">
          <ListItemIcon>
            <Extension />
          </ListItemIcon>
          <ListItemText>Plugins</ListItemText>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default NavigationMenu;
