<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { PER_PAGE } from '@/features/shared/schemas/api'
import { formatDateTime } from '@/features/shared/utils/format'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { USER_LOG_EVENT_LABELS, type UserLog } from '@/features/users/schemas/history'
import { useUserLogsQuery } from '@/features/users/query/useUserHistoryQueries'

/** What changed on this account, and who changed it. Admin-only, 25 rows a page. */
const props = defineProps<{
  userId: number
  enabled: boolean
}>()

const page = shallowRef(1)

const { data, isLoading, error } = useUserLogsQuery(
  () => props.userId,
  page,
  () => props.enabled,
)

const columns: TableColumn<UserLog>[] = [
  { accessorKey: 'created_at', header: 'Kada' },
  { accessorKey: 'event', header: 'Događaj' },
  { id: 'changes', header: 'Izmena' },
  { accessorKey: 'actor', header: 'Ko' },
]

const total = computed(() => data.value?.meta.total ?? 0)

/**
 * A column diff on its own is unreadable, so the event carries the sentence and this carries
 * the proof. Keys come from `new_values` when there is one and from `old_values` otherwise —
 * a creation has no old side, and a field cleared to `null` has no new one.
 */
function changedFields(log: UserLog): { field: string; from: unknown; to: unknown }[] {
  const keys = new Set([...Object.keys(log.new_values ?? {}), ...Object.keys(log.old_values ?? {})])

  return [...keys].map((field) => ({
    field,
    from: log.old_values?.[field],
    to: log.new_values?.[field],
  }))
}

/** Values in the diff are raw column contents, and some of those columns hold timestamps. */
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function display(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'string' && ISO_TIMESTAMP.test(value)) {
    return formatDateTime(value)
  }

  return String(value)
}
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="toDisplayMessage(error)"
      data-testid="logs-error"
    />

    <UTable
      v-else
      :data="data?.data ?? []"
      :columns="columns"
      :loading="isLoading"
      empty="Nema zabeleženih izmena."
      data-testid="user-logs"
    >
      <template #created_at-cell="{ row }">
        <span class="whitespace-nowrap font-mono text-sm tabular-nums text-muted">
          {{ formatDateTime(row.original.created_at) }}
        </span>
      </template>

      <template #event-cell="{ row }">
        <span class="text-sm font-medium text-default">
          {{ USER_LOG_EVENT_LABELS[row.original.event] ?? row.original.event }}
        </span>
      </template>

      <template #changes-cell="{ row }">
        <ul v-if="changedFields(row.original).length" class="space-y-0.5 text-xs">
          <li
            v-for="change in changedFields(row.original)"
            :key="change.field"
            class="flex flex-wrap items-baseline gap-1"
          >
            <span class="text-muted">{{ change.field }}:</span>
            <span class="text-dimmed line-through">{{ display(change.from) }}</span>
            <span class="text-muted">→</span>
            <span class="text-default">{{ display(change.to) }}</span>
          </li>
        </ul>
        <span v-else class="text-xs text-dimmed">—</span>
      </template>

      <template #actor-cell="{ row }">
        <!-- No actor means the system did it: a seeder, a console command, the scheduler. -->
        <span v-if="row.original.actor" class="text-sm text-default">
          {{ row.original.actor.name }} {{ row.original.actor.surname }}
        </span>
        <span v-else class="text-sm text-dimmed">Sistem</span>
      </template>
    </UTable>

    <div v-if="total > PER_PAGE" class="flex justify-end">
      <UPagination v-model:page="page" :total="total" :items-per-page="PER_PAGE" />
    </div>
  </div>
</template>
