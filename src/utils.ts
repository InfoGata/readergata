import isElectron from "is-electron";
import { customAlphabet } from "nanoid";
import { db } from "./database";
import i18next from "./i18n";
import { Manifest, PluginInfo } from "./plugintypes";
import {
  DirectoryFile,
  FileType,
  PublicationSourceType,
  PublicationType,
} from "./types";
import semverGte from "semver/functions/gte";

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
            .equals([publication.hash, publication.source.length]);
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
      alert(errorText);
    }
    return null;
  }

  const script = await getFileText(fileType, manifest.script);
  if (!script) return null;

  const plugin: PluginInfo = {
    id: manifest.id,
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
        alert(errorText);
      }
      return null;
    }

    return await file.text();
  } else if (fileType.url) {
    const encodedName = encodeURIComponent(name);
    const newUrl = fileType.url.url.replace("manifest.json", encodedName);
    try {
      const result = await fetch(newUrl, { headers: fileType.url.headers });
      return await result.text();
    } catch {
      if (!suppressErrors) {
        const errorText = i18next.t("common:cantGetFile", { name });
        alert(errorText);
      }
      return null;
    }
  }
  return null;
}

const isCorrectMimeType = (response: Response, type: string): boolean => {
  const mimeType = response.headers.get("Content-Type");

  if (!mimeType) {
    // If no content type, just return true
    return true;
  } else if (mimeType.includes(type)) {
    return true;
  } else {
    return false;
  }
};

const proxy = import.meta.env.PROD
  ? "https://cloudcors-readergata.audio-pwa.workers.dev?url="
  : "http://localhost:36325/";

export const hasExtension = () => {
  return typeof window.InfoGata !== "undefined";
};

export const corsIsDisabled = () => {
  return hasExtension() || isElectron();
};

export const hasAuthentication = async () => {
  const minVersion = "1.1.0";
  if (hasExtension() && window.InfoGata.getVersion) {
    const version = await window.InfoGata.getVersion();
    return semverGte(version, minVersion);
  }
  return false;
};

export const getValidUrl = async (url: string, mimeType: string) => {
  try {
    // Fetch and check the mime type
    const response = await fetch(url, { method: "HEAD" });
    if (response.status === 404) {
      // HEAD will sometimes return 404
      // But GET returns successfully
      return url;
    }
    return isCorrectMimeType(response, mimeType) ? url : null;
  } catch {
    // Determine if error is because of cors
    const noProtocol = url.replace(/(^\w+:|^)\/\//, "");
    const proxyUrl = `${proxy}${noProtocol}`;
    try {
      const response = await fetch(proxyUrl, { method: "HEAD" });
      if (response.status === 404) {
        // HEAD will sometimes return 404
        // But GET returns successfully
        return proxyUrl;
      }
      return isCorrectMimeType(response, mimeType) ? proxyUrl : null;
    } catch {
      alert("Could not get file");
    }
  }
  return null;
};

export const openFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(res.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

export const getPluginSubdomain = (id?: string): string => {
  if (import.meta.env.PROD) {
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

export const drawerWidth = 240;