# Hash Generator Spec

## Goal

Generate cryptographic hashes of text or files using common algorithms. Clearly communicate that hashing is one-way and that MD5/SHA-1 are not suitable for passwords.

## Route

/tools/hash-generator

## Inputs

- Textarea: text input
- OR file upload: hash a file's contents
- Toggle: select algorithm — MD5, SHA-1, SHA-256, SHA-512

## Actions

- Generate — compute the hash (button is disabled in file mode until a file has been selected)
- Copy — copy the hash to clipboard
- Clear — reset input and output

## UI Notes

- In file mode, show hint text "Choose a file above to generate its hash" when no file is selected yet.
- Generate button should remain disabled until input is non-empty (text mode) or a file is chosen (file mode).

## Output

- Hex-encoded hash string in a read-only input

## Error Handling

- If no input is provided, show: "Please enter some text or upload a file."

## Privacy

Runs fully in the browser. Text and file contents are never sent to a server. Display a note clarifying that hashing is one-way. Display a warning that MD5 and SHA-1 are not suitable for password storage.

## Tests

- Known input produces correct SHA-256 hash
- Known input produces correct SHA-512 hash
- Known input produces correct MD5 hash
- Known input produces correct SHA-1 hash
- File input is hashed correctly (SHA-256)
- Empty input shows error
- Generate button is disabled when no input is provided (text mode)
- Generate button is disabled before a file is chosen (file mode)
