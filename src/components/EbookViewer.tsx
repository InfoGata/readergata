import type { View as FoliateView } from "foliate-js/view.js";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { toast } from "sonner";
import { useTheme } from "@infogata/shadcn-vite-theme-provider";
import {
  EBOOK_ACCEPTED_MIME_TYPES,
  excerptToText,
  formatContributor,
  formatLanguageMap,
  getBookCss,
  publicationToFile,
  tocItemToBookContent,
  tocToBookContents,
} from "../lib/ebook";
import { useAppDispatch, useAppSelector, useAppStore } from "../store/hooks";
import {
  setCurrentLocation,
  setPublicationData,
} from "../store/reducers/documentReducer";
import {
  clearBookData,
  setCurrentChapter,
  setCurrentSearchResult,
  setSearchResults,
  setTitle,
  setToc,
} from "../store/reducers/uiReducer";
import { EBook, PublicationSourceType, SearchResult } from "../types";
import { getValidUrl } from "../utils";
import Spinner from "./Spinner";
import { Button } from "./ui/button";

const ebookToFile = async (ebook: EBook): Promise<File> => {
  if (ebook.sourceType === PublicationSourceType.Binary) {
    return publicationToFile(ebook);
  }

  // Still goes through getValidUrl so the CORS-proxy fallback applies; passing
  // the url straight to foliate-js would bypass it.
  const validUrl = await getValidUrl(ebook.source, EBOOK_ACCEPTED_MIME_TYPES);
  if (!validUrl) {
    throw new Error(`Could not reach a publication at ${ebook.source}`);
  }
  const response = await fetch(validUrl);
  if (!response.ok) {
    throw new Error(`${validUrl} responded with ${response.status}`);
  }
  return publicationToFile(ebook, await response.blob());
};

/**
 * Whether a saved location still points somewhere in this book. Worth checking
 * before `init`, because `init` silently falls back to the first page when a
 * location does not resolve, and the resulting relocation would overwrite the
 * reader's saved position. May reject: MOBI resolves hrefs asynchronously.
 */
const canResolve = async (view: FoliateView, target: string) => {
  try {
    return Boolean(await view.resolveNavigation(target));
  } catch {
    return false;
  }
};

const prefersDark = (theme: string) =>
  theme === "dark" ||
  (theme === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);

interface EbookViewerProps {
  ebook: EBook;
}

const EbookViewer: React.FC<EbookViewerProps> = (props) => {
  const { ebook } = props;
  const theme = useTheme();
  const { t } = useTranslation();
  const [view, setView] = React.useState<FoliateView | null>(null);
  const [loading, setLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  // Bumped on every load and on cleanup, so a load that is overtaken by a
  // newer one bails at its next await instead of racing it.
  const loadGeneration = React.useRef(0);
  // The last location this viewer produced. Locations arriving from elsewhere
  // (a bookmark) differ from it and are treated as a navigation request.
  const lastEmittedLocation = React.useRef<string | undefined>(undefined);
  // Indirection so the listener inside the book iframe survives onKeyUp being
  // recreated, without re-registering it on every render.
  const onKeyUpRef = React.useRef<(event: KeyboardEvent) => void>(() => {});

  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const content = useAppSelector((state) => state.ui.content);
  const currentLocation = useAppSelector(
    (state) => state.document.currentLocation
  );
  const currentSearchResult = useAppSelector(
    (state) => state.ui.currentSearchResult
  );
  const dispatch = useAppDispatch();
  const store = useAppStore();

  React.useEffect(() => {
    if (!ebook) return;

    const generation = ++loadGeneration.current;
    let cancelled = false;
    const isStale = () => cancelled || generation !== loadGeneration.current;
    let created: FoliateView | null = null;
    let foliate: typeof import("foliate-js/view.js") | undefined;

    const load = async () => {
      setLoading(true);
      try {
        // Dynamic so the custom element is not defined at module scope: it
        // cannot render under jsdom, and this keeps it out of the main chunk.
        foliate = await import("foliate-js/view.js");
        if (isStale()) return;

        const container = containerRef.current;
        if (!container) return;

        const file = await ebookToFile(ebook);
        if (isStale()) return;

        const element = document.createElement("foliate-view") as FoliateView;
        element.style.display = "block";
        element.style.width = "100%";
        element.style.height = "100%";
        // Must be in the document before open(): the renderer sizes itself
        // from a ResizeObserver, which needs real layout.
        container.append(element);
        created = element;

        element.addEventListener("relocate", (event) => {
          const { cfi, tocItem } = event.detail;
          // Recorded before dispatching, so the value coming back through
          // redux is recognised as our own echo rather than a navigation.
          lastEmittedLocation.current = cfi;
          dispatch(setCurrentLocation(cfi));
          if (tocItem) dispatch(setCurrentChapter(tocItemToBookContent(tocItem)));
        });
        element.addEventListener("load", (event) => {
          // Key events inside the book's iframe do not reach document.body.
          event.detail.doc.addEventListener("keyup", (keyEvent) =>
            onKeyUpRef.current(keyEvent as KeyboardEvent)
          );
        });

        await element.open(file);
        if (isStale()) return;

        dispatch(clearBookData());
        dispatch(setToc(tocToBookContents(element.book.toc)));
        const title =
          formatLanguageMap(element.book.metadata?.title) ||
          ebook.fileName ||
          "";
        const author = formatContributor(element.book.metadata?.author);
        dispatch(setTitle(title));
        dispatch(setPublicationData({ title, author }));

        // Optional: the fixed-layout renderer used for comics has no
        // setStyles, and inverting artwork for dark mode would be wrong anyway.
        element.renderer.setStyles?.(getBookCss(prefersDark(theme.theme)));

        const saved = store.getState().document.currentLocation;
        const lastLocation =
          saved && (await canResolve(element, saved)) ? saved : undefined;
        if (isStale()) return;
        if (saved && !lastLocation) {
          toast.warning(t("couldNotRestorePosition"));
        }
        lastEmittedLocation.current = lastLocation;
        await element.init({ lastLocation });
        if (isStale()) return;

        setView(element);
      } catch (e) {
        console.error(e);
        if (foliate && e instanceof foliate.UnsupportedTypeError) {
          toast.error(t("unsupportedFileType"));
        } else {
          toast.error(t("couldNotOpenPublication"));
        }
      } finally {
        if (!isStale()) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      setView(null);
      if (created) {
        // The renderer dereferences its view unguarded, which is null when no
        // section ever rendered -- as after a failed open.
        try {
          created.close();
        } catch (e) {
          console.error(e);
        }
        created.book?.destroy?.();
        created.remove();
      }
    };
    // theme is read once at load; the effect below keeps it current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ebook, dispatch, store, t]);

  // A location this viewer did not produce -- a bookmark jump.
  React.useEffect(() => {
    if (!view || !currentLocation) return;
    if (currentLocation === lastEmittedLocation.current) return;
    lastEmittedLocation.current = currentLocation;
    view.goTo(currentLocation);
  }, [view, currentLocation]);

  React.useEffect(() => {
    if (!view) return;
    if (!searchQuery) {
      view.clearSearch();
      dispatch(setSearchResults([]));
      return;
    }

    let cancelled = false;
    const runSearch = async () => {
      const results: SearchResult[] = [];
      for await (const result of view.search({ query: searchQuery })) {
        if (cancelled) break;
        if (result === "done" || !("subitems" in result)) continue;
        for (const { cfi, excerpt } of result.subitems) {
          results.push({ location: cfi, text: excerptToText(excerpt) });
        }
        // Dispatched per section rather than once at the end: whole-book search
        // is slow, and SearchMenu renders straight from this list.
        dispatch(setSearchResults([...results]));
      }
    };
    runSearch();

    return () => {
      cancelled = true;
      // Also removes the highlights the search drew.
      view.clearSearch();
    };
  }, [view, searchQuery, dispatch]);

  React.useEffect(() => {
    if (currentSearchResult?.location) {
      view?.goTo(currentSearchResult.location);
      dispatch(setCurrentSearchResult(undefined));
    }
  }, [view, currentSearchResult, dispatch]);

  // Table of contents click
  React.useEffect(() => {
    if (content && content.location) {
      view?.goTo(content.location);
    }
  }, [content, view]);

  React.useEffect(() => {
    view?.renderer.setStyles?.(getBookCss(prefersDark(theme.theme)));
  }, [view, theme]);

  const onNext = React.useCallback(() => {
    view?.next();
  }, [view]);

  const onPrev = React.useCallback(() => {
    view?.prev();
  }, [view]);

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
    onKeyUpRef.current = onKeyUp;
  }, [onKeyUp]);

  React.useEffect(() => {
    document.body.addEventListener("keyup", onKeyUp);

    return () => document.body.removeEventListener("keyup", onKeyUp);
  }, [onKeyUp]);

  return (
    <>
      <Spinner open={loading} />
      <div className="flex justify-center items-center">
        <Button
          onClick={onPrev}
          variant="ghost"
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 h-full"
        >
          <FaChevronLeft />
        </Button>
        <div ref={containerRef} className="absolute top-10 w-screen h-[90vh]" />
        <Button
          onClick={onNext}
          variant="ghost"
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 h-full"
        >
          <FaChevronRight />
        </Button>
      </div>
    </>
  );
};

export default EbookViewer;
