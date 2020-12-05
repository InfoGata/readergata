import React from "react";
import Epub, { Rendition, Book, NavItem } from "epubjs";
import { BookContent, BookSourceType } from "../models";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../rootReducer";
import { setContents, setTitle } from "../reducers/ebookReducer";
import { AppDispatch } from "../store";

const isCorrectMimeType = (response: Response): boolean => {
  const mimeType = response.headers.get("Content-Type");
  if (mimeType?.includes("application/epub+zip")) {
    return true;
  } else {
    return false;
  }
};

const proxy = "http://localhost:36325/";

const getValidUrl = async (url: string) => {
  try {
    // Fetch and check the mime type
    const response = await fetch(url, { method: "HEAD" });
    return isCorrectMimeType(response) ? url : null;
  } catch {
    // Determine if error is because of cors
    const noProtocol = url.replace(/(^\w+:|^)\/\//, "");
    const proxyUrl = `${proxy}${noProtocol}`;
    try {
      const response = await fetch(proxyUrl, { method: "HEAD" });
      return isCorrectMimeType(response) ? proxyUrl : null;
    } catch {
      alert("Could not get file");
    }
  }
  return null;
}

const EbookViewer: React.FC = () => {
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ebook = useSelector((state: RootState) => state.ebook.currentBook);
  const location = useSelector((state: RootState) => state.ebook.location);
  const dispatch = useDispatch<AppDispatch>();

  const onKeyUp = React.useCallback((event: KeyboardEvent) => {
    const key = event.key;
    if (key === "ArrowLeft") {
      rendition?.prev();
    } else if (key === "ArrowRight") {
      rendition?.next();
    }
  }, [rendition]);

  React.useEffect(() => {
    document.body.addEventListener("keyup", onKeyUp);
  }, [onKeyUp]);

  React.useEffect(() => {
    rendition?.on("keyup", onKeyUp)
  }, [rendition, onKeyUp]);

  React.useEffect(() => {
    if (location) {
      rendition?.display(location);
    }
  }, [location, rendition]);

  React.useEffect(() => {
    rendition?.on("click", (e: MouseEvent) => {
      const clickLocation = e.pageX;
      const third = (containerRef.current?.offsetWidth || 0) / 3;
      // If click is on first third of page go to previous page
      // else go to next page
      if (clickLocation < third) {
        rendition.prev();
      } else if (clickLocation >= third) {
        rendition.next();
      }
    });
  }, [rendition]);

  React.useEffect(() => {
    const loadEbook = async () => {
      if (book.current) {
        book.current.destroy();
      }
      if (!ebook) {
        return;
      }
      const newBook = Epub();
      if (ebook.bookSourceType === BookSourceType.Binary) {
        newBook.open(ebook.bookSource, "binary");
      } else {
        // Url
        const validUrl = await getValidUrl(ebook.bookSource);
        if (validUrl) {
          newBook.open(validUrl);
        } else {
          return;
        }
      }

      const viewer = containerRef?.current;
      if (viewer) {
        const rend = newBook.renderTo(viewer, {
          width: "100vw",
          height: "90vh",
        });
        rend.display();
        setRendition(rend);
      }
      newBook.loaded.navigation.then((navigation) => {
        const navItemToContent = (items: NavItem[]): BookContent[] => {
          if (items.length === 0) return [];

          return items.map((t) => ({
            title: t.label,
            location: t.href,
            items: navItemToContent(t.subitems || []),
          }));
        };
        const contents = navItemToContent(navigation.toc);
        dispatch(setContents(contents));
      });
      newBook.loaded.metadata.then((metadata) => {
        dispatch(setTitle(metadata.title));
      });

      book.current = newBook;
    };
    loadEbook();
  }, [ebook, dispatch]);
  return <div ref={containerRef}></div>;
};

export default EbookViewer;
