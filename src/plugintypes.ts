export interface Publication {
  title: string;
  subtitle?: string;
  images?: ImageInfo[];
  /** May contain html, which is sanitized before rendering. */
  summary?: string;
  authors?: Author[];
  publisher?: string;
  languages?: string[];
  /**
   * ISO 8601 string — "2019", "2019-04-02" or a full timestamp. A string
   * rather than a `Date` because values cross the plugin frame's postMessage
   * boundary, which a `Date` does not survive intact.
   */
  published?: string;
  categories?: Category[];
  series?: Series;
  pageCount?: number;
  rights?: string;
  identifiers?: Identifier[];
  /** 0 to 5. */
  rating?: number;
  /**
   * Id from the third party service. Both what the publication's own url is
   * built from and what is handed back to `onGetPublicationDetails`, so a
   * publication without one has no page of its own.
   */
  apiId?: string;
  sources?: PublicationSource[];
  pluginId?: string;
  originalUrl?: string;
}

export interface Category {
  name: string;
  /** Vocabulary `name` is drawn from. Unset for a free-form tag. */
  scheme?: string;
}

export interface Series {
  name: string;
  /** Position within the series, counting from 1. */
  position?: number;
}

export interface Identifier {
  /** Lowercase scheme: "isbn", "issn", "doi", "asin", "oclc", "uuid". */
  type: string;
  value: string;
}

/** How a source is obtained, following the OPDS acquisition relations. */
export type AcquisitionType =
  | "open-access"
  | "borrow"
  | "buy"
  | "sample"
  | "subscribe";

export interface PublicationSource {
  name?: string;
  /** Opaque to ReaderGata: handed straight back to `onGetPublicationSource`. */
  source: string;
  type?: string;
  /** Bytes. */
  size?: number;
  price?: number;
  /** ISO 4217 code for `price`. */
  currency?: string;
  /** Treated as "open-access" when unset. */
  acquisitionType?: AcquisitionType;
}

export interface Author {
  name: string;
  url?: string;
}

export interface ImageInfo {
  url: string;
  height?: number;
  width?: number;
}

export interface GetFeedRequest {
  apiId?: string;
  pageInfo?: PageRequest;
  filters?: FilterValues;
}

export interface SearchRequest {
  apiId?: string;
  query: string;
  searchInfo?: string;
  pageInfo?: PageRequest;
  filters?: FilterValues;
}

/**
 * Chosen filter values, keyed by `Filter.id`. This is all a plugin is sent
 * back — the rest of a `Filter` only describes how to render it.
 */
export type FilterValues = Record<string, string>;

export interface FilterInfo {
  filters: Filter[];
}

export type FilterType = "radio" | "select" | "text";

export interface Filter {
  /**
   * Unique identifier of filter.
   */
  id: string;
  /**
   * Name of filter that will be displayed to user.
   */
  displayName: string;
  /**
   * Type of filter used to determine if filter will be displayed
   * as a radio field, select tag, or text field.
   */
  type: FilterType;
  /**
   * Value that this filter is set to.
   */
  value?: string;
  /**
   * Selectable options for filter used when filter
   * is type "radio" or "select"
   */
  options?: FilterOption[];
}

export interface FilterOption {
  displayName: string;
  value: string;
}

/**
 * The page being asked for.
 *
 * Only `offset` is certain: the page a user is on lives in the url, so a link
 * into the middle of a feed arrives with no page size in hand. The plugin
 * picks its own and reports it back in `PageInfo`.
 */
export interface PageRequest {
  offset: number;
  /** Page size last seen from this feed, when there was one. Advisory. */
  resultsPerPage?: number;
}

/**
 * The page a plugin returned.
 */
export interface PageInfo {
  /**
   * Total number of results returned
   */
  totalResults?: number;
  /**
   * Number of results on current page
   */
  resultsPerPage: number;
  /**
   * Current offset in the number of totalResults
   */
  offset: number;
  /**
   * Optional string containing information about next page. For example, a url to the next page.
   */
  nextPage?: string;
  /**
   * Optional string containing information about previous page. For example, a url to the next page.
   */
  prevPage?: string;
}

export interface GetPublicationSourceRequest {
  source: string;
}

export interface GetPublicationDetailsRequest {
  apiId: string;
}

export type SourceType = "url" | "binary";

export interface GetPublicationSourceResponse {
  /**
   * Binary data or url for the pdf/epub
   */
  source: string;
  /**
   * Whether source is a url or binary data
   * If undefined, source will be treated as binary data
   */
  sourceType?: SourceType;
}

export interface Catalog {
  id?: string;
  apiId?: string;
  pluginId?: string;
  name: string;
}

export type CatalogFeed = {
  type: "catalog";
  items: Catalog[];
};

export type PublicationFeed = {
  type: "publication";
  items: Publication[];
};

export type FeedInfo = {
  hasSearch?: boolean;
  searchInfo?: string;
  /**
   * Page the plugin returned. When set, next/previous controls are shown.
   */
  pageInfo?: PageInfo;
  /**
   * Filters the plugin supports for this feed. When set, filter controls are
   * shown and the chosen values are sent back as `filters`.
   */
  filterInfo?: FilterInfo;
};

export type Feed = (CatalogFeed | PublicationFeed) & FeedInfo;

export interface PluginInfo {
  id?: string;
  /**
   * Short, human readable name used in urls (`/s/opds/feed`). Assigned locally
   * at install time from the manifest, so it can differ from what the manifest
   * asked for when another plugin already took it, or when the user renamed it.
   */
  alias?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  optionsSameOrigin?: boolean;
  manifestUrl?: string;
  homepage?: string;
  manifest?: Manifest;
}

export interface NotificationMessage {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}
export interface Manifest {
  name: string;
  script: string;
  id?: string;
  /** Requested url alias. Only a request: ids stay the stable identity. */
  alias?: string;
  version?: string;
  description?: string;
  options?: string | ManifestOptions;
  homepage?: string;
  updateUrl?: string;
  authentication?: ManifestAuthentication;
  siteMatch?: string[];
}

export interface ManifestAuthentication {
  loginUrl: string;
  cookiesToFind?: string[];
  loginButton?: string;
  headersToFind?: string[];
  domainHeadersToFind?: Record<string, string[]>;
  completionUrl?: string;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}
