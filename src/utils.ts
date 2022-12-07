import { ImageInfo, PluginInfo } from "./plugintypes";
import { DirectoryFile, FileType, Manifest } from "./types";
import i18next from "./i18n";
import thumbnail from "./thumbnail.png";

export async function getPlugin(
  fileType: FileType
): Promise<PluginInfo | null> {
  const manifestText = await getFileText(fileType, "manifest.json");
  if (!manifestText) return null;

  const manifest = JSON.parse(manifestText) as Manifest;
  if (!manifest.script) {
    const errorText = i18next.t("common:manifestNoScript");
    alert(errorText);
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
  name: string
): Promise<string | null> {
  if (fileType.filelist) {
    const file = getFileByDirectoryAndName(fileType.filelist, name);
    if (!file) {
      const errorText = i18next.t("common:fileNotFound", { name });
      alert(errorText);
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
      const errorText = i18next.t("common:cantGetFile", { name });
      alert(errorText);
      return null;
    }
  }
  return null;
}

// Retreive smallest image bigger than thumbnail size
export const getThumbnailImage = (
  images: ImageInfo[] | undefined,
  size: number
): string => {
  if (!images) {
    return thumbnail;
  }

  const sortedImages = [...images].sort(
    (a, b) => (a.height || 0) - (b.height || 0)
  );
  const thumbnailImage = sortedImages.find((i) => (i.height || 0) >= size);
  return thumbnailImage
    ? thumbnailImage.url
    : sortedImages[0]?.url ?? thumbnail;
};

export const searchThumbnailSize = 40;
