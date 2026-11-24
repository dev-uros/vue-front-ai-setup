<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { PER_PAGE } from '@/features/shared/schemas/api'
import { toDisplayMessage } from '@/features/shared/utils/apiErrors'
import { useMobileUsersQuery } from '@/features/mobile-users/query/useMobileUserQueries'
import MobileUsersTable from '@/features/mobile-users/components/MobileUsersTable.vue'

const search = shallowRef('')
const debouncedSearch = refDebounced(search, 300)
const statusFilter = shallowRef<'all' | 'active' | 'blocked'>('all')
const page = shallowRef(1)

const statusItems = [
  { label: 'Svi statusi', value: 'all' },
  { label: 'Aktivni', value: 'active' },
  { label: 'Blokirani', value: 'blocked' },
]

/** A new search or filter starts from the first page; staying on page 7 of fewer results is empty. */
watch([debouncedSearch, statusFilter], () => {
  page.value = 1
})

const { data, isLoading, error, refetch } = useMobileUsersQuery(() => ({
  page: page.value,
  search: debouncedSearch.value,
  blocked: statusFilter.value === 'all' ? null : statusFilter.value === 'blocked',
}))

const total = computed(() => data.value?.meta.total ?? 0)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-default">Korisnici aplikacije</h2>
      <p class="mt-1 text-sm text-muted">
        Nalozi iz mobilne aplikacije za korisnike. Profil menja vlasnik iz aplikacije; ovde se nalog
        može samo blokirati.
      </p>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Korisničko ime, ime ili email"
        class="sm:max-w-xs"
        data-testid="mobile-users-search"
      />

      <USelect
        v-model="statusFilter"
        :items="statusItems"
        class="sm:w-48"
        data-testid="mobile-users-status-filter"
      />

      <p class="text-sm text-muted sm:ms-auto" data-testid="mobile-users-count">
        Ukupno: {{ total }}
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="toDisplayMessage(error)"
    >
      <template #actions>
        <UButton label="Pokušaj ponovo" color="error" variant="outline" @click="refetch()" />
      </template>
    </UAlert>

    <template v-else>
      <MobileUsersTable :users="data?.data ?? []" :loading="isLoading" />

      <div v-if="total > PER_PAGE" class="flex justify-end">
        <UPagination v-model:page="page" :total="total" :items-per-page="PER_PAGE" />
      </div>
    </template>
  </div>
</template>
