export interface NetworkRequest {
  body: Blob | ArrayBuffer;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

declare global {
  interface Window {
    InfoGata: InfoGataExtension;
  }
}

export interface InfoGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
}

export interface DirectoryFile extends File {
  webkitRelativePath: string;
}

export interface UrlInfo {
  url: string;
  headers?: Headers;
}

export interface FileType {
  filelist?: FileList;
  url?: UrlInfo;
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

export enum PublicationSourceType {
  Url,
  Binary,
}

export interface Publication {
  source: string;
  sourceType: PublicationSourceType;
  hash?: string;
}

export interface EBook extends Publication {
  type: "ebook";
}

export interface Pdf extends Publication {
  type: "pdf";
}

export type PublicationType = EBook | Pdf;

export interface BookContent {
  title: string;
  location?: string;
  items: BookContent[];
  pageNumber?: number;
}

export interface SearchResult {
  location?: string;
  text: string;
}

export interface DocumentData {
  url?: string;
  bookmarks: Bookmark[];
  xxhash64?: string;
  fileSize?: number;
  currentLocation?: string;
}

export interface Bookmark {
  title: string;
  location: string;
}
