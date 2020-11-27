import React from "react";
import {
  CssBaseline,
  makeStyles,
  createStyles,
  Theme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Button,
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import EbookViewer from "./components/EbookViewer";
import Plugins from "./components/Plugins";
import "./App.css";
import { BookContent } from "./models";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import TableOfContents from "./components/TableOfContents";

const proxy = "http://localhost:36325/";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
    },
  }),
);


const App: React.FC = () => {
  const [ebook, setEbook] = React.useState<string | ArrayBuffer>("");
  const [inputUrl, setInputUrl] = React.useState("");
  const [bookContents, setBookContents] = React.useState<BookContent[]>([]);
  const [bookLocation, setBookLocation] = React.useState("");
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes("application/epub+zip")) {
        const bookData = await file.arrayBuffer();
        setEbook(bookData);
      } else {
        alert("Unsupported type");
      }
    }
    setDrawerOpen(false);
  };

  const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
  };

  const setDataUrl = (response: Response, url: string) => {
    const mimeType = response.headers.get("Content-Type");
    console.log(mimeType);
    if (mimeType?.includes("application/epub+zip")) {
      setEbook(url);
      setDrawerOpen(false);
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

  const setLocation = (location: string) => {
    setBookLocation(location);
    setDrawerOpen(false);
  };

  const setContents = (bookContents: BookContent[]) => {
    setBookContents(bookContents);
  };

  const onDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar color="transparent" position="fixed" variant="outlined">
          <Toolbar variant="dense">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              className={classes.menuButton}
              size="small"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Responsive drawer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          classes={{
            paper: classes.drawerPaper,
          }}
          onClose={onDrawerToggle}
        >
          <Button variant="contained" component="label">
            Open File
            <input type="file" onChange={onFileChange} hidden/>
          </Button>
          <form onSubmit={onUrlSubmit}>
            <input type="text" value={inputUrl} onChange={onInputUrlChange} />
            <input type="submit" value="submit" />
          </form>
          <Link to="/">Home</Link>
          <Link to="/plugins">Plugins</Link>
          <TableOfContents
            setLocation={setLocation}
            bookContents={bookContents}
          />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/">
              <EbookViewer
                location={bookLocation}
                setContents={setContents}
                ebook={ebook}
              />
            </Route>
            <Route path="/plugins">
              <Plugins />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;
