import type { DesktopApi, JobProgress, LibraryEntry, TelegramStatus } from "@/types/ipc";

// Browser-only mock so the UI can run in a plain browser (design/preview,
// and `npm run dev` without Electron). In the packaged app the real
// window.lkrDesktop bridge always takes precedence.

const listeners = new Set<(p: JobProgress) => void>();

function emit(p: JobProgress) {
  listeners.forEach((cb) => cb(p));
}

async function fakeProgress(kind: "download" | "convert", total = 1) {
  for (let i = 0; i <= 100; i += 8) {
    emit({
      progress: i,
      status: i < 90 ? (kind === "download" ? "downloading" : "converting") : "finalizing",
      current: 1,
      total,
      fileName: kind === "convert" ? "demo-track.flac" : undefined,
    });
    await new Promise((r) => setTimeout(r, 90));
  }
  emit({ progress: 100, status: "done", current: total, total });
}

let mockTelegram: TelegramStatus = { connected: false };
let mockLibrary: LibraryEntry[] = [
  {
    id: "1",
    title: "Charlotte de Witte - Overdrive",
    source: "beatport",
    originalUrl: "https://www.beatport.com/track/overdrive/12345",
    filePath: "/Users/dj/Music/LKR DJ TOOLs/Charlotte de Witte - Overdrive.wav",
    format: "wav",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "2",
    title: "Fisher - Losing It",
    source: "youtube",
    originalUrl: "https://youtube.com/watch?v=abc",
    filePath: "/Users/dj/Music/LKR DJ TOOLs/Fisher - Losing It.mp3",
    format: "mp3",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "3",
    title: "Boris Brejcha - Gravity",
    source: "soundcloud",
    originalUrl: "https://soundcloud.com/boris/gravity",
    filePath: "/Users/dj/Music/LKR DJ TOOLs/Boris Brejcha - Gravity.wav",
    format: "wav",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
];

export const browserMock: DesktopApi = {
  getAppInfo: async () => ({
    version: "0.1.0-preview",
    platform: "browser",
    outputFolder: "/Users/dj/Music/LKR DJ TOOLs",
  }),
  checkTools: async () => ({
    ffmpeg: true,
    ffmpegPath: "/opt/ffmpeg",
    ytdlp: true,
    ytdlpVersion: "2026.07.04",
    ytdlpPath: "/opt/yt-dlp",
  }),
  getOutputFolder: async () => "/Users/dj/Music/LKR DJ TOOLs",
  selectOutputFolder: async () => "/Users/dj/Music/LKR DJ TOOLs",
  selectAudioFiles: async () => [
    "/Users/dj/Music/set/track-01.flac",
    "/Users/dj/Music/set/track-02.m4a",
  ],
  getPathForFile: (file) => (file as File & { path?: string }).path ?? file.name,
  openOutputFolder: async () => "/Users/dj/Music/LKR DJ TOOLs",
  openFile: async () => true,
  openExternal: async (url) => {
    window.open(url, "_blank");
    return true;
  },
  downloadMedia: async (_url, _format) => {
    await fakeProgress("download");
    return {
      filePath: "/Users/dj/Music/LKR DJ TOOLs/Demo Track.mp3",
      title: "Demo Track",
      platform: "youtube",
    };
  },
  convertAudioBatch: async (inputPaths, _format) => {
    await fakeProgress("convert", inputPaths.length);
    return {
      results: inputPaths.map((p) => ({ filePath: p, title: p, platform: "local" as const })),
      failed: [],
    };
  },
  downloadBeatport: async (url) => {
    await fakeProgress("download");
    const entry: LibraryEntry = {
      id: String(Date.now()),
      title: "Beatport Demo Track",
      source: "beatport",
      originalUrl: url,
      filePath: "/Users/dj/Music/LKR DJ TOOLs/Beatport Demo Track.wav",
      format: "wav",
      createdAt: Date.now(),
    };
    mockLibrary = [entry, ...mockLibrary];
    return { filePath: entry.filePath, title: entry.title, platform: "beatport" };
  },
  onJobProgress: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  telegramStatus: async () => mockTelegram,
  telegramStartLogin: async () => ({ needsCode: true }),
  telegramSubmitCode: async (code) => {
    if (code === "2222") return { needsPassword: true };
    mockTelegram = { connected: true, username: "dj_preview", phone: "+55 11 90000-0000", firstName: "DJ" };
    return { connected: true as const, username: "dj_preview", phone: "+55 11 90000-0000", firstName: "DJ" };
  },
  telegramSubmitPassword: async () => {
    mockTelegram = { connected: true, username: "dj_preview", phone: "+55 11 90000-0000", firstName: "DJ" };
    return { connected: true as const, username: "dj_preview", phone: "+55 11 90000-0000", firstName: "DJ" };
  },
  telegramLogout: async () => {
    mockTelegram = { connected: false };
    return { connected: false };
  },

  libraryList: async () => mockLibrary,
  libraryRemove: async (id) => {
    mockLibrary = mockLibrary.filter((e) => e.id !== id);
    return true;
  },
  startDrag: () => {
    /* no-op in browser preview */
  },
};

export function installBrowserMockIfNeeded() {
  if (typeof window !== "undefined" && !window.lkrDesktop) {
    window.lkrDesktop = browserMock;
  }
}
