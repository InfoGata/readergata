import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface IProps {
  pdf: ArrayBuffer | string;
}

const PdfViewer: React.FC<IProps> = (props) => {
  const [numPages, setNumPages] = React.useState(1);
  const [pageNumber, setPageNumber] = React.useState(1);
  const { pdf } = props;

  const onDocumentLoadSuccess = (event: pdfjs.PDFDocumentProxy) => {
    setNumPages(event.numPages);
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
