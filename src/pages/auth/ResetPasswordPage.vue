<script setup lang="ts">
import { useResetPasswordFlow } from '@/features/auth/composables/useResetPasswordFlow'
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm.vue'

const { link, submit, isLoading, errorMessage } = useResetPasswordFlow()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <UAvatar
          :icon="link ? 'i-lucide-lock-keyhole' : 'i-lucide-link-2-off'"
          size="lg"
          class="bg-primary/10 text-primary"
        />
        <div>
          <h1 class="text-lg font-semibold text-default">
            {{ link ? 'Choose a new password' : 'This link is not valid' }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{
              link
                ? `Resetting the password for ${link.email}.`
                : 'The reset link is incomplete or has expired. Request a new one.'
            }}
          </p>
        </div>
      </div>
    </template>

    <ResetPasswordForm
      v-if="link"
      :email="link.email"
      :loading="isLoading"
      :error-message="errorMessage"
      @submit="submit"
    />

    <UButton
      v-else
      :to="{ name: 'auth-forgot-password' }"
      label="Request a new link"
      size="lg"
      block
      data-testid="request-new-link"
    />

    <template #footer>
      <ULink :to="{ name: 'auth-login' }" class="text-sm font-medium text-primary">
        Back to sign in
      </ULink>
    </template>
  </UCard>
</template>
