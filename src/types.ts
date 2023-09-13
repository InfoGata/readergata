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

export interface EBook {
  type: "ebook";
  source: string;
  sourceType: PublicationSourceType;
}

export interface Pdf {
  type: "pdf";
  source: string;
  sourceType: PublicationSourceType;
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
  bookmarks?: Bookmark[];
  xxhash64?: string;
  fileSize?: number;
}

export interface Bookmark {
  title: string;
  location: string;
}
