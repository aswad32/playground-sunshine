# JWT Decoder Spec

## Goal

Decode a JWT (JSON Web Token) and display its header, payload, and signature in a readable format. Show expiry clearly if present. Decode only — do not verify the signature.

## Route

/tools/jwt-decoder

## Inputs

- Textarea: raw JWT string (three dot-separated Base64url segments)

## Actions

- Decode — parse and display the header and payload
- Copy payload — copy decoded payload to clipboard
- Clear — reset input and output

## Output

- Header: decoded JSON object
- Payload: decoded JSON object with `exp` shown as a human-readable date/time if present
- Signature: raw value (not verified)
- Warning banner if token is expired

## Error Handling

- If the input is not a valid JWT format, show: "This doesn't look like a valid JWT. Make sure it has three dot-separated parts."
- Do not claim the signature is verified.

## Privacy

Runs fully in the browser. The token is never sent to a server. Display a note warning users not to paste production secrets unless they trust the environment.

## Tests

- Valid JWT decodes header and payload correctly
- Expired token shows expiry warning
- Token with no `exp` shows no expiry warning
- Invalid format shows a helpful error message
- Empty input produces no output
