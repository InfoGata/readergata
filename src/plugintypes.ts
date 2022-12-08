export interface Publication {
  title: string;
  images?: ImageInfo[];
  summary?: string;
  authors: Author[];
  apiId?: string;
  sources?: PublicationSource[];
  pluginId?: string;
}

export interface PublicationSource {
  name: string;
  source: string;
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

export interface Catalog {
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

export type Feed = CatalogFeed | PublicationFeed;

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
}

export interface ImageInfo {
  url: string;
  height?: number;
  width?: number;
}
