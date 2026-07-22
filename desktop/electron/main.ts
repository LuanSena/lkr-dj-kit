import { app, BrowserWindow, ipcMain, dialog, shell, nativeImage } from "electron";
import path from "node:path";
import { downloadMedia } from "./services/download";
import { convertAudioBatch } from "./services/convert";
import { checkTools } from "./services/tools";
import { getOutputFolder, setOutputFolder } from "./services/settings";
import {
  addLibraryEntry,
  listLibrary,
  removeLibraryEntry,
  type LibrarySource,
} from "./services/library";
import {
  telegramStatus,
  telegramStartLogin,
  telegramSubmitCode,
  telegramSubmitPassword,
  telegramLogout,
} from "./services/telegram";
import { downloadBeatport } from "./services/beatport";

const DRAG_ICON_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA+klEQVR4nO2aOw7CMBBEJ6OcgDZdREvL/WtaWrQdba4AQqKAKA628G+cvDqR3+6sI0sOsFOWLuTh8To9kAk7HbzcutrEQwvpahX3LYQQkF/zoYL8mhdV5F1+zhFSgUrdX/JsJ4FRpPtz33YSUKVPvcD9fAx+Z7jctpMAIQ4hDiFOn3vBkA26iQQIcQhxCHEIcQhxCHEIcfrSJ89qEighH62AUvJRCigp38QmJsSh8lH6xZ7A4NnVFN2PlsAvuVTyXwX43kmFSqaSt7dv1KNEyk57jdC/KeTCPjzb+wpZ5SnYzG8xgVqLsAUv5wjVVoQ5fNq+qVf4VwLqPAGV1lQjic3adwAAAABJRU5ErkJggg==";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: "#070912",
    title: "LKR DJ TOOLs",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function sendProgress(payload: { progress: number; status: string }) {
  mainWindow?.webContents.send("job-progress", payload);
}

ipcMain.handle("get-app-info", async () => ({
  version: app.getVersion(),
  platform: process.platform,
  outputFolder: getOutputFolder(),
}));

ipcMain.handle("check-tools", async () => checkTools());

ipcMain.handle("get-output-folder", async () => getOutputFolder());

ipcMain.handle("select-output-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openDirectory", "createDirectory"],
    title: "Escolher pasta de saída",
  });

  if (result.canceled || !result.filePaths[0]) {
    return getOutputFolder();
  }

  setOutputFolder(result.filePaths[0]);
  return result.filePaths[0];
});

ipcMain.handle(
  "download-media",
  async (_event, payload: { url: string; format: "mp3" | "wav" }) => {
    const result = await downloadMedia(
      payload.url,
      payload.format,
      getOutputFolder(),
      sendProgress
    );
    addLibraryEntry({
      title: result.title,
      source: result.platform as LibrarySource,
      originalUrl: payload.url,
      filePath: result.filePath,
      format: payload.format,
    });
    return result;
  }
);

ipcMain.handle("download-beatport", async (_event, payload: { url: string }) => {
  return downloadBeatport(payload.url, getOutputFolder(), sendProgress);
});

// ---- Telegram account ----
ipcMain.handle("telegram-status", async () => telegramStatus());
ipcMain.handle(
  "telegram-start-login",
  async (_event, payload: { apiId: number; apiHash: string; phone: string }) =>
    telegramStartLogin(payload)
);
ipcMain.handle("telegram-submit-code", async (_event, payload: { code: string }) =>
  telegramSubmitCode(payload)
);
ipcMain.handle("telegram-submit-password", async (_event, payload: { password: string }) =>
  telegramSubmitPassword(payload)
);
ipcMain.handle("telegram-logout", async () => telegramLogout());

// ---- Library ----
ipcMain.handle("library-list", async () => listLibrary());
ipcMain.handle("library-remove", async (_event, id: string) => removeLibraryEntry(id));

// ---- Native drag-out of a library file to other apps ----
ipcMain.on("start-drag", (event, filePath: string) => {
  const icon = nativeImage.createFromDataURL(`data:image/png;base64,${DRAG_ICON_BASE64}`);
  event.sender.startDrag({ file: filePath, icon });
});

ipcMain.handle(
  "convert-audio",
  async (_event, payload: { inputPath: string; outputFormat: "wav" | "mp3" | "flac" | "m4a" }) => {
    const { results, failed } = await convertAudioBatch(
      [payload.inputPath],
      payload.outputFormat,
      getOutputFolder(),
      sendProgress
    );
    if (failed.length > 0) {
      throw new Error(failed[0].error);
    }
    return results[0];
  }
);

ipcMain.handle(
  "convert-audio-batch",
  async (
    _event,
    payload: { inputPaths: string[]; outputFormat: "wav" | "mp3" | "flac" | "m4a" }
  ) => {
    return convertAudioBatch(
      payload.inputPaths,
      payload.outputFormat,
      getOutputFolder(),
      sendProgress
    );
  }
);

ipcMain.handle("select-audio-files", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Audio",
        extensions: ["flac", "m4a", "mp3", "aac", "wav", "ogg", "webm"],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return [];
  }

  return result.filePaths;
});

ipcMain.handle("select-audio-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openFile"],
    filters: [
      {
        name: "Audio",
        extensions: ["flac", "m4a", "mp3", "aac", "wav", "ogg", "webm"],
      },
    ],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("open-output-folder", async () => {
  const folder = getOutputFolder();
  await shell.openPath(folder);
  return folder;
});

ipcMain.handle("open-file", async (_event, filePath: string) => {
  await shell.showItemInFolder(filePath);
  return true;
});

ipcMain.handle("open-external", async (_event, url: string) => {
  await shell.openExternal(url);
  return true;
});

export function getMainWindow() {
  return mainWindow;
}
