import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import Epub, { Book, EpubCFI, Location, NavItem, Rendition } from "epubjs";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearBookData,
  setCurrentChapter,
  setCurrentSearchResult,
  setSearchResults,
  setTitle,
  setToc,
} from "../store/reducers/uiReducer";
import {
  BookContent,
  EBook,
  PublicationSourceType,
  SearchResult,
} from "../types";
import { getValidUrl } from "../utils";
// eslint-disable-next-line import/no-unresolved
import Section from "epubjs/types/section";
import { setCurrentLocation } from "../store/reducers/documentReducer";

// https://github.com/johnfactotum/foliate/blob/b6b9f6a5315446aebcfee18c07641b7bcf3a43d0/src/web/utils.js#L54
const resolveURL = (url: string, relativeTo: string) => {
  const baseUrl = "https://example.com/";
  return new URL(url, baseUrl + relativeTo).href.replace(baseUrl, "");
};

const navItemToContent = (book: Book, items: NavItem[]): BookContent[] => {
  if (items.length === 0) return [];
  const path = book.packaging.navPath || book.packaging.ncxPath;

  return items.map((t) => ({
    title: t.label,
    location: resolveURL(t.href, path),
    items: navItemToContent(book, t.subitems || []),
  }));
};

const openBook = async (ebook: EBook): Promise<Book | undefined> => {
  const newBook = Epub();
  try {
    if (ebook.sourceType === PublicationSourceType.Binary) {
      newBook.open(ebook.source, "binary");
      return newBook;
    } else {
      const validUrl = await getValidUrl(ebook.source, "application/epub+zip");
      if (validUrl) {
        const test = await fetch(validUrl);
        if (test.status !== 404) {
          const arrayBuffer = await test.arrayBuffer();
          await newBook.open(arrayBuffer);
          return newBook;
        }
      }
    }
  } catch {}
};

const findInSection = async (book: Book, q: string, section: Section) => {
  await section.load(book.load.bind(book));
  const results = await section.search(q);
  section.unload();
  return results;
};

const search = async (book: Book, query: string) => {
  const arr = await Promise.all(
    book.spine.spineItems.map((section) => findInSection(book, query, section))
  );
  const results = arr.reduce((a, b) => a.concat(b), []);
  return results;
};

// https://github.com/futurepress/epub.js/issues/759#issuecomment-1399499918
function flatten(chapters: any) {
  return [].concat.apply(
    [],
    chapters.map((chapter: NavItem) =>
      [].concat.apply([chapter], flatten(chapter.subitems))
    )
  );
}

export function getCfiFromHref(book: Book, href: string) {
  const [_, id] = href.split("#");
  const section = book.spine.get(href);
  const el = (
    id ? section.document.getElementById(id) : section.document.body
  ) as Element;
  return section.cfiFromElement(el);
}

export function getChapter(book: Book, location: Location) {
  const locationHref = location.start.href;

  let match = flatten(book.navigation.toc)
    .filter((chapter: NavItem) => {
      return book
        .canonical(chapter.href)
        .includes(book.canonical(locationHref));
    }, null)
    .reduce((result: NavItem | null, chapter: NavItem) => {
      const locationAfterChapter =
        EpubCFI.prototype.compare(
          location.start.cfi,
          getCfiFromHref(book, chapter.href)
        ) > 0;
      return locationAfterChapter ? chapter : result;
    }, null);

  return match;
}

interface EbookViewerProps {
  ebook: EBook;
}

const EbookViewer: React.FC<EbookViewerProps> = (props) => {
  const { ebook } = props;
  const [rendition, setRendition] = React.useState<Rendition | null>(null);
  const book = React.useRef<Book>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const content = useAppSelector((state) => state.ui.content);
  const currentLocation = useAppSelector(
    (state) => state.document.currentLocation
  );
  const currentSearchResult = useAppSelector(
    (state) => state.ui.currentSearchResult
  );
  const isLoading = React.useRef(false);
  const dispatch = useAppDispatch();
  const isStartup = React.useRef(true);

  React.useEffect(() => {
    if (rendition && isStartup) {
      if (currentLocation) {
        rendition.display(currentLocation);
      }
      isStartup.current = false;
    }
  }, [rendition, currentLocation]);

  React.useEffect(() => {
    let searchResults: SearchResult[] = [];
    const searchBook = async () => {
      if (searchQuery && book.current) {
        const results = await search(book.current, searchQuery);
        searchResults = results.map(
          (s): SearchResult => ({
            location: s.cfi,
            text: s.excerpt,
          })
        );
        dispatch(setSearchResults(searchResults));

        searchResults.forEach((r) => {
          if (r.location) {
            rendition?.annotations.highlight(r.location);
          }
        });
      }
    };
    searchBook();

    return () => {
      searchResults.forEach((r) => {
        if (r.location) {
          rendition?.annotations.remove(r.location, "highlight");
        }
      });
    };
  }, [searchQuery, dispatch, rendition]);

  React.useEffect(() => {
    if (currentSearchResult) {
      rendition?.display(currentSearchResult.location);
      dispatch(setCurrentSearchResult(undefined));
    }
  }, [rendition, currentSearchResult, dispatch]);

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

    return () => document.body.removeEventListener("keyup", onKeyUp);
  }, [onKeyUp]);

  React.useEffect(() => {
    rendition?.on("keyup", onKeyUp);
  }, [rendition, onKeyUp]);

  // Table of contents click
  React.useEffect(() => {
    if (content && content.location) {
      rendition?.display(content.location);
    }
  }, [content, rendition]);

  React.useEffect(() => {
    const loadEbook = async () => {
      if (isLoading.current) return;

      if (book.current) {
        book.current.destroy();
      }
      if (!ebook) {
        return;
      }

      isLoading.current = true;
      const newBook = await openBook(ebook);
      isLoading.current = true;
      if (!newBook) {
        isLoading.current = false;
        return;
      }

      const viewer = containerRef?.current;
      if (viewer) {
        const rend = newBook.renderTo(viewer, {
          width: "100vw",
          height: "90vh",
        });
        rend.on("relocated", (location: Location) => {
          const newLocation = location.start.cfi;
          dispatch(setCurrentLocation(newLocation));

          const currentChapter = getChapter(newBook, location);
          if (currentChapter) {
            const currentContent = navItemToContent(newBook, [currentChapter]);
            if (currentContent.length > 0) {
              dispatch(setCurrentChapter(currentContent[0]));
            }
          }
        });
        rend.display();
        dispatch(clearBookData());
        setRendition(rend);
      }
      newBook.loaded.navigation.then((navigation) => {
        const contents = navItemToContent(newBook, navigation.toc);
        dispatch(setToc(contents));
      });
      newBook.loaded.metadata.then((metadata) => {
        dispatch(setTitle(metadata.title));
      });

      book.current = newBook;
      isLoading.current = false;
    };
    loadEbook();
  }, [ebook, dispatch]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Backdrop open={isLoading.current}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
