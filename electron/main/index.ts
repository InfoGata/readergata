import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  OpenDialogOptions,
} from "electron";
import { join } from "path";
import { optimizer, is } from "@electron-toolkit/utils";
import fs from "fs";

function UpsertKeyValue(obj: any, keyToChange: string, value: string[]) {
  const keyToChangeLower = keyToChange.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      // Done
      return;
    }
  }
  // Insert at end instead
  obj[keyToChange] = value;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      sandbox: false,
    },
  });

  ipcMain.handle("open-file-dialog", async () => {
    const dialogConfig: OpenDialogOptions = {
      title: "Select a file",
      properties: ["openFile"],
      filters: [{ name: "Text Files", extensions: ["txt"] }],
    };
    const files = await dialog.showOpenDialog(dialogConfig);
    if (files.filePaths.length === 0) {
      return;
    }

    const file = files.filePaths[0];
    const content = fs.readFileSync(file).toString();
    mainWindow.setRepresentedFilename(file);
    return content;
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const { requestHeaders } = details;
      UpsertKeyValue(requestHeaders, "Access-Control-Allow-Origin", ["*"]);
      callback({ requestHeaders });
    }
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      const { responseHeaders } = details;
      if (responseHeaders) {
        // If credentials == "true", Access-Control-Allow-Origin cannot be "*"
        // So only set it if that header isn't there
        const credentialsHeader =
          responseHeaders["access-control-allow-credentials"];
        if (!credentialsHeader) {
          UpsertKeyValue(responseHeaders, "Access-Control-Allow-Origin", ["*"]);
          UpsertKeyValue(responseHeaders, "Access-Control-Allow-Headers", [
            "*",
          ]);
        }
      }
      callback({
        responseHeaders,
      });
    }
  );

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
