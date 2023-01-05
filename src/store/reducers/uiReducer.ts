import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookContent, SearchResult } from "../../types";

interface UiState {
  navigationOpen: boolean;
  isFullscreen: boolean;
  tocOpen: boolean;
  waitingServiceWorker?: ServiceWorker;
  contents: BookContent[];
  content?: BookContent;
  searchQuery: string;
  searchResults: SearchResult[];
  currentSearchResult?: SearchResult;
}

let initialState: UiState = {
  navigationOpen: false,
  isFullscreen: false,
  tocOpen: false,
  contents: [],
  searchQuery: "",
  searchResults: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setNavigationOpen(state, action: PayloadAction<boolean>) {
      state.navigationOpen = action.payload;
    },
    setIsFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
    setTocOpen(state, action: PayloadAction<boolean>) {
      state.tocOpen = action.payload;
    },
    updateReady(state, action: PayloadAction<ServiceWorker>) {
      state.waitingServiceWorker = action.payload;
    },
    setToc(state, action: PayloadAction<BookContent[]>) {
      state.contents = action.payload;
    },
    setContent(state, action: PayloadAction<BookContent>) {
      state.content = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSearchResults(state, action: PayloadAction<SearchResult[]>) {
      state.searchResults = action.payload;
    },
    setCurrentSearchResult(
      state,
      action: PayloadAction<SearchResult | undefined>
    ) {
      state.currentSearchResult = action.payload;
    },
  },
});

export const {
  setNavigationOpen,
  setIsFullscreen,
  setTocOpen,
  updateReady,
  setToc,
  setContent,
  setSearchQuery,
  setSearchResults,
  setCurrentSearchResult,
} = uiSlice.actions;

export default uiSlice.reducer;
