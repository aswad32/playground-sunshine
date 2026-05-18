# Contributing to Playground Sunshine

Thank you for contributing! Follow these steps every time to keep the project clean and consistent.

---

## Workflow Overview

```
gh issue create
  → git checkout develop && git pull origin develop
  → git checkout -b feature/<issue-number>-short-description
  → implement changes
  → commit
  → git push
  → gh pr create --base develop
  → merge PR on GitHub
  → git checkout develop && git pull origin develop
```

---

## Step-by-Step

### 1. Create a GitHub issue

Every code change needs a GitHub issue first — no exceptions.

```bash
gh issue create --title "feat: short description" --body "What and why." --label enhancement
```

Note the issue number (e.g. `#42`). You will use it for the branch name and commit message.

**Labels to use:**
- `enhancement` — new features or improvements
- `bug` — something is broken
- `documentation` — docs only changes
- `other` — anything that doesn't fit above

---

### 2. Sync develop

Always start from the latest `develop` to avoid conflicts with other merged work.

```bash
git checkout develop
git pull origin develop
```

---

### 3. Create a feature branch

```bash
git checkout -b feature/<issue-number>-short-kebab-description
```

Examples:
- `feature/42-json-formatter`
- `feature/17-base64-decoder`
- `feature/51-contributing-docs`

---

### 4. Implement your changes

Follow the [project conventions](../../.github/copilot-instructions.md):

- Place pages in `app/pages/tools/`
- Place utility functions (pure, no Vue) in `app/utils/`
- Place composables in `app/composables/`
- Update `app/data/tools.ts` when adding a tool
- Update `app/pages/index.vue` `iconMap` when adding a tool icon
- Add unit tests for utility functions in `tests/`
- Add or update the matching spec in `docs/specs/` using `_template.md`

---

### 5. Verify everything before committing

**Do not run `git commit`, `git push`, or `gh pr create` until all of the following are confirmed.** This is a blocking gate.

**Run unit tests — must be all green:**
```bash
pnpm test
```

**Run Playwright tests — must pass (if e2e tests exist or were added):**
```bash
pnpm test:e2e
```

**Verify metadata and docs:**
- [ ] Tool entry added to `app/data/tools.ts` with `name`, `route`, `description`, `tags`, `icon`, `category` (if adding a tool)
- [ ] Icon added to `iconMap` in `app/pages/index.vue` (if adding a new icon)
- [ ] Tool spec follows `docs/specs/_template.md` and includes SEO, privacy, accessibility, metadata, tests, and a quality checklist
- [ ] README updated (if adding a major tool)

**Verify quality:**
- [ ] Privacy note included on sensitive tools (JWT, Base64, Hash, .env, etc.)
- [ ] SEO metadata added with `useSeoMeta`
- [ ] No raw error stack traces shown to users
- [ ] No user input sent to external servers

---

### 6. Commit

Use Conventional Commits format:

```bash
git add <files>
git commit -m "feat: description (#42)

Closes #42"
```

Prefix guide:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code restructure without behavior change
- `test:` — test changes only
- `chore:` — tooling, config, deps

Always include `Closes #N` in the commit body to auto-close the issue when the PR merges.

---

### 7. Push

```bash
git push origin feature/<issue-number>-short-description
```

---

### 8. Open a pull request

PRs always target `develop`, never `main`.

```bash
gh pr create --base develop --fill
```

Or use the GitHub web UI. Include:
- A clear title (same as commit message)
- Linked issue number in the body
- A brief description of what changed and why

---

### 9. After the PR is merged

Sync `develop` locally to avoid it falling behind:

```bash
git checkout develop
git pull origin develop
```

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature / fix | `feature/<N>-short-description` | `feature/42-json-formatter` |

Always use kebab-case for the description.

---

## Code Conventions

See the full guidelines in [copilot-instructions.md](../../.github/copilot-instructions.md).

Quick summary:
- **Pages:** `kebab-case.vue` in `app/pages/tools/`
- **Components:** `PascalCase.vue`
- **Composables:** `camelCase.ts`, always prefixed with `use`
- **Utils:** `camelCase.ts`, pure functions only
- **Tests:** mirror the utils filename, `.test.ts`

---

## Running the Project Locally

```bash
pnpm install        # install dependencies
pnpm dev            # start dev server at http://localhost:3000
pnpm test           # run unit tests
pnpm test:e2e       # run Playwright end-to-end tests
pnpm build          # production build
```
