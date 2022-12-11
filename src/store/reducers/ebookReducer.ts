import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EBook, BookContent } from "../../types";

interface EbookState {
  currentBook?: EBook;
  location: string;
  contents: BookContent[];
  title: string;
}

let initialState: EbookState = {
  contents: [],
  location: "",
  title: "",
};

const ebookSlice = createSlice({
  name: "ebook",
  initialState,
  reducers: {
    setBook(state, action: PayloadAction<EBook>) {
      state.currentBook = action.payload;
    },
    setContents(state, action: PayloadAction<BookContent[]>) {
      state.contents = action.payload;
    },
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
  },
});

export const { setBook, setContents, setLocation, setTitle } =
  ebookSlice.actions;

export default ebookSlice.reducer;