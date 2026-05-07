# Fake Data Generator Spec

## Goal

Generate realistic fake data for use in mocks, prototypes, and tests. Support common data types and allow generating multiple rows.

## Route

/tools/fake-data-generator

## Inputs

- Multi-select: data types to generate — name, email, phone, address, company, UUID, date, lorem ipsum, number, URL
- Number input: number of rows to generate (1–100)
- Toggle: output format — JSON, CSV, plain list

## Actions

- Generate — produce the requested fake data
- Copy — copy output to clipboard
- Clear — reset output

## Output

Generated fake data in the selected format, shown in a read-only textarea.

## Error Handling

- If no data types are selected, show: "Please select at least one data type."
- Clamp rows to 1–100.

## Privacy

Runs fully in the browser. No data is sent to a server.

## Tests

- Generates correct number of rows
- JSON output is valid parseable JSON
- CSV output has correct column headers matching selected data types
- Plain list output has one entry per row
- Empty type selection shows error
- Each supported data type (name, email, phone, address, company, UUID, date, lorem ipsum, number, URL) produces non-empty values
- Row count is clamped to 1 when 0 is entered
- Row count is clamped to 100 when a value above 100 is entered
