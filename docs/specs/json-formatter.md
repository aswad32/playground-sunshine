# JSON Formatter / Validator Spec

## Goal

Allow users to paste JSON, validate it, format it, and minify it directly in the browser.

## Route

/tools/json-formatter

## Inputs

- Textarea for raw JSON input

## Actions

- Format JSON
- Minify JSON
- Clear
- Copy output
- Download output

## Output

- Formatted or minified JSON text
- Friendly error message if invalid

## Error Handling

If JSON parsing fails, show:

"This does not look like valid JSON. Check for missing quotes, commas, or brackets."

## Privacy

This tool must run fully in the browser. Do not send JSON input to any API or server.

## Tests

- Formats valid compact JSON
- Minifies formatted JSON
- Shows error for invalid JSON
- Handles empty input