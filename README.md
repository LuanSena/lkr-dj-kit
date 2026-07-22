# LKR DJ TOOLs

[![CI](https://github.com/LuanSena/lkr-dj-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/LuanSena/lkr-dj-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

App **desktop** (Windows e macOS) com ferramentas para DJs: ripar música, converter áudio lossless, baixar do Beatport e uma biblioteca com tudo que você baixou.

## Funcionalidades

- **Ripar Música** — YouTube, SoundCloud e Spotify (MP3/WAV) via `yt-dlp`
- **Beatport** — baixa através da sua conta do Telegram e entrega em WAV automaticamente
- **Converter** — MP3, WAV, FLAC e M4A, em lote, via `ffmpeg` nativo
- **Biblioteca** — histórico de tudo que baixou (título, data, canal, link original) com itens **arrastáveis** direto pro Rekordbox/Serato/Finder
- **i18n** — Português (BR) e Inglês

## Stack

- [Electron](https://www.electronjs.org/) + [Vite](https://vitejs.dev/)
- React + TypeScript
- Tailwind CSS v4 + Framer Motion
- `yt-dlp` (downloads) e `ffmpeg` (conversão), nativos
- [GramJS](https://github.com/gram-js/gramjs) — integração com o Telegram (Beatport)

## Desenvolvimento

```bash
git clone git@github.com:LuanSena/lkr-dj-kit.git
cd lkr-dj-kit/desktop
npm install
npm run electron:dev
```

Para prototipar só a interface no navegador (com um mock da API do desktop):

```bash
cd desktop && npm run dev
```

### Scripts (dentro de `desktop/`)

| Comando                 | Descrição                          |
| ----------------------- | ---------------------------------- |
| `npm run electron:dev`  | Roda o app nativo em desenvolvimento |
| `npm run dev`           | Só a UI no navegador (mock)        |
| `npm run typecheck`     | Checagem de tipos                  |
| `npm run electron:build`| Gera instaladores                  |

## Beatport via Telegram

O Beatport é baixado através de um bot do Telegram. Na primeira vez, conecte sua
conta em **Configurações → Conta do Telegram** (API ID/Hash gratuitos em
[my.telegram.org](https://my.telegram.org/apps) + telefone + código). Seus dados
ficam apenas no seu computador.

## Aviso legal

Use apenas para conteúdo que você tem direito de baixar. O LKR DJ TOOLs não
envia arquivos nem dados pessoais para lugar nenhum — tudo roda localmente.

## Licença

[MIT](LICENSE) © Luan Sena
