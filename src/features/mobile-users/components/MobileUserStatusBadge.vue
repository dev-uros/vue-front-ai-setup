<script setup lang="ts">
import { computed } from 'vue'
import { mobileUserStatus, type MobileUser } from '@/features/mobile-users/schemas/mobileUser'

const props = defineProps<{
  user: Pick<MobileUser, 'blocked_at'>
}>()

const STATES = {
  active: { label: 'Aktivan', color: 'success', icon: 'i-lucide-circle-check' },
  blocked: { label: 'Blokiran', color: 'error', icon: 'i-lucide-ban' },
} as const

const state = computed(() => STATES[mobileUserStatus(props.user)])
</script>

<template>
  <UBadge
    :label="state.label"
    :color="state.color"
    :icon="state.icon"
    variant="subtle"
    size="sm"
    :data-status="mobileUserStatus(props.user)"
  />
</template>
