import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookContent, SearchResult } from "../../types";

interface UiState {
  navigationOpen: boolean;
  isFullscreen: boolean;
  tocOpen: boolean;
  searchOpen: boolean;
  contents: BookContent[];
  content?: BookContent;
  searchQuery: string;
  searchResults: SearchResult[];
  currentSearchResult?: SearchResult;
  title: string;
}

let initialState: UiState = {
  navigationOpen: false,
  isFullscreen: false,
  tocOpen: false,
  searchOpen: false,
  contents: [],
  searchQuery: "",
  searchResults: [],
  title: "",
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
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
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
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    clearBookData(state) {
      state.title = "";
      state.contents = [];
      state.searchQuery = "";
      state.searchResults = [];
    },
    clearSearch(state) {
      state.searchQuery = "";
      state.searchResults = [];
    },
  },
});

export const {
  setNavigationOpen,
  setIsFullscreen,
  setTocOpen,
  setToc,
  setContent,
  setSearchQuery,
  setSearchResults,
  setCurrentSearchResult,
  setTitle,
  clearBookData,
  setSearchOpen,
  clearSearch,
} = uiSlice.actions;

export default uiSlice.reducer;
