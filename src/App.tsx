import React from "react";
import { AppBar, Toolbar, CssBaseline, Slide } from "@material-ui/core";
import Epub, { Rendition, Book } from "epubjs";

const DEMO_URL =
  "https://gerhardsletten.github.io/react-reader/files/alice.epub";

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(true);
  const [url, setUrl] = React.useState<string | ArrayBuffer>(DEMO_URL);
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const book = React.useRef<Book>();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  React.useEffect(() => {
    if (book.current) {
      book.current.destroy();
    }
    book.current = Epub();
    if (url instanceof ArrayBuffer) {
      book.current.open(url, "binary");
    } else {
      book.current.open(url);
    }
    console.log(url);

    const viewer = containerRef?.current;
    if (viewer) {
      const rend = book.current.renderTo(viewer, {
        width: "100%",
        height: "100vh",
      });
      rend.display();
      setRendition(rend);
    }
  }, [url]);

  React.useEffect(() => {
    rendition?.on("keyup", (e: KeyboardEvent) => {
      if ((e.keyCode || e.which) === 37) {
        rendition.prev();
      }

      // Right Key
      if ((e.keyCode || e.which) === 39) {
        rendition.next();
      }
    });
    rendition?.on("click", (e: MouseEvent) => {
      const clickLocation = e.pageX;
      const third = (containerRef.current?.offsetWidth || 0) / 3;
      // If click is on first third of page go to previous page
      // If last third go to next page
      if (clickLocation < third) {
        rendition.prev();
      } else if (clickLocation > third * 2) {
        rendition.next();
      }
    });
  }, [rendition]);

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
      if (file.type !== "application/epub+zip") {
        return alert("Unsupported type");
      }
      const bookData = await file.arrayBuffer();
      setUrl(bookData);
    }
  };

  return (
    <>
      <CssBaseline />
      <div style={{ position: "relative", height: "100vh" }}>
        <Slide direction="down" in={menuOpen}>
          <AppBar position="fixed" hidden={!menuOpen}>
            <Toolbar>
              <input type="file" onChange={onFileChange} />
            </Toolbar>
          </AppBar>
        </Slide>
        <div ref={containerRef}></div>
      </div>
    </>
  );
};

export default App;
