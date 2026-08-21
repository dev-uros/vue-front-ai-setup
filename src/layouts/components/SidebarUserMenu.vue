<script setup lang="ts">
import { computed } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useSessionStore } from '@/features/shared/stores/session'
import { userFullName } from '@/features/shared/schemas/user'
import UserAvatar from '@/features/shared/components/UserAvatar.vue'
import { useAppTheme, type ThemePreference } from '@/features/shared/composables/useAppTheme'
import { useLogout } from '@/features/auth/composables/useLogout'

const props = defineProps<{
  collapsed?: boolean
}>()

const session = useSessionStore()
const { preference } = useAppTheme()
const { signOut, isLoading } = useLogout()

const user = computed(() => session.user)

function setTheme(value: ThemePreference) {
  preference.value = value
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Moj nalog',
      icon: 'i-lucide-user',
      to: { name: 'settings-profile' },
    },
    {
      label: 'Tema',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Svetla',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: preference.value === 'light',
          onSelect: () => setTheme('light'),
        },
        {
          label: 'Tamna',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: preference.value === 'dark',
          onSelect: () => setTheme('dark'),
        },
        {
          label: 'Sistemska',
          icon: 'i-lucide-monitor',
          type: 'checkbox',
          checked: preference.value === 'auto',
          onSelect: () => setTheme('auto'),
        },
      ],
    },
  ],
  [
    {
      label: 'Odjavi se',
      icon: 'i-lucide-log-out',
      color: 'error',
      loading: isLoading.value,
      onSelect: () => void signOut(),
    },
  ],
])
</script>

<template>
  <UDropdownMenu
    v-if="user"
    :items="items"
    :content="{ side: 'top', align: 'center', sideOffset: 8 }"
    :ui="{ content: props.collapsed ? 'w-52' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      data-testid="user-menu"
      :square="props.collapsed"
      :class="props.collapsed ? 'p-1.5' : 'gap-2.5 p-2'"
      :aria-label="`Meni naloga za ${userFullName(user)}`"
    >
      <UserAvatar :user="user" size="xs" class="shrink-0" />

      <template v-if="!props.collapsed">
        <span class="min-w-0 flex-1 text-left">
          <span class="block truncate text-sm font-medium text-default">
            {{ userFullName(user) }}
          </span>
          <span class="block truncate text-xs font-normal text-muted">{{ user.email }}</span>
        </span>
        <UIcon name="i-lucide-ellipsis-vertical" class="size-4 shrink-0 text-dimmed" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
