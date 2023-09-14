import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";
import {
  AnyAction,
  configureStore,
  PreloadedState,
  ThunkAction,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import rootReducer from "./rootReducer";

const persistConfig = {
  key: "root",
  storage: createIdbStorage(),
  whitelist: ["document", "settings"],
  serialize: false,
  deserialize: false,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const setupStore = (preloadedState?: PreloadedState<AppState>) => {
  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Setting to false because it causes a warning when using redux-persist
        serializableCheck: false,
      }),
    reducer: persistedReducer,
    preloadedState,
  });
};

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept("./rootReducer", (newModule) => {
    if (newModule) {
      store.replaceReducer(persistReducer(persistConfig, newModule.default));
    }
  });
}

const store = setupStore();
export const persistor = persistStore(store);
export type AppStore = ReturnType<typeof setupStore>;
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  undefined,
  AnyAction
>;

export default store;
