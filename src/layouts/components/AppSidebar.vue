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
    Shell variant `solid-dark`: `app-shell-sidebar` (main.css) repoints the semantic tokens for
    this subtree, so the chrome inside it needs no colour classes of its own. It goes on the
    mobile slideover too — that renders the same slots into a different element, and without it
    the menu would open in light chrome.

    Width is fixed at 240px rather than resizable, so the theme's `w-(--width)` is overridden
    here; `data-[collapsed=true]` falls back to the 64px rail the theme's `min-w-16` describes.
  -->
  <UDashboardSidebar
    id="main"
    collapsible
    :ui="{
      root: [
        'app-shell-sidebar w-60 data-[collapsed=true]:w-16 border-e-0',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
      ],
      content: 'app-shell-sidebar',
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
          <UAvatar icon="i-lucide-gem" size="lg" class="shrink-0 bg-primary/10 text-primary" />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-default">Fifth Guild</p>
            <p class="truncate text-xs text-muted">Administracija</p>
          </div>
        </template>

        <UDashboardSidebarCollapse :class="collapsed ? 'mx-auto' : 'shrink-0'" />
      </div>
    </template>

    <template #default="{ collapsed }">
      <USeparator class="mb-2" />

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
