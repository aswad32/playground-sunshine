# .env File Formatter Spec

## Goal

Parse, validate, and clean up `.env` files. Detect duplicate keys, sort alphabetically if requested, and strip comments or blank lines on demand.

## Route

/tools/env-formatter

## Inputs

- Textarea: raw `.env` file content

## Actions

- Format — parse and re-output the `.env` content with consistent `KEY=VALUE` formatting (trim whitespace around `=`)
- Sort A–Z — sort all keys alphabetically
- Copy — copy the formatted output to clipboard
- Download — save as `.env`
- Clear — reset input and output

## Output

- Cleaned `.env` content in a read-only textarea
- Inline warning list for detected issues (duplicate keys, lines that don't match `KEY=VALUE` pattern)

## Error Handling

- Lines that are not blank, not comments (`#`), and not valid `KEY=VALUE` pairs should be flagged: "Line N: `{line}` does not look like a valid KEY=VALUE pair."
- If duplicate keys are found, warn: "Duplicate key detected: `{KEY}` (lines N and M). Only the last value will take effect."
- Do not treat the input as invalid wholesale — process what is parseable and flag individual issues inline.
- Empty input produces no output and no warnings.

## Notes

- Valid `.env` syntax:
  - `KEY=VALUE` (no spaces around `=` required, but trim on format)
  - Values can be quoted: `KEY="value with spaces"` or `KEY='value'` — preserve quotes
  - Lines starting with `#` are comments — preserve them in output
  - Blank lines are preserved
- Do not evaluate or expand variable references (e.g. `${VAR}`) — treat them as literal strings.
- All parsing is pure string manipulation — no external dependencies required.

## Privacy

Runs fully in the browser. `.env` files frequently contain secrets — display a clear privacy note: "Your .env content never leaves your browser." This is a sensitive tool.

## SEO

```
title: '.env Formatter - Playground Sunshine'
description: 'Format, validate, and clean up .env files directly in your browser. Detect duplicate keys and fix formatting without sending your secrets anywhere.'
```

## Tests

- Valid `KEY=VALUE` pairs are preserved correctly
- Whitespace around `=` is trimmed on format (`KEY = VALUE` → `KEY=VALUE`)
- Quoted values are preserved unchanged
- Comment lines (`#`) are preserved
- Blank lines are preserved
- Duplicate keys trigger a warning with correct line numbers
- Invalid lines trigger a per-line warning
- Sort A–Z reorders keys alphabetically
- Empty input produces no output and no warnings
