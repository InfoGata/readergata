import { Publication } from "./plugintypes";

declare module "@tanstack/history" {
  interface HistoryState {
    /**
     * The feed row a reader clicked, carried to the publication page so it has
     * something to paint before `onGetPublicationDetails` answers.
     *
     * History state rather than the url: it would be far too much to put in a
     * link, and it is only ever an optimisation. A publication page reached
     * any other way — a shared link, a refresh — arrives without it and has to
     * stand on its own.
     */
    publication?: Publication;
  }
}
