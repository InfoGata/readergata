import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";
import { configureStore, ThunkAction, UnknownAction } from "@reduxjs/toolkit";
import { PersistConfig, persistReducer, persistStore } from "redux-persist";
import rootReducer from "./rootReducer";
import { publicationSourceTransform } from "./persist-transforms";

type RootState = ReturnType<typeof rootReducer>;

/**
 * `deserialize` is read by `getStoredState` -- `false` swaps in an identity
 * function -- but is missing from the published types. It has to stay: idb
 * storage hands back objects, blobs among them, and the default deserializer
 * would try to parse them as json.
 */
type IdbPersistConfig = PersistConfig<RootState> & { deserialize: boolean };

// Annotated rather than inferred: a `transforms` entry left to inference
// widens the config's state, `persistReducer` comes back typed over `unknown`,
// and every thunk in the app loses its dispatch signature.
const persistConfig: IdbPersistConfig = {
  key: "root",
  storage: createIdbStorage(),
  whitelist: ["document", "settings"],
  serialize: false,
  deserialize: false,
  transforms: [publicationSourceTransform],
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

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept("./rootReducer", (newModule) => {
    if (newModule) {
      store.replaceReducer(persistReducer(persistConfig, newModule.default));
    }
  });
}

export const persistor = persistStore(store);
export type AppStore = typeof store;
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  undefined,
  UnknownAction
>;

export default store;
