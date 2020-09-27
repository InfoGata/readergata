import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { BookContent } from "../models";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  pdf: ArrayBuffer | string;
}

interface PageLinkProps {
  content: BookContent;
}

const PdfViewer: React.FC<Props> = (props) => {
  const [numPages, setNumPages] = React.useState(1);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [bookContents, setBookContents] = React.useState<BookContent[]>([]);
  const [pdfDocument, setPdfDocument] = React.useState<
    pdfjs.PDFDocumentProxy
  >();
  const { pdf } = props;

  React.useEffect(() => {
    const testPage = async (outline: pdfjs.PDFTreeNode) => {
      const [ref] = outline.dest;
      const test: number = await (pdfDocument as any).getPageIndex(ref);
      console.log(test);
      return (test + 1).toString();
    };

    const outlineToContent = async (
      outline: pdfjs.PDFTreeNode[]
    ): Promise<BookContent[]> => {
      if (outline.length === 0) return [];

      const test = outline.map(async (o) => ({
        title: o.title,
        page: await testPage(o),
        items: await outlineToContent(o.items),
      }));

      return Promise.all(test);
    };

    const onDocumentChange = async () => {
      if (pdfDocument) {
        const outline = await pdfDocument.getOutline();
        setBookContents(await outlineToContent(outline));
      }
    };
    onDocumentChange();
  }, [pdfDocument]);

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

  function onItemClick({ pageNumber }: { pageNumber: string }) {
    if (pageNumber) {
      setPageNumber(parseInt(pageNumber));
    }
  }

  const PageLink: React.FC<PageLinkProps> = (props) => {
    const onClick = () => {
      setPageNumber(parseInt(props.content.page));
    };

    return <button onClick={onClick}>{props.content.title}</button>;
  };

  const bookContentsToList = (contents: BookContent[]) => {
    if (contents.length === 0) {
      return null;
    }

    return (
      <ul>
        {contents.map((c) => (
          <li>
            <PageLink content={c} />
            {bookContentsToList(c.items)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
      {bookContentsToList(bookContents)}
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
