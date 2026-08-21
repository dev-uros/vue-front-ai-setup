<script setup lang="ts">
import { computed } from 'vue'
import { userStatus, type User } from '@/features/shared/schemas/user'

/**
 * A deactivated account is not a deleted one — it stays in the list, and an admin can switch
 * it back on — so the three states are shown as states rather than as a present/absent row.
 */
const props = defineProps<{
  user: User
}>()

const STATES = {
  active: { label: 'Aktivan', color: 'success', icon: 'i-lucide-circle-check' },
  pending: { label: 'Nije aktiviran', color: 'warning', icon: 'i-lucide-clock' },
  deactivated: { label: 'Isključen', color: 'error', icon: 'i-lucide-circle-slash' },
} as const

const state = computed(() => STATES[userStatus(props.user)])
</script>

<template>
  <UBadge
    :label="state.label"
    :color="state.color"
    :icon="state.icon"
    variant="subtle"
    size="sm"
    :data-status="userStatus(props.user)"
  />
</template>
