# URL Encoder / Decoder Spec

## Goal

Encode a plain URL or string using percent-encoding and decode an encoded URL back to plain text.

## Route

/tools/url-encoder-decoder

## Inputs

- Textarea: plain URL or encoded URL string
- Placeholder text: "Enter plain URL or text to encode, or an encoded URL to decode..."

## Actions

- Encode — apply percent-encoding to the input
- Decode — decode percent-encoded characters
- Copy — copy the output to clipboard
- Clear — reset input and output

## Output

Encoded or decoded URL string in a read-only textarea.

## Error Handling

- If decoding fails due to malformed percent-encoding, show: "This doesn't look like a valid encoded URL. Check for incomplete percent sequences."
- Keep output empty when input is invalid.

## Privacy

Runs fully in the browser.

## Tests

- Special characters are percent-encoded correctly
- Encoded URL decodes to original string
- Malformed percent-encoding shows error
- Empty input produces no output
