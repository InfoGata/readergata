import { Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import {
  EBook,
  BookLinkItem,
  BookLinkItemUrl,
  BookSourceType,
} from "../models";
import { setBook } from "../store/reducers/ebookReducer";

interface BookItemButtonProps {
  bookUrl: BookLinkItemUrl;
}

const BookItemButton: React.FC<BookItemButtonProps> = (props) => {
  const { bookUrl } = props;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onClick = () => {
    const book: EBook = {
      source: bookUrl.url,
      sourceType: BookSourceType.Url,
    };
    navigate("/");
    dispatch(setBook(book));
  };

  return <button onClick={onClick}>{bookUrl.type}</button>;
};

interface BookProps {
  book: BookLinkItem;
}

const BookInfo: React.FC<BookProps> = (props) => {
  const { book } = props;
  const authors = book.authors?.map((a) => a.name).join(", ");
  return (
    <>
      <img alt="cover" src={book.icon} />
      <Typography variant="h3">{book.name}</Typography>
      <Typography variant="h5">{authors}</Typography>
      <Typography variant="body1">{book.summary}</Typography>
      {book.urls.map((u, i) => (
        <BookItemButton key={i} bookUrl={u} />
      ))}
    </>
  );
};

export default BookInfo;
