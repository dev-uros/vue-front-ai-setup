<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/layouts/components/AppSidebar.vue'

const route = useRoute()

const title = computed(() => route.meta.title ?? '')

/**
 * Only routes the sidebar cannot reach declare a parent — see `back` in `router/meta.d.ts`.
 * The layout reads the meta rather than knowing which pages nest, so a feature adding a
 * detail page gets the button without touching this file.
 */
const back = computed(() => route.meta.back)
</script>

<template>
  <!--
    `storage="local"` is required outside Nuxt: Nuxt UI's Vue build stubs `useCookie` with a
    no-op, so the default cookie storage would silently drop sidebar collapse state.
  -->
  <UDashboardGroup storage="local" storage-key="app-dashboard">
    <AppSidebar />

    <UDashboardPanel>
      <template #header>
        <!-- The collapse control lives in the sidebar itself; see AppSidebar. -->
        <UDashboardNavbar :title="title">
          <!-- `leading` renders after the sidebar toggle and before the title, not instead of them. -->
          <template v-if="back" #leading>
            <UButton
              :to="back"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              aria-label="Nazad"
              data-testid="page-back"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <RouterView v-slot="{ Component, route: current }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="current.path" />
          </Transition>
        </RouterView>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
