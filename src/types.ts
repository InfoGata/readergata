import React from "react";
import { LinkOptions } from "@tanstack/react-router";
import { ManifestAuthentication } from "./plugintypes";
import { RouterType } from "./router";

export interface NetworkRequest {
  body: Blob | ArrayBuffer | null;
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

export interface SiteRedirectRule {
  pluginId: string;
  pluginName: string;
  appName: string;
  appOrigin: string;
  siteMatchPatterns: string[];
  redirectPath: string;
}

export interface InfoGataExtension {
  networkRequest: (
    input: string,
    init?: RequestInit,
    options?: NetworkRequestOptions
  ) => Promise<NetworkRequest>;
  openLoginWindow?: (
    auth: ManifestAuthentication,
    pluginId: string
  ) => Promise<void>;
  getVersion?: () => Promise<string>;
  registerRedirects?: (rules: SiteRedirectRule[]) => void;
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

interface UrlSource {
  sourceType: PublicationSourceType.Url;
  source: string;
}

/**
 * The bytes themselves, as a `Blob` rather than the string of char codes the
 * plugin interface speaks in. A publication is as large as the reader's
 * library allows -- 650 MB epubs exist on archive.org -- and a js string costs
 * two bytes of heap per byte of file, on top of the copy it is decoded from.
 * A `Blob` is a handle: it survives the plugin boundary, `redux-persist` and
 * `URL.createObjectURL` without the bytes ever entering the heap.
 */
interface BinarySource {
  sourceType: PublicationSourceType.Binary;
  source: Blob;
  hash?: string;
}

export type PublicationSourceData = UrlSource | BinarySource;

export type Publication = PublicationSourceData & {
  fileName?: string;
};

export type EBook = Publication & {
  type: "ebook";
};

export type Pdf = Publication & {
  type: "pdf";
};

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

export type LinkRouterProps = LinkOptions<RouterType>;

export interface NavigationLinkItem {
  title: string;
  link: LinkRouterProps;
  icon: React.JSX.Element;
}
