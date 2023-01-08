import { combineReducers } from "@reduxjs/toolkit";
import documentReducer from "./reducers/documentReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  document: documentReducer,
});

export default rootReducer;
