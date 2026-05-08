# Color Picker & Converter Spec

## Goal

Convert colors between HEX, RGB, HSL, and HSB (HSV) representations. Allow picking a color visually with a native color input. Updates all formats in real time.

## Route

/tools/color-converter

## Inputs

- Native color picker (`<input type="color">`) — visual swatch
- Four text inputs, one per format:
  - HEX — e.g. `#1a2b3c` or `1a2b3c` (with or without `#`)
  - RGB — e.g. `rgb(26, 43, 60)` or `26, 43, 60`
  - HSL — e.g. `hsl(210, 40%, 17%)` or `210, 40%, 17%`
  - HSB / HSV — e.g. `210, 57%, 24%`

Editing any field (or using the color picker) updates all other fields in real time.

## Actions

- Copy button next to each format field — copies that representation to clipboard
- Clear — reset to a default color (e.g. `#3B82F6`, a nice blue)

## Output

All four format fields filled simultaneously. Color swatch (native picker + a large preview box) updates to reflect the current color.

## Error Handling

- If a typed value is not a valid color for its format, highlight the field with a red border and show: "Invalid {format} color value." — do not update other fields while the field is invalid.
- On blur, if the field is still invalid, revert it to the last valid value.

## Notes

- All conversions are pure math — no external dependencies required.
- HEX output is always uppercase (e.g. `#1A2B3C`).
- RGB values are integers 0–255.
- HSL/HSB hue is 0–360°; saturation and lightness/brightness are 0–100%.
- Support both 6-digit (`#RRGGBB`) and 3-digit (`#RGB`) HEX input; always output 6-digit.
- Alpha channel is not supported in v1.

## Privacy

Runs fully in the browser.

## SEO

```
title: 'Color Picker & Converter - Playground Sunshine'
description: 'Convert colors between HEX, RGB, HSL, and HSB instantly — free color picker and converter that runs entirely in your browser.'
```

## Tests

- `#FF0000` → `rgb(255, 0, 0)`, `hsl(0, 100%, 50%)`, `hsb(0, 100%, 100%)`
- `rgb(0, 0, 0)` → `#000000`, `hsl(0, 0%, 0%)`, `hsb(0, 0%, 0%)`
- `rgb(255, 255, 255)` → `#FFFFFF`, `hsl(0, 0%, 100%)`, `hsb(0, 0%, 100%)`
- `#3B82F6` round-trips correctly through all formats back to `#3B82F6`
- 3-digit HEX `#FFF` expands to `#FFFFFF`
- Invalid HEX value shows error and does not update other fields
- Invalid RGB value (channel > 255) shows error
