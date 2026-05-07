# GitHub Copilot Instructions — Playground Sunshine

## Project Overview

Playground Sunshine is an open-source collection of fast, free, privacy-friendly tools for developers and everyday users.

The goal is to provide small utilities that are simple, polished, useful, and safe to use without requiring login.

Tools:

**Live (built):**

- [JSON Formatter / Validator](../docs/specs/json-formatter.md)
- [JWT Decoder](../docs/specs/jwt-decoder.md)
- [Base64 Encoder / Decoder](../docs/specs/base64.md)
- [UUID / NanoID Generator](../docs/specs/uuid-nanoid-generator.md)
- [Unix Timestamp Converter](../docs/specs/unix-timestamp-converter.md)
- [Cron Expression Builder](../docs/specs/cron-builder.md)
- [Regex Tester](../docs/specs/regex-tester.md)
- [URL Encoder / Decoder](../docs/specs/url-encoder-decoder.md)
- [Hash Generator](../docs/specs/hash-generator.md)
- [Fake Data Generator](../docs/specs/fake-data-generator.md)
- [QR Code Generator](../docs/specs/qr-code-generator.md)
- [Markdown Previewer](../docs/specs/markdown-previewer.md)
- [SQL Formatter](../docs/specs/sql-formatter.md)
- [Image Compressor / Resizer](../docs/specs/image-compressor.md)
- [Text Diff Checker](../docs/specs/text-diff-checker.md)

**Planned (spec ready, not yet built):**

- [YAML Formatter / Validator](../docs/specs/yaml-formatter.md)
- [.env File Formatter](../docs/specs/env-formatter.md)
- [HTML Entity Encoder / Decoder](../docs/specs/html-entity-encoder.md)
- [Number Base Converter](../docs/specs/number-base-converter.md)
- [Password Generator](../docs/specs/password-generator.md)
- [String Case Converter](../docs/specs/string-case-converter.md)
- [Word & Character Counter](../docs/specs/word-counter.md)
- [CSV ↔ JSON Converter](../docs/specs/csv-json-converter.md)
- [Color Picker & Converter](../docs/specs/color-converter.md)
- [Contrast Checker](../docs/specs/contrast-checker.md)

The project should feel like a clean developer playground: simple, bright, fast, and trustworthy.

---

## Core Principles & Code Guidelines

Follow these in order of priority:

1. **Privacy-first** — Prefer client-side processing. Sensitive tools (JWT Decoder, Hash Generator, JSON Formatter, Base64, `.env` formatters) must run locally in the browser. Never log or transmit user-submitted input.
2. **No login required** — Tools must be usable immediately. No accounts, sessions, or user profiles for basic functionality.
3. **Fast and lightweight** — Avoid unnecessary dependencies. Lazy-load heavy features. Keep each tool quick to load and use.
4. **Simple, polished UI** — Tools should be understandable within seconds. Clear labels, obvious actions, easy-to-copy output.
5. **Mobile-friendly** — All tools must work on desktop and mobile. No layouts that only work on wide screens.
6. **Open-source friendly** — Readable code, simple abstractions over clever code, comments when logic is non-obvious.

**Code conventions:**

- Use clear variable names; keep components small and focused.
- Extract reusable logic into composables; extract pure utility logic into `utils/`.
- Avoid `any` without a strong reason; prefer explicit types for tool input/output models.
- Avoid deeply nested conditionals; prefer early returns for validation and error handling.

---

## Tech Stack

The project uses:

- Nuxt 3
- Vue 3 Composition API
- TypeScript
- Tailwind CSS
- pnpm
- ESLint
- Prettier
- Vitest for unit tests where useful
- Lucide Vue (`lucide-vue-next`) for icons — use outline style; prefer named imports

When generating code, prefer this stack unless existing project files show otherwise.

**State management:** Prefer local component state (`ref`, `computed`). Do not add Pinia unless cross-tool shared state is explicitly needed.

**i18n:** No i18n at this time. All UI copy is English.

---

## Directory Structure & Naming Conventions

```
playground-sunshine/
├── assets/
│   └── css/
│       └── main.css              # Tailwind entry point
├── components/
│   ├── ui/                       # Shared generic UI (AppButton.vue, AppCard.vue)
│   └── tools/                    # Tool-specific sub-components
├── composables/
│   └── useClipboard.ts           # Reusable logic; always prefix with `use`
├── pages/
│   ├── index.vue                 # Tool directory / home
│   └── tools/
│       ├── json-formatter.vue    # One file per tool, kebab-case
│       ├── jwt-decoder.vue
│       └── base64.vue
├── utils/
│   ├── jsonFormatter.ts          # Pure functions only, camelCase filename
│   ├── base64.ts
│   └── hash.ts
├── tests/
│   ├── jsonFormatter.test.ts     # Mirrors utils/ filenames
│   ├── base64.test.ts
│   └── hash.test.ts
├── data/
│   └── tools.ts                  # Tool metadata registry — update when adding a tool
├── public/
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Naming conventions:**

| Type | Convention | Example |
|---|---|---|
| Pages | kebab-case | `json-formatter.vue` |
| Components | PascalCase | `ToolCard.vue`, `AppButton.vue` |
| Composables | camelCase, `use` prefix | `useClipboard.ts` |
| Utils | camelCase | `jsonFormatter.ts` |
| Tests | mirror source name, `.test.ts` | `jsonFormatter.test.ts` |

**Key rules:**

- `data/tools.ts` is the tool metadata registry. Always update it when adding a new tool.
- Every tool entry must include a `category` field that matches one of the values in `CATEGORY_ORDER` (also exported from `data/tools.ts`). The home page groups tools by category using this field. Current categories and the tools in each:
  - **Formatters** — JSON Formatter, SQL Formatter, Markdown Previewer, YAML Formatter, .env Formatter
  - **Encoders & Decoders** — Base64, URL Encoder/Decoder, JWT Decoder, HTML Entity Encoder, Number Base Converter
  - **Generators** — UUID/NanoID, Hash Generator, Fake Data Generator, QR Code Generator, Password Generator
  - **Date & Time** — Unix Timestamp Converter, Cron Expression Builder
  - **Text & Code** — Regex Tester, Text Diff Checker, String Case Converter, Word & Character Counter, CSV ↔ JSON Converter
  - **Images** — Image Compressor / Resizer
  - **Colors** — Color Picker & Converter, Contrast Checker
  When adding a new tool, pick the most fitting existing category or add a new entry to `CATEGORY_ORDER` if none fit.
- `utils/` contains pure functions only — no Vue reactivity, directly testable with Vitest.
- `components/ui/` holds shared primitives reused across tools; `components/tools/` holds tool-specific pieces.
- Use `<script setup lang="ts">` and runtime `defineProps` for all components.

---

## Tool Page Standard

Each tool page should follow a consistent structure:

- Tool title
- Short description
- Input area
- Main actions
- Output area
- Copy/reset buttons
- Error message area when needed
- Small privacy note if the tool handles sensitive input

Example page content pattern:
Title: JSON Formatter
Description: Format, validate, and minify JSON directly in your browser.
Privacy note: Your JSON is processed locally and never sent to a server.

Every tool should include:

- Clear empty state
- Clear error state
- Copy output button
- Reset/clear button
- Responsive layout
- Keyboard-friendly inputs where practical

---

## UI Guidelines

Use a clean, friendly developer-tool aesthetic.

Preferred style:

- Light and bright by default
- Good spacing
- Rounded cards
- Clear buttons
- Large readable text areas
- Subtle borders
- Simple icons when useful — use `lucide-vue-next`, outline style

Dark mode is not supported at this time. Do not add `dark:` Tailwind variants.

Avoid:

- Overly complex dashboards
- Heavy animations
- Cluttered layouts
- Too many colors in one screen
- Modal-heavy workflows

Buttons should have clear intent like:
- Format
- Minify
- Copy
- Clear
- Generate
- Decode
- Encode
- Download

For dangerous or destructive actions, use careful wording:
- Clear input
- Reset all

---

## Accessibility Guidelines

When creating UI:

- Use semantic HTML.
- Ensure form controls have labels.
- Buttons must have readable text or accessible labels.
- Maintain good color contrast.
- Do not rely on color alone to communicate errors.
- Support keyboard navigation.
- Use aria-live for dynamic error/success messages when useful.

---

## Error Handling

Errors should be helpful and human-readable.

Bad:
Invalid input

Better:
This does not look like valid JSON. Check for missing quotes, commas, or brackets.

Rules:

- Never show raw stack traces to users.
- Keep technical errors in developer logs only.
- For validation tools, explain what went wrong.
- Keep output empty or unchanged when input is invalid.

---

## Privacy and Security Rules

For sensitive tools:

- Do not send input to APIs.
- Do not store input in localStorage unless the user explicitly enables history.
- Do not add analytics events containing user input.
- Do not log secrets, tokens, keys, JSON payloads, or pasted text.
- Clearly show when a tool runs fully in-browser.

Sensitive tools include:

- JWT Decoder
- Base64 tools
- Hash Generator
- .env Formatter
- JSON Formatter
- SQL Formatter
- Text Diff Checker
- Image Compressor

JWT Decoder rules:

- Decode only.
- Do not claim token signature is verified unless actual verification is implemented.
- Show token expiry clearly if exp exists.
- Warn users not to paste production secrets unless they trust the environment.

Hash Generator rules:

- Explain that hashing is one-way.
- Do not present MD5/SHA-1 as secure for password storage.
- For file hashing, process files in browser.

---

## SEO Guidelines

Each tool page should have meaningful SEO metadata.

Use Nuxt useSeoMeta where appropriate.

```
useSeoMeta({
  title: 'JSON Formatter - Playground Sunshine',
  description: 'Format, validate, and minify JSON directly in your browser with this free online JSON formatter.',
})
```

SEO title pattern:
```
<Tool Name> - Playground Sunshine
```

Description pattern:
```
<Main action> directly in your browser with this free, privacy-friendly tool.
```

Each tool page should include natural text explaining:

- What the tool does
- Common use cases
- Privacy/client-side behavior where relevant

Avoid keyword stuffing.

---

## Testing Guidelines

Add tests for utility functions, especially tools with parsing or transformation logic.

Prioritize tests for:

- JSON formatting/minifying
- Base64 encoding/decoding
- URL encoding/decoding
- Timestamp conversion
- Cron explanation or parsing
- Fake data generation
- Hashing helpers
- Regex helpers

Use Vitest.

---

## Dependency Guidelines

Before adding a new dependency, consider:

- Can this be done with native browser APIs?
- Is the dependency actively maintained?
- Is it small enough for a utility site?
- Does it increase client bundle size too much?
- Is it safe for browser usage?

Prefer small, focused libraries.

Avoid heavy dependencies for simple transformations.

---

## Performance Guidelines

- Keep tool pages lightweight.
- Lazy-load expensive components.
- Avoid blocking the main thread for large inputs.
- For heavy processing, consider Web Workers.
- Avoid unnecessary watchers.
- Use computed values carefully for large text input.
- Debounce expensive transformations when needed.

For image tools:

- Prefer browser APIs such as Canvas, Blob, FileReader, and createImageBitmap where appropriate.
- Show before/after file size.
- Do not upload images to the server by default.

---

## AI/Copilot Behavior Rules

When helping with this project, Copilot should:

- Prefer small, incremental changes.
- Keep code readable for human maintainers.
- Avoid over-engineering.
- Ask for missing context only when truly necessary.
- Follow existing project conventions.
- Preserve existing behavior unless explicitly asked to change it.
- Suggest tests when adding transformation logic.
- Avoid adding backend APIs unless there is a clear reason.
- Avoid storing or transmitting user input from tools.

When generating a new tool, Copilot should include:

- Page/component
- Utility function
- Tool metadata update — add an entry to `data/tools.ts` with the tool's name, route, description, tags, icon, and **category**. The `category` must match a value in `CATEGORY_ORDER`. Also add the icon component to the `iconMap` in `pages/index.vue`. Example:
  ```ts
  {
    name: 'JSON Formatter',
    route: '/tools/json-formatter',
    description: 'Format, validate, and minify JSON directly in your browser.',
    tags: ['json', 'formatter', 'validator'],
    icon: 'Braces',
    category: 'Formatters',
  }
  ```
- Basic tests where suitable
- SEO metadata
- Privacy note if relevant

---

## Things to Avoid

Do not:

- Add login unless explicitly requested.
- Add database dependency for simple tools.
- Add server-side processing for sensitive tools by default.
- Add analytics that captures user input.
- Add bloated UI frameworks without approval.
- Create unfinished placeholder pages.
- Mix many unrelated tools in one pull request.
- Overcomplicate simple utilities with unnecessary architecture.
- Use vague error messages.
- Claim security verification that the tool does not actually perform.

---

## Project Tone

The product should feel:

- Friendly
- Useful
- Lightweight
- Trustworthy
- Practical
- Slightly playful, but still professional

Avoid corporate-heavy wording.

Good copy examples:

```
Format messy JSON into something readable.
Decode a JWT without sending it anywhere.
Generate test data for your next mock screen.
Turn a long URL into a QR code.
```

---

## Quality Checklist

Before considering a tool complete, check:

- Works on desktop and mobile
- Has clear title and description
- Has input and output areas
- Has copy button
- Has clear/reset button
- Handles invalid input gracefully
- Does not send sensitive input to server
- Has SEO metadata
- Uses shared components where practical
- Has utility tests for core logic where useful
- Is listed in tool metadata
- UI is clean and consistent


---

## Contribution Guidelines

When generating code intended for contribution:

- Keep changes focused.
- Do not mix unrelated refactors with new tools.
- Include clear naming.
- Update tool metadata when adding a tool.
- Add tests for utility functions.
- Update README when adding major tools.
- Avoid breaking existing routes.
