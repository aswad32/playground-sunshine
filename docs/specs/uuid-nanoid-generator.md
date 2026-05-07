# UUID / NanoID Generator Spec

## Goal

Generate UUIDs (v4) and NanoIDs for use in development and testing. Allow generating multiple at once.

## Route

/tools/uuid-nanoid-generator

## Inputs

- Toggle: UUID v4 or NanoID
- Number input: quantity to generate (1–100)
- NanoID options: custom alphabet and length (shown when NanoID is selected)

## Actions

- Generate — produce the requested IDs; IDs are also auto-generated on page load so the output is never empty on first visit
- Copy all — copy all generated IDs to clipboard as newline-separated values
- Clear — reset output

## Output

List of generated IDs, one per line, in a read-only textarea.

## Error Handling

- If quantity is out of range, clamp to 1–100.
- If NanoID alphabet is empty, show: "Alphabet cannot be empty."
- If NanoID length is less than 1, show: "Length must be at least 1."

## Privacy

Runs fully in the browser. No IDs are sent to a server.

## Tests

- Generates a valid UUID v4 format
- Generates the correct quantity of IDs
- NanoID respects custom alphabet and length
- Empty alphabet shows error
- NanoID with alphabet of 1 character still generates IDs of correct length
- Quantity is clamped to 1 when 0 or negative is passed
- Quantity is clamped to 100 when greater than 100 is passed
