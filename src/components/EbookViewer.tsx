import React from "react";
import Epub, { Rendition, Book, NavItem } from "epubjs";
import { BookContent, BookSourceType } from "../models";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../rootReducer";
import { setContents, setTitle } from "../reducers/ebookReducer";
import { AppDispatch } from "../store";

const EbookViewer: React.FC = () => {
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ebook = useSelector((state: RootState) => state.ebook.currentBook);
  const location = useSelector((state: RootState) => state.ebook.location);
  const dispatch = useDispatch<AppDispatch>();

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
      newBook.open(ebook.bookSource);
    }

    const viewer = containerRef?.current;
    if (viewer) {
      const rend = newBook.renderTo(viewer, {
        width: "100vw",
        height: "80vh",
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
  }, [ebook, dispatch]);
  return <div ref={containerRef}></div>;
};

export default EbookViewer;
