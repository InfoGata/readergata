import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Pdf } from "../../types";

interface PdfState {
  currentPdf?: Pdf;
}

let initialState: PdfState = {};

const pdfSlice = createSlice({
  name: "pdf",
  initialState,
  reducers: {
    setPdf(state, action: PayloadAction<Pdf | undefined>) {
      state.currentPdf = action.payload;
    },
  },
});

export const { setPdf } = pdfSlice.actions;

export default pdfSlice.reducer;
