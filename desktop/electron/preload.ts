import { contextBridge, ipcRenderer } from "electron";

const api = {
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
  checkTools: () => ipcRenderer.invoke("check-tools"),
  getOutputFolder: (): Promise<string> => ipcRenderer.invoke("get-output-folder"),
  selectOutputFolder: (): Promise<string> => ipcRenderer.invoke("select-output-folder"),
  selectAudioFiles: (): Promise<string[]> => ipcRenderer.invoke("select-audio-files"),
  openOutputFolder: (): Promise<string> => ipcRenderer.invoke("open-output-folder"),
  openFile: (filePath: string): Promise<boolean> => ipcRenderer.invoke("open-file", filePath),
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke("open-external", url),
  downloadMedia: (url: string, format: "mp3" | "wav") =>
    ipcRenderer.invoke("download-media", { url, format }),
  downloadBeatport: (url: string) => ipcRenderer.invoke("download-beatport", { url }),
  convertAudioBatch: (
    inputPaths: string[],
    outputFormat: "wav" | "mp3" | "flac" | "m4a"
  ) => ipcRenderer.invoke("convert-audio-batch", { inputPaths, outputFormat }),

  // Telegram account
  telegramStatus: () => ipcRenderer.invoke("telegram-status"),
  telegramStartLogin: (payload: { apiId: number; apiHash: string; phone: string }) =>
    ipcRenderer.invoke("telegram-start-login", payload),
  telegramSubmitCode: (code: string) => ipcRenderer.invoke("telegram-submit-code", { code }),
  telegramSubmitPassword: (password: string) =>
    ipcRenderer.invoke("telegram-submit-password", { password }),
  telegramLogout: () => ipcRenderer.invoke("telegram-logout"),

  // Library
  libraryList: () => ipcRenderer.invoke("library-list"),
  libraryRemove: (id: string) => ipcRenderer.invoke("library-remove", id),
  startDrag: (filePath: string) => ipcRenderer.send("start-drag", filePath),
  onJobProgress: (
    callback: (progress: {
      progress: number;
      status: string;
      current?: number;
      total?: number;
      fileName?: string;
    }) => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: {
        progress: number;
        status: string;
        current?: number;
        total?: number;
        fileName?: string;
      }
    ) => {
      callback(payload);
    };
    ipcRenderer.on("job-progress", listener);
    return () => ipcRenderer.removeListener("job-progress", listener);
  },
};

contextBridge.exposeInMainWorld("lkrDesktop", api);

export type DesktopApi = typeof api;
