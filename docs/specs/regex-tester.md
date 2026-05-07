# Regex Tester Spec

## Goal

Test regular expressions against sample text and visualise matches. Show match groups and support common flags.

## Route

/tools/regex-tester

## Inputs

- Text input: regex pattern (without delimiters)
- Checkboxes: flags — global (g), case-insensitive (i), multiline (m)
- Textarea: test string

## Actions

- Matching is live / real-time (no explicit Test button required) — results update as the user types the pattern, flags, or test string
- Copy regex — copy the full regex in `/pattern/flags` format to clipboard
- Clear — reset all inputs

## Output

- Test string with matches highlighted inline
- List of all matches with index positions
- Named and numbered capture groups shown per match

## Error Handling

- If the pattern is an invalid regex, show: "This is not a valid regular expression. Check for unescaped characters or mismatched brackets."
- If there are no matches, show: "No matches found."

## Privacy

Runs fully in the browser.

## Tests

- Simple pattern matches expected substrings
- Global flag returns all matches
- Case-insensitive flag works correctly
- Named capture groups are shown correctly
- Named capture groups from `(?<name>...)` are displayed alongside numbered groups
- Invalid regex pattern shows error
- Pattern updates without clicking a button (real-time behaviour)
