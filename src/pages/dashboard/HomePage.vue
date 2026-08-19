<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/features/shared/stores/session'

const session = useSessionStore()

const firstName = computed(() => session.user?.firstName ?? '')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-default">Hello, {{ firstName }}</h2>
      <p class="mt-1 text-sm text-muted">
        You are signed in. Reload the page — the session is restored from storage.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="card in 3" :key="card">
        <p class="text-sm text-muted">Placeholder card {{ card }}</p>
      </UCard>
    </div>
  </div>
</template>
