import { combineReducers } from "@reduxjs/toolkit";
import ebookReducer from "./reducers/ebookReducer";
import pdfReducer from "./reducers/pdfReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  ebook: ebookReducer,
  pdf: pdfReducer,
  ui: uiReducer,
});

export default rootReducer;
