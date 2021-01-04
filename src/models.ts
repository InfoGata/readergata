export enum BookSourceType {
  Url,
  Binary,
  Base64,
}

export interface Book {
  bookSource: string;
  bookSourceType: BookSourceType;
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

export interface Author {
  name: string;
}

export interface BookLinkItemUrl {
  type: string;
  url: string;
}

export interface Catalog {
  id?: string[];
  name: string;
  url: string;
}