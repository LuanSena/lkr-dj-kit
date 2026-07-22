export type OutputFormat = "mp3" | "wav" | "flac" | "m4a";

export type Platform = "youtube" | "soundcloud" | "spotify" | "beatport" | "local";

export type LibrarySource = "youtube" | "soundcloud" | "spotify" | "beatport" | "local";

export type LibraryEntry = {
  id: string;
  title: string;
  source: LibrarySource;
  originalUrl: string;
  filePath: string;
  format: string;
  createdAt: number;
};

export type TelegramStatus = {
  connected: boolean;
  username?: string;
  phone?: string;
  firstName?: string;
};

export type TelegramLoginStep =
  | { needsCode: true }
  | { needsPassword: true }
  | ({ connected: true } & TelegramStatus);

export type JobProgress = {
  progress: number;
  status: "preparing" | "downloading" | "converting" | "finalizing" | "done";
  current?: number;
  total?: number;
  fileName?: string;
};

export type AppInfo = {
  version: string;
  platform: string;
  outputFolder: string;
};

export type ToolsStatus = {
  ffmpeg: boolean;
  ffmpegPath: string;
  ytdlp: boolean;
  ytdlpVersion: string;
  ytdlpPath: string;
};

export type DownloadResult = {
  filePath: string;
  title: string;
  platform: Platform;
};

export type BatchConvertResult = {
  results: DownloadResult[];
  failed: { filePath: string; error: string }[];
};

export type DesktopApi = {
  getAppInfo: () => Promise<AppInfo>;
  checkTools: () => Promise<ToolsStatus>;
  getOutputFolder: () => Promise<string>;
  selectOutputFolder: () => Promise<string>;
  selectAudioFiles: () => Promise<string[]>;
  openOutputFolder: () => Promise<string>;
  openFile: (filePath: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<boolean>;
  downloadMedia: (url: string, format: "mp3" | "wav") => Promise<DownloadResult>;
  downloadBeatport: (url: string) => Promise<DownloadResult>;
  convertAudioBatch: (
    inputPaths: string[],
    outputFormat: OutputFormat
  ) => Promise<BatchConvertResult>;
  onJobProgress: (callback: (progress: JobProgress) => void) => () => void;

  // Telegram account
  telegramStatus: () => Promise<TelegramStatus>;
  telegramStartLogin: (payload: {
    apiId: number;
    apiHash: string;
    phone: string;
  }) => Promise<TelegramLoginStep>;
  telegramSubmitCode: (code: string) => Promise<TelegramLoginStep>;
  telegramSubmitPassword: (password: string) => Promise<TelegramLoginStep>;
  telegramLogout: () => Promise<{ connected: false }>;

  // Library
  libraryList: () => Promise<LibraryEntry[]>;
  libraryRemove: (id: string) => Promise<boolean>;
  startDrag: (filePath: string) => void;
};

declare global {
  interface Window {
    lkrDesktop: DesktopApi;
  }
}

export function getDesktopApi(): DesktopApi {
  if (!window.lkrDesktop) {
    throw new Error("Desktop API not available.");
  }
  return window.lkrDesktop;
}

export function fileBaseName(filePath: string) {
  return filePath.split(/[/\\]/).pop() || filePath;
}

export function folderLabel(folderPath: string) {
  const parts = folderPath.split(/[/\\]/).filter(Boolean);
  if (parts.length <= 2) return folderPath;
  return `…/${parts.slice(-2).join("/")}`;
}
