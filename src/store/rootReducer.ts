import { combineReducers } from "@reduxjs/toolkit";
import documentReducer from "./reducers/documentReducer";
import settingsReducer from "./reducers/settingsReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  document: documentReducer,
  settings: settingsReducer,
});

export default rootReducer;
