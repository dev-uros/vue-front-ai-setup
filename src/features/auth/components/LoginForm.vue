<script setup lang="ts">
import { reactive, shallowRef } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { credentialsSchema, type Credentials } from '@/features/auth/schemas/credentials'

const props = defineProps<{
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [credentials: Credentials]
}>()

const state = reactive<Partial<Credentials>>({ email: '', password: '' })
const isPasswordVisible = shallowRef(false)

/** UForm validates against the schema first, so `event.data` is already typed and clean. */
function onSubmit(event: FormSubmitEvent<Credentials>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm :schema="credentialsSchema" :state="state" class="space-y-5" @submit="onSubmit">
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

    <UFormField name="password" label="Password" required>
      <template #hint>
        <ULink :to="{ name: 'auth-forgot-password' }" class="text-xs font-medium text-primary">
          Forgot password?
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
            :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
            :aria-pressed="isPasswordVisible"
            data-testid="toggle-password"
            @click="isPasswordVisible = !isPasswordVisible"
          />
        </template>
      </UInput>
    </UFormField>

    <UButton type="submit" label="Sign in" size="lg" block :loading="props.loading" />
  </UForm>
</template>
