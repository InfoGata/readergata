import { List } from '@material-ui/core';
import React from 'react';
import { BookLinkItem } from '../models';
import BookLink from './BookLink';

interface BookListProps {
  books: BookLinkItem[]
}

const BookList: React.FC<BookListProps> = (props) => {
  const { books } = props;
  return (
    <List>
      {books.map((b, i) => (
        <BookLink key={i} bookItem={b} />
      ))}
    </List>
  );
};

export default BookList;
