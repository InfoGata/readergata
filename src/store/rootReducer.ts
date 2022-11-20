import { combineReducers } from "@reduxjs/toolkit";
import ebookReducer from "./reducers/ebookReducer";
import uiReducer from "./reducers/uiReducer";
import catalogReducer from "./reducers/catalogReducer";

const rootReducer = combineReducers({
  ebook: ebookReducer,
  ui: uiReducer,
  catalog: catalogReducer,
});

export default rootReducer;
