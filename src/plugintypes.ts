export interface Publication {
  title: string;
  images?: ImageInfo[];
  summary?: string;
  authors?: Author[];
  apiId?: string;
  sources?: PublicationSource[];
  pluginId?: string;
  originalUrl?: string;
}

export interface PublicationSource {
  name?: string;
  source: string;
  type?: string;
}

export interface Author {
  name: string;
}

export interface ImageInfo {
  url: string;
  height?: number;
  width?: number;
}

export interface GetFeedRequest {
  apiId?: string;
  pageInfo?: PageInfo;
  filters?: FilterValues;
}

export interface SearchRequest {
  apiId?: string;
  query: string;
  searchInfo?: string;
  pageInfo?: PageInfo;
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

export interface GetPublicationRequest {
  source: string;
}

export type SourceType = "url" | "binary";

export interface GetPublicationResponse {
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
  hasSearch: boolean;
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
  domainHeadersToFind: Record<string, string[]>;
  completionUrl?: string;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}
