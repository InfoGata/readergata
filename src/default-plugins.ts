export interface PluginDescription {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const defaultPlugins: PluginDescription[] = [
  {
    id: "P5oPcz76xlHWUtp5AzLzg",
    name: "Plugin for HumbleBundle",
    description: "Get books from Humble Bundle",
    url: "",
  },
  {
    id: "tJlCCR6lCfx7XeU_9LQum",
    name: "Opds Catalog",
    description: "Get books from opds catalogs.",
    url: "",
  },
];
