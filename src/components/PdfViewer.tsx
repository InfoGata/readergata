import { Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppSelector } from "../store/hooks";
import { getValidUrl } from "../utils";

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
};

const PdfViewer: React.FC = (props) => {
  const { t } = useTranslation();
  const currentPdf = useAppSelector((state) => state.pdf.currentPdf);
  const [numPages, setNumPages] = React.useState<number>();
  const [pageNumber, setPageNumber] = React.useState(1);
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    const loadPdf = async () => {
      if (currentPdf) {
        const newUrl = await getValidUrl(currentPdf.source, "application/pdf");
        if (newUrl) {
          setUrl(newUrl);
        } else {
          alert("Could not open url");
        }
      }
    };
    loadPdf();
  }, [currentPdf]);

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber((prev) => prev + offset);
  };

  const nextPage = () => {
    changePage(1);
  };

  const prevPage = () => {
    changePage(-1);
  };

  return (
    <div className="Example_container_document">
      {url && (
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      )}
      <Typography>
        {pageNumber}/{numPages}
      </Typography>
      <Button variant="contained" onClick={prevPage}>
        {t("previous")}
      </Button>
      <Button variant="contained" onClick={nextPage}>
        {t("next")}
      </Button>
    </div>
  );
};

export default PdfViewer;
