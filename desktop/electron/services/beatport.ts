import fs from "node:fs";
import path from "node:path";
import { downloadViaBeatportBot } from "./telegram";
import { convertAudio } from "./convert";
import { addLibraryEntry } from "./library";
import { getTempDir, sanitizeFilename } from "./settings";

type ProgressCallback = (payload: { progress: number; status: string }) => void;

/**
 * Full Beatport flow: ask the Telegram bot for the track, receive the file,
 * convert it to WAV, save into the output folder and record it in the library.
 */
export async function downloadBeatport(
  url: string,
  outputFolder: string,
  onProgress: ProgressCallback
) {
  if (!/beatport\.com/i.test(url)) {
    throw new Error("Cole um link do Beatport (beatport.com).");
  }

  const tempDir = getTempDir();
  const { tempPath, title } = await downloadViaBeatportBot(url, tempDir, onProgress);

  fs.mkdirSync(outputFolder, { recursive: true });

  try {
    // Convert whatever the bot sent (FLAC/M4A/MP3) into WAV.
    const result = await convertAudio(tempPath, "wav", outputFolder, (p) =>
      onProgress({ progress: Math.max(75, p.progress), status: "converting" })
    );

    const finalTitle = sanitizeFilename(title) || "Beatport track";

    addLibraryEntry({
      title: finalTitle,
      source: "beatport",
      originalUrl: url,
      filePath: result.filePath,
      format: "wav",
    });

    onProgress({ progress: 100, status: "done" });

    return {
      filePath: result.filePath,
      title: finalTitle,
      platform: "beatport" as const,
    };
  } finally {
    // Clean up the temp download.
    try {
      fs.rmSync(tempPath, { force: true });
    } catch {
      // ignore
    }
  }
}
