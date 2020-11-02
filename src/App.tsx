import React from "react";
import {
  AppBar,
  Toolbar,
  CssBaseline,
  Menu,
  MenuItem,
  makeStyles,
  createStyles,
  Theme,
  Container,
  Box,
} from "@material-ui/core";
import EbookViewer from "./components/EbookViewer";
import PdfViewer from "./components/PdfViewer";
import Plugins from "./components/Plugins";
import "./App.css";
import { BookContent } from "./models";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const proxy = "http://localhost:8080/";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(3),
    },
  })
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
    <MenuItem onClick={onClick} className={isNested ? classes.nested : ""}>
      {content.title}
    </MenuItem>
  );
};

const App: React.FC = () => {
  const [ebook, setEbook] = React.useState<string | ArrayBuffer>("");
  const [inputUrl, setInputUrl] = React.useState("");
  const [pdf, setPdf] = React.useState<string | ArrayBuffer>("");
  const [useEbook, setUseEbook] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const gotoMenuOpen = Boolean(anchorEl);
  const [bookContents, setBookContents] = React.useState<BookContent[]>([]);
  const [bookLocation, setBookLocation] = React.useState("");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes("application/epub+zip")) {
        const bookData = await file.arrayBuffer();
        setUseEbook(true);
        setEbook(bookData);
      } else if (file.type.includes("application/pdf")) {
        const pdfData = await file.arrayBuffer();
        setUseEbook(false);
        setPdf(pdfData);
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
      setUseEbook(true);
      setEbook(url);
    } else if (mimeType?.includes("application/pdf")) {
      setUseEbook(false);
      setPdf(url);
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

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const setLocation = (location: string) => {
    setBookLocation(location);
    setAnchorEl(null);
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

  const reader = useEbook ? (
    <EbookViewer
      location={bookLocation}
      setContents={setContents}
      ebook={ebook}
    />
  ) : (
    <PdfViewer location={bookLocation} setContents={setContents} pdf={pdf} />
  );

  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <input type="file" onChange={onFileChange} />
          <form onSubmit={onUrlSubmit}>
            <input type="text" value={inputUrl} onChange={onInputUrlChange} />
            <input type="submit" value="submit" />
          </form>
          <Link to="/">Home</Link>
          <Link to="/plugins">Plugins</Link>
          {bookContents.length > 0 && (
            <div>
              <button onClick={handleMenu}>Go To</button>
              <Menu
                open={gotoMenuOpen}
                onClose={handleClose}
                anchorEl={anchorEl}
              >
                {getBookContents(bookContents)}
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Box my={8}>
          <Switch>
            <Route exact path="/">
              <div style={{ position: "relative", height: "100vh" }}>
                {reader}
              </div>
            </Route>
            <Route path="/plugins">
              <Plugins />
            </Route>
          </Switch>
        </Box>
      </Container>
    </Router>
  );
};

export default App;
