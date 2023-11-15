export interface Publication {
  title: string;
  images?: ImageInfo[];
  summary?: string;
  authors?: Author[];
  apiId?: string;
  sources?: PublicationSource[];
  pluginId?: string;
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
}

export interface SearchRequest {
  apiId?: string;
  query: string;
  searchInfo?: string;
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
};

export type Feed = (CatalogFeed | PublicationFeed) & FeedInfo;

export interface PluginInfo {
  id?: string;
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
  version?: string;
  description?: string;
  options?: string | ManifestOptions;
  homepage?: string;
  updateUrl?: string;
}
export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}
