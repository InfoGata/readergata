import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import React from "react";
import {
  Document,
  Page,
  pdfjs,
  DocumentProps,
  TextLayerItemInternal,
} from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCurrentLocation } from "../store/reducers/documentReducer";
import {
  setCurrentSearchResult,
  setSearchResults,
  setToc,
} from "../store/reducers/uiReducer";
import { BookContent, PdfSourceType, SearchResult } from "../types";
import { getValidUrl } from "../utils";

type PDFDocumentProxy = Parameters<
  NonNullable<DocumentProps["onLoadSuccess"]>
>[0];
type OutlineType = Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>[0];

const outlineToBookConent = (outline: OutlineType): BookContent => {
  return {
    title: outline.title,
    location: typeof outline.dest === "string" ? outline.dest : undefined,
    dest: typeof outline.dest !== "string" ? outline.dest : undefined,
    items: outline.items.map(outlineToBookConent),
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

const PdfViewer: React.FC = () => {
  const currentPdf = useAppSelector((state) => state.document.currentPdf);
  const [numPages, setNumPages] = React.useState<number>();
  const [pageNumber, setPageNumber] = React.useState<number>();
  const [file, setFile] = React.useState<string | { data: string }>("");
  const [pdf, setPdf] = React.useState<PDFDocumentProxy>();
  const [pageText, setPageText] = React.useState<string[]>([]);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
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
      if (content && pdf) {
        if (content.dest) {
          const pageIndex = await pdf.getPageIndex(content.dest[0]);
          if (pageIndex) {
            setPageNumber(pageIndex + 1);
          }
        } else if (content.location) {
          const dest = await pdf.getDestination(content.location);
          if (dest) {
            const pageIndex = await pdf.getPageIndex(dest[0]);
            if (pageIndex) {
              setPageNumber(pageIndex + 1);
            }
          }
        }
      }
    };

    loadContent();
  }, [content, pdf]);

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
      if (currentPdf && currentPdf.sourceType === PdfSourceType.Url) {
        const newUrl = await getValidUrl(currentPdf.source, "application/pdf");
        if (newUrl) {
          setFile(newUrl);
        } else {
          alert("Could not open url");
        }
      } else if (currentPdf && currentPdf.sourceType === PdfSourceType.Binary) {
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
    setPdf(pdfProxy);
    setNumPages(pdfProxy.numPages);
    if (currentLocation) {
      setPageNumber(Number(currentLocation));
    } else {
      setPageNumber(1);
    }
    const outline = await pdfProxy.getOutline();
    if (outline) {
      const contents = outline.map(outlineToBookConent);
      dispatch(setToc(contents));
    }
    // Load all text content
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
