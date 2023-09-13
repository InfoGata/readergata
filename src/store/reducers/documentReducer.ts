import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EBook, Pdf, PublicationType } from "../../types";

interface DocumentState {
  currentPublication?: PublicationType;
  currentLocation?: string;
}

let initialState: DocumentState = {};

const pdfSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setPublication(state, action: PayloadAction<PublicationType | undefined>) {
      state.currentPublication = action.payload;
      state.currentLocation = undefined;
    },
    setCurrentLocation(state, action: PayloadAction<string | undefined>) {
      state.currentLocation = action.payload;
    },
  },
});

export const { setCurrentLocation, setPublication } = pdfSlice.actions;

export default pdfSlice.reducer;
