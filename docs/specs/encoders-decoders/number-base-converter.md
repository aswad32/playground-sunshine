# Number Base Converter Spec

## Goal

Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Update all representations in real time as the user types.

## Route

/tools/number-base-converter

## Inputs

- Four labelled inputs, one per base:
  - Binary (base 2) — accepts `0` and `1` only
  - Octal (base 8) — accepts `0–7` only
  - Decimal (base 10) — accepts `0–9` only
  - Hexadecimal (base 16) — accepts `0–9`, `a–f`, `A–F`

The user types in any one field; all other fields update in real time.

## Actions

- Copy button next to each output field — copy that specific value to clipboard
- Clear — reset all fields

## Output

All four fields filled simultaneously once a valid number is entered in any one field.

## Error Handling

- If the value typed in a field is invalid for that base (e.g. `9` in binary), show: "Invalid character for base N." next to that field.
- If the decimal value exceeds `Number.MAX_SAFE_INTEGER` (2⁵³ − 1), show: "Number too large for safe integer conversion." 
- Empty input clears all fields with no error.

## Notes

- Use `parseInt(value, base)` and `number.toString(base)` — no external dependencies.
- Hexadecimal output should always be uppercase.
- Do not support negative numbers in v1.
- Do not support fractional numbers in v1.

## Privacy

Runs fully in the browser.

## SEO

```
title: 'Number Base Converter - Playground Sunshine'
description: 'Convert numbers between binary, octal, decimal, and hexadecimal in real time — free and runs entirely in your browser.'
```

## Tests

- `255` decimal → `11111111` binary, `377` octal, `FF` hex
- `0` converts correctly in all bases
- `FF` hex → `255` decimal
- `10` binary → `2` decimal
- Invalid binary character (`9`) shows error
- Number above MAX_SAFE_INTEGER shows warning
- Empty input clears all fields
