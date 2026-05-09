#!/usr/bin/env node
// Smoke test: fetches every app route and fails if any returns 4xx or 5xx.
// Usage: BASE_URL=https://example.com node scripts/smoke-test.mjs

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, '')

if (!BASE_URL) {
  console.error('Error: BASE_URL environment variable is required.')
  process.exit(1)
}

const ROUTES = [
  '/',
  '/tools/json-formatter',
  '/tools/yaml-formatter',
  '/tools/env-formatter',
  '/tools/sql-formatter',
  '/tools/markdown-previewer',
  '/tools/html-entity-encoder',
  '/tools/number-base-converter',
  '/tools/base64',
  '/tools/url-encoder-decoder',
  '/tools/jwt-decoder',
  '/tools/uuid-nanoid-generator',
  '/tools/password-generator',
  '/tools/hash-generator',
  '/tools/fake-data-generator',
  '/tools/qr-code-generator',
  '/tools/unix-timestamp-converter',
  '/tools/cron-builder',
  '/tools/regex-tester',
  '/tools/text-diff-checker',
  '/tools/string-case-converter',
  '/tools/word-counter',
  '/tools/csv-json-converter',
  '/tools/image-compressor',
  '/tools/color-converter',
  '/tools/contrast-checker',
  '/tools/sudoku-player',
  '/tools/sudoku-generator',
  '/tools/sudoku-solver',
  '/tools/cidr-calculator',
  '/tools/json-toon-converter',
]

let passed = 0
let failed = 0
const failures = []

console.log(`Smoke testing ${ROUTES.length} routes against ${BASE_URL}\n`)

for (const route of ROUTES) {
  const url = `${BASE_URL}${route}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (res.status >= 400) {
      console.error(`  FAIL  ${res.status}  ${route}`)
      failures.push({ route, status: res.status })
      failed++
    } else {
      console.log(`  OK    ${res.status}  ${route}`)
      passed++
    }
  } catch (err) {
    console.error(`  ERROR       ${route}  —  ${err.message}`)
    failures.push({ route, status: 'network error', message: err.message })
    failed++
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${ROUTES.length} routes.`)

if (failed > 0) {
  console.error('\nFailed routes:')
  for (const f of failures) {
    console.error(`  ${f.status}  ${f.route}`)
  }
  process.exit(1)
}
