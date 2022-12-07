import { Author } from "./plugintypes";

export enum BookSourceType {
  Url,
  Binary,
  Base64,
}

export interface EBook {
  source: string;
  sourceType: BookSourceType;
}

export interface BookContent {
  title: string;
  location?: string;
  items: BookContent[];
}

export interface BookLinkItem {
  name: string;
  authors?: Author[];
  icon: string;
  urls: BookLinkItemUrl[];
  rights?: string;
  publisher?: string;
  summary?: string;
  language?: string;
}

export interface BookLinkItemUrl {
  type: string;
  url: string;
}
