import React from "react";
import { BookLinkItem } from "../models";

interface BookInfoProps {
  book: BookLinkItem;
}

const BookInfo: React.FC<BookInfoProps> = (props) => {
  const { book } = props;
  return <div>
    <img alt="book" src={book.icon} />
    {book.name}
  </div>;
};

export default BookInfo;