import { test, expect, type Page } from '@playwright/test'
import { ACCOUNTS } from '../support/accounts'

/**
 * The two pages the backend links to from its emails. Their paths are fixed by the backend,
 * so a rename here breaks every link already sitting in somebody's inbox — these specs pin
 * them down along with the behaviour.
 */
const RESET_LINK = `/auth/reset-password?email=${encodeURIComponent(ACCOUNTS.plain.email)}&token=tok_e2e`
const ACTIVATE_LINK = `/auth/activate-account?email=${encodeURIComponent(ACCOUNTS.pending.email)}&token=tok_e2e`

/** Satisfies every rule the form checks and, unlike the obvious choices, is not in a breach corpus. */
const STRONG = 'Zg7#mQr2vLx9'

/** Passes every local rule and is refused by the API, which is the only place that can know. */
const BREACHED = 'Lozinka123!'

/**
 * The endpoints behind these pages are throttled, and the counter is **shared**: Laravel keys
 * `throttle:n,1` on domain plus IP, not on the route, so every public auth endpoint draws from
 * one tally and only the ceiling differs (10 for login and the two link endpoints, 5 for
 * forgot-password). A handful of sign-in attempts is therefore enough to make a
 * forgot-password request fail, which is why nothing here posts to it — see
 * `pages/auth/__tests__/ForgotPasswordPage.spec.ts` for that.
 *
 * What is left still costs budget, so a test whose subject is the API's answer rather than the
 * rendering runs in one browser: repeating it in three proves nothing new about a response no
 * renderer touches.
 */
function onlyOneBrowser(browserName: string) {
  // A conditional skip, not a disabled test: the assertion still runs, once.
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(browserName !== 'chromium', 'throttled endpoint: one browser is enough')
}

function fieldErrors(page: Page) {
  return page.locator('[data-slot="error"]')
}

async function fillPassword(page: Page, password: string, confirmation = password) {
  const inputs = page.locator('input[autocomplete="new-password"]')
  await inputs.first().fill(password)
  await inputs.last().fill(confirmation)
}

test.describe('reset password', () => {
  test('reads the account out of the link', async ({ page }) => {
    await page.goto(RESET_LINK)

    await expect(page.getByRole('heading', { name: 'Nova lozinka' })).toBeVisible()
    await expect(page.getByText(`Postavljate novu lozinku za ${ACCOUNTS.plain.email}.`)).toBeVisible()
  })

  test('names the rule a weak password breaks', async ({ page }) => {
    await page.goto(RESET_LINK)

    await fillPassword(page, 'lozinka')
    await page.getByRole('button', { name: 'Sačuvaj lozinku' }).click()

    await expect(fieldErrors(page)).toContainText('Najmanje 8 karaktera')
    await expect(page).toHaveURL(/reset-password/)
  })

  test('refuses a mismatched confirmation', async ({ page }) => {
    await page.goto(RESET_LINK)

    await fillPassword(page, STRONG, 'Lozinka124!')
    await page.getByRole('button', { name: 'Sačuvaj lozinku' }).click()

    await expect(fieldErrors(page)).toContainText('Lozinke se ne poklapaju')
  })

  test('ticks off the checklist as the password improves', async ({ page }) => {
    await page.goto(RESET_LINK)

    const met = page.locator('[data-testid="password-rules"] li[data-met="true"]')
    await expect(met).toHaveCount(0)

    await page.locator('input[autocomplete="new-password"]').first().fill('Lozinka1')
    await expect(met).toHaveCount(4)

    await page.locator('input[autocomplete="new-password"]').first().fill(STRONG)
    await expect(met).toHaveCount(5)
  })

  /**
   * A link with a missing half is not a link. The token only ever arrives by email, so there
   * is nothing to reconstruct — the page offers a new one instead.
   */
  test('treats a link without a token as no link at all', async ({ page }) => {
    await page.goto(`/auth/reset-password?email=${encodeURIComponent(ACCOUNTS.plain.email)}`)

    await expect(page.getByRole('heading', { name: 'Link nije ispravan' })).toBeVisible()
    await expect(page.getByTestId('request-new-link')).toBeVisible()
    await expect(page.locator('input[autocomplete="new-password"]')).toHaveCount(0)
  })

  /**
   * The API refuses an expired, used or foreign link with a 422 that carries a message and no
   * field errors — deliberately not saying which of the three it was. There is no field to pin
   * that to, so it has to surface as an alert or the user is told nothing at all.
   */
  test('surfaces a rejected link as an alert and offers a fresh one', async ({
    page,
    browserName,
  }) => {
    onlyOneBrowser(browserName)

    await page.goto(RESET_LINK)

    await fillPassword(page, STRONG)
    await page.getByRole('button', { name: 'Sačuvaj lozinku' }).click()

    await expect(page.getByTestId('form-error')).toBeVisible()
    await expect(page.getByTestId('request-new-link')).toBeVisible()
    await expect(page).toHaveURL(/reset-password/)
  })

  /**
   * The one password rule that cannot be checked here: the API also refuses passwords found in
   * known breach corpora. That answer names `password`, so it belongs under the field.
   */
  test('puts a breached password under the field, not in the alert', async ({
    page,
    browserName,
  }) => {
    onlyOneBrowser(browserName)

    await page.goto(RESET_LINK)

    await fillPassword(page, BREACHED)
    await page.getByRole('button', { name: 'Sačuvaj lozinku' }).click()

    await expect(fieldErrors(page)).toContainText('data leak')
    await expect(page.getByTestId('form-error')).toHaveCount(0)
  })
})

test.describe('activate account', () => {
  test('offers the same form under its own wording', async ({ page }) => {
    await page.goto(ACTIVATE_LINK)

    await expect(page.getByRole('heading', { name: 'Aktivirajte nalog' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aktiviraj nalog' })).toBeVisible()
  })

  /** Unlike a reset, a user cannot request a new invite themselves — only an admin can. */
  test('points at the administrator when the link is unusable', async ({ page }) => {
    await page.goto('/auth/activate-account?token=tok_e2e')

    await expect(page.getByRole('heading', { name: 'Link nije ispravan' })).toBeVisible()
    await expect(page.getByTestId('activation-help')).toContainText('administrator')
  })
})

test.describe('forgot password', () => {
  test('is reachable from the login form', async ({ page }) => {
    await page.goto('/auth/login')

    await page.getByRole('link', { name: 'Zaboravili ste lozinku?' }).click()

    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.getByRole('button', { name: 'Pošalji link' })).toBeVisible()
  })

  test('rejects a malformed address before sending anything', async ({ page }) => {
    await page.goto('/auth/forgot-password')

    await page.locator('input[autocomplete="email"]').fill('nije-email')
    await page.getByRole('button', { name: 'Pošalji link' }).click()

    await expect(page.getByText('Unesite ispravnu email adresu')).toBeVisible()
    await expect(page.getByTestId('reset-confirmation')).toHaveCount(0)
  })

  /**
   * The endpoint answers the same 200 whether or not the address has an account, and its
   * message is written for that. Showing anything more definite would turn this form into a
   * way to find out who is registered.
   */
  test('goes back to sign in', async ({ page }) => {
    await page.goto('/auth/forgot-password')

    await page.getByRole('link', { name: 'Nazad na prijavu' }).click()

    await expect(page).toHaveURL('/auth/login')
  })
})
