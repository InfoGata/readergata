import { combineReducers } from "@reduxjs/toolkit";
import ebookReducer from "./reducers/ebookReducer";

const rootReducer = combineReducers({
  ebook: ebookReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
