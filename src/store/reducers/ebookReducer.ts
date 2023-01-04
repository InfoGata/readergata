import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EBook } from "../../types";

interface EbookState {
  currentBook?: EBook;
  title: string;
}

let initialState: EbookState = {
  title: "",
};

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {
    setBook(state, action: PayloadAction<EBook | undefined>) {
      state.currentBook = action.payload;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
  },
});

export const { setBook, setTitle } = ebookSlice.actions;

export default ebookSlice.reducer;
