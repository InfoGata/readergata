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

export enum BookSourceType {
  Url,
  Binary,
  Base64,
}

export interface EBook {
  source: string;
  sourceType: BookSourceType;
}

export enum PdfSourceType {
  Url,
  Binary,
}

export interface Pdf {
  source: string;
  sourceType: PdfSourceType;
}

export interface BookContent {
  title: string;
  location?: string;
  dest?: any;
  items: BookContent[];
}
