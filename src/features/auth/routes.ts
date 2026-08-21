import type { RouteRecordRaw } from 'vue-router'

/**
 * Mounted by the root router under the `/auth` layout record, so paths here are relative.
 * Every route is `meta.guestOnly`: reachable while signed out, and redirected to the home
 * page for anyone who already has a session.
 *
 * The last two paths are **fixed by the backend** — it puts these exact URLs into the emails
 * it sends. Renaming one breaks every link already in somebody's inbox.
 */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: 'login',
    name: 'auth-login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { guestOnly: true, title: 'Prijava' },
  },
  {
    path: 'forgot-password',
    name: 'auth-forgot-password',
    component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
    meta: { guestOnly: true, title: 'Zaboravljena lozinka' },
  },
  {
    // From the activation email: /auth/activate-account?email=…&token=…
    path: 'activate-account',
    name: 'auth-activate-account',
    component: () => import('@/pages/auth/ActivateAccountPage.vue'),
    meta: { guestOnly: true, title: 'Aktivacija naloga' },
  },
  {
    // From the password reset email: /auth/reset-password?email=…&token=…
    path: 'reset-password',
    name: 'auth-reset-password',
    component: () => import('@/pages/auth/ResetPasswordPage.vue'),
    meta: { guestOnly: true, title: 'Nova lozinka' },
  },
]
