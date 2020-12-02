import {
  Button,
  Drawer,
  makeStyles,
  createStyles,
  Theme
  } from "@material-ui/core";
import React from "react";
import TableOfContents from "./TableOfContents";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBook } from "../reducers/ebookReducer";
import { BookSourceType } from "../models";
import { setNavigationOpen } from "../reducers/uiReducer";
import { RootState } from "../rootReducer";
import { AppDispatch } from "../store";

const proxy = "http://localhost:36325/";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    drawerPaper: {
      width: drawerWidth,
    },
  }),
);

const openFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = res => {
      resolve(res.target?.result as string);
    }
    reader.onerror = err => reject(err);
    reader.readAsBinaryString(file);
  });
};

const NavigationMenu: React.FC = () => {
  const classes  = useStyles();
  const [inputUrl, setInputUrl] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigationOpen = useSelector((state: RootState) => state.ui.navigationOpen);

  const onClose = ()=> dispatch(setNavigationOpen(false));

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes("application/epub+zip")) {
        const bookData = await openFile(file);
        if (bookData) {
          dispatch(setBook({
            bookSource: bookData,
            bookSourceType: BookSourceType.Binary
          }));
        }
      } else {
        alert("Unsupported type");
      }
    }
    dispatch(setNavigationOpen(false));
  };

  const setDataUrl = (response: Response, url: string) => {
    const mimeType = response.headers.get("Content-Type");
    console.log(mimeType);
    if (mimeType?.includes("application/epub+zip")) {
      dispatch(setBook({
        bookSource: url,
        bookSourceType: BookSourceType.Url
      }));
      dispatch(setNavigationOpen(false));
    } else {
      alert("Unsupported type");
    }
  };

  const onUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Fetch head and check mime type
    fetch(inputUrl, { method: "HEAD" })
      .then((data) => {
        setDataUrl(data, inputUrl);
      })
      .catch(() => {
        // Determine if error is because of cors
        const noProtocol = inputUrl.replace(/(^\w+:|^)\/\//, "");
        const proxyUrl = `${proxy}${noProtocol}`;
        fetch(proxyUrl, { method: "HEAD" })
          .then((data) => {
            setDataUrl(data, proxyUrl);
          })
          .catch(() => {
            alert("Could not get file");
          });
      });
  };

  const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="temporary"
      anchor="left"
      open={navigationOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
      onClose={onClose}
    >
      <Button variant="contained" component="label">
        Open File
        <input type="file" onChange={onFileChange} hidden />
      </Button>
      <form onSubmit={onUrlSubmit}>
        <input type="text" value={inputUrl} onChange={onInputUrlChange} />
        <input type="submit" value="submit" />
      </form>
      <Link to="/">Home</Link>
      <Link to="/plugins">Plugins</Link>
      <TableOfContents />
    </Drawer>
  );
}

export default NavigationMenu;