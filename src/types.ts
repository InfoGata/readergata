import { ManifestAuthentication } from "./plugintypes";

export interface NetworkRequest {
  body: Blob | ArrayBuffer;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

export interface NetworkRequestOptions {
  auth?: ManifestAuthentication;
}

declare global {
  interface Window {
    InfoGata: InfoGataExtension;
  }
}

export interface InfoGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit,
    options?: NetworkRequestOptions
  ) => Promise<NetworkRequest>;
  openLoginWindow?: (
    auth: ManifestAuthentication,
    pluginId: string
  ) => Promise<void>;
  getVersion?: () => Promise<string>;
}

export interface DirectoryFile extends File {
  webkitRelativePath: string;
}

export interface PluginAuthentication {
  pluginId: string;
  headers: Record<string, string>;
  domainHeaders?: Record<string, Record<string, string>>;
}

export type NotifyLoginMessage = {
  type: "infogata-extension-notify-login";
  pluginId: string;
  headers: Record<string, string>;
  domainHeaders: Record<string, Record<string, string>>;
};

export interface UrlInfo {
  url: string;
  headers?: Headers;
}

export interface FileType {
  filelist?: FileList;
  url?: UrlInfo;
}

export enum PublicationSourceType {
  Url,
  Binary,
}

export interface Publication {
  source: string;
  sourceType: PublicationSourceType;
  hash?: string;
  fileName?: string;
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
  id?: string;
  url?: string;
  bookmarks: Bookmark[];
  xxhash64?: string;
  fileSize?: number;
  currentLocation?: string;
  title?: string;
  author?: string;
  fileName?: string;
}

export interface Bookmark {
  title?: string;
  location: string;
}
