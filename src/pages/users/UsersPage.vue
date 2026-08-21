<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { User } from '@/features/shared/schemas/user'
import { useSessionStore } from '@/features/shared/stores/session'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { useUsersQuery } from '@/features/users/query/useUsersQuery'
import UsersTable from '@/features/users/components/UsersTable.vue'
import UserFormModal from '@/features/users/components/UserFormModal.vue'
import ChangeRoleModal from '@/features/users/components/ChangeRoleModal.vue'
import DeactivateUserModal from '@/features/users/components/DeactivateUserModal.vue'

const session = useSessionStore()
const { data: users, isLoading, error, refetch } = useUsersQuery()

/**
 * The modals live here rather than inside the table: a dialog belongs to the page, and one
 * instance driven by which user is selected beats one per row.
 */
const selected = shallowRef<User | null>(null)
const isFormOpen = shallowRef(false)
const isRoleOpen = shallowRef(false)
const isDeactivateOpen = shallowRef(false)

/** Same tile tints as the home page: the colour a counter carries is the one its badge carries. */
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

function openCreate() {
  selected.value = null
  isFormOpen.value = true
}

function openEdit(user: User) {
  selected.value = user
  isFormOpen.value = true
}

function openRole(user: User) {
  selected.value = user
  isRoleOpen.value = true
}

function openDeactivate(user: User) {
  selected.value = user
  isDeactivateOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-highlighted">Korisnici</h2>
        <p class="mt-1 text-sm text-muted">
          Svi nalozi u sistemu, uključujući isključene i one koji još nisu aktivirani.
        </p>
      </div>

      <!--
        Hidden for a plain user as a courtesy, not as protection: POST /users answers 403 for
        them whether or not this button was ever on screen.
      -->
      <UButton
        v-if="session.isAdmin"
        label="Novi korisnik"
        icon="i-lucide-user-plus"
        data-testid="new-user"
        @click="openCreate"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'p-4 sm:p-5' }">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-medium text-muted">{{ stat.label }}</p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">{{ stat.value }}</p>
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

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="toDisplayMessage(error)"
      data-testid="users-error"
    >
      <template #actions>
        <UButton label="Pokušaj ponovo" color="error" variant="outline" @click="refetch()" />
      </template>
    </UAlert>

    <UsersTable
      v-else
      :users="users ?? []"
      :loading="isLoading"
      @edit="openEdit"
      @change-role="openRole"
      @deactivate="openDeactivate"
    />

    <UserFormModal v-model:open="isFormOpen" :user="selected" />
    <ChangeRoleModal v-model:open="isRoleOpen" :user="selected" />
    <DeactivateUserModal v-model:open="isDeactivateOpen" :user="selected" />
  </div>
</template>
