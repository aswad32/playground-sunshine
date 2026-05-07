# QR Code Generator Spec

## Goal

Turn any text or URL into a QR code, displayed instantly in the browser. Allow downloading the QR code as an image.

## Route

/tools/qr-code-generator

## Inputs

- Textarea: text or URL to encode

## Actions

- Generate — render the QR code (can be automatic on input change with debounce)
- Download — save the QR code as a PNG file
- Clear — reset input and output

## Output

QR code rendered as an image (canvas or SVG) displayed on screen.

## Error Handling

- If the input is empty, show no QR code and prompt the user to enter text or a URL.
- If the input is too long for a QR code, show: "The input is too long to encode. Try shortening it."

## Privacy

Runs fully in the browser. Input is never sent to a server.

## Tests

- Valid URL generates a scannable QR code
- Short text input generates a QR code
- Empty input shows empty state
- Input at exactly the maximum length generates a QR code without error
- Input that exceeds maximum length shows error
- Download produces a non-empty PNG file
