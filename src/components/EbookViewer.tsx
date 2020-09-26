import React from "react";
import Epub, { Rendition, Book } from "epubjs";

interface IProps {
  ebook: string | ArrayBuffer;
}

const EbookViewer: React.FC<IProps> = (props) => {
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const { ebook } = props;
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

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

  React.useEffect(() => {
    if (book.current) {
      book.current.destroy();
    }
    if (!ebook) {
      return;
    }
    book.current = Epub();
    if (ebook instanceof ArrayBuffer) {
      book.current.open(ebook, "binary");
    } else {
      book.current.open(ebook);
    }

    const viewer = containerRef?.current;
    if (viewer) {
      const rend = book.current.renderTo(viewer, {
        width: "100%",
        height: "100vh",
      });
      rend.display();
      setRendition(rend);
    }
  }, [ebook]);
  return <div ref={containerRef}></div>;
};

export default EbookViewer;
