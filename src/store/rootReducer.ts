import { combineReducers } from "@reduxjs/toolkit";
import ebookReducer from "./reducers/ebookReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  ebook: ebookReducer,
  ui: uiReducer,
});

export default rootReducer;