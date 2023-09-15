import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DocumentData,
  PublicationSourceType,
  PublicationType,
} from "../../types";
import { AppThunk } from "../store";
import { db } from "../../database";
import { xxhash64 } from "hash-wasm";
import { getDocumentData } from "../../utils";

interface DocumentState {
  currentPublication?: PublicationType;
  currentLocation?: string;
}

let initialState: DocumentState = {};

const documentSlice = createSlice({
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

const ensureDocumentDataExists = async (
  publication: PublicationType
): Promise<DocumentData | undefined> => {
  let documentData = await getDocumentData(publication)?.first();
  if (!documentData) {
    switch (publication.sourceType) {
      case PublicationSourceType.Binary:
        documentData = {
          bookmarks: [],
          xxhash64: publication.hash,
          fileSize: publication.source.length,
        };
        await db.documentData.add(documentData);
        break;
      case PublicationSourceType.Url:
        documentData = { bookmarks: [], url: publication.source };
        await db.documentData.add(documentData);
        break;
    }
  }
  return documentData;
};

export const setPublication =
  (publication: PublicationType): AppThunk =>
  async (dispatch) => {
    if (publication.sourceType === PublicationSourceType.Binary) {
      let hash = await xxhash64(publication.source);
      publication.hash = hash;
    }
    let documentData = await ensureDocumentDataExists(publication);
    dispatch(documentSlice.actions.setPublication(publication));
    if (documentData?.currentLocation) {
      dispatch(
        documentSlice.actions.setCurrentLocation(documentData.currentLocation)
      );
    }
  };

export const setCurrentLocation =
  (location: string | undefined): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    let currentPublication = state.document.currentPublication;
    if (currentPublication) {
      let documentData = getDocumentData(currentPublication);
      if (documentData) {
        documentData.modify((data) => {
          data.currentLocation = location;
        });
      }
    }
    dispatch(documentSlice.actions.setCurrentLocation(location));
  };

export default documentSlice.reducer;
