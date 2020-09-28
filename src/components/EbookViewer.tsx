import React from "react";
import Epub, { Rendition, Book, NavItem } from "epubjs";
import { BookContent } from "../models";

interface IProps {
  ebook: string | ArrayBuffer;
  location: string;
  setContents: (contents: BookContent[]) => void;
}

const EbookViewer: React.FC<IProps> = (props) => {
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const { ebook, setContents, location } = props;
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (location) {
      rendition?.display(location);
    }
  }, [location, rendition]);

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
      // else go to next page
      if (clickLocation < third) {
        rendition.prev();
      } else if (clickLocation >= third) {
        rendition.next();
      }
    });
  }, [rendition]);

  const stableSetContents = React.useCallback(setContents, []);
  React.useEffect(() => {
    if (book.current) {
      book.current.destroy();
    }
    if (!ebook) {
      return;
    }
    const newBook = Epub();
    if (ebook instanceof ArrayBuffer) {
      newBook.open(ebook, "binary");
    } else {
      newBook.open(ebook);
    }

    const viewer = containerRef?.current;
    if (viewer) {
      const rend = newBook.renderTo(viewer, {
        width: "100%",
        height: "100vh",
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
      stableSetContents(contents);
    });
    book.current = newBook;
  }, [ebook, stableSetContents]);
  return <div ref={containerRef}></div>;
};

export default EbookViewer;
