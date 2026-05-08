# Password Generator Spec

## Goal

Generate strong, random passwords with configurable length and character set options. Uses the browser's cryptographically secure `crypto.getRandomValues` API.

## Route

/tools/password-generator

## Inputs

- Range slider + number input: length (8–128, default 16)
- Checkboxes (at least one must be checked):
  - Uppercase letters (A–Z) — checked by default
  - Lowercase letters (a–z) — checked by default
  - Numbers (0–9) — checked by default
  - Symbols (`!@#$%^&*()-_=+[]{}|;:,.<>?`) — unchecked by default
- Number input: quantity to generate (1–20, default 1)

## Actions

- Generate — produce the requested passwords; also auto-generates on page load
- Copy — copy all generated passwords to clipboard (newline-separated)
- Copy individual — copy button next to each password in the list
- Refresh / Re-generate — generate a new set with the same settings (icon button)
- Clear — reset output

## Output

- List of generated passwords, one per row, in a read-only area
- Each row shows the password in monospace font with its own Copy button
- Strength indicator for each password: Weak / Fair / Strong / Very Strong based on length and charset diversity

## Strength Heuristic

- Weak: length < 8 or only one character class
- Fair: length 8–11, two character classes
- Strong: length 12–15, two+ character classes
- Very Strong: length ≥ 16, three+ character classes

## Error Handling

- If no character type is selected, show: "Select at least one character type." and disable Generate.
- If length is out of range, clamp silently to 8–128.
- If quantity is out of range, clamp silently to 1–20.

## Notes

- MUST use `crypto.getRandomValues` — never `Math.random`.
- Guarantee at least one character from each selected class in every password (satisfaction sampling).
- No external dependencies required.

## Privacy

Runs fully in the browser. Passwords are never sent to a server. Display note: "Passwords are generated locally using your browser's secure random API and never leave your device."

## SEO

```
title: 'Password Generator - Playground Sunshine'
description: 'Generate strong, secure passwords with customizable length and character sets — runs entirely in your browser using the Web Crypto API.'
```

## Tests

- Generated password only contains characters from selected classes
- Password length matches the requested length exactly
- At least one character from each selected class appears in every password
- Only uppercase selected → password contains only A–Z
- No character class selected → error shown, Generate disabled
- `crypto.getRandomValues` is used (not `Math.random`)
- Generating 10 passwords produces 10 unique values
- Length clamps correctly at boundaries (7 → 8, 129 → 128)
