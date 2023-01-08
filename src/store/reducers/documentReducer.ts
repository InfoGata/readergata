import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EBook, Pdf } from "../../types";

interface DocumentState {
  currentPdf?: Pdf;
  currentBook?: EBook;
  setCurrentLocation?: string;
}

let initialState: DocumentState = {};

const pdfSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setPdf(state, action: PayloadAction<Pdf | undefined>) {
      state.currentPdf = action.payload;
      state.currentBook = undefined;
    },
    setBook(state, action: PayloadAction<EBook | undefined>) {
      state.currentBook = action.payload;
      state.currentPdf = undefined;
    },
  },
});

export const { setPdf, setBook } = pdfSlice.actions;

export default pdfSlice.reducer;
