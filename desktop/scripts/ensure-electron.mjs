import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const electronDir = path.join(root, "node_modules", "electron");
const pathFile = path.join(electronDir, "path.txt");

function getPlatformPath() {
  switch (process.platform) {
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "win32":
      return "electron.exe";
    default:
      return "electron";
  }
}

function getElectronBinary() {
  if (!existsSync(pathFile)) return null;
  const relative = readFileSync(pathFile, "utf8").trim();
  if (!relative) return null;
  const binary = path.join(electronDir, "dist", relative);
  return existsSync(binary) ? binary : null;
}

function runElectronInstall() {
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;

  return spawnSync(process.execPath, [path.join(electronDir, "install.js")], {
    cwd: root,
    stdio: "inherit",
    env,
  });
}

async function fallbackExtract() {
  const { downloadArtifact } = require("@electron/get");
  const { version } = require(path.join(electronDir, "package.json"));
  const platformPath = getPlatformPath();
  const distDir = path.join(electronDir, "dist");

  console.log("Fallback: downloading Electron", version);

  const zipPath = await downloadArtifact({
    version,
    artifactName: "electron",
    platform: process.platform,
    arch: process.arch,
    force: true,
  });

  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });

  if (process.platform === "win32") {
    const extractZip = require("extract-zip");
    await extractZip(zipPath, { dir: distDir });
  } else {
    const result = spawnSync("unzip", ["-q", zipPath, "-d", distDir], { stdio: "inherit" });
    if (result.status !== 0) {
      throw new Error("unzip failed");
    }
  }

  writeFileSync(pathFile, platformPath, "utf8");
}

function fixPathFile() {
  if (!existsSync(pathFile)) return;
  const trimmed = readFileSync(pathFile, "utf8").trim();
  if (trimmed) {
    writeFileSync(pathFile, trimmed, "utf8");
  }
}

async function main() {
  fixPathFile();

  if (getElectronBinary()) {
    console.log("Electron binary ready.");
    return;
  }

  console.log("Electron binary missing — installing...");
  const installResult = runElectronInstall();

  if (getElectronBinary()) {
    console.log("Electron installed successfully.");
    return;
  }

  if (installResult.status !== 0) {
    console.warn("electron/install.js failed, trying fallback...");
  }

  try {
    await fallbackExtract();
  } catch (error) {
    console.error("\nCould not install Electron.");
    console.error(error instanceof Error ? error.message : error);
    console.error("\nTry:");
    console.error("  rm -rf node_modules/electron && npm install");
    console.error("  nvm use 20   # Node 20 LTS recommended");
    process.exit(1);
  }

  if (!getElectronBinary()) {
    console.error("Electron binary still missing after install.");
    process.exit(1);
  }

  console.log("Electron installed via fallback.");
}

main();
