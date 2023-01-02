import React from "react";
import Epub, { Rendition, Book, NavItem } from "epubjs";
import { setContents, setTitle } from "../store/reducers/ebookReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { BookContent, BookSourceType } from "../types";
import { getValidUrl } from "../utils";
import { Box, Button } from "@mui/material";
import { NavigateBefore, NavigateNext } from "@mui/icons-material";

const EbookViewer: React.FC = () => {
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ebook = useAppSelector((state) => state.ebook.currentBook);
  const location = useAppSelector((state) => state.ebook.location);
  const dispatch = useAppDispatch();

  const onNext = React.useCallback(() => {
    rendition?.next();
  }, [rendition]);

  const onPrev = React.useCallback(() => {
    rendition?.prev();
  }, [rendition]);

  const onKeyUp = React.useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "ArrowLeft") {
        onPrev();
      } else if (key === "ArrowRight") {
        onNext();
      }
    },
    [onPrev, onNext]
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
        const validUrl = await getValidUrl(
          ebook.source,
          "application/epub+zip"
        );
        if (validUrl) {
          const test = await fetch(validUrl);
          if (test.status !== 404) {
            const arrayBuffer = await test.arrayBuffer();
            await newBook.open(arrayBuffer);
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
    <Box display="flex" justifyContent="center" alignItems="center">
      <Button
        variant="outlined"
        startIcon={<NavigateBefore />}
        onClick={onPrev}
        sx={{ position: "fixed", left: 0, zIndex: 5, height: "100%" }}
      ></Button>

      <div ref={containerRef}></div>
      <Button
        onClick={onNext}
        sx={{ position: "fixed", right: 0, zIndex: 5, height: "100%" }}
        variant="outlined"
        endIcon={<NavigateNext />}
      ></Button>
    </Box>
  );
};

export default EbookViewer;
