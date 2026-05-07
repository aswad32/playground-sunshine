# Cron Expression Builder Spec

## Goal

Build and validate cron expressions with a visual UI. Show a human-readable explanation of the expression and a preview of upcoming run times.

## Route

/tools/cron-builder

## Inputs

- Text input: raw cron expression (5 or 6 fields)
- OR visual builder: dropdowns/inputs for minute, hour, day of month, month, day of week

## Actions

- Explain — show a human-readable description of the expression
- Preview — list the next 5 upcoming run times based on current time
- Copy expression — copy the cron string to clipboard
- Clear — reset all inputs

## Output

- Human-readable explanation (e.g. "Every day at 08:00 UTC")
- List of next 5 scheduled run times

## Error Handling

- If the expression is invalid, show: "This doesn't look like a valid cron expression. Check the number of fields and allowed values."

## Privacy

Runs fully in the browser.

## Tests

- `* * * * *` explains as "Every minute"
- `0 8 * * 1` explains correctly as a weekly schedule
- Invalid expression shows error
- Next run times are in the future
