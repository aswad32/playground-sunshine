# Text Diff Checker Spec

## Goal

Allow users to compare two blocks of text and clearly see the differences between them directly in the browser.

This tool helps developers, writers, students, and everyday users compare text, code snippets, configuration files, JSON, SQL, Markdown, or any plain text content — without sending anything to a server.

## Route

/tools/text-diff-checker

## Inputs

- **Original** textarea — the base/original version of the text
- **Modified** textarea — the changed/new version to compare against

Both inputs accept any plain text content. No file size limit is enforced, but very large inputs should be debounced to keep the UI responsive.

## Actions

- **Compare** — compute the diff between the two inputs and display the result (auto-triggered on input change with debounce, or explicitly via a Compare button)
- **Swap** — swap the Original and Modified inputs
- **Copy diff** — copy the diff output as plain text (unified diff format)
- **Clear** — reset both inputs and the diff output

## Output

An inline, line-by-line diff view displayed below the two input areas (or beside them on wider screens), showing:

- **Added lines** — highlighted in green with a `+` prefix
- **Removed lines** — highlighted in red with a `-` prefix
- **Unchanged lines** — shown in neutral grey for context (a few lines above and below each change)
- A summary line at the top: e.g. `3 additions, 2 removals` (hidden when there are no differences)
- A clear "No differences found" message when both inputs are identical

## UI Layout

- Side-by-side textareas at the top (stacked on mobile)
- Diff output panel below, with monospace font and line numbers
- Swap button between the two textareas
- Compare / Copy / Clear buttons grouped in a toolbar above the diff output

## Error Handling

- If both inputs are empty, show nothing (empty state)
- If only one input has content, treat the other as an empty string and diff accordingly
- Do not show raw error stack traces under any circumstances

## Privacy

Runs fully in the browser. Neither the Original nor the Modified text is ever sent to a server, logged, or stored. This should be clearly noted in a privacy notice on the page, as users may paste sensitive content such as configuration files or code.

## Notes

- Use a well-established browser-safe diff library (e.g. `diff` by kpdecker — small, widely used, no server dependency)
- The diff algorithm should operate at the line level by default
- Keep the utility logic in `utils/textDiff.ts` as pure functions, directly testable with Vitest

## Tests

- Two identical strings produce a "no differences" result
- Added lines are correctly identified and marked
- Removed lines are correctly identified and marked
- Mixed additions and removals produce the correct combined diff
- Empty Original with non-empty Modified shows all lines as added
- Non-empty Original with empty Modified shows all lines as removed
- Both inputs empty produces an empty diff
- Diff summary count (additions/removals) is accurate
