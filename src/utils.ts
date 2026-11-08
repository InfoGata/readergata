import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";
import { customAlphabet } from "nanoid";
import { toast } from "sonner";
import { db } from "./database";
import i18next from "./i18n";
import { Manifest, PluginInfo } from "./plugintypes";
import {
  DirectoryFile,
  FileType,
  NetworkRequest,
  PublicationSourceType,
  PublicationType,
} from "./types";
import { PDF_MIME_TYPE } from "./lib/ebook";
import semverGte from "semver/functions/gte";
import { hasExtension } from "@infogata/extension-components";

export const getDocumentData = (publication?: PublicationType) => {
  if (publication) {
    const table = db.documentData;
    switch (publication.sourceType) {
      case PublicationSourceType.Url:
        return table.where("url").equals(publication.source);
      case PublicationSourceType.Binary:
        if (publication.hash) {
          return table
            .where(["xxhash64", "fileSize"])
            .equals([publication.hash, publication.source.size]);
        }
    }
  }
};

export async function getPlugin(
  fileType: FileType,
  suppressErrors = false
): Promise<PluginInfo | null> {
  const manifestText = await getFileText(fileType, "manifest.json");
  if (!manifestText) return null;

  const manifest = JSON.parse(manifestText) as Manifest;
  if (!manifest.script) {
    if (!suppressErrors) {
      const errorText = i18next.t("common:manifestNoScript");
      toast.error(errorText);
    }
    return null;
  }

  const script = await getFileText(fileType, manifest.script);
  if (!script) return null;

  const plugin: PluginInfo = {
    id: manifest.id,
    // Only what the manifest asked for. The effective alias is assigned on
    // install, since another plugin may already hold this one.
    alias: manifest.alias,
    name: manifest.name,
    script,
    description: manifest.description,
    version: manifest.version,
    manifestUrl: manifest.updateUrl || fileType.url?.url,
    homepage: manifest.homepage,
    manifest,
  };

  if (manifest.options) {
    const optionsFile =
      typeof manifest.options === "string"
        ? manifest.options
        : manifest.options.page;
    const optionsText = await getFileText(fileType, optionsFile);
    if (!optionsText) return null;

    if (typeof manifest.options !== "string") {
      plugin.optionsSameOrigin = manifest.options.sameOrigin;
    }
    plugin.optionsHtml = optionsText;
  }

  return plugin;
}

export const directoryProps = {
  directory: "",
  webkitdirectory: "",
  mozdirectory: "",
};

export function getFileByDirectoryAndName(files: FileList, name: string) {
  if (files.length === 0) {
    return null;
  }
  const firstFile = files[0] as DirectoryFile;
  const directory = firstFile.webkitRelativePath.split("/")[0];
  for (let i = 0; i < files.length; i++) {
    const file = files[i] as DirectoryFile;
    if (file.webkitRelativePath === `${directory}/${name}`) {
      return file;
    }
  }
  return null;
}

export function getFileTypeFromPluginUrl(url: string) {
  const fileType: FileType = {
    url: {
      url: url,
    },
  };

  return fileType;
}

export async function getFileText(
  fileType: FileType,
  name: string,
  suppressErrors = false
): Promise<string | null> {
  if (fileType.filelist) {
    const file = getFileByDirectoryAndName(fileType.filelist, name);
    if (!file) {
      if (!suppressErrors) {
        const errorText = i18next.t("common:fileNotFound", { name });
        toast.error(errorText);
      }
      return null;
    }

    return await file.text();
  } else if (fileType.url) {
    const encodedName = encodeURIComponent(name);
    const newUrl = fileType.url.url.replace("manifest.json", encodedName);
    try {
      // Revalidate rather than trust the browser's copy. jsdelivr serves the
      // mutable @latest refs with `max-age=604800`, so a plain fetch can answer
      // an update check with a manifest from a week ago, and purging the CDN
      // can't reach the reader's own cache. "no-cache" revalidates rather than
      // refetches: an unchanged file is a 304 with no body. The manifest and
      // the script it names are separate cache entries, so both need it or a
      // version can be paired with code that isn't it.
      const result = await fetch(newUrl, {
        headers: fileType.url.headers,
        cache: "no-cache",
      });
      return await result.text();
    } catch {
      if (!suppressErrors) {
        const errorText = i18next.t("common:cantGetFile", { name });
        toast.error(errorText);
      }
      return null;
    }
  }
  return null;
}

// Takes a list because a publication can legitimately arrive under any of
// several types -- an ebook may be served as its own type or as a generic
// octet-stream, and foliate-js reads several formats.
export const isCorrectMimeType = (
  response: Response,
  type: string | string[]
): boolean => {
  const mimeType = response.headers.get("Content-Type");

  if (!mimeType) {
    // If no content type, just return true
    return true;
  }
  const accepted = Array.isArray(type) ? type : [type];
  return accepted.some((accept) => mimeType.includes(accept));
};

const proxy = import.meta.env.PROD
  ? "https://cloudcors-readergata.audio-pwa.workers.dev?url="
  : "http://localhost:36325/";

/** The url routed through the app's CORS proxy. */
export const toProxyUrl = (url: string) =>
  `${proxy}${url.replace(/(^\w+:|^)\/\//, "")}`;

// Re-exported so the rest of the app keeps importing detection from one place.
// The shared version also honours `?noextension`, which makes the app behave as
// if the extension were not installed -- the only way to exercise that path in
// a browser that has it.
export { hasExtension };

export const isCorsDisabled = () => {
  return hasExtension() || isElectron() || Capacitor.isNativePlatform();
};

export const hasAuthentication = async () => {
  const minVersion = "1.1.0";
  if (hasExtension() && window.InfoGata.getVersion) {
    const version = await window.InfoGata.getVersion();
    return semverGte(version, minVersion);
  }
  return Capacitor.isNativePlatform();
};

export type CorsRoute = "direct" | "extension" | "proxy";

// Statuses whose Response may not carry a body; the constructor throws if
// given one.
const NULL_BODY_STATUSES = new Set([101, 103, 204, 205, 304]);

/** The extension's answer as a standard Response. */
export const networkRequestToResponse = (result: NetworkRequest): Response => {
  if (result.status < 200 || result.status > 599) {
    throw new Error(`The extension returned status ${result.status}`);
  }
  return new Response(
    NULL_BODY_STATUSES.has(result.status) ? null : result.body,
    {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    }
  );
};

const fetchViaExtension = async (
  url: string,
  init?: RequestInit
): Promise<Response> => {
  // An AbortSignal can't be sent to the extension, and it couldn't act on one
  // anyway: it answers in a single message. Cancelling only discards the
  // answer.
  const { signal, ...rest } = init ?? {};
  const result = await window.InfoGata.networkRequest(url, rest);
  signal?.throwIfAborted();
  return networkRequestToResponse(result);
};

/**
 * Fetches a url from another site, getting past CORS when it has to.
 *
 * 1. Directly. The only route with streaming, progress and cancelling, so it
 *    always goes first.
 * 2. Through the extension, when it's installed. It can reach any site, but
 *    answers in one message: no progress, and chrome refuses messages past
 *    64 MiB, so a failure here still falls through.
 * 3. Through the CORS proxy (the Cloudflare worker in production,
 *    `npm run dev:proxy` in development).
 *
 * A CORS refusal surfaces as a thrown TypeError, never as a status, so any
 * response, even an error status, ends the search.
 */
export const corsFetchWithRoute = async (
  url: string,
  init?: RequestInit
): Promise<{ response: Response; route: CorsRoute; url: string }> => {
  try {
    return { response: await fetch(url, init), route: "direct", url };
  } catch (error) {
    if (init?.signal?.aborted) throw error;
  }
  if (hasExtension()) {
    try {
      return {
        response: await fetchViaExtension(url, init),
        route: "extension",
        url,
      };
    } catch (error) {
      if (init?.signal?.aborted) throw error;
      console.warn("Extension request failed, trying the CORS proxy", error);
    }
  }
  const proxied = toProxyUrl(url);
  return { response: await fetch(proxied, init), route: "proxy", url: proxied };
};

export const corsFetch = async (
  url: string,
  init?: RequestInit
): Promise<Response> => (await corsFetchWithRoute(url, init)).response;

/**
 * What to hand react-pdf for a PDF url: a url it can fetch itself, which
 * lets pdf.js load the file in pieces, or, when only the extension can reach
 * the site, the whole file. Null if it isn't a PDF or can't be reached.
 */
export const getPdfFile = async (
  url: string
): Promise<string | Blob | null> => {
  let head: Awaited<ReturnType<typeof corsFetchWithRoute>>;
  try {
    head = await corsFetchWithRoute(url, { method: "HEAD" });
  } catch {
    return null;
  }
  // Some servers answer HEAD with 404 but serve the file to GET.
  if (
    head.response.status !== 404 &&
    !isCorrectMimeType(head.response, PDF_MIME_TYPE)
  ) {
    return null;
  }
  if (head.route !== "extension") return head.url;
  const response = await corsFetch(url);
  return response.ok ? await response.blob() : null;
};

export const getPluginSubdomain = (id?: string): string => {
  if (import.meta.env.PROD || Capacitor.isNativePlatform()) {
    const domain = import.meta.env.VITE_DOMAIN || "readergata.com";
    const protocol = domain.startsWith("localhost")
      ? window.location.protocol
      : "https:";
    return `${protocol}//${id}.${domain}`;
  }
  return `${window.location.protocol}//${id}.${window.location.host}`;
};

export const getPluginUrl = (id: string, path: string): URL => {
  return import.meta.env.VITE_UNSAFE_SAME_ORIGIN_IFRAME === "true"
    ? new URL(path, window.location.origin)
    : new URL(`${getPluginSubdomain(id)}${path}`);
};

export const isAuthorizedDomain = (
  input: string,
  loginUrl?: string,
  domainHeaders?: Record<string, any>
): boolean => {
  if (!loginUrl) return false;

  const allowedHost = new URL(loginUrl).host;
  const inputHost = new URL(input).host;
  if (allowedHost === inputHost) {
    return true;
  }
  if (domainHeaders && Object.keys(domainHeaders).length > 0) {
    return Object.keys(domainHeaders).some((d) => inputHost.endsWith(d));
  }
  return false;
};

export const generatePluginId = () => {
  // Cannot use '-' or '_' if they show up and beginning or end of id.
  const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    21
  );
  return nanoid();
};

export const debounce = <T extends (...args: any[]) => void>(
  f: T,
  wait: number,
  immediate?: boolean
) => {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: any[]) => {
    const later = () => {
      timeout = undefined;
      if (!immediate) f(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) f(...args);
  };
};

export const searchThumbnailSize = 40;

const byteUnits = ["B", "KB", "MB", "GB", "TB"];

/**
 * Decimal units rather than binary, to match how the sites publications come
 * from report their own file sizes.
 */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const exponent = Math.min(
    byteUnits.length - 1,
    bytes === 0 ? 0 : Math.floor(Math.log10(bytes) / 3)
  );
  const value = bytes / 1000 ** exponent;
  // Whole bytes never want a decimal point; larger units read better with one.
  const digits = exponent === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(digits)} ${byteUnits[exponent]}`;
};

/**
 * Formats a `Publication.published` value for display.
 *
 * These arrive as anything ISO 8601 permits, and a bare year is the common
 * case for older books — so a year stays a year rather than becoming January
 * 1st in whatever timezone the reader happens to be in.
 */
export const formatPublished = (published: string): string => {
  const yearOnly = /^\d{4}$/.exec(published.trim());
  if (yearOnly) return yearOnly[0];

  const parsed = new Date(published);
  if (Number.isNaN(parsed.getTime())) return published;
  return parsed.toLocaleDateString();
};

export const drawerWidth = 240;
