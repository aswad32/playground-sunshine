# Markdown Previewer Spec

## Goal

Render Markdown source as formatted HTML in real time, so users can preview how their Markdown will look.

## Route

/tools/markdown-previewer

## Inputs

- Textarea: Markdown source
- Page loads with a short default Markdown sample pre-filled so the preview panel is not empty on first visit.

## Actions

- Preview is live / auto-updating (debounced)
- Copy HTML — copy the rendered HTML source to clipboard
- Copy Markdown — copy the raw Markdown to clipboard
- Clear — reset input and output

## Output

Rendered HTML preview displayed alongside or below the input.

## Error Handling

- Empty input shows an empty preview with a dashed-border placeholder prompt.
- Malformed Markdown should still render best-effort — do not show an error for render issues.

## Privacy

Runs fully in the browser. Markdown input is never sent to a server.

## Tests

- Headings render as correct HTML heading elements
- Bold and italic syntax renders correctly
- Code blocks render with correct formatting
- Links render as anchor elements
- Empty input shows empty preview
