import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import rootReducer from "./rootReducer";
import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";

const persistConfig = {
  key: "root",
  storage: createIdbStorage(),
  whitelist: ["document", "settings"],
  serialize: false,
  deserialize: false,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Setting to false because it causes a warning when using redux-persist
      serializableCheck: false,
    }),
  reducer: persistedReducer,
});

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./rootReducer", () => {
    const newRootReducer = require("./rootReducer").default;
    store.replaceReducer(newRootReducer);
  });
}

export const persistor = persistStore(store);
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
