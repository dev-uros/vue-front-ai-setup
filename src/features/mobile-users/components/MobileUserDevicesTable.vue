<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { formatDateTime } from '@/features/shared/utils/format'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import type { MobileUserDevice } from '@/features/mobile-users/schemas/mobileUser'
import { useMobileUserDevicesQuery } from '@/features/mobile-users/query/useMobileUserQueries'

/** Every phone the account signed in on. A person has a handful, so it is not paginated. */
const props = defineProps<{
  userId: number
}>()

const { data, isLoading, error } = useMobileUserDevicesQuery(() => props.userId)

const columns: TableColumn<MobileUserDevice>[] = [
  { accessorKey: 'name', header: 'Uređaj' },
  { accessorKey: 'platform', header: 'Sistem' },
  { id: 'state', header: 'Stanje' },
  { accessorKey: 'last_seen_at', header: 'Poslednji put' },
]

function systemOf(device: MobileUserDevice): string {
  return [device.operating_system ?? device.platform, device.os_version].filter(Boolean).join(' ')
}
</script>

<template>
  <UAlert
    v-if="error"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :description="toDisplayMessage(error)"
  />

  <UTable
    v-else
    :data="data ?? []"
    :columns="columns"
    :loading="isLoading"
    empty="Nalog se još nije prijavio ni na jednom uređaju."
    data-testid="mobile-user-devices"
  >
    <template #name-cell="{ row }">
      <span class="text-sm text-default">
        {{ row.original.name ?? row.original.manufacturer ?? row.original.device_id }}
      </span>
    </template>

    <template #platform-cell="{ row }">
      <span class="text-sm text-muted">{{ systemOf(row.original) }}</span>
    </template>

    <template #state-cell="{ row }">
      <div class="flex flex-wrap gap-1">
        <UBadge
          :label="row.original.signed_in ? 'Prijavljen' : 'Odjavljen'"
          :color="row.original.signed_in ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        />
        <UBadge
          v-if="row.original.push_notifications_enabled"
          label="Obaveštenja"
          icon="i-lucide-bell"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>
    </template>

    <template #last_seen_at-cell="{ row }">
      <span class="whitespace-nowrap text-sm text-muted">
        {{ formatDateTime(row.original.last_seen_at) }}
      </span>
    </template>
  </UTable>
</template>
