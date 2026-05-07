# Base64 Encoder / Decoder Spec

## Goal

Encode plain text to Base64 and decode Base64 back to plain text, directly in the browser.

## Route

/tools/base64

## Inputs

- Textarea: text input (for encoding) or Base64 string (for decoding)

## Actions

- Encode — convert input text to Base64
- Decode — convert Base64 input to plain text
- Copy — copy the output to clipboard
- Clear — reset input and output

## Output

Encoded or decoded string displayed in a read-only textarea.

## Error Handling

- If decoding fails (invalid Base64), show: "This doesn't look like valid Base64. Check for invalid characters or incorrect padding."
- Keep output empty when input is invalid.

## Privacy

Runs fully in the browser. Input is never sent to a server.

## Tests

- Plain text encodes to correct Base64
- Valid Base64 decodes to correct plain text
- Invalid Base64 shows a helpful error message
- Empty input produces no output
- Unicode characters encode and decode correctly
