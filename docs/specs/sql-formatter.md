# SQL Formatter Spec

## Goal

Format and beautify SQL queries to make them readable and consistent.

## Route

/tools/sql-formatter

## Inputs

- Textarea: raw SQL query
- Select: SQL dialect — Standard SQL (`sql`), MySQL, PostgreSQL, SQLite, Transact-SQL (T-SQL)

> Note: "Standard SQL" maps to the `sql` language identifier in the `sql-formatter` library.

## Actions

- Format — pretty-print the SQL with consistent indentation and keyword casing
- Copy — copy the formatted SQL to clipboard
- Clear — reset input and output

## Output

Formatted SQL in a read-only textarea or code block.

## Error Handling

- If the input cannot be parsed, show: "Could not format this SQL. Check for syntax errors and try again."
- Keep output empty when formatting fails.

## Privacy

Runs fully in the browser. SQL input is never sent to a server.

## Tests

- Simple SELECT query is formatted correctly
- Multi-table JOIN query is formatted with correct indentation
- Keywords are uppercased consistently
- PostgreSQL dialect formats the same query differently from Standard SQL (dialect switching works)
- MySQL dialect is applied when selected
- Invalid SQL shows a helpful error message
- Empty input produces no output
