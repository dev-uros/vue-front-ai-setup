<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/features/shared/stores/session'
import { formatDateTime } from '@/features/shared/utils/format'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { useUsersQuery } from '@/features/users/query/useUsersQuery'
import UserRoleBadge from '@/features/users/components/UserRoleBadge.vue'

const session = useSessionStore()
const { data: users, isLoading, error } = useUsersQuery()

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
            <p v-else class="text-xl font-semibold text-default">{{ stat.value }}</p>
            <p class="text-xs text-muted">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <UCard v-if="session.user">
      <template #header>
        <h3 class="text-sm font-medium text-default">Vaš nalog</h3>
      </template>

      <dl class="grid gap-4 sm:grid-cols-3">
        <div>
          <dt class="text-xs text-muted">Uloga</dt>
          <dd class="mt-1"><UserRoleBadge :role="session.user.role" /></dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Nalog aktiviran</dt>
          <dd class="text-sm text-default">
            {{ formatDateTime(session.user.email_verified_at) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted">Poslednja izmena</dt>
          <dd class="text-sm text-default">{{ formatDateTime(session.user.updated_at) }}</dd>
        </div>
      </dl>

      <template #footer>
        <UButton
          :to="{ name: 'users-list' }"
          label="Otvori korisnike"
          icon="i-lucide-arrow-right"
          trailing
          color="neutral"
          variant="outline"
        />
      </template>
    </UCard>
  </div>
</template>
