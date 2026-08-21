<script setup lang="ts">
import { computed, reactive, shallowRef, useTemplateRef, watch } from 'vue'
import type { User } from '@/features/shared/schemas/user'
import { useApiToast } from '@/features/shared/composables/useApiToast'
import { NO_FEEDBACK, toFormFeedback } from '@/features/shared/utils/apiErrors'
import {
  createUserSchema,
  updateUserSchema,
  USER_FORM_FIELDS,
  type CreateUserForm,
} from '@/features/users/schemas/userForm'
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from '@/features/users/query/useUserMutations'

/**
 * One modal for both writes, because they are the same three fields.
 *
 * What differs is `role`: it is offered when creating (the API takes it there) and absent when
 * editing, where changing a role is a separate endpoint with rules of its own. And no password
 * field in either case — the backend generates one and emails an activation link instead.
 */
const props = defineProps<{
  /** The account being edited. Absent means this is a create. */
  user?: User | null
}>()

const open = defineModel<boolean>('open', { required: true })

const toast = useApiToast()
const create = useCreateUserMutation()
const update = useUpdateUserMutation()
const form = useTemplateRef('form')

const isEdit = computed(() => Boolean(props.user))
const isLoading = computed(() => create.isLoading.value || update.isLoading.value)
const schema = computed(() => (isEdit.value ? updateUserSchema : createUserSchema))

const state = reactive<CreateUserForm>({ name: '', surname: '', email: '', role: 'user' })
const feedback = shallowRef(NO_FEEDBACK)

const roleItems = [
  { label: 'Korisnik — sme samo da čita', value: 'user' },
  { label: 'Administrator — sme sve', value: 'admin' },
]

/** Reopening must not show the previous account's values, or a stale error from last time. */
watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }

  feedback.value = NO_FEEDBACK
  state.name = props.user?.name ?? ''
  state.surname = props.user?.surname ?? ''
  state.email = props.user?.email ?? ''
  state.role = props.user?.role ?? 'user'
})

watch(feedback, (next) => form.value?.setErrors(next.fields))

/**
 * The submit event carries data narrowed to whichever schema ran, which drops `role` on an
 * edit. The values are read off `state` instead — it holds the same input, already validated,
 * in one shape for both modes.
 */
async function onSubmit() {
  feedback.value = NO_FEEDBACK

  const { name, surname, email, role } = state

  try {
    const result = props.user
      ? // PUT, so every field goes along — the API has no partial update.
        await update.mutateAsync({ id: props.user.id, form: { name, surname, email } })
      : await create.mutateAsync({ name, surname, email, role })

    toast.success(result.message)
    open.value = false
  } catch (error) {
    feedback.value = toFormFeedback(error, USER_FORM_FIELDS)
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Izmena korisnika' : 'Novi korisnik'"
    :description="
      isEdit
        ? 'Menjaju se ime, prezime i email. Uloga se menja zasebno.'
        : 'Korisnik dobija aktivacioni link na email i sam postavlja lozinku.'
    "
    :dismissible="!isLoading"
  >
    <template #body>
      <UForm
        id="user-form"
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UAlert
          v-if="feedback.message"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="feedback.message"
          data-testid="form-error"
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField name="name" label="Ime" required>
            <UInput v-model="state.name" autocomplete="given-name" class="w-full" />
          </UFormField>

          <UFormField name="surname" label="Prezime" required>
            <UInput v-model="state.surname" autocomplete="family-name" class="w-full" />
          </UFormField>
        </div>

        <UFormField name="email" label="Email" required>
          <UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
        </UFormField>

        <UFormField
          v-if="!isEdit"
          name="role"
          label="Uloga"
          required
          help="Uloga se kasnije menja zasebnom radnjom."
        >
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
          type="submit"
          form="user-form"
          :label="isEdit ? 'Sačuvaj' : 'Kreiraj korisnika'"
          :loading="isLoading"
        />
      </div>
    </template>
  </UModal>
</template>
