# Word & Character Counter Spec

## Goal

Count words, characters, sentences, paragraphs, and estimated reading time for any block of text. Updates in real time as the user types or pastes.

## Route

/tools/word-counter

## Inputs

- Textarea: text input (no length limit in UI; performance note below)

## Actions

- All counts update live / real-time as the user types — no button required
- Copy — copy the input text to clipboard
- Clear — reset input and all counts

## Output

A stats panel showing:
- **Characters** (with spaces)
- **Characters** (without spaces)
- **Words**
- **Sentences**
- **Paragraphs**
- **Reading time** — estimated at 200 words per minute, displayed as "X min read" (minimum "< 1 min read")

## Definitions

- **Word**: one or more non-whitespace characters separated by whitespace
- **Sentence**: ends with `.`, `!`, or `?` (consecutive punctuation counts as one sentence end)
- **Paragraph**: one or more non-empty lines separated by one or more blank lines
- **Reading time**: `Math.ceil(wordCount / 200)` minutes

## Error Handling

- No errors expected — all inputs are valid.
- Empty input shows all counts as `0` and reading time as `0 min`.

## Performance Notes

- Debounce updates by 150 ms for large inputs to avoid blocking the main thread.
- Counts should handle inputs up to ~100,000 words without noticeable lag.

## Notes

- No external dependencies required — pure string manipulation.

## Privacy

Runs fully in the browser.

## SEO

```
title: 'Word & Character Counter - Playground Sunshine'
description: 'Count words, characters, sentences, paragraphs, and reading time for any text — free, instant, runs entirely in your browser.'
```

## Tests

- Empty string: all counts are 0
- `"Hello world"` → 2 words, 11 chars with spaces, 9 without
- `"Hello world."` → 1 sentence
- Multiple sentences count correctly
- Two paragraphs separated by a blank line → 2 paragraphs
- Reading time: 200 words → 1 min, 201 words → 2 min, 0 words → 0 min
- Consecutive punctuation (`...`) counts as 1 sentence end
