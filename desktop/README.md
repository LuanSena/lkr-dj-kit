# LKR DJ TOOLs — Desktop

App desktop para **Windows** e **macOS** com download e conversão de áudio via **yt-dlp** e **ffmpeg** nativos.

## Funcionalidades

- **Ripar Música** — YouTube, SoundCloud e Spotify (via yt-dlp)
- **Conversor** — FLAC, M4A, MP3, AAC → WAV ou MP3 320kbps (ffmpeg nativo)
- **Pasta de saída** configurável (padrão: `Música/LKR DJ TOOLs`)
- **PT / EN**

## Stack

- [Electron](https://www.electronjs.org/) — shell desktop
- React + Vite + Tailwind v4 — interface
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) via `youtube-dl-exec` — downloads
- [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static) — conversão

## Requisitos

- **Node.js 20 LTS** (recomendado — `nvm use` na pasta `desktop`)
- Node 22 também funciona; Node 24 pode falhar no download do Electron
- npm 10+

Se o Electron não instalar:

```bash
rm -rf node_modules/electron
npm install
# ou
node scripts/ensure-electron.mjs
```

## Desenvolvimento

```bash
cd desktop
npm install
npm run electron:dev
```

Na primeira execução, o `youtube-dl-exec` baixa o binário do **yt-dlp** automaticamente.

## Build

### macOS (.dmg / .zip)

```bash
cd desktop
npm run electron:build:mac
```

Instaladores em `desktop/release/`.

### Windows (.exe NSIS)

No Windows (ou CI Windows):

```bash
cd desktop
npm run electron:build:win
```

### Ambos

```bash
npm run electron:build
```

> Builds cross-platform: macOS gera `.dmg`; Windows gera `.exe`. Para gerar os dois, use CI com runners separados ou máquinas nativas.

## Estrutura

```
desktop/
  electron/           # Processo principal (IPC, yt-dlp, ffmpeg)
    main.ts
    preload.ts
    services/
  src/                # UI React
  dist/               # Build do Vite
  dist-electron/      # Build do Electron (tsc)
  release/            # Instaladores gerados
```

## Aviso legal

Use apenas para conteúdo que você tem direito de baixar.
