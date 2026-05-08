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
| [YAML Formatter / Validator](/tools/yaml-formatter) | Format and validate YAML with error highlighting |
| [.env File Formatter](/tools/env-formatter) | Parse, sort, and clean up .env files |

### Encoders & Decoders
| Tool | Description |
|---|---|
| [Base64 Encoder / Decoder](/tools/base64) | Encode text to Base64 or decode it back |
| [URL Encoder / Decoder](/tools/url-encoder-decoder) | Percent-encode and decode URLs |
| [JWT Decoder](/tools/jwt-decoder) | Decode JWT header and payload without sending the token anywhere |
| [HTML Entity Encoder / Decoder](/tools/html-entity-encoder) | Encode special characters to HTML entities and back |
| [Number Base Converter](/tools/number-base-converter) | Convert numbers between binary, octal, decimal, and hexadecimal |

### Generators
| Tool | Description |
|---|---|
| [UUID / NanoID Generator](/tools/uuid-nanoid-generator) | Generate UUID v4 and NanoID values with custom alphabet/length |
| [Hash Generator](/tools/hash-generator) | MD5, SHA-1, SHA-256, SHA-512 hashes from text or files |
| [Fake Data Generator](/tools/fake-data-generator) | Realistic fake names, emails, addresses — JSON, CSV, or plain list |
| [QR Code Generator](/tools/qr-code-generator) | Turn any text or URL into a downloadable QR code |
| [Password Generator](/tools/password-generator) | Generate strong random passwords with configurable rules |

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
| [String Case Converter](/tools/string-case-converter) | Convert text between camelCase, snake_case, PascalCase, and more |
| [Word & Character Counter](/tools/word-counter) | Count words, characters, sentences, and reading time |
| [CSV ↔ JSON Converter](/tools/csv-json-converter) | Convert CSV to JSON and JSON to CSV instantly |

### Images
| Tool | Description |
|---|---|
| [Image Compressor / Resizer](/tools/image-compressor) | Compress and resize JPEG, PNG, and WebP images with before/after size |

### Colors
| Tool | Description |
|---|---|
| [Color Picker & Converter](/tools/color-converter) | Convert colors between HEX, RGB, HSL, and HSB |
| [Contrast Checker](/tools/contrast-checker) | Check WCAG AA and AAA color contrast ratios for accessible design |

### Games & Puzzles
| Tool | Description |
|---|---|
| [Sudoku Player](/tools/sudoku-player) | Play Sudoku in your browser — conflict highlighting, pencil marks, timer, and undo |
| [Sudoku Generator](/tools/sudoku-generator) | Generate unique-solution puzzles at Easy / Medium / Hard / Expert difficulty |
| [Sudoku Solver](/tools/sudoku-solver) | Paste an 81-char string or enter manually, solve instantly, detect no-solution or multi-solution puzzles |

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
├── docs/specs/             # Tool specs, organised by category
│   ├── formatters/
│   ├── encoders-decoders/
│   ├── generators/
│   ├── date-time/
│   ├── text-code/
│   ├── images/
│   ├── colors/
│   └── games-puzzles/
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
