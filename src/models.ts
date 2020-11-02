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
  size: string;
}
