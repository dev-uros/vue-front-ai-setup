<script setup lang="ts">
import { reactive, shallowRef, useTemplateRef, watch } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { credentialsSchema, type Credentials } from '@/features/auth/schemas/credentials'
import { NO_FEEDBACK, type FormFeedback } from '@/features/shared/utils/apiErrors'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    feedback?: FormFeedback
  }>(),
  { feedback: () => NO_FEEDBACK },
)

const emit = defineEmits<{
  submit: [credentials: Credentials]
}>()

const state = reactive<Partial<Credentials>>({ email: '', password: '' })
const isPasswordVisible = shallowRef(false)
const form = useTemplateRef('form')

/**
 * Server-side field errors are pushed into the form rather than rendered next to it, so they
 * land under the field they name and are cleared the moment the user edits it.
 */
watch(
  () => props.feedback.fields,
  (fields) => form.value?.setErrors(fields),
)

/** UForm validates against the schema first, so `event.data` is already typed and clean. */
function onSubmit(event: FormSubmitEvent<Credentials>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm ref="form" :schema="credentialsSchema" :state="state" class="space-y-6" @submit="onSubmit">
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

    <UFormField name="password" label="Lozinka" required>
      <template #hint>
        <ULink :to="{ name: 'auth-forgot-password' }" class="text-xs font-medium text-primary">
          Zaboravili ste lozinku?
        </ULink>
      </template>

      <UInput
        v-model="state.password"
        :type="isPasswordVisible ? 'text' : 'password'"
        autocomplete="current-password"
        placeholder="••••••••"
        size="lg"
        class="w-full"
        :ui="{ trailing: 'pe-1' }"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            :icon="isPasswordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="isPasswordVisible ? 'Sakrij lozinku' : 'Prikaži lozinku'"
            :aria-pressed="isPasswordVisible"
            data-testid="toggle-password"
            @click="isPasswordVisible = !isPasswordVisible"
          />
        </template>
      </UInput>
    </UFormField>

    <UButton type="submit" label="Prijavi se" size="lg" block :loading="props.loading" />
  </UForm>
</template>
