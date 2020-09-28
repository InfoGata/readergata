import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { BookContent } from "../models";

interface Props {
  setContents: (contents: BookContent[]) => void;
  pdf: ArrayBuffer | string;
  location: string;
}

const PdfViewer: React.FC<Props> = (props) => {
  const [numPages, setNumPages] = React.useState(1);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pdfDocument, setPdfDocument] = React.useState<
    pdfjs.PDFDocumentProxy
  >();
  const { pdf, setContents, location } = props;

  React.useEffect(() => {
    const getPage = async (outline: pdfjs.PDFTreeNode) => {
      let page = 0;
      if (typeof outline.dest === "string") {
        // TODO: replace with correct code once
        // a pdf that doesn't use object is found
        alert("Need to test");
      } else {
        // dest is an object
        const [ref] = outline.dest;
        page = await (pdfDocument as any).getPageIndex(ref);
      }
      return (page + 1).toString();
    };

    const outlineToContent = async (
      outline: pdfjs.PDFTreeNode[]
    ): Promise<BookContent[]> => {
      if (outline.length === 0) return [];

      const pdfContents = outline.map(async (o) => ({
        title: o.title,
        location: await getPage(o),
        items: await outlineToContent(o.items),
      }));

      return Promise.all(pdfContents);
    };

    const onDocumentChange = async () => {
      if (pdfDocument) {
        const outline = await pdfDocument.getOutline();
        const contents = await outlineToContent(outline);
        setContents(contents);
      }
    };
    onDocumentChange();
  }, [setContents, pdfDocument]);

  React.useEffect(() => {
    if (location) {
      const page = parseInt(location);
      setPageNumber(page);
    }
  }, [location]);

  const onDocumentLoadSuccess = async (pdfDocument: pdfjs.PDFDocumentProxy) => {
    setPdfDocument(pdfDocument);
    setNumPages(pdfDocument.numPages);
    setPageNumber(1);
  };

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
      <Page pageNumber={pageNumber} />
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          Previous
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
      </div>
    </Document>
  );
};

export default PdfViewer;
