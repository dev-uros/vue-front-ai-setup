<script setup lang="ts">
import { computed } from 'vue'
import type { UserRole } from '@/features/shared/schemas/user'

const props = defineProps<{
  role: UserRole
}>()

/**
 * A role is not a status, so it does not borrow a semantic colour. The two are told apart by
 * weight instead: the rank with more rights is the filled one.
 */
const ROLES = {
  admin: { label: 'Administrator', color: 'primary', variant: 'subtle', icon: 'i-lucide-shield' },
  user: { label: 'Korisnik', color: 'neutral', variant: 'outline', icon: 'i-lucide-user' },
} as const

const role = computed(() => ROLES[props.role])
</script>

<template>
  <UBadge
    :label="role.label"
    :color="role.color"
    :icon="role.icon"
    :variant="role.variant"
    size="sm"
    :data-role="props.role"
  />
</template>
