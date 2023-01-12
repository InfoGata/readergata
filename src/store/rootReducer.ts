import { combineReducers } from "@reduxjs/toolkit";
import documentReducer from "./reducers/documentReducer";
import uiReducer from "./reducers/uiReducer";
import settingsReducer from "./reducers/settingsReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  document: documentReducer,
  settings: settingsReducer,
});

export default rootReducer;
