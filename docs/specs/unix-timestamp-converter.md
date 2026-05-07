# Unix Timestamp Converter Spec

## Goal

Convert Unix timestamps to human-readable dates and vice versa. Support seconds and milliseconds.

## Route

/tools/unix-timestamp-converter

## Inputs

- Number input: Unix timestamp (seconds or milliseconds)
- Toggle: seconds / milliseconds
- Date-time input: human-readable date for reverse conversion

## Actions

- Convert timestamp → date — show the human-readable UTC and local date/time
- Convert date → timestamp — show the Unix timestamp in seconds and milliseconds
- Use now — fill the timestamp input with the current time
- Copy — copy the result to clipboard
- Clear — reset inputs and output

## Output

- Timestamp → date: UTC date/time and local date/time
- Date → timestamp: Unix seconds and milliseconds

## Error Handling

- If the timestamp is not a valid number, show: "Please enter a valid number."
- If the date input is not a valid date, show: "Please enter a valid date."

## Privacy

Runs fully in the browser.

## Tests

- Known timestamp converts to correct UTC date
- Known date converts to correct timestamp
- Invalid timestamp shows error
- Milliseconds toggle correctly divides/multiplies
