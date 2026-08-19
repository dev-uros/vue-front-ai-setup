import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/auth/login')
  await page.locator('input[autocomplete="email"]').fill('ana.kovac@fifthguild.dev')
  await page.locator('input[autocomplete="current-password"]').fill('Password123!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
})

test('collapses and expands the sidebar, and remembers the choice', async ({ page }) => {
  // Nuxt UI builds the DOM id as `${storageKey}-sidebar-${id}` from MainLayout + AppSidebar.
  const sidebar = page.locator('#app-dashboard-sidebar-main')
  const userMenu = page.getByTestId('user-menu')

  await expect(userMenu).toContainText('Ana Kovač')

  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await expect(userMenu).not.toContainText('Ana Kovač')

  await page.reload()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')

  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
})

test('navigates through single and expandable menu items', async ({ page }) => {
  await page.getByRole('link', { name: 'Reports' }).click()
  await expect(page).toHaveURL('/reports')

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('link', { name: 'Profile' }).click()

  await expect(page).toHaveURL('/settings/profile')
  await expect(page.locator('dd', { hasText: 'ana.kovac@fifthguild.dev' })).toBeVisible()
})

test('switches to dark mode from the user menu', async ({ page }) => {
  await page.getByTestId('user-menu').click()
  await page.getByRole('menuitem', { name: 'Theme' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Dark' }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('shows the sidebar as an overlay on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const nav = page.getByRole('link', { name: 'Reports' })
  await expect(nav).toBeHidden()

  await page.getByRole('button', { name: 'Open sidebar' }).click()
  await expect(nav).toBeVisible()

  await nav.click()
  await expect(page).toHaveURL('/reports')
  // `autoClose` on UDashboardSidebar dismisses the overlay once the route changes.
  await expect(nav).toBeHidden()
})

test('animates the sidebar width instead of snapping', async ({ page }) => {
  const sidebar = page.locator('#app-dashboard-sidebar-main')

  await expect(sidebar).toHaveCSS('transition-property', 'width')
  await expect(sidebar).toHaveCSS('transition-duration', '0.2s')
})

test('runs the page transition on a route change', async ({ page }) => {
  // Start waiting before the click: the enter phase only lasts 200ms.
  const entering = page.locator('.page-enter-active').waitFor({ state: 'attached', timeout: 3000 })

  await page.getByRole('link', { name: 'Reports' }).click()

  await entering
  await expect(page).toHaveURL('/reports')
})
