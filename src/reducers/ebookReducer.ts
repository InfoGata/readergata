import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '../models';

interface EbookState {
  currentBook?: Book;
}

let initialState: EbookState = {
}

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {
    setBook(state, action: PayloadAction<Book>) {
      state.currentBook = action.payload
    }
  }
});

export const {
  setBook
} = ebookSlice.actions;

export default ebookSlice.reducer