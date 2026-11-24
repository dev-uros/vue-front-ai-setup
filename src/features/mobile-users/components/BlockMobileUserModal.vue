<script setup lang="ts">
import type { MobileUser } from '@/features/mobile-users/schemas/mobileUser'
import { useMobileUserActions } from '@/features/mobile-users/composables/useMobileUserActions'

/**
 * Blocking signs the person out of every phone at once, so it gets a confirmation. It is
 * reversible, which is why it is only a confirmation.
 */
const props = defineProps<{
  user: MobileUser | null
}>()

const open = defineModel<boolean>('open', { required: true })

const { block, isLoading } = useMobileUserActions()

async function confirm() {
  if (props.user === null) {
    return
  }

  if (await block(props.user.id)) {
    open.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Blokiranje naloga"
    :description="user ? `Nalog ${user.username} (${user.email}).` : ''"
    :dismissible="!isLoading"
  >
    <template #body>
      <p class="text-sm text-muted">
        Korisnik se odmah odjavljuje sa svih uređaja i ne može ponovo da se prijavi dok se nalog ne
        odblokira. Podaci naloga ostaju.
      </p>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          label="Odustani"
          color="neutral"
          variant="ghost"
          :disabled="isLoading"
          @click="open = false"
        />
        <UButton
          label="Blokiraj"
          color="error"
          :loading="isLoading"
          data-testid="confirm-block"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>
