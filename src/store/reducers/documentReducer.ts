import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EBook, Pdf } from "../../types";

interface DocumentState {
  currentPdf?: Pdf;
  currentBook?: EBook;
  currentLocation?: string;
}

let initialState: DocumentState = {};

const pdfSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setPdf(state, action: PayloadAction<Pdf | undefined>) {
      state.currentPdf = action.payload;
      state.currentBook = undefined;
      state.currentLocation = undefined;
    },
    setBook(state, action: PayloadAction<EBook | undefined>) {
      state.currentBook = action.payload;
      state.currentPdf = undefined;
      state.currentLocation = undefined;
    },
    setCurrentLocation(state, action: PayloadAction<string | undefined>) {
      state.currentLocation = action.payload;
    },
  },
});

export const { setPdf, setBook, setCurrentLocation } = pdfSlice.actions;

export default pdfSlice.reducer;
