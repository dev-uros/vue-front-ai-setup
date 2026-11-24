<script setup lang="ts">
import type { MobileUser } from '@/features/mobile-users/schemas/mobileUser'

/** How the account can sign in: always with an emailed code, plus Google and Apple if linked. */
defineProps<{
  user: Pick<MobileUser, 'has_google' | 'has_apple' | 'is_demo'>
}>()
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <UBadge label="Email" color="neutral" variant="subtle" size="sm" icon="i-lucide-mail" />
    <UBadge v-if="user.has_google" label="Google" color="neutral" variant="subtle" size="sm" />
    <UBadge v-if="user.has_apple" label="Apple" color="neutral" variant="subtle" size="sm" />
    <UBadge v-if="user.is_demo" label="Demo" color="info" variant="subtle" size="sm" />
  </div>
</template>
