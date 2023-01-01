import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppSelector } from "../store/hooks";
import { PdfSourceType } from "../types";
import { getValidUrl } from "../utils";

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
};

const PdfViewer: React.FC = (props) => {
  // const { t } = useTranslation();
  const currentPdf = useAppSelector((state) => state.pdf.currentPdf);
  // const [numPages, setNumPages] = React.useState<number>();
  const [pageNumber, setPageNumber] = React.useState(1);
  const [file, setFile] = React.useState<string | { data: string }>("");

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

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }) => {
    // setNumPages(nextNumPages);
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

  const onItemClick = ({
    pageNumber: itemPageNumber,
  }: {
    pageNumber: string;
  }) => {
    setPageNumber(Number(itemPageNumber));
  };

  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      justifyContent="space-between"
    >
      <Grid item xs={1}>
        <Button
          variant="outlined"
          onClick={prevPage}
          startIcon={<NavigateBefore />}
          sx={{ position: "fixed", left: 0 }}
        ></Button>
      </Grid>
      <Grid item xs={10}>
        {file && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
            onItemClick={onItemClick}
          >
            <Page pageNumber={pageNumber} />
          </Document>
        )}
      </Grid>
      <Grid item xs={1}>
        <Button
          sx={{ position: "fixed", right: 0 }}
          variant="outlined"
          onClick={nextPage}
          endIcon={<NavigateNext />}
        ></Button>
      </Grid>
    </Grid>
  );
};

export default PdfViewer;
