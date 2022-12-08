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
