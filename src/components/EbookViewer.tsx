import React from "react";
import Epub, { Rendition, Book, NavItem } from "epubjs";
import { setContents, setTitle } from "../store/reducers/ebookReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { BookContent, BookSourceType } from "../types";
import { Backdrop, CircularProgress } from "@mui/material";
import { getValidUrl } from "../utils";

const EbookViewer: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
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

      setIsLoading(true);
      const newBook = Epub();
      if (ebook.sourceType === BookSourceType.Binary) {
        newBook.open(ebook.source, "binary");
      } else {
        // Url
        const validUrl = await getValidUrl(
          ebook.source,
          "application/epub+zip"
        );
        if (validUrl) {
          const test = await fetch(validUrl);
          if (test.status !== 404) {
            const arrayBuffer = await test.arrayBuffer();
            await newBook.open(arrayBuffer);
            setIsLoading(false);
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
  return (
    <>
      <Backdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div ref={containerRef}></div>
    </>
  );
};

export default EbookViewer;
