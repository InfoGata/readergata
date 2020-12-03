import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { BookLinkItem, BookLinkItemUrl, BookSourceType } from "../models";
import { Book } from "../models";
import { setBook } from "../reducers/ebookReducer";
import { AppDispatch } from "../store";

interface BookItemButton {
  bookUrl: BookLinkItemUrl;
}

const BookItemButton: React.FC<BookItemButton> = (props) => {
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

interface BookLinkProps {
  bookItem: BookLinkItem;
}

const BookLink: React.FC<BookLinkProps> = (props) => {
  const { bookItem } = props;

  return (
    <div>
      <img src={bookItem.icon} alt="icon" />
      <h3>{bookItem.name}</h3>
      {bookItem.urls.map((u, i) => (
        <BookItemButton key={i} bookUrl={u} />
      ))}
    </div>
  );
}

export default BookLink;
