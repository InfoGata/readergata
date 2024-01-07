import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
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

const initialState: DocumentState = {};

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
    clearPublication(state) {
      state.currentLocation = undefined;
      state.currentPublication = undefined;
    },
  },
});

const ensureDocumentDataExists = async (
  publication: PublicationType
): Promise<DocumentData | undefined> => {
  let documentData = await getDocumentData(publication)?.first();
  if (!documentData) {
    const id = nanoid();
    switch (publication.sourceType) {
      case PublicationSourceType.Binary:
        documentData = {
          id,
          bookmarks: [],
          xxhash64: publication.hash,
          fileSize: publication.source.length,
          fileName: publication.fileName,
        };
        await db.documentData.add(documentData);
        break;
      case PublicationSourceType.Url:
        documentData = {
          id,
          bookmarks: [],
          url: publication.source,
          fileName: publication.fileName,
        };
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
      const hash = await xxhash64(publication.source);
      publication.hash = hash;
    }
    const documentData = await ensureDocumentDataExists(publication);
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
    const currentPublication = state.document.currentPublication;
    if (currentPublication) {
      const documentData = getDocumentData(currentPublication);
      if (documentData) {
        documentData.modify((data) => {
          data.currentLocation = location;
        });
      }
    }
    dispatch(documentSlice.actions.setCurrentLocation(location));
  };

export const setPublicationData =
  (data: Partial<DocumentData>): AppThunk =>
  async (_dispatch, getState) => {
    const state = getState();
    const currentPublication = state.document.currentPublication;
    const documentDataCollection = getDocumentData(currentPublication);
    if (!documentDataCollection) {
      return;
    }

    const documentData = await documentDataCollection.first();
    if (documentData && !documentData.title && data.title) {
      documentDataCollection.modify((oldData) => {
        oldData.title = data.title;
        oldData.author = data.author;
      });
    }
  };

export const { clearPublication } = documentSlice.actions;
export default documentSlice.reducer;
