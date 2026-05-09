# JSON ↔ TOON Converter Spec

## Goal

Convert JSON to TOON (Token-Oriented Object Notation) and back, directly in the browser. TOON is a compact, human-readable encoding of the JSON data model designed to reduce LLM token costs — typically 20–60% fewer tokens than formatted JSON. This tool lets developers preview TOON output and verify lossless round-trips before adopting the format in their LLM pipelines.

## Route

`/tools/json-toon-converter`

## Category

Text & Code

## Icon

`Sparkles` (lucide-vue-next) — new icon, add to `iconMap` in `app/pages/index.vue`

---

## What is TOON?

TOON combines YAML-style indentation for nested objects with CSV-style tabular layout for uniform arrays of objects. It maps 1-to-1 with the JSON data model (no data loss on round-trip).

Example — the same data in JSON vs TOON:

```json
{
  "context": {
    "task": "Our favorite hikes",
    "location": "Boulder"
  },
  "friends": ["ana", "luis", "sam"],
  "hikes": [
    { "id": 1, "name": "Blue Lake Trail", "distanceKm": 7.5 },
    { "id": 2, "name": "Ridge Overlook",  "distanceKm": 9.2 }
  ]
}
```

```toon
context:
  task: Our favorite hikes
  location: Boulder
friends[3]: ana,luis,sam
hikes[2]{id,name,distanceKm}:
  1,Blue Lake Trail,7.5
  2,Ridge Overlook,9.2
```

TOON is an active open-source project (MIT) with 24k+ GitHub stars and an official TypeScript library.

---

## Dependency

Use the official library: **`@toon-format/toon`** (MIT, maintained by the format authors).

```
pnpm add @toon-format/toon
```

Key API:
```ts
import { encode, decode } from '@toon-format/toon'

encode(jsonValue)           // JSON value → TOON string
decode(toonString)          // TOON string → JSON value
```

Do not implement the TOON format manually — the spec is complex and the library is the authoritative reference implementation.

---

## Inputs & Layout

Split-pane layout — two panels side by side (stacked on mobile):

| Left panel | Right panel |
|---|---|
| JSON | TOON |
| Editable textarea | Editable textarea |
| "Copy" + character/size info | "Copy" + character/size info |

Both panels are editable. Editing the left converts JSON → TOON. Editing the right converts TOON → JSON. A clear direction indicator (arrow icon + label) sits between the panels and flips when the user starts typing in the other panel.

> **Mobile**: stack vertically — JSON on top, TOON below, with direction indicator between them.

---

## Actions

- **Clear** — reset both panels and all state
- **Copy JSON** — copy the left panel content
- **Copy TOON** — copy the raw TOON string
- **Copy as prompt block** — copy the TOON output wrapped in a fenced code block, ready to paste directly into an LLM prompt:
  ````
  ```toon
  <toon content here>
  ```
  ````
  The TOON docs explicitly recommend this wrapping for LLM input. Only shown/enabled when the TOON panel has content.
- **Swap** — move TOON output back to the JSON input to enable round-trip testing

---

## Output / Stats bar

Below each panel, show a compact stats line:

```
1,234 chars
```

Between the two panels (centred, below the direction indicator), show a **savings badge** when both panels have valid content:

| Condition | Badge style | Example text |
|---|---|---|
| TOON is smaller (typical) | Green pill | `✓ 38% fewer chars` |
| TOON is larger (e.g. deeply nested data) | Amber pill | `↑ 12% more chars` |
| Same size | Gray pill | `≈ same size` |

Calculation:
```
savingsPct = Math.round((1 - toonChars / jsonChars) * 100)
```

Positive `savingsPct` → TOON is smaller → green. Negative → TOON is larger → amber.

Use character count as a practical size proxy. Do **not** add a tokenizer library — character count is sufficient for a quick comparison and keeps the bundle small.

---

## Conversion Behaviour

### JSON → TOON (left panel edited)

1. Parse the left panel as JSON on each debounced keystroke (~300ms).
2. On success: call `encode(parsed)` and display the result in the right panel.
3. On failure: show an inline error below the left panel. Right panel stays blank or shows the last valid output (prefer blank on first error).

### TOON → JSON (right panel edited)

1. Decode the right panel as TOON on each debounced keystroke (~300ms).
2. On success: call `JSON.stringify(decoded, null, 2)` and display in the left panel.
3. On failure: show an inline error below the right panel. Left panel stays blank or shows the last valid output.

### Direction tracking

Track which side was last edited by the user. The direction indicator updates accordingly. If both panels are empty, no direction is shown.

---

## Error Handling

- **Invalid JSON**: "This doesn't look like valid JSON. Check for missing quotes, commas, or brackets."
- **Invalid TOON**: "This doesn't look like valid TOON. Check the format structure." (show the library error message in a collapsed `<details>` for power users)
- **Empty input**: no error — both panels simply show empty state.
- Never show raw stack traces.

---

## Initial State / Examples

On load (both panels empty), show placeholder text in both textareas:

- Left: a short example JSON object (e.g. a 2-field `user` + a `tags` array + a `permissions` array of objects)
- Right: the corresponding TOON output (pre-filled)

This teaches the format immediately without requiring user action.

---

## Privacy

JSON and TOON data is processed entirely in the browser using the `@toon-format/toon` library. No input is sent to a server.

---

## SEO

```
title: 'JSON ↔ TOON Converter - Playground Sunshine'
description: 'Convert JSON to TOON (Token-Oriented Object Notation) and back — reduce LLM token costs with this free, in-browser converter.'
```

Include a short explanatory paragraph on the page describing TOON, its purpose, and a link to the official project.

---

## Tool Metadata (`data/tools.ts`)

```ts
{
  name: 'JSON ↔ TOON Converter',
  route: '/tools/json-toon-converter',
  description: 'Convert JSON to TOON (Token-Oriented Object Notation) and back — reduce LLM prompt token costs with this compact, lossless format.',
  tags: ['toon', 'json', 'converter', 'llm', 'token', 'ai'],
  icon: 'Sparkles',
  category: 'Text & Code',
}
```

---

## Tests (`tests/jsonToonConverter.test.ts`)

Test the utility wrapper (`utils/jsonToonConverter.ts`) rather than the library itself:

1. `jsonToToon` — simple flat object encodes correctly
2. `jsonToToon` — array of uniform objects uses tabular header syntax `[N]{fields}`
3. `jsonToToon` — nested object uses indentation
4. `toonToJson` — round-trip: `toonToJson(jsonToToon(input))` deep-equals input
5. `jsonToToon` — throws (or returns `null`) for non-JSON input
6. `toonToJson` — throws (or returns `null`) for invalid TOON
7. `charSavings` — returns positive value when TOON is shorter
8. `charSavings` — returns negative value when TOON is longer
9. `charSavings` — returns 0 when both sides are equal length
10. `toPromptBlock` — wraps TOON string in correct fenced code block (` ```toon\n...\n``` `)
11. `toPromptBlock` — returns empty string for empty input (no wrapping)
12. Handles primitive JSON values: string, number, boolean, null

The util file wraps `encode`/`decode` and adds error normalisation and the `toPromptBlock` helper so the page component stays clean.

---

## Quality Checklist

- [ ] Works on desktop and mobile
- [ ] Both panels are editable and trigger conversion in the correct direction
- [ ] Direction indicator is visible and accurate
- [ ] Stats bar shows character count for each panel
- [ ] Savings badge: green for smaller, amber for larger, gray for same
- [ ] Example content pre-filled on load so new users immediately see the format
- [ ] Errors are shown inline, not in alerts
- [ ] Copy JSON button works
- [ ] Copy TOON button works
- [ ] Copy as prompt block wraps output in ```toon fenced block
- [ ] Copy as prompt block is hidden/disabled when TOON panel is empty
- [ ] Clear and Swap buttons work
- [ ] Privacy note shown
- [ ] SEO metadata set
- [ ] Tool listed in `data/tools.ts` with correct category and icon
- [ ] `Sparkles` icon added to `iconMap` in `index.vue`
- [ ] Unit tests for the utility wrapper
