<script setup lang="ts">
import { computed, reactive, shallowRef, useTemplateRef, watch } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  setPasswordSchema,
  PASSWORD_RULES,
  type SetPasswordForm,
} from '@/features/auth/schemas/password'
import { NO_FEEDBACK, type FormFeedback } from '@/features/shared/utils/apiErrors'

/** Shared by account activation and password reset — the same form, a different endpoint. */
const props = withDefaults(
  defineProps<{
    /** Whose password is being set — rendered as a hidden username field, see the template. */
    email: string
    submitLabel: string
    loading?: boolean
    feedback?: FormFeedback
  }>(),
  { feedback: () => NO_FEEDBACK },
)

const emit = defineEmits<{
  submit: [form: SetPasswordForm]
}>()

const state = reactive<Partial<SetPasswordForm>>({ password: '', password_confirmation: '' })
const isPasswordVisible = shallowRef(false)
const isConfirmVisible = shallowRef(false)
const form = useTemplateRef('form')

const rules = computed(() =>
  PASSWORD_RULES.map((rule) => ({ label: rule.label, met: rule.test(state.password ?? '') })),
)

watch(
  () => props.feedback.fields,
  (fields) => form.value?.setErrors(fields),
)

function onSubmit(event: FormSubmitEvent<SetPasswordForm>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm ref="form" :schema="setPasswordSchema" :state="state" class="space-y-5" @submit="onSubmit">
    <UAlert
      v-if="props.feedback.message"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="props.feedback.message"
      data-testid="form-error"
    />

    <!--
      Password managers need a username next to the new-password fields to file the credential
      under the right account; without it Chrome warns and autofill misbehaves. Visually hidden
      rather than display:none, which browsers ignore for this purpose.
    -->
    <input
      :value="props.email"
      type="email"
      name="email"
      autocomplete="username"
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      readonly
    />

    <UFormField name="password" label="Nova lozinka" required>
      <UInput
        v-model="state.password"
        :type="isPasswordVisible ? 'text' : 'password'"
        autocomplete="new-password"
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

    <ul class="space-y-1" data-testid="password-rules">
      <li
        v-for="rule in rules"
        :key="rule.label"
        class="flex items-center gap-1.5 text-xs"
        :class="rule.met ? 'text-success' : 'text-muted'"
        :data-met="rule.met"
      >
        <UIcon :name="rule.met ? 'i-lucide-circle-check' : 'i-lucide-circle'" class="size-3.5" />
        {{ rule.label }}
      </li>
    </ul>

    <!--
      The one rule the checklist cannot tick off: the API also rejects passwords found in known
      breach corpora, which only it can look up. Saying so up front beats a surprise 422.
    -->
    <p class="text-xs text-muted">Lozinka ne sme da bude među poznatim procurelim lozinkama.</p>

    <UFormField name="password_confirmation" label="Potvrdite lozinku" required>
      <UInput
        v-model="state.password_confirmation"
        :type="isConfirmVisible ? 'text' : 'password'"
        autocomplete="new-password"
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
            :icon="isConfirmVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="isConfirmVisible ? 'Sakrij potvrdu' : 'Prikaži potvrdu'"
            :aria-pressed="isConfirmVisible"
            data-testid="toggle-confirm"
            @click="isConfirmVisible = !isConfirmVisible"
          />
        </template>
      </UInput>
    </UFormField>

    <UButton type="submit" :label="props.submitLabel" size="lg" block :loading="props.loading" />
  </UForm>
</template>
