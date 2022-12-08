import React from "react";
import Epub, { Rendition, Book, NavItem } from "epubjs";
import { setContents, setTitle } from "../store/reducers/ebookReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { BookContent, BookSourceType } from "../types";

const isCorrectMimeType = (response: Response): boolean => {
  const mimeType = response.headers.get("Content-Type");

  if (!mimeType) {
    // If no content type, just return true
    return true;
  } else if (mimeType.includes("application/epub+zip")) {
    return true;
  } else {
    return false;
  }
};

const proxy =
  process.env.NODE_ENV === "production"
    ? "https://cloudcors.audio-pwa.workers.dev?url="
    : "http://localhost:36325/";

const getValidUrl = async (url: string) => {
  try {
    // Fetch and check the mime type
    const response = await fetch(url, { method: "HEAD" });
    if (response.status === 404) {
      // HEAD will sometimes return 404
      // But GET returns successfully
      return url;
    }
    return isCorrectMimeType(response) ? url : null;
  } catch {
    // Determine if error is because of cors
    const noProtocol = url.replace(/(^\w+:|^)\/\//, "");
    const proxyUrl = `${proxy}${noProtocol}`;
    try {
      const response = await fetch(proxyUrl, { method: "HEAD" });
      if (response.status === 404) {
        // HEAD will sometimes return 404
        // But GET returns successfully
        return proxyUrl;
      }
      return isCorrectMimeType(response) ? proxyUrl : null;
    } catch {
      alert("Could not get file");
    }
  }
  return null;
};

const EbookViewer: React.FC = () => {
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ebook = useAppSelector((state) => state.ebook.currentBook);
  const location = useAppSelector((state) => state.ebook.location);
  const dispatch = useAppDispatch();

  const onKeyUp = React.useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "ArrowLeft") {
        rendition?.prev();
      } else if (key === "ArrowRight") {
        rendition?.next();
      }
    },
    [rendition]
  );

  React.useEffect(() => {
    document.body.addEventListener("keyup", onKeyUp);
  }, [onKeyUp]);

  React.useEffect(() => {
    rendition?.on("keyup", onKeyUp);
  }, [rendition, onKeyUp]);

  React.useEffect(() => {
    if (location) {
      rendition?.display(location);
    }
  }, [location, rendition]);

  React.useEffect(() => {
    rendition?.on("click", (e: MouseEvent) => {
      const clickLocation = e.screenX;
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
      if (ebook.sourceType === BookSourceType.Binary) {
        newBook.open(ebook.source, "binary");
      } else {
        // Url
        const validUrl = await getValidUrl(ebook.source);
        if (validUrl) {
          const test = await fetch(validUrl);
          if (test.status !== 404) {
            const arrayBuffer = await test.arrayBuffer();
            newBook.open(arrayBuffer);
          } else {
            return;
          }
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
