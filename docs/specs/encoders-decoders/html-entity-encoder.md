# HTML Entity Encoder / Decoder Spec

## Goal

Encode plain text to HTML entities (escaping `<`, `>`, `&`, `"`, `'`) and decode HTML-encoded text back to plain characters, directly in the browser.

## Route

/tools/html-entity-encoder

## Inputs

- Textarea: plain text (for encoding) or HTML-entity text (for decoding)

## Actions

- Encode — replace special characters with their HTML entity equivalents
- Decode — replace HTML entities with their plain-text characters
- Copy — copy the output to clipboard
- Clear — reset input and output

## Output

- Encoded or decoded string in a read-only textarea

## Error Handling

- If decoding fails due to a malformed entity (e.g. `&invalidEntity;`), leave unknown entities unchanged in the output and show: "Some entities could not be decoded and were left as-is."
- Empty input produces no output and no error.

## Notes

- Encoding should handle at minimum: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`
- For decoding, leverage the browser's native DOM API (`document.createElement('textarea')` trick) to handle the full range of named and numeric entities without a library.
- No external dependencies required — use native browser APIs.

## Privacy

Runs fully in the browser.

## SEO

```
title: 'HTML Entity Encoder / Decoder - Playground Sunshine'
description: 'Encode special characters to HTML entities or decode them back to plain text — free and private, runs entirely in your browser.'
```

## Tests

- `<script>` encodes to `&lt;script&gt;`
- `&` encodes to `&amp;`
- `"` encodes to `&quot;`
- `&lt;p&gt;` decodes to `<p>`
- `&amp;` decodes to `&`
- `&#39;` decodes to `'`
- Round-trip: encode then decode returns original string
- Empty input produces no output
