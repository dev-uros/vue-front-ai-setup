import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('@/pages/dashboard/HomePage.vue'),
    meta: { title: 'Početna', icon: 'i-lucide-house' },
  },
]
