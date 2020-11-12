import React from "react";
import {
  CssBaseline,
  ListItemText,
  makeStyles,
  createStyles,
  Theme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  ListItem,
  List,
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import EbookViewer from "./components/EbookViewer";
import Plugins from "./components/Plugins";
import "./App.css";
import { BookContent } from "./models";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const proxy = "http://localhost:8080/";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    nested: {
      paddingLeft: theme.spacing(3),
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

interface TocItemProps {
  content: BookContent;
  setLocation: (location: string) => void;
  isNested: boolean;
}

const TocItem: React.FC<TocItemProps> = (props) => {
  const classes = useStyles();
  const { content, isNested, setLocation } = props;
  const onClick = () => {
    if (content.location) {
      setLocation(content.location);
    }
  };
  return (
    <ListItem button={true} onClick={onClick} className={isNested ? classes.nested : ""}>
      <ListItemText primary={content.title} />
    </ListItem>
  );
};

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
        // setUseEbook(true);
        setEbook(bookData);
      } else if (file.type.includes("application/pdf")) {
        // const pdfData = await file.arrayBuffer();
        // setUseEbook(false);
        // setPdf(pdfData);
      } else {
        alert("Unsupported type");
      }
    }
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
  };

  const getBookContents = (
    contents: BookContent[],
    isNested = false
  ): JSX.Element[] => {
    if (contents.length === 0) {
      return [];
    }

    return contents.flatMap((c) => [
      <TocItem
        key={c.title}
        content={c}
        setLocation={setLocation}
        isNested={isNested}
      />,
      ...getBookContents(c.items, true),
    ]);
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
          <input type="file" onChange={onFileChange} />
          <form onSubmit={onUrlSubmit}>
            <input type="text" value={inputUrl} onChange={onInputUrlChange} />
            <input type="submit" value="submit" />
          </form>
      <Link to="/">Home</Link>
      <Link to="/plugins">Plugins</Link>
          <List>
            {getBookContents(bookContents)}
          </List>
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
