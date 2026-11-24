<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { formatDate, formatDateTime } from '@/features/shared/utils/format'
import { mobileUserPersonalName, type MobileUser } from '@/features/mobile-users/schemas/mobileUser'
import MobileUserAvatar from '@/features/mobile-users/components/MobileUserAvatar.vue'
import MobileUserStatusBadge from '@/features/mobile-users/components/MobileUserStatusBadge.vue'
import MobileUserSignInBadges from '@/features/mobile-users/components/MobileUserSignInBadges.vue'

/**
 * One page of app users. Searching and filtering happen on the server — the page owns them —
 * so this only renders what it is given.
 */
const props = defineProps<{
  users: MobileUser[]
  loading?: boolean
}>()

const columns: TableColumn<MobileUser>[] = [
  { accessorKey: 'username', header: 'Korisnik' },
  { id: 'sign_in', header: 'Prijava' },
  { id: 'status', header: 'Status' },
  { accessorKey: 'devices_count', header: 'Uređaji' },
  { accessorKey: 'last_seen_at', header: 'Poslednji put' },
  { accessorKey: 'created_at', header: 'Registrovan' },
]
</script>

<template>
  <UTable
    :data="props.users"
    :columns="columns"
    :loading="props.loading"
    empty="Nema korisnika koji odgovaraju pretrazi."
    data-testid="mobile-users-table"
    :ui="{ base: 'min-w-full' }"
  >
    <template #username-cell="{ row }">
      <div class="flex items-center gap-3">
        <MobileUserAvatar :user="row.original" size="sm" />
        <div class="min-w-0">
          <RouterLink
            :to="{ name: 'mobile-users-detail', params: { id: row.original.id } }"
            class="block truncate text-sm font-medium text-default hover:text-primary"
          >
            {{ row.original.username }}
          </RouterLink>
          <span class="block truncate text-xs text-muted">
            {{ mobileUserPersonalName(row.original) ?? row.original.email }}
          </span>
        </div>
      </div>
    </template>

    <template #sign_in-cell="{ row }">
      <MobileUserSignInBadges :user="row.original" />
    </template>

    <template #status-cell="{ row }">
      <MobileUserStatusBadge :user="row.original" />
    </template>

    <template #devices_count-cell="{ row }">
      <span class="text-sm text-muted">{{ row.original.devices_count ?? 0 }}</span>
    </template>

    <template #last_seen_at-cell="{ row }">
      <span class="whitespace-nowrap text-sm text-muted">
        {{ formatDateTime(row.original.last_seen_at) }}
      </span>
    </template>

    <template #created_at-cell="{ row }">
      <span class="text-sm text-muted">{{ formatDate(row.original.created_at) }}</span>
    </template>
  </UTable>
</template>
