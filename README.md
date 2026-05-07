# Playground Sunshine ☀️

A collection of fast, free, privacy-friendly tools for developers and everyday users. Everything runs directly in your browser — no login, no server, no tracking.

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

---

## Features

- **Privacy-first** — all tools run client-side. Your data never leaves your browser.
- **No login required** — open a tool and start using it immediately.
- **Lightweight** — minimal dependencies, fast load times.
- **Mobile-friendly** — works on desktop and mobile.
- **Open source** — readable code, MIT licensed.

---

## Available Tools

### Formatters
| Tool | Description |
|---|---|
| [JSON Formatter / Validator](/tools/json-formatter) | Format, validate, and minify JSON |
| [SQL Formatter](/tools/sql-formatter) | Beautify SQL with dialect support (MySQL, PostgreSQL, SQLite, T-SQL) |
| [Markdown Previewer](/tools/markdown-previewer) | Live Markdown → HTML preview with copy buttons |

### Encoders & Decoders
| Tool | Description |
|---|---|
| [Base64 Encoder / Decoder](/tools/base64) | Encode text to Base64 or decode it back |
| [URL Encoder / Decoder](/tools/url-encoder-decoder) | Percent-encode and decode URLs |
| [JWT Decoder](/tools/jwt-decoder) | Decode JWT header and payload without sending the token anywhere |

### Generators
| Tool | Description |
|---|---|
| [UUID / NanoID Generator](/tools/uuid-nanoid-generator) | Generate UUID v4 and NanoID values with custom alphabet/length |
| [Hash Generator](/tools/hash-generator) | MD5, SHA-1, SHA-256, SHA-512 hashes from text or files |
| [Fake Data Generator](/tools/fake-data-generator) | Realistic fake names, emails, addresses — JSON, CSV, or plain list |
| [QR Code Generator](/tools/qr-code-generator) | Turn any text or URL into a downloadable QR code |

### Date & Time
| Tool | Description |
|---|---|
| [Unix Timestamp Converter](/tools/unix-timestamp-converter) | Convert timestamps ↔ human-readable dates (seconds and milliseconds) |
| [Cron Expression Builder](/tools/cron-builder) | Build cron expressions visually with live explanation and run preview |

### Text & Code
| Tool | Description |
|---|---|
| [Regex Tester](/tools/regex-tester) | Test regex patterns with live match highlighting and capture groups |
| [Text Diff Checker](/tools/text-diff-checker) | Compare two blocks of text line by line |

### Images
| Tool | Description |
|---|---|
| [Image Compressor / Resizer](/tools/image-compressor) | Compress and resize JPEG, PNG, and WebP images with before/after size |

---

## Coming Soon

The following tools have specs written and are ready to build:

- YAML Formatter / Validator
- .env File Formatter
- HTML Entity Encoder / Decoder
- Number Base Converter
- Password Generator
- String Case Converter
- Word & Character Counter
- CSV ↔ JSON Converter
- Color Picker & Converter
- Contrast Checker (WCAG AA/AAA)

---

## Tech Stack

- [Nuxt 4](https://nuxt.com) — Vue 3 framework
- [Vue 3](https://vuejs.org) — Composition API, `<script setup>`
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Vue](https://lucide.dev) — icons
- [Vitest](https://vitest.dev) — unit tests
- [pnpm](https://pnpm.io) — package manager

---

## Getting Started

**Prerequisites:** Node.js 18+ and pnpm.

```bash
# Clone the repo
git clone https://github.com/aswad32/playground-sunshine.git
cd playground-sunshine

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Tests

```bash
# Run all tests once
pnpm test

# Watch mode
pnpm test:watch
```

---

## Building for Production

```bash
# Build
pnpm build

# Preview the production build locally
pnpm preview
```

---

## Project Structure

```
playground-sunshine/
├── app/
│   ├── assets/css/         # Tailwind entry point
│   ├── components/
│   │   ├── ui/             # Shared primitives (AppButton, AppCard…)
│   │   └── tools/          # Tool-specific sub-components
│   ├── composables/        # Reusable logic (useClipboard…)
│   ├── data/
│   │   └── tools.ts        # Tool metadata registry
│   ├── layouts/
│   │   └── default.vue     # Shared header + footer layout
│   ├── pages/
│   │   ├── index.vue       # Home — grouped tool directory
│   │   ├── privacy.vue     # Privacy Policy
│   │   ├── terms.vue       # Terms of Use
│   │   └── tools/          # One .vue file per tool
│   └── utils/              # Pure utility functions (no Vue reactivity)
├── docs/specs/             # Tool specs (one .md per tool)
├── tests/                  # Vitest unit tests (mirrors utils/)
├── public/                 # Static assets (favicon…)
└── nuxt.config.ts
```

---

## Contributing

1. Fork the repo and create a branch from `develop`.
2. Add your tool: utility function → page → tests → registry entry in `data/tools.ts`.
3. Follow the conventions in [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
4. Open a pull request against `develop`.

Keep changes focused — one tool per PR.

---

## License

MIT — see [LICENSE](LICENSE) for details.
