<script setup lang="ts">
import { computed } from 'vue'
import type { AvatarProps } from '@nuxt/ui'
import { userFullName, type User } from '@/features/shared/schemas/user'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import { useSessionStore } from '@/features/shared/stores/session'
import UserAvatar from '@/features/shared/components/UserAvatar.vue'
import { AVATAR_ACCEPT, avatarFileSchema } from '@/features/users/schemas/avatar'
import { canManageAvatar } from '@/features/users/utils/avatar'
import {
  useRemoveAvatarMutation,
  useUpdateAvatarMutation,
} from '@/features/users/query/useUserMutations'

/**
 * The profile picture together with the two controls that change it, for anyone allowed to
 * use them — an admin on any account, everybody else only on their own. A viewer without that
 * right gets the picture and nothing else, which is what the whole rest of the app renders.
 */
const props = defineProps<{
  user: User
  size?: AvatarProps['size']
}>()

const session = useSessionStore()
const toast = useApiToast()
const upload = useUpdateAvatarMutation()
const removal = useRemoveAvatarMutation()

const canManage = computed(() =>
  canManageAvatar({ id: session.user?.id, isAdmin: session.isAdmin }, props.user),
)

const isSaving = computed(() => upload.isLoading.value || removal.isLoading.value)

/**
 * The file never becomes component state: it is validated and sent straight away. Hence no
 * `v-model` on the upload — only the picked file, and `reset` so choosing the same file twice
 * in a row still fires.
 */
async function onPick(file: File | null | undefined) {
  if (!file) {
    return
  }

  const parsed = avatarFileSchema.safeParse(file)

  if (!parsed.success) {
    // One field, so the first issue is the whole story.
    toast.failure(parsed.error.issues[0]?.message ?? 'Slika nije prihvaćena.')
    return
  }

  try {
    const result = await upload.mutateAsync({ id: props.user.id, file: parsed.data })
    toast.success(result.message)
  } catch (error) {
    toast.error(error)
  }
}

async function onRemove() {
  try {
    const result = await removal.mutateAsync(props.user.id)
    toast.success(result.message)
  } catch (error) {
    toast.error(error)
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <div class="relative">
      <UserAvatar :user="props.user" :size="props.size" />

      <UFileUpload
        v-if="canManage"
        :accept="AVATAR_ACCEPT"
        reset
        class="absolute -bottom-1 -end-1"
        @update:model-value="onPick"
      >
        <template #default="{ open }">
          <UButton
            icon="i-lucide-camera"
            size="xs"
            color="neutral"
            :loading="isSaving"
            :aria-label="`Promeni profilnu sliku za ${userFullName(props.user)}`"
            :ui="{ base: 'rounded-full' }"
            data-testid="avatar-upload"
            @click="open()"
          />
        </template>
      </UFileUpload>
    </div>

    <UButton
      v-if="canManage && props.user.avatar_url !== null"
      label="Ukloni sliku"
      size="xs"
      color="neutral"
      variant="link"
      :disabled="isSaving"
      data-testid="avatar-remove"
      @click="onRemove()"
    />
  </div>
</template>
