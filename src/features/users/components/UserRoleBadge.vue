<script setup lang="ts">
import { computed } from 'vue'
import type { UserRole } from '@/features/shared/schemas/user'

const props = defineProps<{
  role: UserRole
}>()

const ROLES = {
  admin: { label: 'Administrator', color: 'primary', icon: 'i-lucide-shield' },
  user: { label: 'Korisnik', color: 'neutral', icon: 'i-lucide-user' },
} as const

const role = computed(() => ROLES[props.role])
</script>

<template>
  <UBadge
    :label="role.label"
    :color="role.color"
    :icon="role.icon"
    variant="subtle"
    size="md"
    :data-role="props.role"
  />
</template>
