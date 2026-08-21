<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mainNavigation } from '@/layouts/navigation'
import SidebarUserMenu from '@/layouts/components/SidebarUserMenu.vue'

const route = useRoute()

/** The menu recomputes on every navigation, which is what moves the active highlight. */
const items = computed(() => mainNavigation(String(route.name ?? '')))
</script>

<template>
  <UDashboardSidebar
    id="main"
    collapsible
    resizable
    :min-size="14"
    :default-size="18"
    :max-size="26"
    :ui="{
      root: 'transition-[width] duration-200 ease-out motion-reduce:transition-none data-[dragging=true]:transition-none',
      footer: 'border-t border-default',
    }"
  >
    <template #header="{ collapsed }">
      <div class="flex w-full items-center gap-2.5">
        <!--
          The header has a fixed height, so the collapsed rail shows the expand control on its
          own — stacking it under the avatar would clip both. Branding returns on expand.
        -->
        <template v-if="!collapsed">
          <!-- The one filled shape in the chrome: near-black in light, near-white in dark. -->
          <UAvatar
            icon="i-lucide-gem"
            size="lg"
            class="shrink-0 rounded-lg bg-inverted"
            :ui="{ icon: 'text-inverted' }"
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-default">Fifth Guild</p>
            <p class="truncate text-xs text-muted">Administracija</p>
          </div>
        </template>

        <UDashboardSidebarCollapse :class="collapsed ? 'mx-auto' : 'shrink-0'" />
      </div>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="items"
        orientation="vertical"
        tooltip
        popover
      />
    </template>

    <template #footer="{ collapsed }">
      <SidebarUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
