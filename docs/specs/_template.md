# Tool Name Spec

## Goal

What this tool does, who it helps, and the primary outcome the user gets.

## Route

/tools/tool-name

## Category

Category name from `app/data/tools.ts`.

## Icon

Lucide icon name used in `app/data/tools.ts` and `app/pages/index.vue`.

## Inputs

- Input field / textarea / file upload
- Default values, accepted formats, limits, and placeholder examples

## Actions

- Main action
- Copy
- Clear

## Output

What the user sees after running the tool.

## Layout

- Desktop layout
- Mobile layout
- Empty state
- Loading state, if any

## Behaviour

- Live updates or explicit action behaviour
- Debounce timing, if relevant
- URL query params, if supported
- Local persistence, if any

## Error Handling

What errors should be shown.

## Privacy

Does this run fully in the browser?

Mention whether input can contain sensitive data and confirm that no input is sent to a server.

## Accessibility

- Keyboard navigation expectations
- Focus management
- Error announcements, e.g. `aria-live="polite"` or `role="alert"`
- Color/contrast considerations

## SEO

```ts
useSeoMeta({
  title: 'Tool Name - Playground Sunshine',
  description: 'Short search-friendly description of what the tool does.',
})
```

## Tool Metadata (`app/data/tools.ts`)

```ts
{
  name: 'Tool Name',
  route: '/tools/tool-name',
  description: 'One-sentence description shown on the home page.',
  tags: ['keyword', 'keyword'],
  icon: 'IconName',
  category: 'Category',
}
```

## Utility Design

- Utility file path, e.g. `app/utils/toolName.ts`
- Pure function signatures
- Dependencies, if any
- Edge cases that must be handled

## Tests

- Test case 1
- Test case 2

## Quality Checklist

- [ ] Works on desktop and mobile
- [ ] Empty, invalid, and large inputs are handled gracefully
- [ ] Copy/download actions work
- [ ] Clear/reset works
- [ ] Errors are human-readable and do not expose stack traces
- [ ] Sensitive inputs stay in the browser
- [ ] SEO metadata is set
- [ ] Tool is listed in `app/data/tools.ts`
- [ ] Icon is available in `app/pages/index.vue`
- [ ] Unit tests cover core utility logic
