# LKR DJ Tools — Desktop app

This repo is now a **desktop-only** app. The web (Next.js) version was removed.

- The app lives entirely in `desktop/` (Electron + Vite + React + TypeScript).
- Main process: `desktop/electron/` (Node/Electron, compiled to CommonJS).
- Renderer (UI): `desktop/src/` (React, Tailwind v4).
- Run it: `cd desktop && npm run electron:dev`
- Typecheck: `cd desktop && npm run typecheck`

The UI can be previewed in a plain browser (`cd desktop && npm run dev`) — a browser
mock of the desktop API kicks in when the Electron bridge isn't present.

Native tools used at runtime: `yt-dlp` (downloads) and `ffmpeg` (conversion).
Beatport downloads go through the user's Telegram account via GramJS.
