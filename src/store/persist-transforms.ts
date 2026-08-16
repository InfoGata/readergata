import { createTransform } from "redux-persist";
import { toPublicationSource } from "../lib/publication-source";
import { PublicationSourceType, PublicationType } from "../types";

/**
 * What is actually on disk, which is not what the types promise: a state
 * written before publications became blobs holds `source` as a string of char
 * codes even where `sourceType` says binary.
 */
interface PersistedDocumentState {
  currentPublication?: Omit<PublicationType, "source"> & {
    source: string | Blob;
  };
  currentLocation?: string;
}

/**
 * Brings a persisted publication forward to holding its bytes as a `Blob`.
 *
 * Rehydrating the older shape lands it straight in code that expects a
 * `Blob`: `source.size` is undefined, which reaches IndexedDB as an invalid
 * key and throws `DataError` in the first thing to look the book up -- the
 * bookmarks menu, on load, before the reader has done anything.
 *
 * Converting is the whole migration. The digest the string used to hash to is
 * what `hashPublicationSource` still produces, so the row it keys stays found
 * and no reading position is lost. A url source is a string legitimately and
 * is left alone.
 */
export const migrateDocumentState = (
  state: PersistedDocumentState | undefined
): PersistedDocumentState | undefined => {
  const publication = state?.currentPublication;
  if (
    !state ||
    !publication ||
    publication.sourceType !== PublicationSourceType.Binary ||
    typeof publication.source !== "string"
  ) {
    return state;
  }

  return {
    ...state,
    currentPublication: {
      ...publication,
      source: toPublicationSource(publication.source),
    },
  };
};

/**
 * Both generics are spelled out. Left to inference the transform widens the
 * config's state type, and `persistReducer` then hands back a reducer over
 * `unknown` -- which loses `AppState` and every thunk's dispatch signature
 * with it.
 */
export const publicationSourceTransform = createTransform<
  PersistedDocumentState,
  PersistedDocumentState
>(
  // Nothing to do on the way in: what is held is already a blob.
  (state) => state,
  (state) => migrateDocumentState(state) ?? state,
  { whitelist: ["document"] }
);
