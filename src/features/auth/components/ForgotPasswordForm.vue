<script setup lang="ts">
import { reactive, useTemplateRef, watch } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { forgotPasswordSchema, type ForgotPasswordRequest } from '@/features/auth/schemas/password'
import { NO_FEEDBACK, type FormFeedback } from '@/features/shared/utils/apiErrors'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    feedback?: FormFeedback
  }>(),
  { feedback: () => NO_FEEDBACK },
)

const emit = defineEmits<{
  submit: [request: ForgotPasswordRequest]
}>()

const state = reactive<Partial<ForgotPasswordRequest>>({ email: '' })
const form = useTemplateRef('form')

watch(
  () => props.feedback.fields,
  (fields) => form.value?.setErrors(fields),
)

function onSubmit(event: FormSubmitEvent<ForgotPasswordRequest>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm
    ref="form"
    :schema="forgotPasswordSchema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <UAlert
      v-if="props.feedback.message"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="props.feedback.message"
      data-testid="form-error"
    />

    <UFormField name="email" label="Email" required>
      <UInput
        v-model="state.email"
        type="email"
        autocomplete="email"
        placeholder="ime.prezime@primer.com"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <UButton type="submit" label="Pošalji link" size="lg" block :loading="props.loading" />
  </UForm>
</template>
