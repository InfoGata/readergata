import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";
import { Api } from "./types";

// Custom APIs for renderer
const api: Api = {
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  (window as any).electron = electronAPI;
  (window as any).api = api;
}
