# .env File Formatter Spec

## Goal

Parse, validate, and clean up `.env` files. Detect duplicate keys, sort alphabetically if requested, and convert to multiple output formats including JSON, Docker Compose, GitHub Actions YAML, and `.env.example`. Also supports comparing a `.env` against a `.env.example`.

## Route

/tools/env-formatter

## Inputs

- Textarea: raw `.env` file content (primary input)
- Second textarea (Compare mode only): `.env.example` content to compare against

## Modes

The tool has two top-level modes, selectable via tabs or a toggle:

1. **Format & Convert** — the default mode. Input a `.env` file and apply formatting, sorting, and conversion actions.
2. **Compare** — input a `.env` and a `.env.example` side by side and see which keys are missing or extra.

---

## Format & Convert Mode

### Actions

- **Format** — parse and re-output the `.env` content with consistent `KEY=VALUE` formatting (trim whitespace around `=`)
- **Sort A–Z** — sort all keys alphabetically
- **Copy** — copy the formatted output to clipboard
- **Download** — save output using the appropriate file extension for the selected conversion
- **Clear** — reset input and output

### Conversion Targets (output format selector)

After formatting, the user can choose which output format to render:

| Option | Output |
|---|---|
| `.env` (default) | Standard `KEY=VALUE` format |
| JSON | A flat JSON object `{ "KEY": "value", … }` |
| Docker Compose env block | A YAML `environment:` block listing `- KEY=value` entries |
| GitHub Actions `env:` YAML | A YAML `env:` block with `KEY: value` entries |
| `.env.example` | Same keys as the input but with all values stripped (replaced with empty string) |

### Output

- Converted content in a read-only textarea
- Inline warning list for detected issues (duplicate keys, lines that don't match `KEY=VALUE` pattern)
- Download button label updates to reflect the selected format (e.g. "Download .env", "Download .json", "Download docker-compose.env.yml")

---

## Compare Mode

### Inputs

- Left textarea: actual `.env` content
- Right textarea: `.env.example` content

### Output

Three lists rendered below the inputs:

1. **Missing from `.env`** — keys present in `.env.example` but not in `.env` (highlighted in red/orange)
2. **Extra in `.env`** — keys present in `.env` but not in `.env.example` (highlighted in yellow)
3. **Matching** — keys present in both (highlighted in green)

A summary line: e.g. "3 missing, 1 extra, 12 matching."

If both inputs are empty, show an empty state with instructions.

---

## Conversion Details

### JSON output
```json
{
  "KEY": "value",
  "ANOTHER_KEY": "another value"
}
```
- Comments and blank lines are excluded.
- Quoted values have their surrounding quotes stripped in the JSON output.

### Docker Compose `environment:` block
```yaml
environment:
  - KEY=value
  - ANOTHER_KEY=another value
```
- Comments and blank lines are excluded.
- Values are unquoted (surrounding quotes stripped).

### GitHub Actions `env:` block
```yaml
env:
  KEY: value
  ANOTHER_KEY: another value
```
- Comments and blank lines are excluded.
- Values are unquoted (surrounding quotes stripped).
- Values containing `:`, `#`, or leading/trailing spaces are wrapped in double quotes.

### `.env.example` output
```
# Example .env — fill in your own values
KEY=
ANOTHER_KEY=
```
- Preserves comment lines from the original.
- Replaces all values with empty string.
- Preserves blank lines.

---

## Error Handling

- Lines that are not blank, not comments (`#`), and not valid `KEY=VALUE` pairs should be flagged: "Line N: `{line}` does not look like a valid KEY=VALUE pair."
- If duplicate keys are found, warn: "Duplicate key detected: `{KEY}` (lines N and M). Only the last value will take effect."
- Do not treat the input as invalid wholesale — process what is parseable and flag individual issues inline.
- Empty input produces no output and no warnings.

## Notes

- Valid `.env` syntax:
  - `KEY=VALUE` (no spaces around `=` required, but trim on format)
  - Values can be quoted: `KEY="value with spaces"` or `KEY='value'` — preserve quotes in `.env` output, strip quotes in converted outputs
  - Lines starting with `#` are comments — preserve them in `.env` and `.env.example` outputs; exclude from JSON, Docker Compose, and GitHub Actions outputs
  - Blank lines are preserved in `.env` and `.env.example` outputs; excluded from converted outputs
- Do not evaluate or expand variable references (e.g. `${VAR}`) — treat them as literal strings.
- All parsing is pure string manipulation — no external dependencies required.

## Privacy

Runs fully in the browser. `.env` files frequently contain secrets — display a clear privacy note: "Your .env content never leaves your browser." This is a sensitive tool.

## SEO

```
title: '.env Formatter - Playground Sunshine'
description: 'Format, validate, and convert .env files to JSON, Docker Compose, GitHub Actions YAML, or .env.example — entirely in your browser.'
```

## Tests

### Formatting
- Valid `KEY=VALUE` pairs are preserved correctly
- Whitespace around `=` is trimmed on format (`KEY = VALUE` → `KEY=VALUE`)
- Quoted values are preserved unchanged in `.env` output
- Comment lines (`#`) are preserved in `.env` output
- Blank lines are preserved in `.env` output
- Duplicate keys trigger a warning with correct line numbers
- Invalid lines trigger a per-line warning
- Sort A–Z reorders keys alphabetically
- Empty input produces no output and no warnings

### JSON conversion
- Outputs a valid JSON object with all key-value pairs
- Quoted values have surrounding quotes stripped
- Comments and blank lines excluded

### Docker Compose conversion
- Outputs a valid `environment:` block with `- KEY=value` entries
- Comments and blank lines excluded
- Quoted values have surrounding quotes stripped

### GitHub Actions conversion
- Outputs a valid `env:` block with `KEY: value` entries
- Values containing special characters are wrapped in double quotes
- Comments and blank lines excluded

### `.env.example` generation
- All values are stripped to empty string
- Comment lines are preserved
- Blank lines are preserved

### Compare mode
- Keys in `.env.example` but not `.env` appear in "Missing" list
- Keys in `.env` but not `.env.example` appear in "Extra" list
- Keys in both appear in "Matching" list
- Summary count is correct
- Empty inputs show empty state
