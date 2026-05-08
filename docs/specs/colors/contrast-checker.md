# Contrast Checker Spec

## Goal

Check the color contrast ratio between a foreground and background color against WCAG 2.1 accessibility standards (AA and AAA levels). Help developers and designers build accessible UIs.

## Route

/tools/contrast-checker

## Inputs

- Foreground color picker — native `<input type="color">` + text input (HEX)
- Background color picker — native `<input type="color">` + text input (HEX)

## Actions

- Check is live / real-time — results update as colors change
- Swap — swap foreground and background colors
- Copy ratio — copy the contrast ratio to clipboard

## Output

- **Contrast ratio** — displayed prominently as `X.XX : 1`
- **WCAG AA** pass/fail badges for:
  - Normal text (≥ 4.5 : 1)
  - Large text (≥ 3 : 1 — text ≥ 18pt or ≥ 14pt bold)
  - UI components / graphical objects (≥ 3 : 1)
- **WCAG AAA** pass/fail badges for:
  - Normal text (≥ 7 : 1)
  - Large text (≥ 4.5 : 1)
- **Preview panel** — show sample text ("The quick brown fox") rendered with the chosen foreground on the chosen background at normal and large sizes

## Contrast Ratio Calculation

Per WCAG 2.1: `(L1 + 0.05) / (L2 + 0.05)` where `L1` is the lighter relative luminance and `L2` is the darker.

Relative luminance per channel: `C / 12.92` if `C ≤ 0.04045`, else `((C + 0.055) / 1.055) ^ 2.4`.

## Error Handling

- If a HEX text input is not a valid color, highlight with a red border and show: "Invalid HEX color." — do not update results while invalid.
- On blur, revert invalid field to last valid value.

## Notes

- All calculation is pure math — no external dependencies required.
- Support both 6-digit and 3-digit HEX input; always display 6-digit.
- Default colors on load: foreground `#111827` (near-black), background `#FFFFFF` (white).

## Privacy

Runs fully in the browser.

## SEO

```
title: 'Contrast Checker - Playground Sunshine'
description: 'Check WCAG AA and AAA color contrast ratios instantly — free accessibility contrast checker that runs entirely in your browser.'
```

## Tests

- White on black (`#FFFFFF` / `#000000`) → ratio `21 : 1`, passes all AA and AAA levels
- `#767676` on white → ratio ≈ `4.48 : 1`, passes AA normal text (just barely), fails AAA
- `#FFFFFF` on `#FFFFFF` → ratio `1 : 1`, fails all levels
- Luminance of `#000000` is `0`
- Luminance of `#FFFFFF` is `1`
- Luminance of `#FF0000` is ≈ `0.2126`
- Swapping foreground/background produces the same ratio
- Invalid HEX shows error and does not update results
