import React from "react";
import { BookLinkItem, BookLinkItemUrl } from "../models";

interface BookItemButton {
  bookUrl: BookLinkItemUrl;
}

const BookItemButton: React.FC<BookItemButton> = (props) => {
  const { bookUrl } = props;
  const onClick = () => {
    document.location.href = bookUrl.url;
  };

  return (
    <button onClick={onClick}>
      {bookUrl.type}: {bookUrl.size}
    </button>
  );
};

interface BookLinkProps {
  bookItem: BookLinkItem;
}

const BookLink: React.FC<BookLinkProps> = (props) => {
  const { bookItem } = props;

  return (
    <>
      <img src={bookItem.icon} alt="icon" />
      <h3>{bookItem.name}</h3>
      {bookItem.urls.map((u) => (
        <BookItemButton bookUrl={u} />
      ))}
    </>
  );
}

export default BookLink;
