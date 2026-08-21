import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/features/auth/routes'
import { dashboardRoutes } from '@/features/dashboard/routes'
import { settingsRoutes } from '@/features/settings/routes'
import { usersRoutes } from '@/features/users/routes'
import { authGuard } from '@/router/guards'

/**
 * Features export plain route arrays; the layout they render inside is decided here by
 * nesting them under a layout record. That keeps features layout-agnostic and puts every
 * layout decision in one file.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [...authRoutes],
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [...dashboardRoutes, ...usersRoutes, ...settingsRoutes],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach(authGuard)

export default router
