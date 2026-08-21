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
  <!--
    Sizes are pixels rather than percentages (`unit="px"` on the group in MainLayout), because
    the theme specifies the rail in pixels: 200px open, a 48px icon rail collapsed. `min-w-12`
    has to come with it — the component floors its own root at `min-w-16`, which would hold the
    collapsed rail at 64px however small `collapsedSize` is.

    The collapsed padding hangs off `data-collapsed` on the root, which is the only element
    that knows: `ui` is resolved once for the whole component, while `collapsed` is a slot prop.
  -->
  <UDashboardSidebar
    id="main"
    collapsible
    resizable
    :min-size="176"
    :default-size="200"
    :max-size="320"
    :collapsed-size="48"
    :ui="{
      root: 'group/sidebar min-w-12 transition-[width] duration-200 ease-out motion-reduce:transition-none data-[dragging=true]:transition-none',
      header: 'px-3 group-data-[collapsed=true]/sidebar:px-1.5',
      body: 'gap-3 px-3 py-2 group-data-[collapsed=true]/sidebar:px-1.5',
      footer: 'border-t border-default px-3 py-2 group-data-[collapsed=true]/sidebar:px-1.5',
    }"
  >
    <template #header="{ collapsed }">
      <div class="flex w-full items-center gap-2">
        <!--
          The header has a fixed height, so the collapsed rail shows the expand control on its
          own — stacking it under the avatar would clip both. Branding returns on expand.
        -->
        <template v-if="!collapsed">
          <UAvatar icon="i-lucide-gem" size="sm" class="shrink-0 bg-primary/10 text-primary" />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm/tight font-semibold text-default">Fifth Guild</p>
            <p class="truncate text-xs/tight text-dimmed">Administracija</p>
          </div>
        </template>

        <UDashboardSidebarCollapse :class="collapsed ? 'mx-auto' : 'shrink-0'" />
      </div>
    </template>

    <template #default="{ collapsed }">
      <USeparator class="mb-1" />

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
