import React from "react";
import { AppBar, Toolbar, CssBaseline, Slide } from "@material-ui/core";
import EbookViewer from "./components/EbookViewer";
import PdfViewer from "./components/PdfViewer";

const proxy = "http://localhost:8080/";
const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(true);
  const [ebook, setEbook] = React.useState<string | ArrayBuffer>("");
  const [inputUrl, setInputUrl] = React.useState("");
  const [pdf, setPdf] = React.useState<string | ArrayBuffer>("");
  const [useEbook, setUseEbook] = React.useState(false);

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
      if (file.type === "application/epub+zip") {
        const bookData = await file.arrayBuffer();
        setUseEbook(true);
        setEbook(bookData);
      } else if (file.type === "application/pdf") {
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
    if (mimeType === "application/epub+zip") {
      setUseEbook(true);
      setEbook(url);
    } else if (mimeType === "application/pdf") {
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

  const reader = useEbook ? (
    <EbookViewer ebook={ebook} />
  ) : (
    <PdfViewer pdf={pdf} />
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
          </Toolbar>
        </AppBar>
      </Slide>
      <div style={{ position: "relative", height: "100vh" }}>{reader}</div>
    </>
  );
};

export default App;
