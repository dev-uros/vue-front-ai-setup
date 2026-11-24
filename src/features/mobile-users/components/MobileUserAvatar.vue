<script setup lang="ts">
import type { AvatarProps } from '@nuxt/ui'
import type { MobileUser } from '@/features/mobile-users/schemas/mobileUser'

/** The picture, or the first letter of what the app greets the person with. */
const props = defineProps<{
  user: Pick<MobileUser, 'display_name' | 'avatar_url'>
  size?: AvatarProps['size']
}>()
</script>

<template>
  <UAvatar
    :src="props.user.avatar_url ?? undefined"
    :alt="props.user.display_name"
    :text="props.user.display_name.slice(0, 1).toUpperCase()"
    :size="props.size"
  />
</template>
