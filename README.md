# LKR DJ TOOLs

[![CI](https://github.com/LuanSena/lkr-dj-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/LuanSena/lkr-dj-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Ferramentas modernas para DJs — landing page e utilitários para ripar música, converter áudio lossless e análise Rekordbox (em breve).

## Funcionalidades

- **Landing page** com visual cyber/tech, animações e design responsivo
- **Ripar Música** — YouTube, SoundCloud e Spotify (via match no YouTube)
- **Conversor** — FLAC, M4A, MP3 e AAC para WAV lossless (100% no browser com ffmpeg.wasm)
- **Rekordbox Analyzer** — teaser com roadmap (em desenvolvimento)
- **i18n** — Português (BR) e Inglês

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- [next-intl](https://next-intl.dev/)
- [ffmpeg.wasm](https://ffmpegwasm.netlify.app/)
- [youtubei.js](https://github.com/LuanRT/YouTube.js) — download do YouTube
- soundcloud-scraper — client id do SoundCloud

## Requisitos

- Node.js 20+
- npm 10+

## Desenvolvimento

```bash
git clone git@github.com:LuanSena/lkr-dj-kit.git
cd lkr-dj-kit
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — redireciona automaticamente para `/pt`.

### Scripts

| Comando        | Descrição              |
| -------------- | ---------------------- |
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run start`| Servidor de produção   |
| `npm run lint` | ESLint                 |

## Deploy na Vercel

1. Conecte o repositório [LuanSena/lkr-dj-kit](https://github.com/LuanSena/lkr-dj-kit) na Vercel
2. Framework preset: **Next.js**
3. Deploy — nenhuma variável de ambiente obrigatória

As rotas de download usam `maxDuration: 300` configurado em `vercel.json`.

## Aviso legal

Use apenas para conteúdo que você tem direito de baixar. O LKR DJ TOOLs não armazena arquivos nem dados pessoais.

## Estrutura

```
app/
  [locale]/           # Páginas com i18n
  api/download/       # API routes com streaming
components/
  landing/            # Hero, Footer, animações
  tools/              # Downloader, Converter
  animations/         # SVGs e canvas animados
lib/
  download/           # YouTube, SoundCloud, Spotify
  ffmpeg/             # Wrapper ffmpeg.wasm
messages/
  pt.json / en.json   # Traduções
```

## Licença

[MIT](LICENSE) © Luan Sena
