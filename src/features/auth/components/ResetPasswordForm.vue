<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  resetPasswordSchema,
  PASSWORD_RULES,
  type ResetPasswordForm,
} from '@/features/auth/schemas/passwordReset'

const props = defineProps<{
  /** Whose password is being reset — rendered as a hidden username field, see the template. */
  email: string
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [password: string]
}>()

const state = reactive<Partial<ResetPasswordForm>>({ password: '', confirmPassword: '' })
const isPasswordVisible = shallowRef(false)
const isConfirmVisible = shallowRef(false)

const rules = computed(() =>
  PASSWORD_RULES.map((rule) => ({ label: rule.label, met: rule.test(state.password ?? '') })),
)

function onSubmit(event: FormSubmitEvent<ResetPasswordForm>) {
  emit('submit', event.data.password)
}
</script>

<template>
  <UForm :schema="resetPasswordSchema" :state="state" class="space-y-5" @submit="onSubmit">
    <UAlert
      v-if="props.errorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="props.errorMessage"
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

    <UFormField name="password" label="New password" required>
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
            :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
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

    <UFormField name="confirmPassword" label="Confirm new password" required>
      <UInput
        v-model="state.confirmPassword"
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
            :aria-label="isConfirmVisible ? 'Hide confirmation' : 'Show confirmation'"
            :aria-pressed="isConfirmVisible"
            data-testid="toggle-confirm"
            @click="isConfirmVisible = !isConfirmVisible"
          />
        </template>
      </UInput>
    </UFormField>

    <UButton type="submit" label="Set new password" size="lg" block :loading="props.loading" />
  </UForm>
</template>
