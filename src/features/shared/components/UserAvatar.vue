<script setup lang="ts">
import type { AvatarProps } from '@nuxt/ui'
import { userFullName, userInitials, type User } from '@/features/shared/schemas/user'

/**
 * A user's profile picture, with their initials as the fallback.
 *
 * One component rather than the same two-line `UAvatar` in every list, card and menu, because
 * the fallback has to be identical everywhere: `avatar_url` is `null` for an account that
 * never uploaded one, and `UAvatar` also drops back to `text` when the image itself fails to
 * load — a file that was deleted between the response and the render.
 */
const props = defineProps<{
  user: Pick<User, 'name' | 'surname' | 'avatar_url'>
  size?: AvatarProps['size']
}>()
</script>

<template>
  <UAvatar
    :src="props.user.avatar_url ?? undefined"
    :alt="userFullName(props.user)"
    :text="userInitials(props.user)"
    :size="props.size"
  />
</template>
