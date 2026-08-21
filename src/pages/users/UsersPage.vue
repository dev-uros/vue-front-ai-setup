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

const counts = computed(() => {
  const all = users.value ?? []

  return {
    total: all.length,
    admins: all.filter((user) => user.role === 'admin').length,
    pending: all.filter((user) => user.email_verified_at === null).length,
    deactivated: all.filter((user) => user.deactivated_at !== null).length,
  }
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
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-highlighted">Korisnici</h2>
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

    <!-- Same featured-card treatment as the counters on the home screen. -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard
        v-for="stat in [
          { label: 'Ukupno naloga', value: counts.total, icon: 'i-lucide-users' },
          { label: 'Administratori', value: counts.admins, icon: 'i-lucide-shield' },
          { label: 'Nisu aktivirani', value: counts.pending, icon: 'i-lucide-clock' },
          { label: 'Isključeni', value: counts.deactivated, icon: 'i-lucide-circle-slash' },
        ]"
        :key="stat.label"
        class="rounded-feature"
        :ui="{ body: 'sm:p-4' }"
      >
        <div class="flex items-center gap-4">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-card bg-primary/10 text-primary"
          >
            <UIcon :name="stat.icon" class="size-5" />
          </span>
          <div class="min-w-0">
            <p class="text-2xl font-bold text-highlighted">{{ stat.value }}</p>
            <p class="truncate text-sm text-muted">{{ stat.label }}</p>
          </div>
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
