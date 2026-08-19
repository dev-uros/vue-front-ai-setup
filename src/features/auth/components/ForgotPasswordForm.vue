<script setup lang="ts">
import { reactive } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  passwordResetRequestSchema,
  type PasswordResetRequest,
} from '@/features/auth/schemas/passwordReset'

const props = defineProps<{
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [request: PasswordResetRequest]
}>()

const state = reactive<Partial<PasswordResetRequest>>({ email: '' })

function onSubmit(event: FormSubmitEvent<PasswordResetRequest>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm :schema="passwordResetRequestSchema" :state="state" class="space-y-5" @submit="onSubmit">
    <UAlert
      v-if="props.errorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="props.errorMessage"
    />

    <UFormField name="email" label="Email" required>
      <UInput
        v-model="state.email"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <UButton type="submit" label="Send reset link" size="lg" block :loading="props.loading" />
  </UForm>
</template>
