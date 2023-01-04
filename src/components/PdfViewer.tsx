import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import React from "react";
import { Document, Page, pdfjs, DocumentProps } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setToc } from "../store/reducers/uiReducer";
import { BookContent, PdfSourceType } from "../types";
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

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
};

const PdfViewer: React.FC = () => {
  const currentPdf = useAppSelector((state) => state.pdf.currentPdf);
  const [numPages, setNumPages] = React.useState<number>();
  const [pageNumber, setPageNumber] = React.useState(1);
  const [file, setFile] = React.useState<string | { data: string }>("");
  const [pdf, setPdf] = React.useState<PDFDocumentProxy>();
  const content = useAppSelector((state) => state.ui.content);
  const dispatch = useAppDispatch();

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
    setPageNumber((prev) => prev + offset);
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
    setPageNumber(1);
    const outline = await pdfProxy.getOutline();
    const contents = outline.map(outlineToBookConent);
    dispatch(setToc(contents));
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      {numPages && pageNumber - 1 > 0 && (
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
          <Page pageNumber={pageNumber} />
        </Document>
      )}
      {numPages && numPages > pageNumber + 1 && (
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
