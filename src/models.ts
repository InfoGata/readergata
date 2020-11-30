export enum BookSourceType {
  Url,
  Binary,
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
  icon: string;
  urls: BookLinkItemUrl[];
}

export interface BookLinkItemUrl {
  type: string;
  url: string;
}
