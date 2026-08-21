<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { PER_PAGE } from '@/features/shared/schemas/api'
import { formatDateTime } from '@/features/shared/utils/format'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import {
  LOGIN_OUTCOME_LABELS,
  type LoginAttempt,
  type LoginOutcome,
} from '@/features/users/schemas/history'
import { useUserLoginsQuery } from '@/features/users/query/useUserHistoryQueries'

/**
 * Sign-in attempts against this account, successful and not. Attempts on addresses that match
 * no account are recorded too, but belong to no user and so never show up here.
 */
const props = defineProps<{
  userId: number
  enabled: boolean
}>()

const page = shallowRef(1)

const { data, isLoading, error } = useUserLoginsQuery(
  () => props.userId,
  page,
  () => props.enabled,
)

const OUTCOME_COLORS: Record<LoginOutcome, 'success' | 'error' | 'warning'> = {
  succeeded: 'success',
  invalid_credentials: 'error',
  account_deactivated: 'warning',
}

const columns: TableColumn<LoginAttempt>[] = [
  { accessorKey: 'created_at', header: 'Kada' },
  { accessorKey: 'outcome', header: 'Ishod' },
  { accessorKey: 'email', header: 'Uneta adresa' },
  { accessorKey: 'ip_address', header: 'IP adresa' },
  { accessorKey: 'user_agent', header: 'Uređaj' },
]

const total = computed(() => data.value?.meta.total ?? 0)

/** Table slot props are untyped, so the narrowing happens here rather than in the template. */
function outcomeBadge(attempt: LoginAttempt) {
  return {
    label: LOGIN_OUTCOME_LABELS[attempt.outcome],
    color: OUTCOME_COLORS[attempt.outcome],
  }
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
      data-testid="logins-error"
    />

    <UTable
      v-else
      :data="data?.data ?? []"
      :columns="columns"
      :loading="isLoading"
      empty="Nema zabeleženih prijava."
      data-testid="user-logins"
    >
      <template #created_at-cell="{ row }">
        <span class="whitespace-nowrap text-sm text-muted">
          {{ formatDateTime(row.original.created_at) }}
        </span>
      </template>

      <template #outcome-cell="{ row }">
        <UBadge
          v-bind="outcomeBadge(row.original)"
          variant="subtle"
          size="sm"
          :data-outcome="row.original.outcome"
        />
      </template>

      <template #email-cell="{ row }">
        <!-- What was typed, not necessarily this account's current address. -->
        <span class="text-sm text-default">{{ row.original.email }}</span>
      </template>

      <template #ip_address-cell="{ row }">
        <span class="text-sm text-muted">{{ row.original.ip_address ?? '—' }}</span>
      </template>

      <template #user_agent-cell="{ row }">
        <span
          class="block max-w-xs truncate text-xs text-muted"
          :title="row.original.user_agent ?? ''"
        >
          {{ row.original.user_agent ?? '—' }}
        </span>
      </template>
    </UTable>

    <div v-if="total > PER_PAGE" class="flex justify-end">
      <UPagination v-model:page="page" :total="total" :items-per-page="PER_PAGE" />
    </div>
  </div>
</template>
