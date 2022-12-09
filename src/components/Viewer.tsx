import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setBook } from "../store/reducers/ebookReducer";
import { BookSourceType, EBook } from "../types";
import EbookViewer from "./EbookViewer";

const Viewer: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [bookLoaded, setBookLoaded] = React.useState(false);

  const params = new URLSearchParams(location.search);
  const source = params.get("source");

  const getBookFromUrl = () => {
    if (source) {
      const book: EBook = {
        source: source,
        sourceType: BookSourceType.Url,
      };
      dispatch(setBook(book));
      setBookLoaded(true);
    } else {
      setBookLoaded(true);
    }
  };

  useQuery(["viewer", source], getBookFromUrl);

  return <>{bookLoaded && <EbookViewer />}</>;
};

export default Viewer;
