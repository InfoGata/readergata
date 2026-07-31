// Hand-written declarations for the vendored foliate-js modules in
// src/vendor/foliate-js, which are plain JS with no types of their own.
//
// The import specifier is the bare "foliate-js/..." (aliased to the vendor
// directory in vite.config.ts and electron.vite.config.ts) rather than a
// relative path, because TypeScript consults ambient module declarations for
// non-relative specifiers. A relative import would go through file resolution
// and fail, since `allowJs` is off.
//
// This covers only the surface the app uses. Widen it as needed rather than
// reaching for `allowJs`, which would pull ~320KB of upstream source into every
// `tsc` run.

declare module "foliate-js/view.js" {
  /** Titles and names may be localized, e.g. `{ en: "...", ja: "..." }`. */
  export type LanguageMap = string | Record<string, string>;

  export type Contributor = string | { name?: LanguageMap; sortAs?: string };

  export interface FoliateTocItem {
    label: string;
    href: string;
    subitems?: FoliateTocItem[] | null;
    /** Assigned by progress.js when the view opens the book. */
    id?: number;
  }

  /** Roughly Readium's webpub manifest schema. */
  export interface FoliateMetadata {
    title?: LanguageMap;
    author?: Contributor | Contributor[];
    language?: string | string[];
    description?: LanguageMap;
    publisher?: Contributor;
  }

  export interface FoliateBook {
    sections: unknown[];
    toc?: FoliateTocItem[] | null;
    metadata?: FoliateMetadata;
    dir?: "ltr" | "rtl";
    rendition?: { layout?: string };
    /** Revokes the blob: URLs minted for the book's resources. */
    destroy?: () => void;
  }

  export interface RelocateDetail {
    cfi: string;
    range?: Range;
    /** Progress within the section, 0-1. */
    fraction?: number;
    tocItem?: FoliateTocItem | null;
    pageItem?: FoliateTocItem | null;
    location?: { current: number; next: number; total: number };
  }

  export interface SearchExcerpt {
    pre: string;
    match: string;
    post: string;
  }

  export type SearchResultYield =
    | { progress: number }
    | { label: string; subitems: { cfi: string; excerpt: SearchExcerpt }[] }
    | "done";

  export interface FoliateRenderer extends HTMLElement {
    /** Paginator only -- the fixed-layout renderer does not implement this. */
    setStyles?(styles: string | [string, string]): void;
    getContents(): { index: number; doc: Document }[];
  }

  export interface FoliateViewEventMap {
    relocate: CustomEvent<RelocateDetail>;
    load: CustomEvent<{ doc: Document; index: number }>;
    "external-link": CustomEvent<{ a: HTMLAnchorElement; href: string }>;
  }

  export interface NavigationTarget {
    index: number;
    anchor?: (doc: Document) => Element | Range | null;
  }

  export class View extends HTMLElement {
    book: FoliateBook;
    renderer: FoliateRenderer;
    isFixedLayout: boolean;
    lastLocation?: RelocateDetail;

    /** Accepts a File/Blob, a URL string, or an already-parsed book object. */
    open(book: File | Blob | string | FoliateBook): Promise<void>;
    /** Destructures its argument, so it must be called with an object. */
    init(opts: { lastLocation?: string; showTextStart?: boolean }): Promise<void>;
    close(): void;

    /** Target may be a CFI, an href, or a section index. */
    goTo(target: string | number): Promise<NavigationTarget | undefined>;
    /** May return a promise: MOBI/KF8 resolve hrefs asynchronously. */
    resolveNavigation(
      target: string | number
    ): NavigationTarget | Promise<NavigationTarget> | undefined;
    next(distance?: number): Promise<void>;
    prev(distance?: number): Promise<void>;

    search(opts: {
      query: string;
      index?: number;
      matchCase?: boolean;
      matchDiacritics?: boolean;
      matchWholeWords?: boolean;
    }): AsyncGenerator<SearchResultYield, void, void>;
    clearSearch(): void;

    addEventListener<K extends keyof FoliateViewEventMap>(
      type: K,
      listener: (event: FoliateViewEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
  }

  export class ResponseError extends Error {}
  export class NotFoundError extends Error {}
  export class UnsupportedTypeError extends Error {}

  export function makeBook(file: File | Blob | string): Promise<FoliateBook>;
}
