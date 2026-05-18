import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads and shows tool cards', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Playground Sunshine/)
    // At least one tool card should be visible
    const cards = page.locator('a[href^="/tools/"]')
    await expect(cards.first()).toBeVisible()
  })
})

test.describe('JSON Formatter', () => {
  test('formats valid JSON', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    await page.waitForLoadState('networkidle')

    // pressSequentially types char-by-char so Vue's v-model picks up input events
    await page.locator('#json-input').pressSequentially('{"a":1,"b":2}')
    await page.getByRole('button', { name: 'Format' }).click()

    await expect(page.locator('#json-output')).toHaveValue(/"a"/)
  })

  test('shows error for invalid JSON', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    await page.waitForLoadState('networkidle')
    await page.locator('#json-input').pressSequentially('{invalid}')
    await page.getByRole('button', { name: 'Format' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})

test.describe('Base64 Encoder / Decoder', () => {
  test('encodes text to base64 (live)', async ({ page }) => {
    await page.goto('/tools/base64')
    await page.waitForLoadState('networkidle')

    // Encoding is computed live — pressSequentially triggers Vue's v-model
    await page.locator('#b64-input').pressSequentially('hello')

    // Output textarea appears when result is non-empty
    await expect(page.locator('textarea[readonly]')).toHaveValue('aGVsbG8=')
  })
})

test.describe('UUID Generator', () => {
  test('shows UUIDs on page load', async ({ page }) => {
    await page.goto('/tools/uuid-nanoid-generator')
    await expect(page.getByRole('heading', { name: /uuid/i })).toBeVisible()

    // UUIDs are generated on load automatically
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    await expect(page.locator('body')).toContainText(uuidPattern)
  })

  test('regenerates UUIDs on Generate click', async ({ page }) => {
    await page.goto('/tools/uuid-nanoid-generator')
    await page.getByRole('button', { name: 'Generate' }).click()
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    await expect(page.locator('body')).toContainText(uuidPattern)
  })
})

test.describe('IPv6 CIDR Calculator', () => {
  test('loads and shows empty state', async ({ page }) => {
    await page.goto('/tools/ipv6-cidr-calculator')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /ipv6 cidr calculator/i })).toBeVisible()
    await expect(page.locator('body')).toContainText('Enter an IPv6 CIDR block')
  })

  test('calculates results for a valid CIDR on blur', async ({ page }) => {
    await page.goto('/tools/ipv6-cidr-calculator')
    await page.waitForLoadState('networkidle')

    const input = page.locator('#cidr-input')
    await input.pressSequentially('2001:db8::1/64')
    await input.blur()

    // Network address should appear in the result grid
    await expect(page.locator('body')).toContainText('2001:db8::')
    await expect(page.locator('body')).toContainText('Documentation')
  })

  test('does not show error while typing incomplete input', async ({ page }) => {
    await page.goto('/tools/ipv6-cidr-calculator')
    await page.waitForLoadState('networkidle')

    // Type something invalid without blurring
    await page.locator('#cidr-input').pressSequentially('2001:db8')

    // Error must not appear mid-type
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('shows validation error after blur on invalid input', async ({ page }) => {
    await page.goto('/tools/ipv6-cidr-calculator')
    await page.waitForLoadState('networkidle')

    const input = page.locator('#cidr-input')
    await input.pressSequentially('notanipv6/64')
    await input.blur()

    await expect(page.getByRole('alert')).toBeVisible()
  })
})
