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
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_DOMAIN: string;
    }
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
  source: string;
  sourceType: PublicationSourceType;
}

export interface Pdf {
  source: string;
  sourceType: PublicationSourceType;
}

export interface BookContent {
  title: string;
  location?: string;
  dest?: any;
  items: BookContent[];
}

export interface SearchResult {
  location?: string;
  text: string;
}
