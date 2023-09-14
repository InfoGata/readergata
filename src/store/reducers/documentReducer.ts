import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicationSourceType, PublicationType } from "../../types";
import { AppThunk } from "../store";
import { db } from "../../database";
import { xxhash64 } from "hash-wasm";
import { getDocumentData } from "../../utils";

interface DocumentState {
  currentPublication?: PublicationType;
  currentLocation?: string;
}

let initialState: DocumentState = {};

const pdfSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setPublication(state, action: PayloadAction<PublicationType>) {
      state.currentPublication = action.payload;
      state.currentLocation = undefined;
    },
    setCurrentLocation(state, action: PayloadAction<string | undefined>) {
      state.currentLocation = action.payload;
    },
  },
});

const ensureDocumentDataExists = async (publication: PublicationType) => {
  let documentData = await getDocumentData(publication)?.first();
  if (!documentData) {
    switch (publication.sourceType) {
      case PublicationSourceType.Binary:
        await db.documentData.add({
          bookmarks: [],
          xxhash64: publication.hash,
          fileSize: publication.source.length,
        });
        break;
      case PublicationSourceType.Url:
        await db.documentData.add({ bookmarks: [], url: publication.source });
        break;
    }
  }
};

export const setPublication =
  (publication: PublicationType): AppThunk =>
  async (dispatch) => {
    if (publication.sourceType === PublicationSourceType.Binary) {
      let hash = await xxhash64(publication.source);
      publication.hash = hash;
    }
    await ensureDocumentDataExists(publication);
    dispatch(pdfSlice.actions.setPublication(publication));
  };

export const { setCurrentLocation } = pdfSlice.actions;

export default pdfSlice.reducer;
