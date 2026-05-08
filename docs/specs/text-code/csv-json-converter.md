# CSV ↔ JSON Converter Spec

## Goal

Convert CSV data to JSON and JSON arrays to CSV, directly in the browser. Handles quoted fields, commas inside values, and common edge cases.

## Route

/tools/csv-json-converter

## Inputs

- Textarea: CSV or JSON input
- Toggle: conversion direction — CSV → JSON or JSON → CSV

## Actions

- Convert — run the conversion
- Copy — copy the output to clipboard
- Download — save the result as `.json` or `.csv` depending on output format
- Clear — reset input and output

## Output

- Converted result in a read-only textarea
- For CSV → JSON: a formatted JSON array of objects, one object per row, keys from the header row
- For JSON → CSV: a CSV string with a header row derived from the keys of the first object

## Error Handling

- CSV → JSON:
  - If the CSV has no header row (single row only), treat the single row as data with numeric keys (`0`, `1`, `2`…).
  - If rows have inconsistent column counts, fill missing fields with empty string `""`.
  - Empty input produces no output and no error.
- JSON → CSV:
  - If the input is not valid JSON, show: "This doesn't look like valid JSON. Make sure it's a JSON array of objects."
  - If the JSON is valid but not an array, show: "JSON → CSV conversion expects a JSON array of objects."
  - If the array is empty, show an empty CSV with no rows.
  - Keys are derived from the first object; subsequent objects with extra keys are ignored for those fields.

## Notes

- Use `papaparse` for CSV parsing (handles quoted fields, escaped commas, newlines in values) — it is the standard, well-maintained choice (~47 KB). Alternatively, consider a native implementation for simple CSVs.
- JSON serialization uses `JSON.stringify(data, null, 2)` for readable output.
- CSV output should quote fields that contain commas, quotes, or newlines.

## Privacy

Runs fully in the browser. CSV and JSON data is never sent to a server.

## SEO

```
title: 'CSV ↔ JSON Converter - Playground Sunshine'
description: 'Convert CSV to JSON or JSON to CSV directly in your browser — free, private, handles quoted fields and complex values.'
```

## Tests

- Simple CSV with header row converts to correct JSON array
- JSON array of objects converts to correct CSV with header row
- CSV with quoted fields containing commas parses correctly
- CSV with missing fields in some rows fills with empty string
- Invalid JSON input shows error
- JSON input that is not an array shows error
- Empty input produces no output
- JSON → CSV → JSON round-trip preserves data for simple cases
