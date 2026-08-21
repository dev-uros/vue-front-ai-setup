<script setup lang="ts">
import { userFullName, type User } from '@/features/shared/schemas/user'
import { useUserActions } from '@/features/users/composables/useUserActions'

/**
 * Switching an account off revokes its tokens the same instant — whoever is signed in as that
 * user is thrown out mid-session — so it gets a confirmation. It is reversible, which is why
 * this is a confirmation and not a typed-name ceremony.
 */
const props = defineProps<{
  user: User | null
}>()

const open = defineModel<boolean>('open', { required: true })

const { deactivate, isLoading } = useUserActions()

async function confirm() {
  if (props.user === null) {
    return
  }

  if (await deactivate(props.user.id)) {
    open.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Isključivanje naloga"
    :description="user ? `Nalog korisnika ${userFullName(user)}.` : ''"
    :dismissible="!isLoading"
  >
    <template #body>
      <div class="space-y-3 text-sm text-muted">
        <p>
          Nalog ostaje u listi i može se ponovo uključiti. Svi tokeni se poništavaju odmah, pa je
          korisnik odjavljen sa svih uređaja.
        </p>
        <p v-if="user">
          Email: <span class="font-medium text-default">{{ user.email }}</span>
        </p>
      </div>
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
          label="Isključi nalog"
          color="error"
          :loading="isLoading"
          data-testid="confirm-deactivate"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>
