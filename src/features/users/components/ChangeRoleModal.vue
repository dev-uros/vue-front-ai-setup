<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { userFullName, type User } from '@/features/shared/schemas/user'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import { NO_FEEDBACK, toFormFeedback } from '@/features/shared/utils/apiErrors'
import { changeRoleSchema, type ChangeRoleForm } from '@/features/users/schemas/userForm'
import { useChangeRoleMutation } from '@/features/users/query/useUserMutations'

/**
 * A role change is its own endpoint and its own dialog, mirroring the backend: folding it into
 * the edit form would turn every profile change into a request to hand out privileges.
 *
 * An admin cannot change their own role. The caller hides the entry point for that case, and
 * the API answers 403 regardless — which is what the alert would show if it ever got here.
 */
const props = defineProps<{
  user: User | null
}>()

const open = defineModel<boolean>('open', { required: true })

const toast = useApiToast()
const { mutateAsync, isLoading } = useChangeRoleMutation()

const state = reactive<ChangeRoleForm>({ role: 'user' })
const feedback = shallowRef(NO_FEEDBACK)

const roleItems = [
  { label: 'Korisnik — sme samo da čita', value: 'user' },
  { label: 'Administrator — sme sve', value: 'admin' },
]

const isUnchanged = computed(() => state.role === props.user?.role)

watch(open, (isOpen) => {
  if (isOpen) {
    feedback.value = NO_FEEDBACK
    state.role = props.user?.role ?? 'user'
  }
})

async function submit() {
  if (props.user === null) {
    return
  }

  feedback.value = NO_FEEDBACK

  try {
    const result = await mutateAsync({ id: props.user.id, form: { role: state.role } })
    toast.success(result.message)
    open.value = false
  } catch (error) {
    feedback.value = toFormFeedback(error, ['role'])
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Promena uloge"
    :description="user ? `Uloga korisnika ${userFullName(user)}.` : ''"
    :dismissible="!isLoading"
  >
    <template #body>
      <UForm :schema="changeRoleSchema" :state="state" class="space-y-4" @submit="submit">
        <UAlert
          v-if="feedback.message"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="feedback.message"
          data-testid="form-error"
        />

        <UFormField name="role" label="Uloga" required>
          <USelect v-model="state.role" :items="roleItems" class="w-full" />
        </UFormField>
      </UForm>
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
          label="Promeni ulogu"
          :loading="isLoading"
          :disabled="isUnchanged"
          data-testid="confirm-role"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>
