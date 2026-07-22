import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SETTINGS_FILE = "settings.json";

function getSettingsPath() {
  return path.join(app.getPath("userData"), SETTINGS_FILE);
}

function defaultOutputFolder() {
  return path.join(app.getPath("music"), "LKR DJ TOOLs");
}

export function getOutputFolder(): string {
  try {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, "utf8")) as {
        outputFolder?: string;
      };
      if (data.outputFolder && fs.existsSync(data.outputFolder)) {
        return data.outputFolder;
      }
    }
  } catch {
    // ignore
  }

  const fallback = defaultOutputFolder();
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

export function setOutputFolder(folder: string) {
  fs.mkdirSync(folder, { recursive: true });
  const settingsPath = getSettingsPath();
  const data = { outputFolder: folder };
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf8");
}

export function sanitizeFilename(name: string) {
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export function getTempDir() {
  return path.join(os.tmpdir(), "lkr-dj-tools");
}
