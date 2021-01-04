import { Typography } from "@material-ui/core";
import React from "react"
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Book, BookLinkItem, BookLinkItemUrl, BookSourceType } from "../models";
import { setBook } from "../reducers/ebookReducer";
import { AppDispatch } from "../store";

interface BookItemButtonProps {
  bookUrl: BookLinkItemUrl;
}

const BookItemButton: React.FC<BookItemButtonProps> = (props) => {
  const { bookUrl } = props;
  const history = useHistory();
  const dispatch = useDispatch<AppDispatch>();
  const onClick = () => {
    const book: Book = {
      bookSource: bookUrl.url,
      bookSourceType: BookSourceType.Url,
    };
    history.push("/");
    dispatch(setBook(book));
  };

  return (
    <button onClick={onClick}>
      {bookUrl.type}
    </button>
  );
};

interface BookProps {
  book: BookLinkItem;
}

const BookInfo: React.FC<BookProps> = (props) => {
  const { book } = props;
  return (
    <>
      <img alt="cover" src={book.icon} />
      <Typography variant="h3">{book.name}</Typography>
      <Typography variant="h4">{book.authors?.join(" ,")}</Typography>
      {book.urls.map((u, i) => (
        <BookItemButton key={i} bookUrl={u} />
      ))}
    </>
  );
};

export default BookInfo;
