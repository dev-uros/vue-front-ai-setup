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

const stats = computed(() => {
  const all = users.value ?? []

  return [
    { label: 'Ukupno naloga', value: all.length, icon: 'i-lucide-users' },
    {
      label: 'Administratori',
      value: all.filter((user) => user.role === 'admin').length,
      icon: 'i-lucide-shield',
    },
    {
      label: 'Nisu aktivirani',
      value: all.filter((user) => user.email_verified_at === null).length,
      icon: 'i-lucide-clock',
    },
    {
      label: 'Isključeni',
      value: all.filter((user) => user.deactivated_at !== null).length,
      icon: 'i-lucide-circle-slash',
    },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-default" data-testid="greeting">
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

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'sm:p-4' }">
        <div class="flex items-center gap-3">
          <UIcon :name="stat.icon" class="size-5 shrink-0 text-muted" />
          <div>
            <USkeleton v-if="isLoading && !users" class="h-7 w-10" />
            <p v-else class="font-mono text-xl font-semibold tabular-nums text-default">
              {{ stat.value }}
            </p>
            <p class="text-xs text-muted">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
