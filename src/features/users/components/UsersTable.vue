<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import {
  userFullName,
  userStatus,
  type User,
  type UserStatus,
} from '@/features/shared/schemas/user'
import { formatDate } from '@/features/shared/utils/format'
import { useSessionStore } from '@/features/shared/stores/session'
import UserAvatar from '@/features/shared/components/UserAvatar.vue'
import { useUserActions } from '@/features/users/composables/useUserActions'
import { userRowActions } from '@/features/users/utils/rowActions'
import UserRoleBadge from '@/features/users/components/UserRoleBadge.vue'
import UserStatusBadge from '@/features/users/components/UserStatusBadge.vue'

/**
 * The whole user table in one request — `GET /users` is not paginated — so searching and
 * filtering run here rather than as round trips.
 */
const props = defineProps<{
  users: User[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [user: User]
  changeRole: [user: User]
  deactivate: [user: User]
}>()

const session = useSessionStore()
const { reactivate, resendActivation, isLoading: isActing } = useUserActions()

const search = shallowRef('')
const statusFilter = shallowRef<UserStatus | 'all'>('all')

const statusItems = [
  { label: 'Svi statusi', value: 'all' },
  { label: 'Aktivni', value: 'active' },
  { label: 'Nisu aktivirani', value: 'pending' },
  { label: 'Isključeni', value: 'deactivated' },
]

const columns: TableColumn<User>[] = [
  { accessorKey: 'name', header: 'Korisnik' },
  { accessorKey: 'role', header: 'Uloga' },
  { id: 'status', header: 'Status' },
  { accessorKey: 'created_at', header: 'Kreiran' },
  { id: 'actions', header: '', meta: { class: { td: 'w-px', th: 'w-px' } } },
]

const rows = computed(() => {
  const term = search.value.trim().toLowerCase()

  return props.users.filter((user) => {
    if (statusFilter.value !== 'all' && userStatus(user) !== statusFilter.value) {
      return false
    }

    if (term === '') {
      return true
    }

    return `${user.name} ${user.surname} ${user.email}`.toLowerCase().includes(term)
  })
})

/** The rules live in `utils/rowActions`; this only supplies the handlers. */
function actionsFor(user: User) {
  return userRowActions(
    user,
    { id: session.user?.id, isAdmin: session.isAdmin },
    {
      edit: (target) => emit('edit', target),
      changeRole: (target) => emit('changeRole', target),
      deactivate: (target) => emit('deactivate', target),
      reactivate: (target) => void reactivate(target.id),
      resendActivation: (target) => void resendActivation(target.id),
    },
  )
}
</script>

<template>
  <!-- Toolbar and table share one surface, so the filters read as controls on the data. -->
  <div class="overflow-hidden rounded-lg bg-default shadow-xs ring ring-default">
    <div class="flex flex-col gap-2 border-b border-default p-3 sm:flex-row sm:items-center">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Pretraga po imenu ili email adresi"
        class="sm:max-w-xs"
        data-testid="users-search"
      />

      <USelect
        v-model="statusFilter"
        :items="statusItems"
        class="sm:w-48"
        data-testid="users-status-filter"
      />

      <p class="text-sm tabular-nums text-muted sm:ms-auto" data-testid="users-count">
        {{ rows.length }} od {{ props.users.length }}
      </p>
    </div>

    <UTable
      :data="rows"
      :columns="columns"
      :loading="props.loading"
      empty="Nema korisnika koji odgovaraju filteru."
      data-testid="users-table"
      :ui="{ base: 'min-w-full' }"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UserAvatar :user="row.original" size="sm" />
          <div class="min-w-0">
            <RouterLink
              :to="{ name: 'users-detail', params: { id: row.original.id } }"
              class="block truncate text-sm font-medium text-default hover:text-primary"
            >
              {{ userFullName(row.original) }}
            </RouterLink>
            <span class="block truncate text-xs text-muted">{{ row.original.email }}</span>
          </div>
        </div>
      </template>

      <template #role-cell="{ row }">
        <UserRoleBadge :role="row.original.role" />
      </template>

      <template #status-cell="{ row }">
        <UserStatusBadge :user="row.original" />
      </template>

      <template #created_at-cell="{ row }">
        <span class="text-sm tabular-nums text-muted">{{
          formatDate(row.original.created_at)
        }}</span>
      </template>

      <template #actions-cell="{ row }">
        <UDropdownMenu :items="actionsFor(row.original)" :content="{ align: 'end' }">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="isActing"
            :aria-label="`Radnje za ${userFullName(row.original)}`"
            :data-testid="`user-actions-${row.original.id}`"
          />
        </UDropdownMenu>
      </template>
    </UTable>
  </div>
</template>
