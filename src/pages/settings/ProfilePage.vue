<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/features/shared/stores/session'

const session = useSessionStore()

const user = computed(() => session.user)
</script>

<template>
  <UCard v-if="user">
    <dl class="grid gap-4 sm:grid-cols-2">
      <div>
        <dt class="text-xs text-muted">First name</dt>
        <dd class="text-sm text-default">{{ user.firstName }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Last name</dt>
        <dd class="text-sm text-default">{{ user.lastName }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Email</dt>
        <dd class="text-sm text-default">{{ user.email }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted">Company</dt>
        <dd class="text-sm text-default">{{ user.company }}</dd>
      </div>
    </dl>
  </UCard>
</template>
