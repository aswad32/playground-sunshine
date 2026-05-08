# String Case Converter Spec

## Goal

Convert text between common casing conventions used in code: camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, and Title Case. Updates all formats in real time as the user types.

## Route

/tools/string-case-converter

## Inputs

- Textarea: input text (can be in any casing convention or plain English)

## Actions

- Conversion is live / real-time — all formats update as the user types
- Copy button next to each output format
- Clear — reset input and all outputs

## Output

Six read-only output fields, one per format:
- `camelCase`
- `PascalCase`
- `snake_case`
- `kebab-case`
- `SCREAMING_SNAKE_CASE`
- `Title Case`

## Conversion Logic Notes

- Input is first tokenised into words by splitting on whitespace, underscores, hyphens, and boundaries between lowercase and uppercase letters (camelCase/PascalCase detection).
- Numbers are treated as word tokens and kept in place.
- Leading/trailing whitespace is ignored.
- Consecutive separators (e.g. `__`, `--`) are collapsed into a single word boundary.
- Non-alphanumeric characters other than separators are stripped.
- Empty input produces empty outputs with no error.

## Error Handling

- No errors expected — all inputs are valid (conversion is best-effort).
- If input is entirely non-alphanumeric, all outputs are empty.

## Notes

- No external dependencies required — pure string manipulation.

## Privacy

Runs fully in the browser.

## SEO

```
title: 'String Case Converter - Playground Sunshine'
description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, and Title Case — free, instant, runs in your browser.'
```

## Tests

- `hello world` → `helloWorld`, `HelloWorld`, `hello_world`, `hello-world`, `HELLO_WORLD`, `Hello World`
- `getUserById` → `get_user_by_id`, `get-user-by-id`, `GetUserById`, `GET_USER_BY_ID`
- `snake_case_input` converts correctly to all formats
- `kebab-case-input` converts correctly to all formats
- Numbers in input are preserved: `base64Encoder` → `base_64_encoder`
- Empty input produces empty outputs
- Input with only non-alphanumeric characters produces empty outputs
- Consecutive separators (`user__name`) collapse correctly
