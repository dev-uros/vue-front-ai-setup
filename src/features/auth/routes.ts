import type { RouteRecordRaw } from 'vue-router'

/**
 * Mounted by the root router under the `/auth` layout record, so paths here are relative.
 * `meta.public` is what opts these routes out of the auth guard.
 */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: 'login',
    name: 'auth-login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { public: true, title: 'Sign in' },
  },
  {
    path: 'forgot-password',
    name: 'auth-forgot-password',
    component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
    meta: { public: true, title: 'Forgot password' },
  },
  {
    // Reached from an emailed link: /auth/reset-password?email=…&token=…
    path: 'reset-password',
    name: 'auth-reset-password',
    component: () => import('@/pages/auth/ResetPasswordPage.vue'),
    meta: { public: true, title: 'Reset password' },
  },
]
