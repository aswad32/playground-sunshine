# Cron Expression Builder Spec

## Goal

Build and validate cron expressions with a visual UI. Show a human-readable explanation of the expression and a preview of upcoming run times.

## Route

/tools/cron-builder

## Inputs

- Text input: raw cron expression (5 fields: minute, hour, day-of-month, month, day-of-week)
- OR visual builder: individual dropdowns/inputs for each field
- Quick-start presets: buttons for common schedules — Every minute, Every hour, Daily at midnight, Weekly on Monday, Monthly on the 1st

## Actions

- Explain — show a human-readable description of the expression
- Preview — list the next 5 upcoming run times based on current time
- Copy expression — copy the cron string to clipboard
- Clear — reset all inputs and output

## Notes

- Only 5-field standard cron is supported (no seconds field). Display note if user enters 6 fields.

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
- `*/15 * * * *` explains as "Every 15 minutes"
- `0 9-17 * * 1-5` explains as a weekday business-hours schedule
- `0 0 1 * *` explains as "At midnight on the 1st of every month"
- Invalid expression (e.g. 6 fields) shows error
- Invalid field values (e.g. minute `60`) shows error
- Next run times are in the future
