<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useSessionStore } from '@/features/shared/stores/session'
import { useAppTheme, type ThemePreference } from '@/features/shared/composables/useAppTheme'

const props = defineProps<{
  collapsed?: boolean
}>()

const router = useRouter()
const session = useSessionStore()
const { preference } = useAppTheme()

const user = computed(() => session.user)

const fullName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
)

const initials = computed(() =>
  user.value ? `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}` : '',
)

function setTheme(value: ThemePreference) {
  preference.value = value
}

async function signOut() {
  session.end()
  await router.push({ name: 'auth-login' })
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Profile settings',
      icon: 'i-lucide-user',
      to: { name: 'settings-profile' },
    },
    {
      label: 'Theme',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: preference.value === 'light',
          onSelect: () => setTheme('light'),
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: preference.value === 'dark',
          onSelect: () => setTheme('dark'),
        },
        {
          label: 'System',
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
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: signOut,
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
      :aria-label="`Account menu for ${fullName}`"
    >
      <UAvatar :text="initials" size="sm" class="shrink-0" />

      <template v-if="!props.collapsed">
        <span class="min-w-0 flex-1 text-left">
          <span class="block truncate text-sm font-medium text-default">{{ fullName }}</span>
          <span class="block truncate text-xs font-normal text-muted">{{ user.email }}</span>
        </span>
        <UIcon name="i-lucide-ellipsis-vertical" class="size-4 shrink-0 text-dimmed" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
