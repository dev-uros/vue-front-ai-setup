<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/features/shared/stores/session'
import { userFullName } from '@/features/shared/schemas/user'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { useShortcuts } from '@/features/shortcuts/composables/useShortcuts'
import type { ShortcutVisit } from '@/features/shortcuts/schemas/shortcut'
import ShortcutsCard from '@/features/shortcuts/components/ShortcutsCard.vue'
import { useUsersQuery } from '@/features/users/query/useUsersQuery'

const session = useSessionStore()
const { data: users, isLoading, error } = useUsersQuery()

/**
 * The shortcuts feature stores routes, not records, so a link to `users-detail` arrives as an
 * id and nothing else. Naming the person is knowledge only the users feature has, and this
 * page is where the two meet — the list is already loaded here for the counters below.
 *
 * An id with no match (an account that has since gone) falls through to the route's own
 * title, so the shortcut still works and reads "Detalji korisnika".
 */
function resolveLabel(visit: ShortcutVisit): string | undefined {
  if (visit.name !== 'users-detail') {
    return undefined
  }

  const user = users.value?.find((candidate) => String(candidate.id) === visit.params.id)

  return user ? userFullName(user) : undefined
}

const { shortcuts, clear: clearShortcuts } = useShortcuts({ resolveLabel })

/**
 * The tile tint per counter, written out in full because Tailwind reads these class names out of
 * the source — a `bg-${color}/10` built at runtime never reaches the stylesheet.
 *
 * The colours are the ones the status badges already use, so a count and the badges it counts
 * agree: pending is warning, switched off is error.
 */
const TILE_TONES = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
} as const

const stats = computed(() => {
  const all = users.value ?? []

  return [
    { label: 'Ukupno naloga', value: all.length, icon: 'i-lucide-users', tone: TILE_TONES.primary },
    {
      label: 'Administratori',
      value: all.filter((user) => user.role === 'admin').length,
      icon: 'i-lucide-shield',
      tone: TILE_TONES.primary,
    },
    {
      label: 'Nisu aktivirani',
      value: all.filter((user) => user.email_verified_at === null).length,
      icon: 'i-lucide-clock',
      tone: TILE_TONES.warning,
    },
    {
      label: 'Isključeni',
      value: all.filter((user) => user.deactivated_at !== null).length,
      icon: 'i-lucide-circle-slash',
      tone: TILE_TONES.error,
    },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-semibold text-highlighted" data-testid="greeting">
        Zdravo, {{ session.user?.name }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        Prijavljeni ste kao
        <span class="font-medium text-default">{{ session.user?.email }}</span>
      </p>
    </div>

    <ShortcutsCard :shortcuts="shortcuts" @clear="clearShortcuts" />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="toDisplayMessage(error)"
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'p-4 sm:p-5' }">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-medium text-muted">{{ stat.label }}</p>
            <USkeleton v-if="isLoading && !users" class="mt-2 h-8 w-12" />
            <p v-else class="mt-1 text-2xl font-semibold text-highlighted">{{ stat.value }}</p>
          </div>

          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-xl"
            :class="stat.tone"
          >
            <UIcon :name="stat.icon" class="size-5" />
          </span>
        </div>
      </UCard>
    </div>
  </div>
</template>
