import React from "react";
import {
  AppBar,
  Toolbar,
  CssBaseline,
  Slide,
  Menu,
  MenuItem,
  makeStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import EbookViewer from "./components/EbookViewer";
import PdfViewer from "./components/PdfViewer";
import "./App.css";
import { BookContent } from "./models";

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
  const [menuOpen, setMenuOpen] = React.useState(true);
  const [ebook, setEbook] = React.useState<string | ArrayBuffer>("");
  const [inputUrl, setInputUrl] = React.useState("");
  const [pdf, setPdf] = React.useState<string | ArrayBuffer>("");
  const [useEbook, setUseEbook] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const gotoMenuOpen = Boolean(anchorEl);
  const [bookContents, setBookContents] = React.useState<BookContent[]>([]);
  const [bookLocation, setBookLocation] = React.useState("");
  const closeMenu = () => {
    setMenuOpen(false);
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", (event: MouseEvent) => {
      if (event.pageY < 65) {
        setMenuOpen(true);
      } else {
        closeMenu();
      }
    });
  }, []);

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
    <>
      <CssBaseline />
      <Slide direction="down" in={menuOpen}>
        <AppBar position="fixed" hidden={!menuOpen}>
          <Toolbar>
            <input type="file" onChange={onFileChange} />
            <form onSubmit={onUrlSubmit}>
              <input type="text" value={inputUrl} onChange={onInputUrlChange} />
              <input type="submit" value="submit" />
            </form>
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
      </Slide>
      <div style={{ position: "relative", height: "100vh" }}>{reader}</div>
    </>
  );
};

export default App;
