import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book, BookContent } from '../models';

interface EbookState {
  currentBook?: Book;
  location: string;
  contents: BookContent[];
}

let initialState: EbookState = {
  contents: [],
  location: ""
}

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {
    setBook(state, action: PayloadAction<Book>) {
      state.currentBook = action.payload
    },
    setContents(state, action: PayloadAction<BookContent[]>) {
      state.contents = action.payload;
    },
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    }
  }
});

export const {
  setBook,
  setContents,
  setLocation
} = ebookSlice.actions;

export default ebookSlice.reducer
