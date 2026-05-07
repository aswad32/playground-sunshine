# YAML Formatter / Validator Spec

## Goal

Allow users to paste YAML, validate it, and format it with consistent indentation directly in the browser.

## Route

/tools/yaml-formatter

## Inputs

- Textarea: raw YAML input

## Actions

- Format — parse and re-serialize the YAML with consistent 2-space indentation
- Copy — copy the formatted output to clipboard
- Download — save the formatted YAML as `output.yaml`
- Clear — reset input and output

## Output

- Formatted YAML in a read-only textarea
- Textarea shows a placeholder ("Formatted YAML will appear here") until Format is run
- Error message rendered with `aria-live="polite"` when input is invalid

## Error Handling

- If YAML parsing fails, show: "This doesn't look like valid YAML. Check for incorrect indentation, tabs instead of spaces, or missing colons."
- Keep output empty when input is invalid.
- Empty input produces no output and no error.

## Notes

- Use the `js-yaml` library (`js-yaml` on npm, ~27 KB) for parsing and serialization.
- Do not minify YAML — YAML is a human-readable format; formatting is the only transformation offered.
- YAML supports multiple documents in one file (separated by `---`). For simplicity, handle only single-document YAML. If multiple documents are detected, show: "Multi-document YAML is not supported. Only the first document will be formatted."

## Privacy

Runs fully in the browser. YAML input is never sent to a server. Include a privacy note since YAML files often contain secrets (API keys, credentials).

## SEO

```
title: 'YAML Formatter - Playground Sunshine'
description: 'Validate and format YAML directly in your browser with this free, privacy-friendly tool.'
```

## Tests

- Valid YAML formats correctly with 2-space indentation
- Nested objects and arrays format correctly
- Invalid YAML (bad indentation, tabs) shows a helpful error message
- Empty input produces no output and no error
- Output is valid YAML that round-trips back to the same structure
