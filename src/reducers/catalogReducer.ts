import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Catalog } from "../models";
import { v4 as uuid } from "uuid";

export const defaultCatalogs: Catalog[] = [
  {
    name: "Project Gutenberg",
    url: "https://m.gutenberg.org/ebooks.opds/",
  },
];

interface CatalogState {
  catalogs: Catalog[];
}

let initialState: CatalogState = {
  catalogs: defaultCatalogs,
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    addCatalog: {
      reducer(state, action: PayloadAction<Catalog>) {
        state.catalogs.push(action.payload);
      },
      prepare(catalog: Catalog) {
        return { payload: { id: uuid(), ...catalog } as Catalog };
      },
    },
    deleteCatalog(state, action: PayloadAction<Catalog>) {
      state.catalogs = state.catalogs.filter((c) => c.id !== action.payload.id);
    },
  },
});

export const { addCatalog, deleteCatalog } = catalogSlice.actions;

export default catalogSlice.reducer;
