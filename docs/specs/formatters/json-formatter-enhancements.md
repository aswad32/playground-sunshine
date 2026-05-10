# JSON Formatter — Enhancements Spec

## Overview

This spec covers two new features to add to the existing JSON Formatter tool:

1. **Sort Keys** — sort the top-level keys of a JSON object alphabetically before formatting
2. **jq Query** — run a jq expression against the input JSON and send the result to the output panel

Both features are additive — all existing behaviour (Format, Minify, Open File, Clear, Copy, Download) is preserved unchanged.

---

## Feature 1 — Sort Keys

### Description

A toggle that, when enabled, sorts the top-level keys of the root JSON object alphabetically before formatting. If the root value is not an object (e.g. array, string, number), the toggle is a no-op and no error is shown.

### Scope

Top-level keys only. No recursive sorting. Simple to understand, no surprises for nested structures.

### UI

- A checkbox or pill toggle labelled **Sort keys** placed in the action row alongside Format / Minify.
- When checked, clicking **Format** (or **Minify**) sorts top-level keys before processing.
- The toggle state persists while the user is on the page but is not saved to localStorage.

### Behaviour

- Sorting is case-insensitive (locale-aware: `localeCompare`).
- When the root value is not a plain object, the output is identical to what it would be without sorting — no error, no warning.
- Sort happens after `JSON.parse`, before `JSON.stringify` — purely data manipulation, no regex.

### Implementation

Pure utility function `sortTopLevelKeys(value: unknown): unknown` in `utils/jsonFormatter.ts`:

```ts
export function sortTopLevelKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value
  return Object.keys(value as object)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (value as Record<string, unknown>)[key]
      return acc
    }, {})
}
```

Called inside `formatJson` and `minifyJson` when the `sortKeys` option is `true`.

Updated signatures:

```ts
export function formatJson(input: string, options?: { sortKeys?: boolean }): FormatResult
export function minifyJson(input: string, options?: { sortKeys?: boolean }): FormatResult
```

### Tests to add

- Sorts top-level keys alphabetically (case-insensitive)
- Does not sort when toggle is off
- Root array: output is unchanged
- Root primitive: output is unchanged
- Mixed-case keys sort correctly (`Zebra` before `apple` → should sort as `apple`, `Zebra`)

---

## Feature 2 — jq Query

### Description

A collapsible query panel below the main input/output that lets the user run a [jq](https://stedolan.github.io/jq/) expression against the input JSON. The result replaces the output panel content.

jq is the de-facto standard for JSON querying on the CLI. Supporting it makes the tool useful for developers who already know it.

### Library

**`jq-web`** by fiatjaf — WebAssembly port of jq for the browser.

- npm: `jq-web`
- Licence: MIT
- Bundle: ~1 MB WASM + a small JS wrapper
- Browser-safe: runs entirely in-browser
- GitHub: https://github.com/fiatjaf/jq-web

**Bundle strategy:** The jq WASM must be lazy-loaded. It is only imported when the user opens the query panel for the first time. This keeps the initial page load unaffected for users who never use jq.

```ts
// Lazy-load pattern in the composable / page
const jq = await import('jq-web').then(m => m.default ?? m)
```

### UI

- A **Query** collapsible section below the two-panel grid, hidden by default.
- Toggled open by a **Query (jq)** button in the action row (or a small link below the actions).
- When open, shows:
  - A single-line `<input>` for the jq expression (e.g. `.name`, `.items[] | .id`, `keys`).
  - A **Run** button.
  - An inline error area for jq parse/runtime errors.
- The output panel is used to display the jq result (same as Format output). Running a query does not overwrite the raw input.
- A small help text: `jq expression — e.g. .name, .items[] | .id, keys` with a link to the [jq manual](https://jqlang.org/manual/).

### Behaviour

- The jq WASM is loaded lazily on first Run click.
- While loading, the Run button shows a loading state (`Running…`).
- The query runs against the current value of the input textarea (does not require having clicked Format first).
- jq output is always pretty-printed (2-space indent via `JSON.stringify(result, null, 2)`) when the result is a JSON value. If jq returns a raw string (e.g. from `@base64`), it is shown as-is.
- Errors (invalid jq syntax, runtime errors) are shown inline below the query input with the raw jq error message — jq error messages are already human-readable.
- The query panel can be closed again — doing so does not clear the output.
- The input textarea remains editable while the query panel is open.

### Load failure

If the WASM fails to load (e.g. offline), show:

> "Could not load the jq engine. Please check your connection and try again."

### Examples to show in placeholder

- `.name`
- `.users[] | .email`
- `keys`
- `[.items[] | select(.active == true)]`

### Implementation notes

- A composable `useJq()` in `composables/useJq.ts` handles the lazy import, loading state, and error normalisation.
- The composable exposes: `run(input: string, expr: string): Promise<string>`, `loading: Ref<boolean>`, `loadError: Ref<string | null>`.
- jq WASM initialisation is cached after the first load — calling `run()` again does not re-initialise.
- The `jq-web` API: `jq.promised(json, expr)` returns a Promise resolving to the result string.

```ts
// composables/useJq.ts
let jqInstance: unknown = null

export function useJq() {
  const loading = ref(false)
  const loadError = ref<string | null>(null)

  async function run(jsonInput: string, expr: string): Promise<string> {
    loading.value = true
    loadError.value = null
    try {
      if (!jqInstance) {
        const mod = await import('jq-web')
        jqInstance = mod.default ?? mod
      }
      // jq-web: jq.promised(object | string, expr) → string
      const parsed = JSON.parse(jsonInput)
      const result = await (jqInstance as { promised: (v: unknown, e: string) => Promise<string> }).promised(parsed, expr)
      return result
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e))
    } finally {
      loading.value = false
    }
  }

  return { run, loading, loadError }
}
```

### Tests

jq query logic is tested in integration against the page (the jq engine itself is MIT-tested upstream). Unit tests cover the composable wrapper's error normalisation and caching behaviour. Where WASM cannot run in Vitest (Node/jsdom), tests mock `jq-web`.

Test cases:
- `.name` on `{"name":"Alice"}` → `"Alice"`
- `keys` on `{"b":2,"a":1}` → `["a","b"]`
- `.missing` on `{"name":"Alice"}` → `null`
- `.items[] | .id` on array input → sequence of ids
- Invalid jq expression → error shown, output unchanged
- Load failure (mock import throws) → load error message shown
- Second `run()` call does not re-import the module (cache hit)

---

## UI Layout Changes (combined view)

```
┌─────────────────────────────────────────┐
│ Input                   Output           │
│ [textarea]              [textarea]        │
│                                          │
│ [Format] [Minify] [☐ Sort keys]          │
│ [Open File] [Clear]                      │
│                         [Copy] [Download] │
│                                          │
│ ▼ Query (jq)  ← collapsible toggle      │
│ ┌──────────────────────────────────────┐ │
│ │ Expression: [_____________] [Run]    │ │
│ │ e.g. .name, .items[] | .id, keys    │ │
│ │ Error: …                            │ │
│ └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## What is NOT in scope

- Recursive key sorting (spec'd as top-level only)
- JSONPath or dot-path alternatives (jq covers these use cases)
- Saving query history
- Multiple query results / streaming
- jq signature verification
- Dark mode

---

## Privacy

jq runs entirely in the browser via WebAssembly. No JSON input, no jq expressions, and no output are transmitted to any server.

---

## SEO

No changes needed — existing `useSeoMeta` title/description already covers the tool well. The tool description can be updated to mention jq once the feature ships:

> "Format, validate, and minify JSON directly in your browser. Query with jq expressions and sort keys — no data leaves your machine."

---

## Quality Checklist

- [ ] Sort keys toggle works with Format and Minify
- [ ] Sort keys is a no-op for non-object root values
- [ ] jq panel is hidden by default (no layout shift on load)
- [ ] jq WASM loads lazily on first Run click
- [ ] Loading state shown during WASM initialisation
- [ ] jq errors shown inline, not as alerts
- [ ] All existing actions (Format, Minify, Open File, Copy, Download) still work
- [ ] Mobile-friendly layout
- [ ] Tests pass for new utility functions
- [ ] Privacy note updated to mention jq
