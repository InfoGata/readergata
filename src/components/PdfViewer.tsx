import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface IProps {
  pdf: ArrayBuffer | string;
}

const PdfViewer: React.FC<IProps> = (props) => {
  const { pdf } = props;

  return (
    <Document file={pdf}>
      <Page pageNumber={1} />
    </Document>
  );
};

export default PdfViewer;
