import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import React from "react";
import {
  Document,
  DocumentProps,
  PDFPageProxy,
  Page,
  TextLayerItemInternal,
  pdfjs,
} from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
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
import {
  BookContent,
  Pdf,
  PublicationSourceType,
  SearchResult,
} from "../types";
import { getValidUrl, mapAsync } from "../utils";

type PDFDocumentProxy = Parameters<
  NonNullable<DocumentProps["onLoadSuccess"]>
>[0];
type OutlineType = Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>[0];

const outlineToBookConent = async (
  outline: OutlineType,
  pdf: PDFDocumentProxy
): Promise<BookContent> => {
  let destination =
    outline.dest !== "string"
      ? outline.dest
      : await pdf.getDestination(outline.dest);
  return {
    title: outline.title,
    items: await mapAsync(outline.items, (element) =>
      outlineToBookConent(element, pdf)
    ),
    pageNumber: destination
      ? (await pdf.getPageIndex(destination[0])) + 1
      : undefined,
  };
};

function highlightPattern(text: string, pattern: string) {
  const regex = new RegExp(pattern, "i");
  return text.replace(regex, (value) => `<mark>${value}</mark>`);
}

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
};

interface PdfViewerProps {
  currentPdf: Pdf;
}

const PdfViewer: React.FC<PdfViewerProps> = (props) => {
  const { currentPdf } = props;
  const [numPages, setNumPages] = React.useState<number>();
  const [pageNumber, setPageNumber] = React.useState<number>();
  const [file, setFile] = React.useState<string | { data: string }>("");
  const [pageText, setPageText] = React.useState<string[]>([]);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const toc = useAppSelector((state) => state.ui.contents);
  const content = useAppSelector((state) => state.ui.content);
  const currentLocation = useAppSelector(
    (state) => state.document.currentLocation
  );
  const currentSearchResult = useAppSelector(
    (state) => state.ui.currentSearchResult
  );
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (pageNumber) {
      dispatch(setCurrentLocation(pageNumber.toString()));
    }
  }, [pageNumber, dispatch]);

  React.useEffect(() => {
    const loadContent = async () => {
      if (content && content.pageNumber) {
        setPageNumber(content.pageNumber);
      }
    };

    loadContent();
  }, [content]);

  React.useEffect(() => {
    if (currentSearchResult) {
      setPageNumber(Number(currentSearchResult.location));
      dispatch(setCurrentSearchResult(undefined));
    }
  }, [currentSearchResult, dispatch]);

  React.useEffect(() => {
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      const excerptLimit = 150;
      const results: SearchResult[] = [];

      pageText.forEach((text, index) => {
        const textIndex = text.search(regex);
        if (textIndex > -1) {
          const page = index + 1;
          const excerpt = text.substring(
            textIndex - excerptLimit / 2,
            textIndex + excerptLimit / 2
          );
          results.push({ location: page.toString(), text: `...${excerpt}...` });
        }
      });

      dispatch(setSearchResults(results));
    }
  }, [searchQuery, pageText, dispatch]);

  React.useEffect(() => {
    const loadPdf = async () => {
      if (currentPdf && currentPdf.sourceType === PublicationSourceType.Url) {
        const newUrl = await getValidUrl(currentPdf.source, "application/pdf");
        if (newUrl) {
          setFile(newUrl);
        } else {
          alert("Could not open url");
        }
      } else if (
        currentPdf &&
        currentPdf.sourceType === PublicationSourceType.Binary
      ) {
        setFile({ data: currentPdf.source });
      }
    };
    loadPdf();
  }, [currentPdf]);

  const changePage = (offset: number) => {
    setPageNumber((prev) => (prev || 1) + offset);
  };

  const nextPage = () => {
    changePage(1);
  };

  const prevPage = () => {
    changePage(-1);
  };

  const onItemClick = ({
    pageNumber: itemPageNumber,
  }: {
    pageNumber: string;
  }) => {
    setPageNumber(Number(itemPageNumber));
  };

  const onDocumentLoad = async (pdfProxy: PDFDocumentProxy) => {
    dispatch(clearBookData());
    setNumPages(pdfProxy.numPages);
    if (currentLocation) {
      setPageNumber(Number(currentLocation));
    } else {
      setPageNumber(1);
    }

    // Table of contents
    const outline = await pdfProxy.getOutline();
    if (outline) {
      const contents = await mapAsync(outline, async (o) =>
        outlineToBookConent(o, pdfProxy)
      );
      dispatch(setToc(contents));
    }

    // Set Title
    const metadata = await pdfProxy.getMetadata();
    let title: string | undefined;
    let author: string | undefined;
    if ("Title" in metadata.info && typeof metadata.info.Title === "string") {
      title = metadata.info.Title;
      dispatch(setTitle(metadata.info.Title));
    }
    if ("Author" in metadata.info && typeof metadata.info.Author === "string") {
      author = metadata.info.Author;
    }
    if (title || author) {
      dispatch(setPublicationData({ title, author }));
    }

    // Load all text content for searching
    const pagePromises = Array.from(
      { length: pdfProxy.numPages },
      (_, pageIndex) => {
        return pdfProxy.getPage(pageIndex + 1).then((pageData) => {
          return pageData.getTextContent().then((textContent) => {
            return textContent.items
              .map((i) => ("str" in i ? i.str : undefined))
              .join(" ");
          });
        });
      }
    );

    const pageText = await Promise.all(pagePromises);
    setPageText(pageText);
  };

  const textRenderer = React.useCallback(
    (textItem: TextLayerItemInternal) =>
      highlightPattern(textItem.str, searchQuery),
    [searchQuery]
  );

  const onPageRender = async (page: PDFPageProxy) => {
    const renderedPageNum = page.pageNumber;
    if (toc.length > 0) {
      const flatContents = toc.flatMap((t) => [t, ...t.items]);
      let currentContent = flatContents[0];
      for (let i = 1; i < flatContents.length; i++) {
        currentContent = flatContents[i];
        if (renderedPageNum > (currentContent.pageNumber ?? 0)) {
          continue;
        } else {
          break;
        }
      }
      dispatch(setCurrentChapter(currentContent));
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      {numPages && (pageNumber || 1) - 1 > 0 && (
        <Button
          variant="outlined"
          onClick={prevPage}
          startIcon={<NavigateBefore />}
          sx={{ position: "fixed", left: 0, height: "100%" }}
        ></Button>
      )}
      {file && (
        <Document
          file={file}
          onLoadSuccess={onDocumentLoad}
          options={options}
          onItemClick={onItemClick}
        >
          <Page
            pageNumber={pageNumber || Number(currentLocation) || 1}
            customTextRenderer={textRenderer}
            onRenderSuccess={onPageRender}
          />
        </Document>
      )}
      {numPages && numPages > (pageNumber || 1) + 1 && (
        <Button
          sx={{ position: "fixed", right: 0, height: "100%" }}
          variant="outlined"
          onClick={nextPage}
          endIcon={<NavigateNext />}
        ></Button>
      )}
    </Box>
  );
};

export default PdfViewer;
