<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/layouts/components/AppSidebar.vue'

const route = useRoute()

const title = computed(() => route.meta.title ?? '')
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
        <UDashboardNavbar :title="title" />
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
